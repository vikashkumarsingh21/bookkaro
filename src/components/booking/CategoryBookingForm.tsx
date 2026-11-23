'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Hotel,
  UtensilsCrossed,
  ChevronDown,
  Info,
  Car,
  ShieldAlert,
} from 'lucide-react';
import { MockProvider } from '@/data/mockProviders';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface BookingFormSubmissionPayload {
  providerId: string;
  providerName: string;
  category: MockProvider['category'];
  serviceName: string;
  selectedServices: string[];
  date: string;
  checkOutDate?: string; // For hotels
  timeSlot: string;
  guestCount?: number;
  // Healthcare
  doctorOrDepartment?: string;
  visitType?: 'NEW_CONSULTATION' | 'FOLLOW_UP';
  branch?: string;
  patientName?: string;
  patientAge?: number;
  // Hotel
  roomType?: string;
  nights?: number;
  // Restaurant
  partySize?: number;
  seatingPreference?: string;
  specialInstructions?: string;
  // Salon / Vehicle Care
  staffOrBay?: string;
  vehicleDetails?: {
    type: string;
    makeModel: string;
    regNumber: string;
  };
  selectedAddons?: string[];
  // Financials
  basePrice: number;
  taxGst: number;
  totalEstimatedInr: number;
  currency: 'INR';
}

interface CategoryBookingFormProps {
  provider: MockProvider;
  onInitiateReview: (payload: BookingFormSubmissionPayload) => void;
  className?: string;
}

export const CategoryBookingForm: React.FC<CategoryBookingFormProps> = ({
  provider,
  onInitiateReview,
  className = '',
}) => {
  // Common states
  const [selectedDate, setSelectedDate] = useState<string>(
    provider.availableDates[0] || '2026-11-20'
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    provider.timeSlots[0] || '11:00 AM'
  );

  // 1. Healthcare states
  const [selectedDoctorOrDept, setSelectedDoctorOrDept] = useState<string>(
    provider.doctors?.[0]?.name || provider.departments?.[0] || 'General OPD'
  );
  const [visitType, setVisitType] = useState<'NEW_CONSULTATION' | 'FOLLOW_UP'>('NEW_CONSULTATION');
  const selectedBranch =
    provider.branches?.[0] || `${provider.locality} Main Branch`;
  const [patientName, setPatientName] = useState<string>('Vikramaditya Sengupta');
  const [patientAge, setPatientAge] = useState<number>(34);

  // 2. Hotel states
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-11-21');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    provider.roomTypes?.[0]?.id || 'rt-1'
  );
  const [adultCount, setAdultCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  // 3. Restaurant states
  const [partySize, setPartySize] = useState<number>(2);
  const [seatingPreference, setSeatingPreference] = useState<string>(
    provider.seatingAreas?.[0] || 'Indoor AC Dining'
  );
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // 4. Salon & Vehicle Care states
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    provider.services[0]?.id || 's-1',
  ]);
  const [selectedStaffOrBay, setSelectedStaffOrBay] = useState<string>(
    provider.staffOrBays?.[0] || 'Any Available Professional'
  );
  const [vehicleType, setVehicleType] = useState<string>('Sedan');
  const [vehicleMakeModel, setVehicleMakeModel] = useState<string>('Hyundai Creta');
  const [vehicleRegNumber, setVehicleRegNumber] = useState<string>('BR 01 AB 1234');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Calculation of Nights for Hotels
  const hotelNights = useMemo(() => {
    try {
      const d1 = new Date(selectedDate);
      const d2 = new Date(checkOutDate);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  }, [selectedDate, checkOutDate]);

  // Pricing calculations
  const { basePrice, taxGst, totalEstimatedInr, serviceTitleSummary, totalDurationMins } =
    useMemo(() => {
      let base = 0;
      let duration = 0;
      let title = '';

      if (provider.category === 'healthcare') {
        const primaryService = provider.services[0];
        base = primaryService ? primaryService.price : 600;
        duration = primaryService ? primaryService.durationMinutes : 20;
        title = `${selectedDoctorOrDept} (${visitType === 'NEW_CONSULTATION' ? 'New Patient' : 'Follow-up'})`;
      } else if (provider.category === 'hotels') {
        const room = provider.roomTypes?.find((r) => r.id === selectedRoomId);
        const ratePerNight = room ? room.pricePerNight : 4500;
        base = ratePerNight * hotelNights;
        duration = hotelNights * 1440;
        title = `${room ? room.name : 'Deluxe Room'} (${hotelNights} Night${hotelNights > 1 ? 's' : ''})`;
      } else if (provider.category === 'restaurants') {
        const primaryService = provider.services[0];
        base = primaryService ? primaryService.price : 400;
        duration = 90;
        title = `Table for ${partySize} (${seatingPreference})`;
      } else {
        const activeServices = provider.services.filter((s) =>
          selectedServiceIds.includes(s.id)
        );
        const servicesBase = activeServices.reduce((sum, s) => sum + s.price, 0);
        const servicesDuration = activeServices.reduce(
          (sum, s) => sum + s.durationMinutes,
          0
        );

        const activeAddons = (provider.addons || []).filter((a) =>
          selectedAddonIds.includes(a.id)
        );
        const addonsBase = activeAddons.reduce((sum, a) => sum + a.price, 0);
        const addonsDuration = activeAddons.reduce(
          (sum, a) => sum + (a.durationMinutes || 0),
          0
        );

        base = servicesBase + addonsBase;
        duration = servicesDuration + addonsDuration;
        title = activeServices.map((s) => s.name).join(', ') || 'Selected Services';
      }

      // GST Rates: Healthcare is 0% in India, Hotels are 12%, Dining is 5%, Salon/Auto is 18%
      let gstRate = 0.18;
      if (provider.category === 'healthcare') gstRate = 0;
      else if (provider.category === 'hotels') gstRate = 0.12;
      else if (provider.category === 'restaurants') gstRate = 0.05;

      const tax = Math.round(base * gstRate);
      const total = base + tax;

      return {
        basePrice: base,
        taxGst: tax,
        totalEstimatedInr: total,
        serviceTitleSummary: title,
        totalDurationMins: duration,
      };
    }, [
      provider,
      selectedDoctorOrDept,
      visitType,
      selectedRoomId,
      hotelNights,
      partySize,
      seatingPreference,
      selectedServiceIds,
      selectedAddonIds,
    ]);

  const toggleServiceSelect = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((s) => s !== id));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const toggleAddonSelect = (id: string) => {
    if (selectedAddonIds.includes(id)) {
      setSelectedAddonIds(selectedAddonIds.filter((a) => a !== id));
    } else {
      setSelectedAddonIds([...selectedAddonIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: BookingFormSubmissionPayload = {
      providerId: provider.id,
      providerName: provider.name,
      category: provider.category,
      serviceName: serviceTitleSummary,
      selectedServices:
        ['salon', 'vehicle_care'].includes(provider.category)
          ? selectedServiceIds
          : [provider.services[0]?.id || 's-1'],
      date: selectedDate,
      checkOutDate: provider.category === 'hotels' ? checkOutDate : undefined,
      timeSlot: selectedTimeSlot,
      guestCount:
        provider.category === 'hotels'
          ? adultCount + childrenCount
          : provider.category === 'restaurants'
          ? partySize
          : 1,
      doctorOrDepartment:
        provider.category === 'healthcare' ? selectedDoctorOrDept : undefined,
      visitType: provider.category === 'healthcare' ? visitType : undefined,
      branch: provider.category === 'healthcare' ? selectedBranch : undefined,
      patientName: provider.category === 'healthcare' ? patientName : undefined,
      patientAge: provider.category === 'healthcare' ? patientAge : undefined,
      roomType:
        provider.category === 'hotels'
          ? provider.roomTypes?.find((r) => r.id === selectedRoomId)?.name
          : undefined,
      nights: provider.category === 'hotels' ? hotelNights : undefined,
      partySize: provider.category === 'restaurants' ? partySize : undefined,
      seatingPreference:
        provider.category === 'restaurants' ? seatingPreference : undefined,
      specialInstructions: specialInstructions.trim() || undefined,
      staffOrBay:
        ['salon', 'vehicle_care'].includes(provider.category)
          ? selectedStaffOrBay
          : undefined,
      vehicleDetails:
        provider.category === 'vehicle_care'
          ? {
              type: vehicleType,
              makeModel: vehicleMakeModel,
              regNumber: vehicleRegNumber,
            }
          : undefined,
      selectedAddons: selectedAddonIds,
      basePrice,
      taxGst,
      totalEstimatedInr,
      currency: 'INR',
    };

    onInitiateReview(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl border border-[#E2DDD5] p-5 sm:p-6 space-y-5 ${className}`}
    >
      {/* Header & Notice */}
      <div className="pb-4 border-b border-[#E2DDD5]">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="terracotta" size="sm">
            Slot Request Engine
          </Badge>
          <span className="text-xs text-[#52524E] font-medium">
            Patna Partner SLA: &lt; 90s
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#52524E] block">
              Estimated Total Due at Venue
            </span>
            <div className="font-heading font-bold text-2xl text-[#143D2B] tabular-nums">
              ₹{totalEstimatedInr.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-[#52524E]">
                {provider.category === 'hotels' ? `(${hotelNights} Night${hotelNights > 1 ? 's' : ''})` : 'estimated'}
              </span>
            </div>
          </div>

          {totalDurationMins > 0 && provider.category !== 'hotels' && (
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#52524E] block">
                Duration
              </span>
              <span className="text-xs font-semibold text-[#141413] flex items-center gap-1 justify-end tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#143D2B]" />
                <span>{totalDurationMins} mins</span>
              </span>
            </div>
          )}
        </div>

        {/* Clear Unambiguous Booking State Notice */}
        <div className="mt-3 p-3 rounded-xl bg-[#F3F1EC] border border-[#E2DDD5] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#C25E28] shrink-0 mt-0.5" />
          <p className="text-xs text-[#52524E] leading-relaxed">
            <strong className="text-[#141413]">Status Notice:</strong> Submitting creates a <strong className="text-[#C25E28]">REQUESTED</strong> booking. Your booking becomes <strong className="text-[#143D2B]">Confirmed</strong> once the Patna partner accepts your slot (&lt;90s average SLA).
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. HEALTHCARE SPECIFIC FIELDS */}
      {/* ========================================================= */}
      {provider.category === 'healthcare' && (
        <div className="space-y-4">
          {/* Department or Doctor Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
              Doctor or Department
            </label>
            <div className="relative">
              <select
                value={selectedDoctorOrDept}
                onChange={(e) => setSelectedDoctorOrDept(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B] text-[#141413] appearance-none"
              >
                {provider.doctors?.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} — {doc.specialty} ({doc.qualification})
                  </option>
                ))}
                {provider.departments?.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept} (General Senior OPD)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#52524E] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Visit Type: New Consultation vs Follow-up */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
              Visit Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisitType('NEW_CONSULTATION')}
                className={`
                  py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors
                  ${
                    visitType === 'NEW_CONSULTATION'
                      ? 'bg-[#143D2B] text-white border-[#143D2B]'
                      : 'bg-[#FAF9F6] text-[#52524E] border-[#E2DDD5] hover:border-[#143D2B]'
                  }
                `}
              >
                New Consultation
              </button>
              <button
                type="button"
                onClick={() => setVisitType('FOLLOW_UP')}
                className={`
                  py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors
                  ${
                    visitType === 'FOLLOW_UP'
                      ? 'bg-[#143D2B] text-white border-[#143D2B]'
                      : 'bg-[#FAF9F6] text-[#52524E] border-[#E2DDD5] hover:border-[#143D2B]'
                  }
                `}
              >
                Follow-up Visit
              </button>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
                Patient Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Patient Name"
                  required
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B] tabular-nums"
                required
              />
            </div>
          </div>

          {/* Mandatory Calm Healthcare Disclaimer */}
          <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E2DDD5] text-xs text-[#52524E] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#143D2B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#141413]">Medical Disclaimer:</strong> Appointment booking only; no diagnosis, prescriptions, or medical records are stored. Consultation fee of ₹{basePrice} is paid directly at clinic reception upon arrival.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. HOTELS SPECIFIC FIELDS */}
      {/* ========================================================= */}
      {provider.category === 'hotels' && (
        <div className="space-y-4">
          {/* Room Type Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
              Select Room Type
            </label>
            <div className="space-y-2">
              {provider.roomTypes?.map((room) => {
                const isSelected = selectedRoomId === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`
                      p-3 rounded-xl border cursor-pointer transition-colors flex items-start justify-between
                      ${
                        isSelected
                          ? 'border-[#143D2B] bg-[#F3F1EC]'
                          : 'border-[#E2DDD5] hover:border-[#143D2B] bg-white'
                      }
                    `}
                  >
                    <div>
                      <div className="font-heading font-semibold text-xs text-[#141413]">
                        {room.name}
                      </div>
                      <div className="text-[11px] text-[#52524E] mt-0.5">
                        {room.bedType} • Max {room.maxGuests} Guests
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {room.amenities.slice(0, 3).map((am, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#E2DDD5] text-[#52524E]"
                          >
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="font-heading font-bold text-sm text-[#143D2B] tabular-nums">
                        ₹{room.pricePerNight}
                      </div>
                      <span className="text-[10px] text-[#52524E]">/ night</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Check-in / Check-out Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
                Check-in Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOutDate}
                min={selectedDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
                required
              />
            </div>
          </div>

          {/* Guest Count Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
                Adults
              </label>
              <select
                value={adultCount}
                onChange={(e) => setAdultCount(parseInt(e.target.value, 10))}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} Adult{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
                Children
              </label>
              <select
                value={childrenCount}
                onChange={(e) => setChildrenCount(parseInt(e.target.value, 10))}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n} Children
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Itemized INR Rate & Tax Breakdown */}
          <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#52524E]">
              <span>
                Room charges ({hotelNights} Night{hotelNights > 1 ? 's' : ''})
              </span>
              <span className="tabular-nums font-semibold text-[#141413]">
                ₹{basePrice.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-[#52524E]">
              <span>GST (12% Indian Hospitality)</span>
              <span className="tabular-nums font-semibold text-[#141413]">
                ₹{taxGst.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="pt-2 border-t border-[#E2DDD5] flex justify-between font-heading font-bold text-sm text-[#143D2B]">
              <span>Total Payable at Hotel Counter</span>
              <span className="tabular-nums">
                ₹{totalEstimatedInr.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Cancellation Cutoff Notice */}
          <div className="p-2.5 rounded-lg bg-white border border-[#E2DDD5] text-xs text-[#52524E] flex items-start gap-2">
            <Hotel className="w-4 h-4 text-[#143D2B] shrink-0 mt-0.5" />
            <p>{provider.cancellationPolicy}</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. RESTAURANTS SPECIFIC FIELDS */}
      {/* ========================================================= */}
      {provider.category === 'restaurants' && (
        <div className="space-y-4">
          {/* Party Size */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
              Party Size (Guests)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[2, 4, 6, 8, 12].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPartySize(size)}
                  className={`
                    py-2 text-xs font-semibold rounded-lg border transition-colors tabular-nums
                    ${
                      partySize === size
                        ? 'bg-[#143D2B] text-white border-[#143D2B]'
                        : 'bg-[#FAF9F6] text-[#52524E] border-[#E2DDD5] hover:border-[#143D2B]'
                    }
                  `}
                >
                  {size} Pax
                </button>
              ))}
            </div>
          </div>

          {/* Seating Preference */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
              Seating Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(provider.seatingAreas || ['Indoor AC Dining', 'Rooftop Section', 'Family Dining']).map(
                (area) => {
                  const isSelected = seatingPreference === area;
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setSeatingPreference(area)}
                      className={`
                        p-2.5 text-xs font-medium rounded-lg border text-center transition-colors truncate
                        ${
                          isSelected
                            ? 'bg-[#143D2B] text-white border-[#143D2B]'
                            : 'bg-white text-[#52524E] border-[#E2DDD5] hover:border-[#143D2B]'
                        }
                      `}
                    >
                      {area}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Special Request */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
              Special Table / Dietary Request (Optional)
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="E.g., Window booth, Jain / non-spicy preparation, high chair needed, celebrating anniversary..."
              className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B] placeholder:text-[#52524E]/50 resize-none"
            />
          </div>

          {/* Mandatory Restaurant Note: Table reservation only */}
          <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E2DDD5] text-xs text-[#52524E] flex items-start gap-2">
            <UtensilsCrossed className="w-4 h-4 text-[#143D2B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#141413]">Dine-In Notice:</strong> Table reservation only (not online food delivery). Tables are held for 15 minutes past slot time. Food is ordered fresh at the venue.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SALON & VEHICLE CARE FIELDS */}
      {/* ========================================================= */}
      {['salon', 'vehicle_care'].includes(provider.category) && (
        <div className="space-y-4">
          {/* Service Multi-Select */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
              Choose Services &amp; Packages (Multi-Select)
            </label>
            <div className="space-y-2">
              {provider.services.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleServiceSelect(srv.id)}
                    className={`
                      p-3 rounded-xl border cursor-pointer transition-colors flex items-start justify-between
                      ${
                        isSelected
                          ? 'border-[#143D2B] bg-[#F3F1EC]'
                          : 'border-[#E2DDD5] hover:border-[#143D2B] bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1 accent-[#143D2B] w-4 h-4 rounded cursor-pointer"
                      />
                      <div>
                        <div className="font-heading font-semibold text-xs text-[#141413]">
                          {srv.name}
                        </div>
                        <div className="text-[11px] text-[#52524E] mt-0.5 line-clamp-1">
                          {srv.description}
                        </div>
                        <div className="text-[10px] text-[#52524E] mt-1 tabular-nums">
                          ⏱ {srv.durationMinutes} minutes
                        </div>
                      </div>
                    </div>
                    <div className="font-heading font-bold text-xs text-[#143D2B] tabular-nums shrink-0 ml-2">
                      ₹{srv.price}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staff or Service Bay Preference */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
              {provider.category === 'salon' ? 'Stylist / Therapist Preference' : 'Service Bay Preference'}
            </label>
            <select
              value={selectedStaffOrBay}
              onChange={(e) => setSelectedStaffOrBay(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2.5 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
            >
              {(provider.staffOrBays || ['Any Available Professional']).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Details for Vehicle Care */}
          {provider.category === 'vehicle_care' && (
            <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#143D2B] uppercase tracking-wider">
                <Car className="w-4 h-4 text-[#143D2B]" />
                <span>Vehicle Information</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#52524E] block mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
                  >
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Two-Wheeler">Two-Wheeler</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#52524E] block mb-1">
                    Make &amp; Model
                  </label>
                  <input
                    type="text"
                    value={vehicleMakeModel}
                    onChange={(e) => setVehicleMakeModel(e.target.value)}
                    placeholder="E.g. Hyundai Creta"
                    className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#52524E] block mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={vehicleRegNumber}
                  onChange={(e) => setVehicleRegNumber(e.target.value.toUpperCase())}
                  placeholder="BR 01 AB 1234"
                  className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B] uppercase"
                />
              </div>
            </div>
          )}

          {/* Optional Add-ons */}
          {provider.addons && provider.addons.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
                Recommended Add-ons
              </label>
              <div className="space-y-2">
                {provider.addons.map((add) => {
                  const isChecked = selectedAddonIds.includes(add.id);
                  return (
                    <label
                      key={add.id}
                      className={`
                        p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors
                        ${
                          isChecked
                            ? 'bg-[#F3F1EC] border-[#143D2B]'
                            : 'bg-white border-[#E2DDD5] hover:border-[#143D2B]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddonSelect(add.id)}
                          className="accent-[#143D2B] w-4 h-4 rounded cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-semibold text-[#141413]">{add.name}</div>
                          <div className="text-[10px] text-[#52524E]">{add.description}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-xs text-[#143D2B] tabular-nums shrink-0 ml-2">
                        +₹{add.price}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* COMMON DATE & TIME SLOT PICKER (For Non-Hotel categories) */}
      {/* ========================================================= */}
      {provider.category !== 'hotels' && (
        <div className="space-y-3 pt-2 border-t border-[#E2DDD5]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
                Preferred Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
                Available Time Slot
              </label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
              >
                {provider.timeSlots.map((ts) => (
                  <option key={ts} value={ts}>
                    {ts}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Price Summary Breakdown */}
      <div className="pt-2 border-t border-[#E2DDD5] space-y-1.5 text-xs">
        <div className="flex justify-between text-[#52524E]">
          <span>Service Base Fee</span>
          <span className="tabular-nums font-semibold text-[#141413]">
            ₹{basePrice.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between text-[#52524E]">
          <span>Applicable GST / Taxes</span>
          <span className="tabular-nums font-semibold text-[#141413]">
            {taxGst === 0 ? 'Exempt (Healthcare)' : `₹${taxGst.toLocaleString('en-IN')}`}
          </span>
        </div>
        <div className="pt-2 border-t border-[#E2DDD5] flex justify-between font-heading font-bold text-base text-[#143D2B]">
          <span>Total Payable at Venue</span>
          <span className="tabular-nums">
            ₹{totalEstimatedInr.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Submit Action */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        className="h-11 font-semibold"
      >
        Review &amp; Submit Slot Request
      </Button>

      <p className="text-[11px] text-[#52524E] text-center leading-normal">
        Pay at venue counter with your 4-digit code. Zero upfront card charges.
      </p>
    </form>
  );
};
