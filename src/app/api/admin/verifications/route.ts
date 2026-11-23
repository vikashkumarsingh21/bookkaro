import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole, KYCStatus, ProviderCategory } from "@prisma/client";
import { getVerifications } from "@/services/admin.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const { searchParams } = new URL(request.url);

    const statusParam = searchParams.get("status") as KYCStatus | null;
    const categoryParam = searchParams.get("category") as ProviderCategory | null;
    const city = searchParams.get("city") || undefined;
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;

    const data = await getVerifications({
      status:
        statusParam && Object.values(KYCStatus).includes(statusParam)
          ? statusParam
          : undefined,
      category:
        categoryParam && Object.values(ProviderCategory).includes(categoryParam)
          ? categoryParam
          : undefined,
      city,
      search,
      page,
      limit,
    });

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
