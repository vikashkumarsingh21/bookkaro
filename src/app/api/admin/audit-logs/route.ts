import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { getPlatformAuditLogs } from "@/services/admin.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const { searchParams } = new URL(request.url);

    const actorRole = searchParams.get("actorRole") || undefined;
    const entityType = searchParams.get("entityType") || undefined;
    const action = searchParams.get("action") || undefined;
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 25;

    const data = await getPlatformAuditLogs({
      actorRole,
      entityType,
      action,
      search,
      page,
      limit,
    });

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
