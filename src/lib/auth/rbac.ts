import { UserRole } from "@prisma/client";
import { getAuthTokensFromRequest } from "./cookies";
import { verifyAccessToken } from "./jwt";
import { UnauthorizedError, ForbiddenError, handleApiError } from "../errors";
import prisma from "../prisma";
import { NextResponse } from "next/server";

export interface AuthenticatedUser {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  forcePasswordChange: boolean;
  providerId: string | null;
}

export interface AuthContext {
  user: AuthenticatedUser;
  params?: Record<string, string | string[]>;
}

/**
 * Extracts and verifies the access token from cookies or Authorization header,
 * checks database to ensure user is active and account is valid.
 */
export async function requireAuth(
  request: Request,
  options?: { allowPasswordChangePending?: boolean }
): Promise<AuthenticatedUser> {
  const { accessToken } = getAuthTokensFromRequest(request);

  if (!accessToken) {
    throw new UnauthorizedError(
      "Authentication required. No session token found.",
      "NO_TOKEN"
    );
  }

  // 1. Verify cryptographic signature & expiration
  const payload = verifyAccessToken(accessToken);

  // 2. Fetch live user record to verify active status
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      forcePasswordChange: true,
      providerId: true,
    },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedError(
      "User account does not exist or has been deactivated.",
      "ACCOUNT_INACTIVE"
    );
  }

  // 3. Enforce password change for newly activated merchant accounts
  if (
    user.forcePasswordChange &&
    !options?.allowPasswordChangePending
  ) {
    throw new ForbiddenError(
      "Password change required before accessing this resource.",
      "FORCE_PASSWORD_CHANGE_REQUIRED"
    );
  }

  return user;
}

/**
 * Guard that enforces authentication AND checks if user has one of the allowed roles.
 */
export async function requireRole(
  request: Request,
  allowedRoles: UserRole[],
  options?: { allowPasswordChangePending?: boolean }
): Promise<AuthenticatedUser> {
  const user = await requireAuth(request, options);

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(
      `Access denied. Requires one of roles: [${allowedRoles.join(", ")}]. Current role: ${user.role}`,
      "INSUFFICIENT_PERMISSIONS"
    );
  }

  return user;
}

/**
 * Higher-order Route Handler wrapper providing declarative RBAC, automatic user injection,
 * and unified error boundary handling.
 */
export type AuthenticatedRouteHandler<T = unknown> = (
  request: Request,
  context: AuthContext
) => Promise<NextResponse<T>>;

export function withAuth<T>(
  handler: AuthenticatedRouteHandler<T>,
  options?: {
    roles?: UserRole[];
    allowPasswordChangePending?: boolean;
  }
) {
  return async (
    request: Request,
    routeProps?: { params: Promise<Record<string, string | string[]>> }
  ): Promise<NextResponse> => {
    try {
      const user = options?.roles
        ? await requireRole(request, options.roles, {
            allowPasswordChangePending: options?.allowPasswordChangePending,
          })
        : await requireAuth(request, {
            allowPasswordChangePending: options?.allowPasswordChangePending,
          });

      const resolvedParams = routeProps?.params
        ? await routeProps.params
        : undefined;

      return await handler(request, { user, params: resolvedParams });
    } catch (error) {
      return handleApiError(error);
    }
  };
}
