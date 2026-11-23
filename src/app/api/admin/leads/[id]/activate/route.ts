import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { activateCRMLead } from "@/services/admin.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireRole(request, [UserRole.ADMIN]);
    const { id } = await props.params;

    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const result = await activateCRMLead(id, {
      id: authUser.id,
      name: `${authUser.firstName} ${authUser.lastName}`.trim(),
      role: authUser.role,
      ipAddress,
      userAgent,
    });

    return apiSuccess(result, result.message, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
