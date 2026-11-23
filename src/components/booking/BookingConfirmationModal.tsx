'use client';

import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  AlertTriangle,
  Copy,
  ArrowRight,
  Check,
  KeyRound,
  Compass,
  MessageCircle,
  Navigation,
} from 'lucide-react';
import { BookingFormSubmissionPayload } from './CategoryBookingForm';
import { bookingService } from '@/services/bookingService';
import { BookingRequest } from '@/types/booking';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingPayload: BookingFormSubmissionPayload | null;
  providerPhone?: string;
  providerAddress?: string;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  bookingPayload,
  providerPhone,
  providerAddress,
}) => {
  const [step, setStep] = useState<'REVIEW' | 'RECEIPT'>('REVIEW');
  const [customerName, setCustomerName] = useState('Vikramaditya Sengupta');
  const [customerPhone, setCustomerPhone] = useState('98450 12345');
  const [customerEmail] = useState('vikramaditya@gmail.com');
  const [overrideInstructions, setOverrideInstructions] = useState<string | null>(null);
  const specialInstructions =
    overrideInstructions !== null
      ? overrideInstructions
      : bookingPayload?.specialInstructions || '';
  const [generatedBookingId, setGeneratedBookingId] = useState('');
  const [generatedVenueCode, setGeneratedVenueCode] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  if (!bookingPayload) return null;

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Generate unique Indian booking reference (e.g. BK-PAT-8492)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `BK-PAT-${randomSuffix}`;

    // 2. Generate 4-digit Venue Verification Code (e.g. 4821)
    const venueCode = Math.floor(1000 + Math.random() * 9000).toString();

    setGeneratedBookingId(bookingId);
    setGeneratedVenueCode(venueCode);

    // 3. Save into reactive client-side bookingService store (strictly REQUESTED)
    const newBooking: BookingRequest = {
      id: `bk-pat-${Date.now().toString(36)}`,
      bookingReference: bookingId,
      customerId: 'cust-user-101',
      customerName,
      customerPhone: `+91 ${customerPhone}`,
      customerEmail,
      providerId: bookingPayload.providerId,
      providerName: bookingPayload.providerName,
      providerAddress: providerAddress || 'Patna, Bihar',
      category: bookingPayload.category,
      serviceId: bookingPayload.selectedServices[0] || 's-1',
      serviceName: bookingPayload.serviceName,
      status: 'REQUESTED',
      statusHistory: [
        {
          status: 'REQUESTED',
          timestamp: new Date().toISOString(),
          updatedBy: 'CUSTOMER',
          note: 'Request sent to provider. Booking becomes Confirmed once the Patna partner accepts your slot (<90s average SLA).',
        },
      ],
      scheduledDate: bookingPayload.date,
      scheduledSlot: {
        startTime: bookingPayload.timeSlot,
        endTime: '12:00 PM',
      },
      paxOrUnits: bookingPayload.guestCount || 1,
      pricing: {
        basePrice: bookingPayload.basePrice,
        taxesAndGst: bookingPayload.taxGst,
        platformFee: 0,
        discountAmount: 0,
        totalAmount: bookingPayload.totalEstimatedInr,
        tokenPaidOnline: 0,
        amountPayableAtVenue: bookingPayload.totalEstimatedInr,
        currency: 'INR',
      },
      paymentStatus: 'PENDING',
      specialInstructions: specialInstructions || undefined,
      providerPhone: providerPhone,
      checkInPin: venueCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bookingService.addBooking(newBooking);

    setStep('RECEIPT');
  };

  const handleCopyBookingId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedBookingId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyVenueCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedVenueCode);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const resetAndClose = () => {
    setStep('REVIEW');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={step === 'REVIEW' ? 'Review & Transmit Slot Request' : 'Booking Request Transmitted'}
      description={
        step === 'REVIEW'
          ? 'Verify your booking details and slot preference prior to transmitting to the provider.'
          : 'Your slot request is on its way to the provider desk for roster verification.'
      }
      maxWidth="lg"
    >
      {step === 'REVIEW' ? (
        <form onSubmit={handleConfirmSubmit} className="space-y-4 pt-1">
          {/* CRITICAL CORE PRODUCT LOGIC NOTICE */}
          <div className="p-3.5 rounded-xl bg-[#F3F1EC] border border-[#E2DDD5] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#C25E28] shrink-0 mt-0.5" />
            <div>
              <div className="font-heading font-semibold text-xs text-[#C25E28] uppercase tracking-wider">
                Unambiguous Booking Protocol
              </div>
              <p className="text-xs text-[#52524E] mt-1 leading-relaxed">
                Request sent to provider. Booking becomes <strong className="text-[#143D2B]">Confirmed</strong> once the Patna partner accepts your slot (&lt;90s average SLA).
              </p>
            </div>
          </div>

          {/* Service & Merchant Summary Card */}
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#52524E]">
                  Patna Service Provider
                </span>
                <h3 className="font-heading font-semibold text-sm text-[#143D2B]">
                  {bookingPayload.providerName}
                </h3>
                {providerAddress && (
                  <p className="text-xs text-[#52524E] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#143D2B]" />
                    <span>{providerAddress}</span>
                  </p>
                )}
              </div>
              <Badge variant="sand" size="sm">
                {bookingPayload.category.toUpperCase().replace('_', ' ')}
              </Badge>
            </div>

            <div className="pt-2 border-t border-[#E2DDD5] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#52524E] uppercase tracking-wider block">
                  Service / Package
                </span>
                <span className="font-semibold text-[#141413] line-clamp-1">
                  {bookingPayload.serviceName}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#52524E] uppercase tracking-wider block">
                  Scheduled Arrival
                </span>
                <span className="font-semibold text-[#141413] tabular-nums">
                  {bookingPayload.date} at {bookingPayload.timeSlot}
                </span>
              </div>
            </div>

            {bookingPayload.patientName && (
              <div className="pt-2 border-t border-[#E2DDD5] text-xs">
                <span className="text-[10px] text-[#52524E] uppercase tracking-wider block">
                  Patient Consultation Details
                </span>
                <span className="font-semibold text-[#141413]">
                  {bookingPayload.patientName} ({bookingPayload.patientAge} yrs) • {bookingPayload.visitType === 'NEW_CONSULTATION' ? 'New Consultation' : 'Follow-up'}
                </span>
              </div>
            )}

            {bookingPayload.vehicleDetails && (
              <div className="pt-2 border-t border-[#E2DDD5] text-xs">
                <span className="text-[10px] text-[#52524E] uppercase tracking-wider block">
                  Vehicle Information
                </span>
                <span className="font-semibold text-[#141413]">
                  {bookingPayload.vehicleDetails.makeModel} ({bookingPayload.vehicleDetails.type}) • {bookingPayload.vehicleDetails.regNumber}
                </span>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD5] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#52524E]">
              <span>Base Rate / Package</span>
              <span className="tabular-nums font-semibold text-[#141413]">
                ₹{bookingPayload.basePrice.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-[#52524E]">
              <span>Taxes &amp; GST</span>
              <span className="tabular-nums font-semibold text-[#141413]">
                {bookingPayload.taxGst === 0 ? 'Exempt' : `₹${bookingPayload.taxGst.toLocaleString('en-IN')}`}
              </span>
            </div>
            <div className="pt-2 border-t border-[#E2DDD5] flex justify-between font-heading font-bold text-sm text-[#143D2B]">
              <span>Amount Due at Patna Counter</span>
              <span className="tabular-nums">
                ₹{bookingPayload.totalEstimatedInr.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Customer Contact Details */}
          <div className="space-y-3 pt-2 border-t border-[#E2DDD5]">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Primary Contact Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <Input
                label="WhatsApp / Mobile Number"
                prefixText="+91"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
            <Input
              label="Special Requests / Instructions (Optional)"
              placeholder="E.g., Allergen preference, quiet room, baby chair..."
              value={specialInstructions}
              onChange={(e) => setOverrideInstructions(e.target.value)}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E2DDD5]">
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-semibold">
              Transmit Booking Request
            </Button>
          </div>
        </form>
      ) : (
        /* ========================================================= */
        /* STEP 2: CRISP "BOOKING REQUESTED" RECEIPT SCREEN */
        /* ========================================================= */
        <div className="space-y-5 pt-1 text-left">
          {/* Header Status Banner */}
          <div className="text-center space-y-2 pb-4 border-b border-[#E2DDD5]">
            <div className="w-12 h-12 rounded-full bg-[#F3F1EC] text-[#143D2B] flex items-center justify-center mx-auto border border-[#E2DDD5]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-[#141413]">
              Booking Request Transmitted!
            </h3>
            <p className="text-xs text-[#52524E] max-w-sm mx-auto leading-relaxed">
              Request sent to provider. Booking becomes <strong className="text-[#143D2B]">Confirmed</strong> once the Patna partner accepts your slot (&lt;90s average SLA).
            </p>
          </div>

          {/* Unique Booking ID & 4-Digit Venue Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Unique Booking Reference */}
            <div className="p-4 rounded-xl bg-white border border-[#E2DDD5] space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#52524E] block">
                Booking Reference ID
              </span>
              <div className="font-mono font-bold text-lg text-[#143D2B] tracking-tight tabular-nums flex items-center justify-between">
                <span>{generatedBookingId}</span>
                <button
                  type="button"
                  onClick={handleCopyBookingId}
                  className="p-1 rounded text-[#52524E] hover:text-[#143D2B] hover:bg-[#FAF9F6] transition-colors"
                  title="Copy Reference ID"
                >
                  {copiedId ? (
                    <Check className="w-4 h-4 text-[#143D2B]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <span className="text-[11px] text-[#52524E]">
                Saved in reactive booking store
              </span>
            </div>

            {/* 4-digit Venue Verification Pin */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#52524E] flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-[#C25E28]" />
                <span>Venue Verification Code</span>
              </span>
              <div className="font-mono font-bold text-2xl text-[#C25E28] tracking-widest tabular-nums flex items-center justify-between">
                <span>{generatedVenueCode}</span>
                <button
                  type="button"
                  onClick={handleCopyVenueCode}
                  className="p-1 rounded text-[#52524E] hover:text-[#C25E28] hover:bg-white transition-colors"
                  title="Copy Venue PIN"
                >
                  {copiedPin ? (
                    <Check className="w-4 h-4 text-[#C25E28]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <span className="text-[11px] text-[#52524E]">
                Present at venue counter for check-in
              </span>
            </div>
          </div>

          {/* Status Pill: Strictly REQUESTED */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD5] flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-[#141413] block">
                Current Booking Status
              </span>
              <span className="text-[#52524E]">
                Merchant response underway
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F3F1EC] border border-[#E2DDD5] text-[#C25E28] font-bold text-xs tabular-nums">
              <span className="w-2 h-2 rounded-full bg-[#C25E28] animate-pulse" />
              <span>REQUESTED</span>
            </span>
          </div>

          {/* Receipt Details Card */}
          <div className="p-4 rounded-xl bg-white border border-[#E2DDD5] space-y-2 text-xs">
            <div className="flex justify-between pb-2 border-b border-[#E2DDD5]">
              <span className="text-[#52524E]">Client Name</span>
              <span className="font-semibold text-[#141413]">
                {customerName} (+91 {customerPhone})
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-[#E2DDD5]">
              <span className="text-[#52524E]">Provider</span>
              <span className="font-semibold text-[#141413]">
                {bookingPayload.providerName}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-[#E2DDD5]">
              <span className="text-[#52524E]">Scheduled Slot</span>
              <span className="font-semibold text-[#143D2B] tabular-nums">
                {bookingPayload.date} at {bookingPayload.timeSlot}
              </span>
            </div>
            {providerAddress && (
              <div className="flex justify-between pb-2 border-b border-[#E2DDD5]">
                <span className="text-[#52524E]">Venue Address</span>
                <span className="font-semibold text-[#141413] truncate max-w-[220px]">
                  {providerAddress}
                </span>
              </div>
            )}
            {specialInstructions && (
              <div className="flex justify-between pb-2 border-b border-[#E2DDD5]">
                <span className="text-[#52524E]">Special Request</span>
                <span className="font-semibold text-[#141413] truncate max-w-[220px]">
                  {specialInstructions}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 font-heading font-bold text-sm text-[#143D2B]">
              <span>Estimated Payable at Counter</span>
              <span className="tabular-nums">
                ₹{bookingPayload.totalEstimatedInr.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Indian Marketplace Sharing & Directions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `*BOOKKARO Reservation Request*\nBooking Reference: ${generatedBookingId}\nVenue: ${bookingPayload.providerName}\nAddress: ${providerAddress || 'Patna, Bihar'}\nScheduled Slot: ${bookingPayload.date} at ${bookingPayload.timeSlot}\nVenue PIN: ${generatedVenueCode}\nEstimated Payable: ₹${bookingPayload.totalEstimatedInr.toLocaleString('en-IN')}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] font-medium text-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Share on WhatsApp</span>
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${bookingPayload.providerName}, ${providerAddress || ''}, Patna, Bihar`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F3F1EC] border border-[#E2DDD5] text-[#141413] font-medium text-xs transition-colors"
            >
              <Navigation className="w-4 h-4 text-[#143D2B]" />
              <span>Get Directions</span>
            </a>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E2DDD5]">
            <Button
              href="/search"
              variant="outline"
              size="sm"
              onClick={resetAndClose}
              leftIcon={<Compass className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto"
            >
              Explore More in Patna
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                href="/dashboard"
                variant="primary"
                size="sm"
                onClick={resetAndClose}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
              >
                Track in My Bookings
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
