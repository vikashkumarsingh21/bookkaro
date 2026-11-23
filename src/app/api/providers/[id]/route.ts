import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-response";
import { NotFoundError, handleApiError } from "@/lib/errors";

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id) {
      throw new NotFoundError("Provider ID parameter");
    }

    // 1. Database Lookup
    let provider = null;
    try {
      provider = await prisma.provider.findFirst({
        where: {
          OR: [
            { id },
            { providerCode: id },
          ],
        },
        include: {
          branches: {
            where: { isActive: true },
          },
          services: {
            where: { isActive: true },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              reviewText: true,
              isVerifiedBooking: true,
              providerReply: true,
              providerRepliedAt: true,
              createdAt: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });
    } catch (err) {
      console.warn("[ProviderDetailAPI] Database query warning:", err);
    }

    // 2. Mock Pool Fallback for Immediate Development & Testing
    if (!provider) {
      const { MOCK_PROVIDERS_DATA } = await import("@/data/mockProviders");
      const mock = MOCK_PROVIDERS_DATA.find(
        (p) => p.id === id || p.slug === id || `BK-PRV-${p.city.slice(0, 3).toUpperCase()}-${p.id.slice(-2)}` === id
      );

      if (!mock) {
        throw new NotFoundError(`Provider with identifier '${id}'`);
      }

      return apiSuccess({
        id: mock.id,
        slug: mock.slug,
        providerCode: `BK-PRV-${mock.city.slice(0, 3).toUpperCase()}-${mock.id.slice(-2)}`,
        businessName: mock.name,
        legalName: mock.legalBusinessName,
        category: mock.category.toUpperCase(),
        subCategory: mock.subCategory,
        tagline: mock.tagline,
        bio: mock.description,
        rating: mock.rating,
        reviewCount: mock.reviewCount,
        isVerified: mock.isVerified,
        isSponsored: !!mock.isSponsored,
        isOpenNow: mock.isOpenNow,
        operatingHours: mock.operatingHours,
        priceRange: mock.priceRange,
        startingPriceInr: mock.startingPriceInr,
        nextAvailableSlot: mock.nextAvailableSlot,
        availableDates: mock.availableDates,
        timeSlots: mock.timeSlots,
        images: mock.images,
        badges: mock.badges,
        phone: mock.phone,
        email: mock.email || "care@bookkaro.in",
        cancellationPolicy: mock.cancellationPolicy,
        branches: [
          {
            id: `br-${mock.id}`,
            name: `${mock.locality} Facility`,
            addressLine: mock.address,
            locality: mock.locality,
            city: mock.city,
            pincode: mock.pincode,
            latitude: mock.coordinates.lat,
            longitude: mock.coordinates.lng,
            phone: mock.phone,
            operatingHours: mock.operatingHours,
          },
        ],
        services: mock.services.map((s) => ({
          id: s.id,
          name: s.name,
          durationMinutes: s.durationMinutes,
          basePrice: s.price,
          description: s.description,
          categoryMetadata: {
            doctors: mock.doctors,
            roomTypes: mock.roomTypes,
            seatingAreas: mock.seatingAreas,
            staffOrBays: mock.staffOrBays,
          },
        })),
        addons: mock.addons || [],
        doctors: mock.doctors || [],
        roomTypes: mock.roomTypes || [],
        seatingAreas: mock.seatingAreas || [],
        staffOrBays: mock.staffOrBays || [],
        reviews: mock.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          reviewText: r.comment,
          isVerifiedBooking: r.isVerifiedBooking,
          createdAt: r.date,
          authorName: r.authorName,
          city: r.city,
          serviceBooked: r.serviceBooked,
        })),
      });
    }

    // 3. Format Database Provider Object
    const formattedProvider = {
      id: provider.id,
      providerCode: provider.providerCode,
      businessName: provider.businessName,
      legalName: provider.legalName,
      category: provider.category,
      verificationStatus: provider.verificationStatus,
      commercialModel: provider.commercialModel,
      commissionRate: Number(provider.commissionRate),
      subscriptionPlan: provider.subscriptionPlan,
      subscriptionStatus: provider.subscriptionStatus,
      rating: Number(provider.rating),
      reviewCount: provider.reviewCount,
      isSponsored: provider.isSponsored,
      bio: provider.bio,
      logoUrl: provider.logoUrl,
      coverImageUrl: provider.coverImageUrl,
      contactPhone: provider.contactPhone,
      contactEmail: provider.contactEmail,
      website: provider.website,
      gstin: provider.gstin,
      licenseType: provider.licenseType,
      licenseNumber: provider.licenseNumber,
      cancellationPolicy:
        provider.cancellationPolicy ||
        "Free cancellation up to 2 hours before the scheduled slot. 100% refund on timely cancellation.",
      branches: provider.branches.map((b) => ({
        id: b.id,
        name: b.name,
        isMainBranch: b.isMainBranch,
        addressLine: b.addressLine,
        locality: b.locality,
        city: b.city,
        state: b.state,
        pincode: b.pincode,
        latitude: b.latitude,
        longitude: b.longitude,
        phone: b.phone,
        email: b.email,
        operatingHours: b.operatingHours,
      })),
      services: provider.services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        durationMinutes: s.durationMinutes,
        basePrice: Number(s.basePrice),
        currency: s.currency,
        category: s.category,
        categoryMetadata: s.categoryMetadata,
      })),
      reviews: provider.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        reviewText: r.reviewText,
        isVerifiedBooking: r.isVerifiedBooking,
        providerReply: r.providerReply,
        providerRepliedAt: r.providerRepliedAt,
        createdAt: r.createdAt,
        authorName: `${r.customer.firstName} ${r.customer.lastName ? r.customer.lastName[0] + "." : ""}`,
      })),
    };

    return apiSuccess(formattedProvider);
  } catch (error) {
    return handleApiError(error);
  }
}
