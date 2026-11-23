import { NextResponse } from "next/server";
import { getAuthTokensFromRequest, setAuthCookies } from "@/lib/auth/cookies";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  hashToken,
} from "@/lib/auth/jwt";
import { UnauthorizedError, handleApiError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function POST(request: Request) {
  try {
    // 1. Extract refresh token from cookie or body
    let refreshToken: string | null = null;
    const { refreshToken: cookieRefreshToken } = getAuthTokensFromRequest(request);

    if (cookieRefreshToken) {
      refreshToken = cookieRefreshToken;
    } else {
      try {
        const body = (await request.json()) as { refreshToken?: string };
        if (body?.refreshToken) refreshToken = body.refreshToken;
      } catch {
        // No JSON body
      }
    }

    if (!refreshToken) {
      throw new UnauthorizedError(
        "Refresh token not provided in request cookies or payload.",
        "MISSING_REFRESH_TOKEN"
      );
    }

    // 2. Cryptographic verification
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    // 3. Database lookup for rotation & reuse detection
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            forcePasswordChange: true,
            providerId: true,
            ownedProviders: {
              select: { id: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedError(
        "Invalid refresh token. Token record does not exist.",
        "TOKEN_REVOKED"
      );
    }

    // 4. Token Reuse Detection: If an already revoked token is submitted, revoke ALL tokens for this user!
    if (storedToken.revoked) {
      await prisma.refreshToken.updateMany({
        where: { userId: payload.sub },
        data: { revoked: true },
      });

      throw new UnauthorizedError(
        "Security Alert: Attempted reuse of revoked token family. All sessions have been terminated. Please log in again.",
        "TOKEN_REUSE_DETECTED"
      );
    }

    // 5. Check Expiry
    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });
      throw new UnauthorizedError("Refresh token has expired. Please log in again.", "REFRESH_EXPIRED");
    }

    const { user } = storedToken;
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Associated user account is deactivated.", "ACCOUNT_INACTIVE");
    }

    // 6. Resolve provider ID
    let associatedProviderId: string | null = user.providerId;
    if (user.role === UserRole.PROVIDER_OWNER && user.ownedProviders.length > 0) {
      associatedProviderId = user.ownedProviders[0].id;
    }

    // 7. Token Rotation: Revoke current token and issue new token pair
    const { token: newRefreshToken, tokenId: newRefreshTokenId } = signRefreshToken(user.id);
    const newTokenHash = hashToken(newRefreshToken);

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          revoked: true,
          replacedByToken: newRefreshTokenId,
        },
      }),
      prisma.refreshToken.create({
        data: {
          id: newRefreshTokenId,
          tokenHash: newTokenHash,
          userId: user.id,
          expiresAt: newExpiresAt,
        },
      }),
    ]);

    // 8. Generate fresh Access Token
    const newAccessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      providerId: associatedProviderId,
      forcePasswordChange: user.forcePasswordChange,
    });

    // 9. Send response & updated HTTP-only cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "Token refreshed successfully.",
        data: {
          accessToken: newAccessToken,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            forcePasswordChange: user.forcePasswordChange,
            providerId: associatedProviderId,
          },
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
