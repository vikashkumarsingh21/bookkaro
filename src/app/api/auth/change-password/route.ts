import { NextResponse } from "next/server";
import { changePasswordSchema } from "@/lib/auth/schemas";
import { validateBody } from "@/lib/validation";
import { requireAuth } from "@/lib/auth/rbac";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken, hashToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { BadRequestError, handleApiError } from "@/lib/errors";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user (permitting accounts currently in forcePasswordChange state)
    const authUser = await requireAuth(request, { allowPasswordChangePending: true });
    const input = await validateBody(changePasswordSchema, request);

    // 2. Fetch current password hash
    const userRecord = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, role: true, passwordHash: true, providerId: true },
    });

    if (!userRecord) {
      throw new BadRequestError("User record not found");
    }

    // 3. Verify current password
    const isCurrentValid = await verifyPassword(input.currentPassword, userRecord.passwordHash);
    if (!isCurrentValid) {
      throw new BadRequestError("The current password provided is incorrect.", "INVALID_CURRENT_PASSWORD");
    }

    // 4. Ensure new password is not identical to current password
    if (input.currentPassword === input.newPassword) {
      throw new BadRequestError(
        "New password cannot be the same as your current temporary password.",
        "PASSWORD_IDENTICAL"
      );
    }

    // 5. Hash new password and update user state
    const newPasswordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        passwordHash: newPasswordHash,
        forcePasswordChange: false, // Completes the forced activation flow
      },
    });

    // 6. Security Invalidation: Revoke all previous refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: { userId: authUser.id },
      data: { revoked: true },
    });

    // 7. Issue fresh tokens with forcePasswordChange set to false
    const newAccessToken = signAccessToken({
      sub: authUser.id,
      email: authUser.email,
      role: authUser.role,
      providerId: authUser.providerId,
      forcePasswordChange: false,
    });

    const { token: newRefreshToken, tokenId } = signRefreshToken(authUser.id);
    const tokenHash = hashToken(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        tokenHash,
        userId: authUser.id,
        expiresAt,
      },
    });

    // 8. Platform Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: authUser.id,
        actorRole: authUser.role,
        action: "PASSWORD_CHANGED",
        entityType: "USER",
        entityId: authUser.id,
        newState: { forcePasswordChangeCleared: true },
      },
    });

    // 9. Response & updated cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "Password updated successfully. Forced password change completed.",
        data: {
          accessToken: newAccessToken,
          forcePasswordChange: false,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

    setAuthCookies(response, newAccessToken, newRefreshToken);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
