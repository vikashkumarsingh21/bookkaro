import { NextResponse } from "next/server";
import { getAuthTokensFromRequest, clearAuthCookies } from "@/lib/auth/cookies";
import { hashToken } from "@/lib/auth/jwt";
import { handleApiError } from "@/lib/errors";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { refreshToken } = getAuthTokensFromRequest(request);

    // If a refresh token is present, revoke it in database
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true },
      }).catch(() => {
        // Silently continue if already absent or revoked
      });
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Successfully signed out.",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

    clearAuthCookies(response);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
