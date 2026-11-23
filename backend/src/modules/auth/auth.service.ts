import bcrypt from 'bcryptjs';
import prisma from '../../config/db';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { RegisterInput, LoginInput } from './auth.validation';
import { SafeUser } from '../../middleware/auth';

const BCRYPT_SALT_ROUNDS = 12;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: SafeUser;
  tokens: AuthTokens;
}

export class AuthService {
  /**
   * Register a new Customer or Partner Owner
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    const { fullName, email, phone, password, role } = input;

    // Check if email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError('An account with this email address already exists.');
      }
      throw new ConflictError('An account with this mobile number already exists.');
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        role: role || 'CUSTOMER',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        mustChangePassword: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return {
      user,
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Log in user using email or phone
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const { emailOrPhone, password } = input;

    // Search user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone.toLowerCase() },
          { phone: emailOrPhone },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials. Check your email/phone and password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated. Please contact BOOKKARO Patna desk.');
    }

    // Compare bcrypt password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials. Check your email/phone and password.');
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const safeUser: SafeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return {
      user: safeUser,
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Refresh session tokens
   */
  async refresh(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          mustChangePassword: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token or inactive account.');
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = signAccessToken(tokenPayload);
      const newRefreshToken = signRefreshToken(tokenPayload);

      return {
        user,
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch {
      throw new UnauthorizedError('Expired or invalid refresh token. Please sign in again.');
    }
  }

  /**
   * Get authenticated user profile
   */
  async getMe(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        mustChangePassword: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User profile not found.');
    }

    return user;
  }
}

export const authService = new AuthService();
