import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errorCode = "INTERNAL_SERVER_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", errorCode = "BAD_REQUEST", details?: unknown) {
    super(message, 400, errorCode, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", errorCode = "UNAUTHORIZED") {
    super(message, 401, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message = "You do not have permission to access this resource",
    errorCode = "FORBIDDEN"
  ) {
    super(message, 403, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", errorCode = "NOT_FOUND") {
    super(`${resource} not found`, 404, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict detected", errorCode = "CONFLICT", details?: unknown) {
    super(message, 409, errorCode, details);
  }
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  const timestamp = new Date().toISOString();

  // 1. Zod Validation Errors
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed. Please review the provided inputs.",
          details: formattedErrors,
          timestamp,
        },
      },
      { status: 422 }
    );
  }

  // 2. Custom App Errors (Domain & Operational)
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.errorCode,
          message: error.message,
          details: error.details,
          timestamp,
        },
      },
      { status: error.statusCode }
    );
  }

  // 3. Fallback Internal Server Error
  console.error("[CRITICAL UNHANDLED ERROR]:", error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected internal server error occurred. Please try again later.",
        timestamp,
      },
    },
    { status: 500 }
  );
}
