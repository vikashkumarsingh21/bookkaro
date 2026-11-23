import React, { useState } from 'react';
import { Star, CheckCircle2, ShieldCheck, ThumbsUp } from 'lucide-react';
import { BookingRequest } from '@/types/booking';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRequest;
  onSubmitReview: (bookingId: string, review: { rating: number; comment: string; tags: string[] }) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const availableTags = [
    'On-Time Doctor / Stylist',
    'Impeccable Cleanliness',
    'Courteous Staff',
    'Transparent Billing',
    'High Standard of Hygiene',
    'Genuine Spare Parts',
    'Will Book Again in Patna',
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onSubmitReview(booking.id, {
      rating,
      comment: comment.trim(),
      tags: selectedTags,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  const ratingLabels: Record<number, string> = {
    1: 'Terrible Experience',
    2: 'Below Expectations',
    3: 'Average Service',
    4: 'Very Good Experience',
    5: 'Exceptional & Highly Recommended',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Write Verified Partner Review"
      description={`Share your experience with ${booking.providerName}`}
      maxWidth="md"
    >
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#EBF2EE] text-[#143D2B] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-[#143D2B]">
            Verified Review Published!
          </h3>
          <p className="text-xs text-[#52524E] max-w-sm mx-auto">
            Thank you for helping fellow Patna customers discover authentic, reliable local businesses. Your review is now live on {booking.providerName}&apos;s profile.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Verified Visit Badge Notice */}
          <div className="p-3 rounded-xl bg-[#FAF1EB] border border-[#F3DEC9] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C25E28]/10 flex items-center justify-center text-[#C25E28] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-semibold text-[#141413]">Verified Booking Visit</div>
              <div className="text-[#52524E]">
                Visit completed on {booking.scheduledDate} for {booking.serviceName}.
              </div>
            </div>
          </div>

          {/* Star Rating Interactive Selector */}
          <div className="text-center py-2 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#52524E]">
              Your Overall Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#143D2B] rounded-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-[#C25E28] text-[#C25E28]'
                        : 'text-[#E2DDD5] fill-transparent'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-semibold text-[#143D2B]">
              {ratingLabels[hoverRating || rating]}
            </div>
          </div>

          {/* Quick Compliment Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#141413]">
              What went especially well? (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`
                      px-2.5 py-1 rounded-lg text-xs font-medium border transition-all text-left cursor-pointer
                      ${
                        isSelected
                          ? 'bg-[#143D2B] text-white border-[#143D2B]'
                          : 'bg-white text-[#52524E] border-[#E2DDD5] hover:border-[#143D2B]/40'
                      }
                    `}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Comment */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#141413]">
              Your Detailed Experience <span className="text-[#C25E28]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about the doctor's consultation, salon hygiene, food taste, or workshop speed. Constructive feedback is appreciated."
              className="w-full text-xs p-3 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none text-[#141413] placeholder:text-[#A8A29E] bg-white resize-none"
            />
            <div className="flex justify-between items-center text-[11px] text-[#52524E]">
              <span>Minimum 15 characters</span>
              <span className="tabular-nums">{comment.length} characters</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-3 border-t border-[#E2DDD5] flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={comment.trim().length < 15}
              leftIcon={<ThumbsUp className="w-3.5 h-3.5" />}
            >
              Submit Verified Review
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
