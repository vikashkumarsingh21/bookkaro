import {
  PrismaClient,
  UserRole,
  ProviderCategory,
  KYCStatus,
  CommercialModel,
  SubscriptionPlan,
  BookingStatus,
  PaymentStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { MOCK_PROVIDERS_DATA } from "../src/data/mockProviders";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/bookkaro_db?schema=public";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=================================================");
  console.log("🌱 BOOKKARO Database Seeding Engine");
  console.log("=================================================\n");

  const adminHash = await bcrypt.hash("Admin@Bookkaro2026", 12);
  const merchantHash = await bcrypt.hash("Provider@2026", 12);
  const customerHash = await bcrypt.hash("Customer@2026", 12);

  // 1. Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@bookkaro.in" },
    update: {},
    create: {
      email: "admin@bookkaro.in",
      phone: "9810011001",
      passwordHash: adminHash,
      firstName: "Antigravity",
      lastName: "SuperAdmin",
      role: UserRole.ADMIN,
      isActive: true,
      forcePasswordChange: false,
    },
  });
  console.log(`✓ Seeded SuperAdmin: ${admin.email}`);

  // 2. Verified Customer
  const customer = await prisma.user.upsert({
    where: { email: "ananya.sharma@example.com" },
    update: {},
    create: {
      email: "ananya.sharma@example.com",
      phone: "9871122334",
      passwordHash: customerHash,
      firstName: "Ananya",
      lastName: "Sharma",
      role: UserRole.CUSTOMER,
      isActive: true,
      forcePasswordChange: false,
    },
  });
  console.log(`✓ Seeded Customer: ${customer.email}`);

  // 3. Seed 15 Realistic Providers Across Patna, Rajkot, and Delhi
  console.log("\nSeeding 15 Providers across Healthcare, Hotels, Restaurants, Salon, and Vehicle Care...");

  for (let i = 0; i < MOCK_PROVIDERS_DATA.length; i++) {
    const mock = MOCK_PROVIDERS_DATA[i];
    const categoryEnum = mock.category.toUpperCase() as ProviderCategory;
    const providerCode = `BK-PRV-${mock.city.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(2, "0")}`;
    const ownerEmail = `owner.${mock.slug}@bookkaro-partners.in`;
    const ownerPhone = `98${String(10000000 + i * 111111).slice(0, 8)}`;

    // Create / Upsert Provider Owner
    const owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {},
      create: {
        email: ownerEmail,
        phone: ownerPhone,
        passwordHash: merchantHash,
        firstName: mock.name.split(" ")[0],
        lastName: "Manager",
        role: UserRole.PROVIDER_OWNER,
        isActive: true,
        forcePasswordChange: i === 1, // Second merchant triggers forcePasswordChange flow for test
      },
    });

    // Create / Upsert Provider
    const provider = await prisma.provider.upsert({
      where: { providerCode },
      update: {
        businessName: mock.name,
        rating: mock.rating,
        reviewCount: mock.reviewCount,
        isSponsored: !!mock.isSponsored,
      },
      create: {
        providerCode,
        businessName: mock.name,
        legalName: mock.legalBusinessName,
        category: categoryEnum,
        verificationStatus: mock.isVerified ? KYCStatus.VERIFIED : KYCStatus.PENDING,
        commercialModel: i % 2 === 0 ? CommercialModel.COMMISSION : CommercialModel.SUBSCRIPTION,
        commissionRate: 8.0,
        subscriptionPlan: i % 2 === 1 ? SubscriptionPlan.GROWTH : SubscriptionPlan.NONE,
        gstin: mock.gstin || `10AAACB${String(1000 + i)}K1Z5`,
        panNumber: `ABCDE${String(1000 + i)}F`,
        contactEmail: mock.email || ownerEmail,
        contactPhone: mock.phone,
        bio: mock.description,
        rating: mock.rating,
        reviewCount: mock.reviewCount,
        isSponsored: !!mock.isSponsored,
        cancellationPolicy: mock.cancellationPolicy,
        ownerId: owner.id,
      },
    });

    // Create Main Branch
    const branch = await prisma.branch.create({
      data: {
        providerId: provider.id,
        name: `${mock.locality} Facility`,
        isMainBranch: true,
        addressLine: mock.address,
        locality: mock.locality,
        city: mock.city,
        state: mock.city === "Patna" ? "Bihar" : mock.city === "Rajkot" ? "Gujarat" : "Delhi NCR",
        pincode: mock.pincode,
        latitude: mock.coordinates.lat,
        longitude: mock.coordinates.lng,
        phone: mock.phone,
        email: mock.email || ownerEmail,
        operatingHours: {
          monday: { open: "09:00", close: "20:00", isOpen: true },
          tuesday: { open: "09:00", close: "20:00", isOpen: true },
          wednesday: { open: "09:00", close: "20:00", isOpen: true },
          thursday: { open: "09:00", close: "20:00", isOpen: true },
          friday: { open: "09:00", close: "20:00", isOpen: true },
          saturday: { open: "09:00", close: "20:00", isOpen: true },
          sunday: { open: "10:00", close: "16:00", isOpen: true },
        },
        isActive: true,
      },
    });

    // Create Services with Rich JSONB Metadata
    for (const s of mock.services) {
      await prisma.service.create({
        data: {
          providerId: provider.id,
          branchId: branch.id,
          name: s.name,
          description: s.description,
          durationMinutes: s.durationMinutes,
          basePrice: s.price,
          currency: "INR",
          category: categoryEnum,
          categoryMetadata: JSON.parse(
            JSON.stringify({
              doctors: mock.doctors,
              roomTypes: mock.roomTypes,
              seatingAreas: mock.seatingAreas,
              staffOrBays: mock.staffOrBays,
            })
          ),
          isActive: true,
        },
      });
    }

    // Create Completed Sample Booking & Verified Review for first service
    const firstService = await prisma.service.findFirst({
      where: { providerId: provider.id },
    });

    if (firstService) {
      const bookingCode = `BK-2026-${String(8000 + i)}`;
      const completedBooking = await prisma.booking.create({
        data: {
          bookingCode,
          status: BookingStatus.COMPLETED,
          customerId: customer.id,
          providerId: provider.id,
          branchId: branch.id,
          serviceId: firstService.id,
          bookingDate: new Date("2026-11-16T11:00:00Z"),
          timeSlot: "11:00 AM",
          categoryInputs: {
            partyOrGuestCount: 2,
            specialInstructions: "Standard booking",
          },
          tokenAmountPaid: 200.0,
          estimatedBillAmount: Number(firstService.basePrice),
          finalBillAmount: Number(firstService.basePrice),
          paymentStatus: PaymentStatus.PAID_OFFLINE,
          acceptedAt: new Date("2026-11-15T10:00:00Z"),
          confirmedAt: new Date("2026-11-15T10:05:00Z"),
          completedAt: new Date("2026-11-16T12:00:00Z"),
        },
      });

      // Review linked 1:1 to Completed Booking
      await prisma.review.create({
        data: {
          bookingId: completedBooking.id,
          customerId: customer.id,
          providerId: provider.id,
          rating: mock.rating >= 4.8 ? 5 : 4,
          reviewText: mock.reviews[0]?.comment || "Outstanding service and prompt turnaround time.",
          isVerifiedBooking: true,
          providerReply: `Thank you Ananya for booking with ${mock.name}. We look forward to serving you again!`,
          providerRepliedAt: new Date("2026-11-16T16:00:00Z"),
        },
      });
    }

    console.log(`  ✓ [${i + 1}/15] [${mock.city}] [${categoryEnum}] ${mock.name} (${providerCode})`);
  }

  // 4. Platform Initialized Audit Log
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      actorRole: "ADMIN",
      action: "DATABASE_SEEDED",
      entityType: "SYSTEM",
      entityId: "DISCOVERY_ENGINE_V2",
      newState: { totalProvidersSeeded: MOCK_PROVIDERS_DATA.length },
    },
  });

  console.log("\n=================================================");
  console.log("✅ Seed completed successfully: 15 Providers, Branches, Services & Reviews ready!");
  console.log("=================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
