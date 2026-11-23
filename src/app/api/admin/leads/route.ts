import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole, CRMStage, ProviderCategory } from "@prisma/client";
import { getCRMLeads, createCRMLead } from "@/services/admin.service";
import { createLeadSchema } from "@/lib/admin/schemas";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const { searchParams } = new URL(request.url);

    const stageParam = searchParams.get("stage") as CRMStage | null;
    const categoryParam = searchParams.get("category") as ProviderCategory | null;
    const city = searchParams.get("city") || undefined;
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 25;

    const data = await getCRMLeads({
      stage: stageParam && Object.values(CRMStage).includes(stageParam) ? stageParam : undefined,
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

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireRole(request, [UserRole.ADMIN]);
    const body = (await request.json()) as unknown;
    const validated = createLeadSchema.parse(body);

    const ipAddress = request.headers.get("x-forwarded-for") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const lead = await createCRMLead(validated, {
      id: authUser.id,
      name: `${authUser.firstName} ${authUser.lastName}`.trim(),
      role: authUser.role,
      ipAddress,
      userAgent,
    });

    return apiSuccess(lead, "Sales lead created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
