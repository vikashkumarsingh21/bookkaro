import crypto from 'crypto';
import prisma from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import {
  UpdateCrmStageInput,
  RequestChangesInput,
  ResolveDisputeInput,
  CrmQueryParams,
  AuditLogsQueryParams,
} from './admin.validation';
import {
  ApplicationStage,
  BookingStatus,
  CommercialModel,
  KycStatus,
  PaymentTransactionStatus,
  Prisma,
  ProviderStatus,
  Role,
  SubscriptionTier,
} from '@prisma/client';

export class AdminService {
  /**
   * Helper: Generate unique canonical provider code: BK-PRV-PAT-XXXX
   */
  private async generateProviderCode(): Promise<string> {
    for (let attempts = 0; attempts < 10; attempts++) {
      const randomSuffix = crypto.randomInt(1000, 9999).toString();
      const code = `BK-PRV-PAT-${randomSuffix}`;

      const existing = await prisma.provider.findUnique({
        where: { providerCode: code },
        select: { id: true },
      });

      if (!existing) {
        return code;
      }
    }
    return `BK-PRV-PAT-${Date.now().toString().slice(-4)}`;
  }

  /**
   * GET /api/v1/admin/scorecard
   */
  async getScorecard() {
    const [
      activeVerifiedProviders,
      completedBookings,
      totalBookings,
      confirmedBookings,
      pendingKycs,
      openDisputes,
      pendingRefunds,
      revenueAggregates,
    ] = await Promise.all([
      prisma.provider.count({ where: { isVerified: true, status: ProviderStatus.ACTIVE } }),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.ACCEPTED] },
        },
      }),
      prisma.partnerApplication.count({
        where: { kycStatus: { in: [KycStatus.PENDING, KycStatus.SUBMITTED] } },
      }),
      prisma.booking.count({ where: { status: BookingStatus.DISPUTED } }),
      prisma.booking.count({ where: { status: BookingStatus.REFUND_REQUESTED } }),
      prisma.commissionLedger.aggregate({
        _sum: {
          finalBillInr: true,
          commissionAmountInr: true,
          netPayoutInr: true,
        },
      }),
    ]);

    const acceptanceRate =
      totalBookings > 0
        ? Math.round((confirmedBookings / totalBookings) * 100)
        : 100;

    return {
      activeVerifiedProviders,
      completedBookings,
      totalBookings,
      acceptanceRate,
      pendingKycs,
      openDisputes,
      pendingRefunds,
      financials: {
        totalGmvInr: Number(revenueAggregates._sum.finalBillInr || 0),
        realizedPlatformFeeInr: Number(revenueAggregates._sum.commissionAmountInr || 0),
        netMerchantPayoutsInr: Number(revenueAggregates._sum.netPayoutInr || 0),
      },
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * GET /api/v1/admin/crm
   */
  async getCrmLeads(params: CrmQueryParams) {
    const { stage, kycStatus, q, page, limit } = params;

    const where: Prisma.PartnerApplicationWhereInput = {};

    if (stage) {
      where.stage = stage;
    }

    if (kycStatus) {
      where.kycStatus = kycStatus;
    }

    if (q) {
      where.OR = [
        { applicationCode: { contains: q, mode: 'insensitive' } },
        { applicant: { fullName: { contains: q, mode: 'insensitive' } } },
        { applicant: { email: { contains: q, mode: 'insensitive' } } },
        { applicant: { phone: { contains: q } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.partnerApplication.findMany({
        where,
        include: {
          applicant: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          provider: {
            select: { id: true, providerCode: true, brandName: true, status: true, isVerified: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.partnerApplication.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * PATCH /api/v1/admin/crm/:id
   */
  async updateCrmLead(adminId: string, applicationId: string, input: UpdateCrmStageInput) {
    const app = await prisma.partnerApplication.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      throw new NotFoundError('Partner application record not found.');
    }

    const existingNotes = Array.isArray(app.notes) ? (app.notes as Array<Record<string, unknown>>) : [];
    const existingBusinessData = typeof app.businessData === 'object' && app.businessData !== null
      ? (app.businessData as Record<string, unknown>)
      : {};

    const updatedNotes = [...existingNotes];
    if (input.note) {
      updatedNotes.push({
        author: 'Admin',
        text: input.note,
        timestamp: new Date().toISOString(),
      });
    }

    const updatedBusinessData = {
      ...existingBusinessData,
      ...(input.assignedPlan ? { commercialPlan: input.assignedPlan } : {}),
    };

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.partnerApplication.update({
        where: { id: applicationId },
        data: {
          stage: input.stage || app.stage,
          kycStatus: input.kycStatus || app.kycStatus,
          businessData: updatedBusinessData as Prisma.InputJsonValue,
          notes: updatedNotes as Prisma.InputJsonValue,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: 'ADMIN',
          actionType: 'CRM_LEAD_UPDATED',
          targetId: applicationId,
          summary: `CRM Stage updated to ${record.stage} for application ${app.applicationCode}`,
          metadata: { stage: record.stage, kycStatus: record.kycStatus, note: input.note },
        },
      });

      return record;
    });

    return updated;
  }

  /**
   * POST /api/v1/admin/verifications/:id/approve
   */
  async approveVerification(adminId: string, applicationId: string) {
    const app = await prisma.partnerApplication.findUnique({
      where: { id: applicationId },
      include: { applicant: true, provider: true },
    });

    if (!app) {
      throw new NotFoundError('Partner application record not found.');
    }

    if (!app.applicantId) {
      throw new BadRequestError('Application does not have an attached applicant account.');
    }

    const bizData = typeof app.businessData === 'object' && app.businessData !== null
      ? (app.businessData as Record<string, unknown>)
      : {};

    const category = (bizData.category as string) || 'hotels';
    const brandName = (bizData.brandName as string) || 'Patna Partner';
    const legalName = (bizData.legalName as string) || brandName;
    const locality = (bizData.locality as string) || 'Fraser Road';
    const pincode = (bizData.pincode as string) || '800001';
    const address = (bizData.address as string) || `${locality}, Patna, Bihar`;

    // Category default commission: 10% hotels, 5% restaurants, 10% salon
    const categoryCommissionMap: Record<string, number> = {
      hotels: 10.0,
      restaurants: 5.0,
      salon: 10.0,
    };
    const commissionRate = categoryCommissionMap[category] || 10.0;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or activate Provider
      let provider = app.provider;
      if (!provider) {
        const providerCode = await this.generateProviderCode();
        provider = await tx.provider.create({
          data: {
            providerCode,
            ownerId: app.applicantId!,
            brandName,
            legalName,
            category,
            locality,
            pincode,
            address,
            latitude: 25.6093,
            longitude: 85.1376,
            isVerified: true,
            isSponsored: false,
            rating: 5.0,
            reviewCount: 0,
            commercialModel: CommercialModel.COMMISSION,
            commissionRate,
            subscriptionTier: SubscriptionTier.BUSINESS_PRO,
            operatingHours: { days: 'Monday – Sunday', hours: '09:00 AM – 09:00 PM' },
            photos: [],
            status: ProviderStatus.ACTIVE,
          },
        });
      } else {
        provider = await tx.provider.update({
          where: { id: provider.id },
          data: {
            isVerified: true,
            status: ProviderStatus.ACTIVE,
          },
        });
      }

      // 2. Set mustChangePassword: true on the owner user
      await tx.user.update({
        where: { id: app.applicantId! },
        data: {
          role: Role.PARTNER_OWNER,
          mustChangePassword: true,
          isActive: true,
        },
      });

      // 3. Move application to STAGE_06_GO_LIVE
      const updatedApp = await tx.partnerApplication.update({
        where: { id: applicationId },
        data: {
          stage: ApplicationStage.STAGE_06_GO_LIVE,
          kycStatus: KycStatus.VERIFIED,
          providerId: provider.id,
        },
      });

      // 4. Append immutable AuditLog
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: 'ADMIN',
          actionType: 'KYC_VERIFICATION_APPROVED',
          targetId: provider.id,
          summary: `Approved merchant verification: ${brandName} [${provider.providerCode}]`,
          metadata: { applicationId, providerCode: provider.providerCode },
        },
      });

      return { application: updatedApp, provider };
    });

    return result;
  }

  /**
   * POST /api/v1/admin/verifications/:id/request-changes
   */
  async requestVerificationChanges(adminId: string, applicationId: string, input: RequestChangesInput) {
    const app = await prisma.partnerApplication.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      throw new NotFoundError('Partner application record not found.');
    }

    const existingNotes = Array.isArray(app.notes) ? (app.notes as Array<Record<string, unknown>>) : [];
    const updatedNotes = [
      ...existingNotes,
      {
        author: 'KYC Auditor',
        text: `Changes Requested: ${input.reason}`,
        missingDocuments: input.missingDocuments || [],
        timestamp: new Date().toISOString(),
      },
    ];

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.partnerApplication.update({
        where: { id: applicationId },
        data: {
          kycStatus: KycStatus.REJECTED,
          notes: updatedNotes as Prisma.InputJsonValue,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: 'ADMIN',
          actionType: 'KYC_CHANGES_REQUESTED',
          targetId: applicationId,
          summary: `Changes requested on application ${app.applicationCode}: ${input.reason}`,
          metadata: { reason: input.reason, missingDocuments: input.missingDocuments },
        },
      });

      return record;
    });

    return updated;
  }

  /**
   * GET /api/v1/admin/disputes
   */
  async getDisputes() {
    const disputes = await prisma.booking.findMany({
      where: {
        status: { in: [BookingStatus.DISPUTED, BookingStatus.REFUND_REQUESTED] },
      },
      include: {
        provider: {
          select: { id: true, providerCode: true, brandName: true, category: true, locality: true },
        },
        customer: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        payments: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return disputes;
  }

  /**
   * POST /api/v1/admin/disputes/:bookingId/resolve
   */
  async resolveDispute(adminId: string, bookingId: string, input: ResolveDisputeInput) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      throw new NotFoundError('Booking record not found.');
    }

    const existingDetails = typeof booking.categoryDetails === 'object' && booking.categoryDetails !== null
      ? (booking.categoryDetails as Record<string, unknown>)
      : {};

    const updatedDetails = {
      ...existingDetails,
      disputeResolution: input.resolution,
      disputeResolutionNotes: input.resolutionNotes,
      resolvedAt: new Date().toISOString(),
      resolvedBy: adminId,
    };

    const result = await prisma.$transaction(async (tx) => {
      let targetStatus: BookingStatus = BookingStatus.COMPLETED;
      let targetPaymentStatus = booking.paymentStatus;

      if (input.resolution === 'REFUNDED') {
        targetStatus = BookingStatus.REFUNDED;
        targetPaymentStatus = 'REFUNDED';

        // Update payment transactions
        await tx.payment.updateMany({
          where: { bookingId },
          data: { status: PaymentTransactionStatus.REFUNDED },
        });
      } else if (input.resolution === 'WAIVED') {
        targetStatus = BookingStatus.CANCELLED;
      } else {
        targetStatus = BookingStatus.COMPLETED;
      }

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: targetStatus,
          paymentStatus: targetPaymentStatus,
          categoryDetails: updatedDetails as Prisma.InputJsonValue,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: 'ADMIN',
          actionType: 'DISPUTE_RESOLVED',
          targetId: bookingId,
          summary: `Dispute on ${booking.bookingCode} resolved as ${input.resolution}: ${input.resolutionNotes}`,
          metadata: { resolution: input.resolution, notes: input.resolutionNotes },
        },
      });

      return updated;
    });

    return result;
  }

  /**
   * GET /api/v1/admin/audit-logs
   */
  async getAuditLogs(params: AuditLogsQueryParams) {
    const { actionType, actorRole, targetId, format, page, limit } = params;

    const where: Prisma.AuditLogWhereInput = {};

    if (actionType) {
      where.actionType = actionType;
    }

    if (actorRole) {
      where.actorRole = actorRole;
    }

    if (targetId) {
      where.targetId = targetId;
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    if (format === 'csv') {
      const headers = ['Log ID', 'Timestamp', 'Actor ID', 'Actor Role', 'Action Type', 'Target ID', 'Summary'];
      const rows = items.map((log) => [
        `"${log.id}"`,
        `"${log.createdAt.toISOString()}"`,
        `"${log.actorId || 'N/A'}"`,
        `"${log.actorRole}"`,
        `"${log.actionType}"`,
        `"${log.targetId || 'N/A'}"`,
        `"${(log.summary || '').replace(/"/g, '""')}"`,
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      return { csv, total };
    }

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export const adminService = new AdminService();
