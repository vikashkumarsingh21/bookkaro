import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { validateBody } from "@/lib/validation";
import { createBookingSchema } from "@/lib/booking/schemas";
import { createBooking } from "@/services/booking.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const input = await validateBody(createBookingSchema, request);

    const booking = await createBooking(authUser, input);

    return apiSuccess(
      {
        booking: {
          id: booking.id,
          bookingCode: booking.bookingCode,
          verificationCode: booking.verificationCode,
          status: booking.status,
          bookingDate: booking.bookingDate,
          timeSlot: booking.timeSlot,
          estimatedBillAmount: Number(booking.estimatedBillAmount),
          tokenAmountPaid: Number(booking.tokenAmountPaid),
          paymentStatus: booking.paymentStatus,
          provider: booking.provider,
          branch: booking.branch,
          service: booking.service,
        },
      },
      "Booking request submitted successfully. Provider confirmation pending.",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
