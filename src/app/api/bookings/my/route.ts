import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { getCustomerBookings } from "@/services/booking.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const tab =
      (searchParams.get("tab") as
        | "active"
        | "upcoming"
        | "completed"
        | "cancelled"
        | "all") || "all";

    const bookings = await getCustomerBookings(authUser.id, tab);

    return apiSuccess({
      tab,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
