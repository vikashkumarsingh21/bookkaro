import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import {
  getCRMLeadById,
  updateCRMLead,
  deleteCRMLead,
} from "@/services/admin.service";
import { updateLeadSchema } from "@/lib/admin/schemas";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const { id } = await props.params;

    const lead = await getCRMLeadById(id);
    return apiSuccess(lead);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireRole(request, [UserRole.ADMIN]);
    const { id } = await props.params;
    const body = (await request.json()) as unknown;
    const validated = updateLeadSchema.parse(body);

    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const updatedLead = await updateCRMLead(id, validated, {
      id: authUser.id,
      name: `${authUser.firstName} ${authUser.lastName}`.trim(),
      role: authUser.role,
      ipAddress,
      userAgent,
    });

    return apiSuccess(updatedLead, "Sales lead updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireRole(request, [UserRole.ADMIN]);
    const { id } = await props.params;

    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const result = await deleteCRMLead(id, {
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
