import { NextResponse } from "next/server";

export const COOKIE_ACCESS_TOKEN = "bk_access_token";
export const COOKIE_REFRESH_TOKEN = "bk_refresh_token";

const isProduction = process.env.NODE_ENV === "production";

// 15 minutes in seconds
const ACCESS_COOKIE_MAX_AGE = 15 * 60; 
// 7 days in seconds
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Sets secure HTTP-only cookies on Next.js response.
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  response.cookies.set(COOKIE_ACCESS_TOKEN, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  response.cookies.set(COOKIE_REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/api/auth", // Restricted only to auth refresh/logout endpoints
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

/**
 * Clears authentication cookies upon logout.
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(COOKIE_ACCESS_TOKEN, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set(COOKIE_REFRESH_TOKEN, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });
}

/**
 * Extracts access and refresh tokens from HTTP Cookies or Authorization header.
 */
export function getAuthTokensFromRequest(request: Request): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  // 1. Extract from Authorization Bearer header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.substring(7).trim();
  }

  // 2. Extract from Cookie header
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      if (name && rest.length > 0) {
        acc[name] = decodeURIComponent(rest.join("="));
      }
      return acc;
    }, {} as Record<string, string>);

    if (!accessToken && cookies[COOKIE_ACCESS_TOKEN]) {
      accessToken = cookies[COOKIE_ACCESS_TOKEN];
    }
    if (cookies[COOKIE_REFRESH_TOKEN]) {
      refreshToken = cookies[COOKIE_REFRESH_TOKEN];
    }
  }

  return { accessToken, refreshToken };
}
