import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import {
  resolveMerchantProvider,
  getProviderBilling,
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
    const billingData = await getProviderBilling(provider.id);

    return apiSuccess(billingData);
  } catch (error) {
    return handleApiError(error);
  }
}
