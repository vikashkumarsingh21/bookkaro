import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../src/lib/auth/jwt";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../src/lib/auth/schemas";
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  handleApiError,
} from "../src/lib/errors";
import { UserRole } from "@prisma/client";

async function runTests() {
  console.log("=================================================");
  console.log("🧪 BOOKKARO Backend Module 1 Verification Suite");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${label}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${label}`);
      failed++;
    }
  }

  // 1. Password Hashing & Verification
  console.log("1. Password Security & Bcrypt Validation");
  const plain = "StrongPassword@2026";
  const hashed = await hashPassword(plain);
  assert(hashed !== plain && hashed.startsWith("$2"), "Password hashed with bcrypt salt");
  assert(await verifyPassword(plain, hashed), "Correct password verified successfully");
  assert(!(await verifyPassword("WrongPassword@123", hashed)), "Incorrect password rejected");

  // 2. JWT Access & Refresh Tokens
  console.log("\n2. JWT Cryptographic Signing & Validation");
  const claims = {
    sub: "user-uuid-1234",
    email: "patna.clinic@example.com",
    role: UserRole.PROVIDER_OWNER,
    providerId: "prov-pat-01",
    forcePasswordChange: false,
  };

  const accessToken = signAccessToken(claims);
  const decodedAccess = verifyAccessToken(accessToken);
  assert(decodedAccess.sub === claims.sub, "Access token subject decoded");
  assert(decodedAccess.role === UserRole.PROVIDER_OWNER, "Access token role verified as PROVIDER_OWNER");
  assert(decodedAccess.type === "access", "Access token claims verified");

  const { token: refreshToken, tokenId } = signRefreshToken(claims.sub);
  const decodedRefresh = verifyRefreshToken(refreshToken);
  assert(decodedRefresh.sub === claims.sub, "Refresh token subject decoded");
  assert(decodedRefresh.tokenId === tokenId, "Refresh token family ID matched");

  const tokenHash1 = hashToken(refreshToken);
  const tokenHash2 = hashToken(refreshToken);
  assert(tokenHash1 === tokenHash2 && tokenHash1.length === 64, "Deterministic SHA-256 token hash generated");

  // 3. Zod Schemas Validation
  console.log("\n3. Zod Request Schema Validation");
  const validRegister = registerSchema.safeParse({
    email: "customer@patna.in",
    phone: "9835012345",
    password: "SecurePassword@1",
    firstName: "Amit",
    lastName: "Kumar",
  });
  assert(validRegister.success, "Valid customer registration accepted");

  const invalidPhone = registerSchema.safeParse({
    email: "customer@patna.in",
    phone: "1234567890", // Invalid Indian phone (doesn't start with 6-9)
    password: "SecurePassword@1",
    firstName: "Amit",
    lastName: "Kumar",
  });
  assert(!invalidPhone.success, "Invalid Indian phone rejected");

  const weakPassword = registerSchema.safeParse({
    email: "customer@patna.in",
    phone: "9835012345",
    password: "weak", // Missing uppercase, number, length < 8
    firstName: "Amit",
    lastName: "Kumar",
  });
  assert(!weakPassword.success, "Weak password rejected by complexity policy");

  const validLogin = loginSchema.safeParse({
    identifier: "customer@patna.in",
    password: "Password@123",
  });
  assert(validLogin.success, "Valid login input parsed");

  const validPasswordChange = changePasswordSchema.safeParse({
    currentPassword: "OldPassword@123",
    newPassword: "NewStrongPassword@2026",
  });
  assert(validPasswordChange.success, "Valid password change input parsed");

  // 4. Centralized Error Handling
  console.log("\n4. Centralized Error Handling & AppError Boundary");
  const notFound = new AppError("Resource not found", 404, "NOT_FOUND");
  assert(notFound.statusCode === 404 && notFound.errorCode === "NOT_FOUND", "AppError statusCode and errorCode verified");

  const unauthorized = new UnauthorizedError("Session expired", "EXPIRED");
  assert(unauthorized.statusCode === 401 && unauthorized.errorCode === "EXPIRED", "UnauthorizedError verified");

  const forbidden = new ForbiddenError("Denied", "FORBIDDEN");
  assert(forbidden.statusCode === 403 && forbidden.errorCode === "FORBIDDEN", "ForbiddenError verified");

  const conflict = new ConflictError("Email already in use");
  assert(conflict.statusCode === 409 && conflict.errorCode === "CONFLICT", "ConflictError verified");

  const validationErr = new ValidationError("Invalid inputs", [{ field: "email" }]);
  assert(validationErr.statusCode === 422, "ValidationError statusCode 422 verified");

  // Test handleApiError with Zod error
  const zodResult = registerSchema.safeParse({ email: "invalid-email" });
  if (!zodResult.success) {
    const apiErrorResponse = handleApiError(zodResult.error);
    assert(apiErrorResponse.status === 422, "handleApiError transforms ZodError to HTTP 422");
  }

  // 5. Test handleApiError with domain AppError
  const handledConflict = handleApiError(conflict);
  assert(handledConflict.status === 409, "handleApiError transforms ConflictError to HTTP 409");

  console.log(`\n=================================================`);
  console.log(`🎯 Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`=================================================`);

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
