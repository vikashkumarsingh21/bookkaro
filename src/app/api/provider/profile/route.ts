import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { validateBody } from "@/lib/validation";
import { updateProviderProfileSchema } from "@/lib/provider/schemas";
import {
  resolveMerchantProvider,
  getProviderProfile,
  updateProviderProfile,
} from "@/services/provider.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

const ALLOWED_MERCHANT_ROLES = [
  UserRole.PROVIDER_OWNER,
  UserRole.PROVIDER_STAFF,
  UserRole.ADMIN,
];

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireRole(request, ALLOWED_MERCHANT_ROLES);
    const { searchParams } = new URL(request.url);
    const targetProviderId = searchParams.get("providerId") || undefined;

    const provider = await resolveMerchantProvider(authUser, targetProviderId);
    const profile = await getProviderProfile(provider.id);

    return apiSuccess({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireRole(request, [
      UserRole.PROVIDER_OWNER,
      UserRole.ADMIN,
    ]);
    const { searchParams } = new URL(request.url);
    const targetProviderId = searchParams.get("providerId") || undefined;

    const provider = await resolveMerchantProvider(authUser, targetProviderId);
    const input = await validateBody(updateProviderProfileSchema, request);

    const updatedProfile = await updateProviderProfile(
      provider.id,
      input,
      authUser
    );

    return apiSuccess(
      { profile: updatedProfile },
      "Provider profile updated successfully."
    );
  } catch (error) {
    return handleApiError(error);
  }
}
