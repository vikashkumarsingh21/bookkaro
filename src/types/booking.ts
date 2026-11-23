/**
 * BOOKKARO Core Domain & Booking Types
 * Multi-category local discovery & booking marketplace for India
 */

export type BookingCategory =
  | 'healthcare'
  | 'hotels'
  | 'restaurants'
  | 'salon'
  | 'vehicle_care';

export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'DISPUTED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED';

export type RevenueModel = 'SUBSCRIPTION' | 'COMMISSION';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'PREMIUM_PARTNER';

export type WorkspaceView =
  | 'CUSTOMER'
  | 'PARTNER_OWNER'
  | 'PARTNER_STAFF'
  | 'ADMIN'
  | 'PROVIDER';

export type IndianCurrency = 'INR';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  streetAddress: string;
  landmark?: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: GeoCoordinates;
}

export interface BusinessCompliance {
  gstin?: string;
  panNumber?: string;
  registrationNumber?: string;
  licenseType?: 'FSSAI' | 'NMC' | 'RTO_AUTHORIZED' | 'MUNICIPAL' | 'OTHER';
}

export interface RevenueModelConfig {
  type: RevenueModel;
  commissionPercentage?: number; // e.g. 8.5%
  subscriptionTier?: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  subscriptionMonthlyFeeInr?: number;
  payoutCycle: 'DAILY' | 'T_PLUS_1' | 'WEEKLY' | 'MONTHLY';
  effectiveFrom: string;
}

export interface TimeSlot {
  startTime: string; // "09:00"
  endTime: string;   // "09:45"
  isAvailable: boolean;
  maxCapacity?: number;
  currentBookings?: number;
}

export interface DailySchedule {
  isOpen: boolean;
  openTime: string;  // "09:00"
  closeTime: string; // "20:00"
  slots: TimeSlot[];
}

export interface WeeklySchedule {
  monday: DailySchedule;
  tuesday: DailySchedule;
  wednesday: DailySchedule;
  thursday: DailySchedule;
  friday: DailySchedule;
  saturday: DailySchedule;
  sunday: DailySchedule;
}

export interface CategoryMetadata {
  id: BookingCategory;
  name: string;
  vernacularLabel: string;
  tagline: string;
  accentBg: string;
  iconName: string;
  popularSubcategories: string[];
}

export interface Provider {
  id: string;
  slug: string;
  name: string;
  legalBusinessName: string;
  category: BookingCategory;
  subCategories: string[];
  description: string;
  shortBio: string;
  address: Address;
  city: string;
  pincode: string;
  rating: number; // e.g. 4.8
  reviewCount: number;
  verificationStatus: VerificationStatus;
  revenueModel: RevenueModel;
  revenueConfig: RevenueModelConfig;
  compliance?: BusinessCompliance;
  operatingHours: WeeklySchedule;
  images: string[];
  badges: string[];
  priceRange: {
    min: number;
    max: number;
    currency: IndianCurrency;
  };
  instantBookingEnabled: boolean;
  phone: string;
  email: string;
  amenities: string[];
}

export interface HealthcareDetails {
  consultationType: 'OPD_PHYSICAL' | 'VIDEO_CONSULT' | 'HOME_VISIT';
  doctorName: string;
  qualification: string; // e.g. "MBBS, MD (Medicine)"
  specialty: string;
  experienceYears: number;
  followUpWindowDays: number;
}

export interface HotelDetails {
  roomType: 'STANDARD_AC' | 'DELUXE' | 'EXECUTIVE_SUITE' | 'FAMILY_ROOM';
  maxOccupancyAdults: number;
  maxOccupancyChildren: number;
  bedConfig: 'KING' | 'QUEEN' | 'TWIN';
  checkInTime: string;
  checkOutTime: string;
  complimentaryBreakfast: boolean;
}

export interface RestaurantDetails {
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'ALL_DAY';
  seatingPreference: 'INDOOR_AC' | 'ROOFTOP' | 'OUTDOOR_PATIO' | 'PRIVATE_DINING';
  tableCapacity: number;
  coverChargePerPerson: number;
  isCoverChargeDeductible: boolean;
  cuisineTypes: string[];
}

export interface SalonDetails {
  targetGender: 'MEN' | 'WOMEN' | 'UNISEX';
  treatmentType: 'HAIRCUT_STYLING' | 'SKIN_CARE' | 'SPA_MASSAGE' | 'BRIDAL_GROOMING';
  therapistPreferenceAllowed: boolean;
  productsUsedBrand?: string;
}

export interface VehicleCareDetails {
  vehicleType: 'TWO_WHEELER' | 'FOUR_WHEELER_HATCHBACK' | 'FOUR_WHEELER_SUV' | 'EV';
  serviceType: 'GENERAL_SERVICE' | 'PERIODIC_MAINTENANCE' | 'CERAMIC_COATING' | 'AC_SERVICE' | 'BATTERY_CARE';
  estimatedDurationHours: number;
  includesPickUpDrop: boolean;
  warrantyKmOrMonths?: string;
}

export interface Service {
  id: string;
  providerId: string;
  category: BookingCategory;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  originalPrice?: number;
  currency: IndianCurrency;
  depositRequired: boolean;
  depositAmount: number;
  isAvailable: boolean;
  categoryDetails?: {
    healthcare?: HealthcareDetails;
    hotel?: HotelDetails;
    restaurant?: RestaurantDetails;
    salon?: SalonDetails;
    vehicleCare?: VehicleCareDetails;
  };
}

export interface BookingStatusAuditEntry {
  status: BookingStatus;
  timestamp: string;
  note?: string;
  updatedBy: 'CUSTOMER' | 'PROVIDER' | 'ADMIN' | 'SYSTEM';
}

export interface BookingPriceBreakdown {
  basePrice: number;
  taxesAndGst: number; // 5%, 12%, or 18% GST as per Indian tax norms
  platformFee: number;
  discountAmount: number;
  totalAmount: number;
  tokenPaidOnline: number;
  amountPayableAtVenue: number;
  currency: IndianCurrency;
}

export interface BookingRequest {
  id: string;
  bookingReference: string; // e.g. "BK-DEL-2601"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  providerId: string;
  providerName: string;
  providerAddress: string;
  category: BookingCategory;
  serviceId: string;
  serviceName: string;
  status: BookingStatus;
  statusHistory: BookingStatusAuditEntry[];
  scheduledDate: string; // "YYYY-MM-DD"
  scheduledSlot: {
    startTime: string; // "14:00"
    endTime: string;   // "14:45"
  };
  paxOrUnits: number;
  pricing: BookingPriceBreakdown;
  paymentStatus: 'PENDING' | 'TOKEN_PAID' | 'PAID_IN_FULL' | 'REFUNDED';
  specialInstructions?: string;
  providerNotes?: string;
  cancellationReason?: string;
  providerPhone?: string;
  providerImage?: string;
  checkInPin?: string;
  dispute?: {
    ticketId: string;
    reason: string;
    description: string;
    filedAt: string;
    status: 'OPEN' | 'RESOLVED';
  };
  refundRequest?: {
    reason: string;
    upiOrBankRef?: string;
    requestedAt: string;
    processedAt?: string;
    adminNote?: string;
  };
  verifiedReview?: {
    rating: number;
    comment: string;
    tags: string[];
    submittedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProviderFilterParams {
  category?: BookingCategory;
  city?: string;
  searchQuery?: string;
  minRating?: number;
  instantBookingOnly?: boolean;
  revenueModel?: RevenueModel;
  maxPrice?: number;
}
