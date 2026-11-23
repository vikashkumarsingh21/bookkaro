import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // 1. Handled Operational Errors (AppError instances)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(config.isProduction ? {} : { stack: err.stack }),
    });
    return;
  }

  // 2. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed for request parameters',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors,
    });
    return;
  }

  // 3. Prisma Known Request Errors
  if ('code' in err && typeof (err as { code: unknown }).code === 'string') {
    const prismaCode = (err as { code: string }).code;
    if (prismaCode === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A resource with this unique field already exists (duplicate entry)',
        code: 'CONFLICT_DUPLICATE_KEY',
      });
      return;
    }
    if (prismaCode === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'The requested record was not found in the database',
        code: 'RECORD_NOT_FOUND',
      });
      return;
    }
  }

  // 4. Fallback for unhandled internal exceptions
  console.error('[UNHANDLED_ERROR]:', err);

  res.status(500).json({
    success: false,
    message: config.isProduction
      ? 'An unexpected error occurred on the BOOKKARO server'
      : err.message || 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
};
