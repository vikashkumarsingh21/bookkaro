import { BookingStatus } from '@prisma/client';

/**
 * Strict BOOKKARO State Machine Transition Map
 * Enforces valid state transitions across Customer, Partner, and Admin actions
 */
export const VALID_BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: [
    BookingStatus.ACCEPTED,
    BookingStatus.CONFIRMED,
    BookingStatus.DECLINED,
    BookingStatus.EXPIRED,
    BookingStatus.CANCELLED,
  ],
  ACCEPTED: [
    BookingStatus.CONFIRMED,
    BookingStatus.DECLINED,
    BookingStatus.CANCELLED,
    BookingStatus.EXPIRED,
  ],
  CONFIRMED: [
    BookingStatus.COMPLETED,
    BookingStatus.NO_SHOW,
    BookingStatus.CANCELLED,
    BookingStatus.DISPUTED,
  ],
  COMPLETED: [BookingStatus.DISPUTED],
  DECLINED: [],
  EXPIRED: [],
  CANCELLED: [BookingStatus.REFUND_REQUESTED, BookingStatus.DISPUTED],
  NO_SHOW: [BookingStatus.DISPUTED],
  DISPUTED: [BookingStatus.REFUND_REQUESTED, BookingStatus.REFUNDED],
  REFUND_REQUESTED: [BookingStatus.REFUNDED, BookingStatus.DECLINED],
  REFUNDED: [],
};

export const isValidBookingTransition = (
  from: BookingStatus,
  to: BookingStatus
): boolean => {
  const allowed = VALID_BOOKING_TRANSITIONS[from];
  return Boolean(allowed && allowed.includes(to));
};
