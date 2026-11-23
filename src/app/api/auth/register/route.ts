import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/auth/schemas";
import { validateBody } from "@/lib/validation";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken, hashToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { ConflictError, handleApiError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const input = await validateBody(registerSchema, request);

    // 1. Check for existing email or phone
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { phone: input.phone }],
      },
      select: { email: true, phone: true },
    });

    if (existing) {
      if (existing.email === input.email) {
        throw new ConflictError("An account with this email address already exists.");
      }
      if (existing.phone === input.phone) {
        throw new ConflictError("An account with this mobile number already exists.");
      }
    }

    // 2. Hash password & persist user
    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        phone: input.phone,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: UserRole.CUSTOMER,
        isActive: true,
        forcePasswordChange: false,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        forcePasswordChange: true,
        createdAt: true,
      },
    });

    // 3. Generate tokens & record refresh token family
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      providerId: null,
      forcePasswordChange: user.forcePasswordChange,
    });

    const { token: refreshToken, tokenId } = signRefreshToken(user.id);
    const tokenHash = hashToken(refreshToken);

    // 7 days expiration
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

    // 4. Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: "CUSTOMER",
        action: "CUSTOMER_REGISTERED",
        entityType: "USER",
        entityId: user.id,
        newState: { email: user.email, phone: user.phone },
      },
    });

    // 5. Build response and set HTTP-only cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "Customer account created successfully.",
        data: {
          user,
          accessToken,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );

    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
