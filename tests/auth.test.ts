import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
} from "@/lib/auth/jwt";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "@/lib/auth/schemas";
import { UserRole } from "@prisma/client";
import {
  ConflictError,
  handleApiError,
} from "@/lib/errors";
import { z } from "zod";

describe("Auth & Security Unit Tests", () => {
  it("hashes password and verifies successfully with bcrypt", async () => {
    const raw = "SecurePass@2026";
    const hash = await hashPassword(raw);
    expect(hash).not.toBe(raw);
    expect(await verifyPassword(raw, hash)).toBe(true);
    expect(await verifyPassword("WrongPassword", hash)).toBe(false);
  });

  it("generates and verifies cryptographically signed JWT tokens", () => {
    const claims = {
      sub: "user-123",
      email: "test@bookkaro.in",
      role: UserRole.CUSTOMER,
      forcePasswordChange: false,
    };
    const token = signAccessToken(claims);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(claims.sub);
    expect(decoded.email).toBe(claims.email);
    expect(decoded.role).toBe(claims.role);

    const { token: refreshToken, tokenId } = signRefreshToken("user-123");
    const decodedRefresh = verifyRefreshToken(refreshToken);
    expect(decodedRefresh.sub).toBe("user-123");
    expect(decodedRefresh.tokenId).toBe(tokenId);

    const tokenHash = hashToken(refreshToken);
    expect(typeof tokenHash).toBe("string");
    expect(tokenHash.length).toBe(64); // SHA-256 hex
  });

  it("validates registration with Indian mobile number regex", () => {
    const valid = registerSchema.safeParse({
      firstName: "Vikas",
      lastName: "Kumar",
      email: "vikas@example.com",
      phone: "9835012345",
      password: "StrongPassword@123",
    });
    expect(valid.success).toBe(true);

    const invalidPhone = registerSchema.safeParse({
      firstName: "Vikas",
      lastName: "Kumar",
      email: "vikas@example.com",
      phone: "12345",
      password: "StrongPassword@123",
    });
    expect(invalidPhone.success).toBe(false);

    const validLogin = loginSchema.safeParse({
      identifier: "test@bookkaro.in",
      password: "StrongPassword@123",
    });
    expect(validLogin.success).toBe(true);

    const validChange = changePasswordSchema.safeParse({
      currentPassword: "OldPassword@123",
      newPassword: "NewStrongPassword@123",
    });
    expect(validChange.success).toBe(true);
  });

  it("enforces centralized error response formatting", () => {
    const appErr = new ConflictError("Account already exists");
    expect(appErr.statusCode).toBe(409);
    expect(appErr.errorCode).toBe("CONFLICT");

    const schema = z.object({ name: z.string().min(3) });
    const result = schema.safeParse({ name: "ab" });
    if (!result.success) {
      const response = handleApiError(result.error);
      expect(response.status).toBe(422);
    }
  });
});
