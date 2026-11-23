import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema, refreshSchema } from './auth.validation';
import { setAuthCookies, clearAuthCookies } from '../../utils/jwt';
import { UnauthorizedError } from '../../utils/errors';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);

      // Set secure HTTP-only cookies
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Welcome to BOOKKARO Patna.',
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      // Set secure HTTP-only cookies
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Look for refresh token in cookies or fallback to request body
      const tokenFromCookie = req.cookies?.refresh_token;
      const parsedBody = refreshSchema.safeParse(req.body);
      const tokenFromBody = parsedBody.success ? parsedBody.data.refreshToken : undefined;

      const tokenToUse = tokenFromCookie || tokenFromBody;

      if (!tokenToUse) {
        throw new UnauthorizedError('Refresh token is required.');
      }

      const result = await authService.refresh(tokenToUse);

      // Rotate cookies cleanly
      setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Session refreshed successfully.',
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      clearAuthCookies(res);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Unauthorized');
      }

      const user = await authService.getMe(req.user.id);

      res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
