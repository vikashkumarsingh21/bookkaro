import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import {
  resolveMerchantProvider,
  getProviderBookingsQueue,
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

    const filters = {
      status: searchParams.get("status") || undefined,
      date: searchParams.get("date") || undefined,
      page: searchParams.has("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.has("limit") ? Number(searchParams.get("limit")) : 15,
    };

    const queueData = await getProviderBookingsQueue(provider.id, filters);

    return apiSuccess(queueData);
  } catch (error) {
    return handleApiError(error);
  }
}
