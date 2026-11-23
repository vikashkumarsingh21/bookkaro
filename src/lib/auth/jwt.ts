import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "node:crypto";
import { UserRole } from "@prisma/client";
import { UnauthorizedError } from "../errors";

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  "bookkaro_prod_super_secure_access_secret_key_2026_jwt";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "bookkaro_prod_super_secure_refresh_secret_key_2026_jwt";

const ACCESS_TOKEN_EXPIRY = (process.env.JWT_ACCESS_EXPIRY || "15m") as SignOptions["expiresIn"];
const REFRESH_TOKEN_EXPIRY = (process.env.JWT_REFRESH_EXPIRY || "7d") as SignOptions["expiresIn"];

export interface AuthClaims {
  sub: string; // userId
  email: string;
  role: UserRole;
  providerId?: string | null;
  forcePasswordChange: boolean;
}

export interface AccessTokenPayload extends AuthClaims {
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string; // userId
  type: "refresh";
  tokenId: string; // unique token family identifier
}

/**
 * Generates an Access Token with user claims and short lifespan (default: 15m).
 */
export function signAccessToken(claims: AuthClaims): string {
  const payload: AccessTokenPayload = {
    ...claims,
    type: "access",
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: "HS256",
  });
}

/**
 * Generates a Refresh Token with unique tokenId for rotation tracking (default: 7d).
 */
export function signRefreshToken(userId: string, tokenId = crypto.randomUUID()): { token: string; tokenId: string } {
  const payload: RefreshTokenPayload = {
    sub: userId,
    type: "refresh",
    tokenId,
  };

  const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: "HS256",
  });

  return { token, tokenId };
}

/**
 * Computes a deterministic SHA-256 hash of a refresh token to safely store in PostgreSQL.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Verifies and decodes an Access Token. Throws UnauthorizedError on invalid/expired.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
    if (decoded.type !== "access") {
      throw new UnauthorizedError("Invalid token type", "INVALID_TOKEN_TYPE");
    }
    return decoded;
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Access token has expired. Please refresh your session.", "TOKEN_EXPIRED");
    }
    throw new UnauthorizedError("Invalid access token signature", "INVALID_TOKEN");
  }
}

/**
 * Verifies and decodes a Refresh Token. Throws UnauthorizedError on invalid/expired.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
    if (decoded.type !== "refresh") {
      throw new UnauthorizedError("Invalid token type", "INVALID_TOKEN_TYPE");
    }
    return decoded;
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Refresh token has expired. Please log in again.", "REFRESH_EXPIRED");
    }
    throw new UnauthorizedError("Invalid refresh token", "INVALID_REFRESH_TOKEN");
  }
}
