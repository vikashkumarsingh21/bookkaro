import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { BookingRequest } from '@/types/booking';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRequest;
  onRaiseDispute: (
    bookingId: string,
    disputeData: {
      ticketId: string;
      reason: string;
      description: string;
    }
  ) => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  booking,
  onRaiseDispute,
}) => {
  const [reason, setReason] = useState<string>('Partner refused to honor confirmed booking');
  const [description, setDescription] = useState<string>('');
  const [resolutionPreference, setResolutionPreference] = useState<string>('Immediate token refund');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const disputeReasons = [
    'Partner refused to honor confirmed booking',
    'Excessive venue delay (>45 minutes past booked time)',
    'Substandard service quality or hygiene violation',
    'Billing discrepancy / extra charges demanded above app rate',
    'Doctor or therapist was absent from the clinic/salon',
    'Vehicle returned with damage or incomplete service',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const ticketId = `DISP-PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    onRaiseDispute(booking.id, {
      ticketId,
      reason,
      description: `${description.trim()} [Requested Resolution: ${resolutionPreference}]`,
    });

    setSubmittedTicket(ticketId);
  };

  const handleFinish = () => {
    setSubmittedTicket(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Raise Dispute / Contact Support"
      description={`Customer Grievance for Booking #${booking.bookingReference}`}
      maxWidth="md"
    >
      {submittedTicket ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF1EB] text-[#C25E28] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-[#141413]">
            Dispute Registered
          </h3>
          <div className="inline-block px-3 py-1 bg-[#FAF1EB] text-[#C25E28] font-mono font-bold text-xs rounded-full border border-[#F3DEC9]">
            Ticket ID: {submittedTicket}
          </div>
          <p className="text-xs text-[#52524E] max-w-sm mx-auto">
            Our Patna Merchant Grievance Officer has placed this booking on hold. The partner ({booking.providerName}) has been notified to provide an explanation within 4 business hours.
          </p>
          <div className="pt-3">
            <Button variant="primary" size="sm" onClick={handleFinish}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Dispute Warning Notice */}
          <div className="p-3 rounded-xl bg-[#FAF1EB] border border-[#F3DEC9] flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-[#C25E28] shrink-0 mt-0.5" />
            <div className="text-xs text-[#52524E]">
              <strong className="text-[#141413] block mb-0.5">BOOKKARO Customer Protection Guarantee</strong>
              If a Patna partner declines your verified slot or violates published pricing, our mediation team will issue an instant token refund or alternate booking credit.
            </div>
          </div>

          {/* Reason Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#141413]">
              Primary Reason for Dispute <span className="text-[#C25E28]">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none text-[#141413] bg-white cursor-pointer"
            >
              {disputeReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#141413]">
              Detailed Explanation <span className="text-[#C25E28]">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State what occurred at the venue, who you spoke with, and any receipts or photos you have available."
              className="w-full text-xs p-3 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none text-[#141413] placeholder:text-[#A8A29E] bg-white resize-none"
            />
          </div>

          {/* Desired Resolution */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#141413]">
              Preferred Resolution
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                'Immediate token refund',
                'Priority Senior Manager call',
                'Re-booking with alternative partner',
                'Billing charge adjustment',
              ].map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setResolutionPreference(res)}
                  className={`
                    p-2 rounded-lg border text-left font-medium transition-all cursor-pointer
                    ${
                      resolutionPreference === res
                        ? 'border-[#C25E28] bg-[#FAF1EB] text-[#C25E28] font-semibold'
                        : 'border-[#E2DDD5] bg-white text-[#52524E] hover:border-[#141413]/30'
                    }
                  `}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-3 border-t border-[#E2DDD5] flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="submit"
              disabled={!description.trim()}
              leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
            >
              Submit Grievance
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
