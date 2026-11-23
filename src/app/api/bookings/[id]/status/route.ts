import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { validateBody } from "@/lib/validation";
import { updateBookingStatusSchema } from "@/lib/booking/schemas";
import { updateBookingStatus } from "@/services/booking.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError, NotFoundError } from "@/lib/errors";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    const { id } = await props.params;

    if (!id) {
      throw new NotFoundError("Booking ID parameter");
    }

    const input = await validateBody(updateBookingStatusSchema, request);
    const updated = await updateBookingStatus(id, authUser, input);

    return apiSuccess(
      {
        booking: {
          id: updated.id,
          bookingCode: updated.bookingCode,
          status: updated.status,
          acceptedAt: updated.acceptedAt,
          confirmedAt: updated.confirmedAt,
          completedAt: updated.completedAt,
          cancelledAt: updated.cancelledAt,
          declineReason: updated.declineReason,
          finalBillAmount: updated.finalBillAmount ? Number(updated.finalBillAmount) : null,
          paymentStatus: updated.paymentStatus,
        },
      },
      `Booking status successfully updated to ${updated.status}.`
    );
  } catch (error) {
    return handleApiError(error);
  }
}
