import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { validateBody } from "@/lib/validation";
import { createProviderStaffSchema } from "@/lib/provider/schemas";
import {
  resolveMerchantProvider,
  createProviderStaff,
} from "@/services/provider.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireRole(request, [
      UserRole.PROVIDER_OWNER,
      UserRole.ADMIN,
    ]);
    const { searchParams } = new URL(request.url);
    const targetProviderId = searchParams.get("providerId") || undefined;

    const provider = await resolveMerchantProvider(authUser, targetProviderId);
    const input = await validateBody(createProviderStaffSchema, request);

    const result = await createProviderStaff(provider.id, input, authUser);

    return apiSuccess(
      result,
      "Staff member invited successfully. Temporary credentials provisioned.",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
