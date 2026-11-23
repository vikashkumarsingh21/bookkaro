import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { validateBody } from "@/lib/validation";
import { createBookingReviewSchema } from "@/lib/booking/schemas";
import { createBookingReview } from "@/services/booking.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError, NotFoundError } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    const { id } = await props.params;

    if (!id) {
      throw new NotFoundError("Booking ID parameter");
    }

    const input = await validateBody(createBookingReviewSchema, request);
    const review = await createBookingReview(id, authUser, input);

    return apiSuccess(
      {
        review: {
          id: review.id,
          bookingId: review.bookingId,
          rating: review.rating,
          reviewText: review.reviewText,
          isVerifiedBooking: review.isVerifiedBooking,
          createdAt: review.createdAt,
        },
      },
      "Verified booking review submitted successfully.",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
