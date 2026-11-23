import crypto from 'crypto';
import prisma from '../../config/db';
import { CreateApplicationInput } from './onboarding.validation';
import { ApplicationStage, KycStatus, Prisma, Role } from '@prisma/client';
import { NotFoundError } from '../../utils/errors';
import bcrypt from 'bcryptjs';

const STAGE_PROGRESS_MAP: Record<ApplicationStage, number> = {
  STAGE_01_LEAD: 16,
  STAGE_02_DOC_SUBMISSION: 33,
  STAGE_03_KYC_AUDIT: 50,
  STAGE_04_CATALOG_SETUP: 67,
  STAGE_05_CONTRACT_SIGN: 83,
  STAGE_06_GO_LIVE: 100,
};

export class PartnerOnboardingService {
  /**
   * Helper: Generate unique application code: APP-PAT-2026-XXXX
   */
  private async generateApplicationCode(): Promise<string> {
    for (let attempts = 0; attempts < 10; attempts++) {
      const randomSuffix = crypto.randomInt(1000, 9999).toString();
      const code = `APP-PAT-2026-${randomSuffix}`;

      const existing = await prisma.partnerApplication.findUnique({
        where: { applicationCode: code },
        select: { id: true },
      });

      if (!existing) {
        return code;
      }
    }
    return `APP-PAT-2026-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Submit new partner application (Public)
   */
  async createApplication(input: CreateApplicationInput) {
    const {
      brandName,
      legalName,
      category,
      locality,
      pincode,
      address,
      contactName,
      contactEmail,
      contactPhone,
      commercialPlan,
      documents,
      notes,
    } = input;

    // 1. Find or create applicant user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: contactEmail.toLowerCase() }, { phone: contactPhone }],
      },
    });

    if (!user) {
      const defaultHash = await bcrypt.hash('Partner@Patna2026!', 10);
      user = await prisma.user.create({
        data: {
          fullName: contactName,
          email: contactEmail.toLowerCase(),
          phone: contactPhone,
          passwordHash: defaultHash,
          role: Role.PARTNER_OWNER,
          mustChangePassword: true,
          isActive: true,
        },
      });
    }

    // 2. Generate unique tracking application code
    const applicationCode = await this.generateApplicationCode();

    const initialNotes = [
      {
        author: 'System',
        text: 'Application created via BOOKKARO Partner Desk',
        timestamp: new Date().toISOString(),
      },
    ];

    if (notes) {
      initialNotes.push({
        author: contactName,
        text: notes,
        timestamp: new Date().toISOString(),
      });
    }

    const businessData = {
      brandName,
      legalName,
      category,
      locality,
      pincode,
      address,
      contactName,
      contactEmail,
      contactPhone,
      commercialPlan,
    };

    const application = await prisma.partnerApplication.create({
      data: {
        applicationCode,
        applicantId: user.id,
        stage: ApplicationStage.STAGE_01_LEAD,
        kycStatus: KycStatus.PENDING,
        businessData: businessData as Prisma.InputJsonValue,
        documents: (documents || {}) as Prisma.InputJsonValue,
        notes: initialNotes as Prisma.InputJsonValue,
      },
    });

    // Also log audit trail
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: 'PARTNER_OWNER',
        actionType: 'PARTNER_APPLICATION_SUBMITTED',
        targetId: application.id,
        summary: `New merchant application: ${brandName} (${locality}, Patna) [${applicationCode}]`,
        metadata: { category, commercialPlan },
      },
    });

    return {
      applicationCode: application.applicationCode,
      brandName,
      category,
      locality,
      stage: application.stage,
      kycStatus: application.kycStatus,
      createdAt: application.createdAt,
    };
  }

  /**
   * Track application progress by code (Public, Case-Insensitive)
   */
  async trackApplication(code: string) {
    const cleanCode = code.trim().toUpperCase();

    const application = await prisma.partnerApplication.findFirst({
      where: {
        applicationCode: {
          equals: cleanCode,
          mode: 'insensitive',
        },
      },
      include: {
        applicant: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
        provider: {
          select: {
            providerCode: true,
            status: true,
            isVerified: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundError(
        `Application with reference '${cleanCode}' was not found in BOOKKARO Patna registry.`
      );
    }

    const progressPercent = STAGE_PROGRESS_MAP[application.stage] || 16;

    return {
      applicationCode: application.applicationCode,
      stage: application.stage,
      kycStatus: application.kycStatus,
      progressPercent,
      businessData: application.businessData,
      documents: application.documents,
      notes: application.notes,
      provider: application.provider,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}

export const partnerOnboardingService = new PartnerOnboardingService();
