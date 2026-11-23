import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { handleApiError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const authUser = await requireAuth(request, { allowPasswordChangePending: true });

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        forcePasswordChange: true,
        avatarUrl: true,
        providerId: true,
        createdAt: true,
        ownedProviders: {
          select: {
            id: true,
            providerCode: true,
            businessName: true,
            category: true,
            verificationStatus: true,
            commercialModel: true,
            commissionRate: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
            rating: true,
            reviewCount: true,
          },
          take: 1,
        },
        staffAtProvider: {
          select: {
            id: true,
            providerCode: true,
            businessName: true,
            category: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    let provider = null;
    if (user.role === UserRole.PROVIDER_OWNER && user.ownedProviders.length > 0) {
      provider = user.ownedProviders[0];
    } else if (user.role === UserRole.PROVIDER_STAFF && user.staffAtProvider) {
      provider = user.staffAtProvider;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            forcePasswordChange: user.forcePasswordChange,
            avatarUrl: user.avatarUrl,
            provider,
            createdAt: user.createdAt,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
