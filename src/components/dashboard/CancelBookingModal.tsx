import React, { useState } from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { BookingRequest } from '@/types/booking';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRequest;
  onConfirmCancel: (bookingId: string, reason: string) => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirmCancel,
}) => {
  const [reason, setReason] = useState<string>('Sudden personal schedule change');
  const [customReason, setCustomReason] = useState<string>('');

  const cancellationReasons = [
    'Sudden personal schedule change',
    'Patna traffic / transit delay',
    'Booked incorrect date, time, or service variant',
    'Medical or family emergency',
    'No longer needed / found alternative service',
    'Other reason',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Other reason' && customReason.trim() ? customReason.trim() : reason;
    onConfirmCancel(booking.id, finalReason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Booking Request?"
      description={`Withdraw slot with ${booking.providerName}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="p-3 rounded-xl bg-[#FAF1EB] border border-[#F3DEC9] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#C25E28] shrink-0 mt-0.5" />
          <div className="text-xs text-[#52524E]">
            Are you sure you want to cancel booking <strong className="text-[#141413] font-mono">#{booking.bookingReference}</strong>? The allocated slot will be released back to other customers in Patna.
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#141413]">
            Reason for cancellation <span className="text-[#C25E28]">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none text-[#141413] bg-white cursor-pointer"
          >
            {cancellationReasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {reason === 'Other reason' && (
          <div className="space-y-1">
            <input
              type="text"
              required
              placeholder="Provide a brief explanation..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none text-[#141413] bg-white"
            />
          </div>
        )}

        <div className="pt-2 border-t border-[#E2DDD5] flex items-center justify-end gap-2.5">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Keep Booking
          </Button>
          <Button
            variant="danger"
            size="sm"
            type="submit"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Confirm Cancellation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
