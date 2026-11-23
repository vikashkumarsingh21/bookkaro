import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { getPlatformAnalytics } from "@/services/admin.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const data = await getPlatformAnalytics();
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
