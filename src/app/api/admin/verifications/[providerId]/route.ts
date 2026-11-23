import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import {
  getVerificationDossier,
  updateVerificationStatus,
} from "@/services/admin.service";
import { updateVerificationSchema } from "@/lib/admin/schemas";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ providerId: string }> }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const { providerId } = await props.params;

    const dossier = await getVerificationDossier(providerId);
    return apiSuccess(dossier);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ providerId: string }> }
) {
  try {
    const authUser = await requireRole(request, [UserRole.ADMIN]);
    const { providerId } = await props.params;
    const body = (await request.json()) as unknown;
    const validated = updateVerificationSchema.parse(body);

    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const result = await updateVerificationStatus(providerId, validated, {
      id: authUser.id,
      name: `${authUser.firstName} ${authUser.lastName}`.trim(),
      role: authUser.role,
      ipAddress,
      userAgent,
    });

    return apiSuccess(result, result.message);
  } catch (error) {
    return handleApiError(error);
  }
}
