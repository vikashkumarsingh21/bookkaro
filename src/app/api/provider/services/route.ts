import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { validateBody } from "@/lib/validation";
import {
  createProviderServiceSchema,
  updateProviderServiceSchema,
} from "@/lib/provider/schemas";
import {
  resolveMerchantProvider,
  getProviderServices,
  createProviderService,
  updateProviderService,
  deleteProviderService,
} from "@/services/provider.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError, BadRequestError } from "@/lib/errors";

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
    const services = await getProviderServices(provider.id);

    return apiSuccess({ count: services.length, services });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireRole(request, [
      UserRole.PROVIDER_OWNER,
      UserRole.ADMIN,
    ]);
    const { searchParams } = new URL(request.url);
    const targetProviderId = searchParams.get("providerId") || undefined;

    const provider = await resolveMerchantProvider(authUser, targetProviderId);
    const input = await validateBody(createProviderServiceSchema, request);

    const service = await createProviderService(provider.id, input);

    return apiSuccess(
      { service },
      "New catalog service created successfully.",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireRole(request, [
      UserRole.PROVIDER_OWNER,
      UserRole.ADMIN,
    ]);
    const { searchParams } = new URL(request.url);
    const targetProviderId = searchParams.get("providerId") || undefined;

    const provider = await resolveMerchantProvider(authUser, targetProviderId);
    const input = await validateBody(updateProviderServiceSchema, request);

    const service = await updateProviderService(provider.id, input);

    return apiSuccess({ service }, "Service updated successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await requireRole(request, [
      UserRole.PROVIDER_OWNER,
      UserRole.ADMIN,
    ]);
    const { searchParams } = new URL(request.url);
    const targetProviderId = searchParams.get("providerId") || undefined;
    const serviceId = searchParams.get("id");

    if (!serviceId) {
      throw new BadRequestError("Service ID parameter is required for deletion.");
    }

    const provider = await resolveMerchantProvider(authUser, targetProviderId);
    const result = await deleteProviderService(provider.id, serviceId);

    return apiSuccess(result, "Service successfully removed.");
  } catch (error) {
    return handleApiError(error);
  }
}
