import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth/schemas";
import { validateBody } from "@/lib/validation";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken, hashToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { UnauthorizedError, handleApiError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const input = await validateBody(loginSchema, request);

    // 1. Find user by email or phone
    const isEmail = input.identifier.includes("@");
    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: input.identifier.toLowerCase() }
        : { phone: input.identifier.trim() },
      include: {
        ownedProviders: {
          select: { id: true, providerCode: true, businessName: true, verificationStatus: true },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError(
        "Invalid credentials. Please verify your email/phone and password.",
        "INVALID_CREDENTIALS"
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedError(
        "Your account is inactive or has been suspended. Please contact BOOKKARO support.",
        "ACCOUNT_SUSPENDED"
      );
    }

    // 2. Validate password
    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError(
        "Invalid credentials. Please verify your email/phone and password.",
        "INVALID_CREDENTIALS"
      );
    }

    // 3. Resolve Provider context for Merchants / Staff
    let associatedProviderId: string | null = user.providerId;
    let providerDetails: { id: string; providerCode: string; businessName: string; verificationStatus: string } | null = null;

    if (user.role === UserRole.PROVIDER_OWNER && user.ownedProviders.length > 0) {
      associatedProviderId = user.ownedProviders[0].id;
      providerDetails = user.ownedProviders[0];
    } else if (user.role === UserRole.PROVIDER_STAFF && user.providerId) {
      const staffProvider = await prisma.provider.findUnique({
        where: { id: user.providerId },
        select: { id: true, providerCode: true, businessName: true, verificationStatus: true },
      });
      if (staffProvider) providerDetails = staffProvider;
    }

    // 4. Generate token family
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      providerId: associatedProviderId,
      forcePasswordChange: user.forcePasswordChange,
    });

    const { token: refreshToken, tokenId } = signRefreshToken(user.id);
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // 5. Build response and set cookies
    const userSafe = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      forcePasswordChange: user.forcePasswordChange,
      providerId: associatedProviderId,
      provider: providerDetails,
    };

    const response = NextResponse.json(
      {
        success: true,
        message: "Authentication successful.",
        data: {
          user: userSafe,
          accessToken,
          forcePasswordChange: user.forcePasswordChange,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
