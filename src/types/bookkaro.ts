/**
 * =======================================================================
 * BOOKKARO | Multi-Category Local Discovery & Booking Marketplace
 * Core Types for BOOKKARO Launch in Patna, Bihar
 * =======================================================================
 */

// -----------------------------------------------------------------------
// 1. PATNA LOCALITIES & PIN CODES
// -----------------------------------------------------------------------

export const PATNA_LOCALITIES = [
  {
    name: 'Boring Road',
    pincode: '800013',
    zone: 'West Patna',
    landmark: 'Boring Canal Road & Crossing',
    coordinates: { lat: 25.6186, lng: 85.1129 },
  },
  {
    name: 'Kankarbagh',
    pincode: '800020',
    zone: 'South Patna',
    landmark: 'Doctors Colony & Tiwary Bechar',
    coordinates: { lat: 25.5912, lng: 85.1528 },
  },
  {
    name: 'Fraser Road',
    pincode: '800001',
    zone: 'Central Patna',
    landmark: 'Dakbunglow Crossing & Gandhi Maidan',
    coordinates: { lat: 25.6092, lng: 85.1376 },
  },
  {
    name: 'Bailey Road',
    pincode: '800014',
    zone: 'West Corridor',
    landmark: 'Patna Zoo, High Court & Raja Bazaar',
    coordinates: { lat: 25.6121, lng: 85.0886 },
  },
  {
    name: 'Rajendra Nagar',
    pincode: '800016',
    zone: 'East Patna',
    landmark: 'Moin-ul-Haq Stadium & Premchand Rangshala',
    coordinates: { lat: 25.6002, lng: 85.1624 },
  },
  {
    name: 'Dakbunglow',
    pincode: '800001',
    zone: 'Central Commercial Hub',
    landmark: 'Maurya Lok Complex & Crossing',
    coordinates: { lat: 25.6098, lng: 85.1345 },
  },
  {
    name: 'Ashok Rajpath',
    pincode: '800004',
    zone: 'North / University Hub',
    landmark: 'PMCH, Patna College & NIT Patna',
    coordinates: { lat: 25.6206, lng: 85.1689 },
  },
  {
    name: 'Danapur',
    pincode: '801503',
    zone: 'West Suburbs',
    landmark: 'Saguna More & Danapur Cantt',
    coordinates: { lat: 25.6324, lng: 85.0435 },
  },
  {
    name: 'Patliputra Colony',
    pincode: '800013',
    zone: 'North West Patna',
    landmark: 'Patliputra Golambar & Industrial Area',
    coordinates: { lat: 25.6264, lng: 85.1118 },
  },
  {
    name: 'Lalganj Corridor',
    pincode: '844121',
    zone: 'Inter-District Destination Corridor',
    landmark: 'Vaishali Highway Corridor to Patna',
    coordinates: { lat: 25.867, lng: 85.178 },
  },
] as const;

export type PatnaLocality = typeof PATNA_LOCALITIES[number]['name'];
export type PatnaPincode = typeof PATNA_LOCALITIES[number]['pincode'];

// -----------------------------------------------------------------------
// 2. MARKETPLACE CATEGORIES
// -----------------------------------------------------------------------

export type BookingCategory =
  | 'healthcare'
  | 'hotels'
  | 'restaurants'
  | 'salon'
  | 'vehicle_care';

export interface CategoryDefinition {
  id: BookingCategory;
  name: string;
  hindiLabel: string;
  tagline: string;
  sampleServices: string[];
  icon: string;
}

export const BOOKING_CATEGORIES: Record<BookingCategory, CategoryDefinition> = {
  healthcare: {
    id: 'healthcare',
    name: 'Clinics & Doctors',
    hindiLabel: 'क्लीनिक एवं डॉक्टर',
    tagline: 'Direct OPD slots & specialized doctor appointments',
    sampleServices: ['Cardiology OPD', 'Pediatrics Review', 'Dental Care', 'Diagnostics'],
    icon: 'Stethoscope',
  },
  hotels: {
    id: 'hotels',
    name: 'Stays & Suites',
    hindiLabel: 'होटल एवं स्टे',
    tagline: 'Boutique AC rooms & heritage suites with zero walk-in uncertainty',
    sampleServices: ['Deluxe AC Room', 'Executive Suite', 'Day Use Hourly', 'Banquet Hall'],
    icon: 'Hotel',
  },
  restaurants: {
    id: 'restaurants',
    name: 'Dining & Cafes',
    hindiLabel: 'रेस्टोरेंट एवं कैफे',
    tagline: 'Guaranteed table reservations & Ahuna Handi slots',
    sampleServices: ['Ahuna Handi Tasting', 'Rooftop Family Table', 'Private Gazebo', 'Buffet'],
    icon: 'UtensilsCrossed',
  },
  salon: {
    id: 'salon',
    name: 'Salons & Spas',
    hindiLabel: 'सैलून एवं स्पा',
    tagline: 'Dedicated stylist stations & bridal hair appointments',
    sampleServices: ['Keratin Therapy', 'Bridal Grooming', 'Ayurvedic Head Spa', 'Beard Styling'],
    icon: 'Scissors',
  },
  vehicle_care: {
    id: 'vehicle_care',
    name: 'Vehicle Care & Auto',
    hindiLabel: 'कार वॉश एवं सर्विस',
    tagline: 'Express foam wash, underbody rust protection & 10H ceramic coating',
    sampleServices: ['High-Pressure Jet Wash', '3M Interior Spa', '10H Ceramic Coating', 'OBD-II Scan'],
    icon: 'Wrench',
  },
};

// -----------------------------------------------------------------------
// 3. BOOKING STATE MACHINE & STATUSES
// -----------------------------------------------------------------------

export type BookingStatus =
  | 'REQUESTED'   // Created by customer, awaiting merchant response (average SLA 90s)
  | 'ACCEPTED'    // Merchant accepted and allocated slot/table/bed
  | 'CONFIRMED'   // Final verification code dispatched to customer
  | 'COMPLETED'   // Customer verified via offline PIN & service rendered
  | 'DECLINED'    // Merchant declined due to emergency capacity constraint
  | 'EXPIRED'     // System expired unconfirmed booking request past timeout
  | 'CANCELLED'   // Customer cancelled prior to check-in policy deadline
  | 'NO_SHOW'     // Customer failed to arrive within grace window
  | 'DISPUTED'    // Customer or merchant raised SLA / billing dispute
  | 'REFUND_REQUESTED' // Customer requested refund for cancelled or disputed visit
  | 'REFUNDED';   // Platform or merchant processed refund to customer bank/UPI

export const VALID_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: ['ACCEPTED', 'CONFIRMED', 'DECLINED', 'EXPIRED', 'CANCELLED'],
  ACCEPTED: ['CONFIRMED', 'COMPLETED', 'DECLINED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELLED', 'DISPUTED'],
  COMPLETED: ['DISPUTED'],
  DECLINED: [],
  EXPIRED: [],
  CANCELLED: ['DISPUTED', 'REFUND_REQUESTED'],
  NO_SHOW: ['DISPUTED'],
  DISPUTED: ['COMPLETED', 'CANCELLED', 'REFUND_REQUESTED', 'REFUNDED'],
  REFUND_REQUESTED: ['REFUNDED', 'DISPUTED', 'CANCELLED'],
  REFUNDED: [],
};

export function isValidBookingTransition(from: BookingStatus, to: BookingStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// -----------------------------------------------------------------------
// 4. USER ROLES & STRICT PERMISSION FLAGS
// -----------------------------------------------------------------------

export type UserRole =
  | 'CUSTOMER'
  | 'PARTNER_OWNER'
  | 'PARTNER_STAFF'
  | 'ADMIN';

export interface RolePermissions {
  canBrowseAndBook: boolean;
  canCancelOwnBooking: boolean;
  canManageBusinessProfile: boolean;
  canAcceptOrDeclineBookings: boolean;
  canVerifyCustomerPin: boolean;
  canCompleteBookings: boolean;
  canManageServicesAndSlots: boolean;
  canManageStaffRoles: boolean;
  canViewCommercialLedger: boolean;
  canApprovePartners: boolean;
  canManagePlatformDisputes: boolean;
  canAccessAdminAuditLogs: boolean;
  canConfigurePlatformCommission: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  CUSTOMER: {
    canBrowseAndBook: true,
    canCancelOwnBooking: true,
    canManageBusinessProfile: false,
    canAcceptOrDeclineBookings: false,
    canVerifyCustomerPin: false,
    canCompleteBookings: false,
    canManageServicesAndSlots: false,
    canManageStaffRoles: false,
    canViewCommercialLedger: false,
    canApprovePartners: false,
    canManagePlatformDisputes: false,
    canAccessAdminAuditLogs: false,
    canConfigurePlatformCommission: false,
  },
  PARTNER_STAFF: {
    canBrowseAndBook: false,
    canCancelOwnBooking: false,
    canManageBusinessProfile: false,
    canAcceptOrDeclineBookings: true,
    canVerifyCustomerPin: true,
    canCompleteBookings: true,
    canManageServicesAndSlots: false,
    canManageStaffRoles: false,
    canViewCommercialLedger: false,
    canApprovePartners: false,
    canManagePlatformDisputes: false,
    canAccessAdminAuditLogs: false,
    canConfigurePlatformCommission: false,
  },
  PARTNER_OWNER: {
    canBrowseAndBook: false,
    canCancelOwnBooking: false,
    canManageBusinessProfile: true,
    canAcceptOrDeclineBookings: true,
    canVerifyCustomerPin: true,
    canCompleteBookings: true,
    canManageServicesAndSlots: true,
    canManageStaffRoles: true,
    canViewCommercialLedger: true,
    canApprovePartners: false,
    canManagePlatformDisputes: false,
    canAccessAdminAuditLogs: false,
    canConfigurePlatformCommission: false,
  },
  ADMIN: {
    canBrowseAndBook: true,
    canCancelOwnBooking: true,
    canManageBusinessProfile: true,
    canAcceptOrDeclineBookings: true,
    canVerifyCustomerPin: true,
    canCompleteBookings: true,
    canManageServicesAndSlots: true,
    canManageStaffRoles: true,
    canViewCommercialLedger: true,
    canApprovePartners: true,
    canManagePlatformDisputes: true,
    canAccessAdminAuditLogs: true,
    canConfigurePlatformCommission: true,
  },
};

// -----------------------------------------------------------------------
// 5. DOMAIN INTERFACES: PROVIDER, BRANCH, SERVICE, BOOKING, LEDGER, CRM
// -----------------------------------------------------------------------

export type CommercialModel = 'SUBSCRIPTION' | 'COMMISSION';

export interface CommercialConfig {
  model: CommercialModel;
  commissionPercentage?: number; // e.g. 8.0 for 8%
  subscriptionTier?: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  monthlyFeeInr?: number;
  payoutCycle: 'DAILY_NEFT' | 'T_PLUS_1' | 'WEEKLY_SETTLEMENT';
}

export interface OperatingHoursDay {
  isOpen: boolean;
  open: string;  // "09:00"
  close: string; // "20:00"
}

export type WeeklyOperatingHours = {
  monday: OperatingHoursDay;
  tuesday: OperatingHoursDay;
  wednesday: OperatingHoursDay;
  thursday: OperatingHoursDay;
  friday: OperatingHoursDay;
  saturday: OperatingHoursDay;
  sunday: OperatingHoursDay;
};

export interface PartnerStaffMember {
  id: string;
  name: string;
  role: 'PARTNER_OWNER' | 'PARTNER_STAFF';
  phone: string;
  email?: string;
  branchId: string;
  assignedBayOrCounter?: string;
  isActive: boolean;
}

export interface Branch {
  id: string;
  providerId: string;
  branchCode: string; // e.g. BR-PAT-001
  branchName: string;
  streetAddress: string;
  locality: PatnaLocality;
  city: 'Patna';
  state: 'Bihar';
  pincode: PatnaPincode;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  operatingHours: WeeklyOperatingHours;
  staff: PartnerStaffMember[];
  isActive: boolean;
}

export interface ServiceItem {
  id: string;
  providerId: string;
  name: string;
  category: BookingCategory;
  description: string;
  priceInr: number;
  durationMinutes: number;
  isActive: boolean;
  categorySpecificData?: Record<string, unknown>;
}

export interface Provider {
  id: string;
  providerCode: string; // e.g. BK-PAT-001
  name: string;
  legalBusinessName: string;
  category: BookingCategory;
  tagline: string;
  city: 'Patna';
  locality: PatnaLocality;
  pincode: PatnaPincode;
  coordinates: {
    lat: number;
    lng: number;
  };
  isVerified: boolean;
  verificationBadge: string;
  gstin?: string;
  panNumber?: string;
  tradeLicenseNumber?: string;
  commercialPlan: CommercialConfig;
  rating: number;
  reviewCount: number;
  startingPriceInr: number;
  branches: Branch[];
  services: ServiceItem[];
  images: string[];
  isSponsored?: boolean;
}

export interface BookingTimelineEvent {
  status: BookingStatus;
  timestamp: string;
  updatedBy: UserRole | 'SYSTEM';
  note?: string;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. BK-PAT-2026-8812
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  providerId: string;
  providerName: string;
  branchId: string;
  locality: PatnaLocality;
  category: BookingCategory;
  serviceId: string;
  serviceName: string;
  status: BookingStatus;
  scheduledDate: string; // YYYY-MM-DD
  slotTime: string;      // e.g. "10:30 AM"
  offlineVerificationCode: string; // 4-digit PIN e.g. "4192"
  baseBillAmountInr: number;
  taxGstInr: number;
  finalBillAmountInr: number;
  paymentStatus: 'PENDING' | 'COLLECTED_AT_VENUE' | 'REFUNDED';
  specialInstructions?: string;
  timeline: BookingTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CommissionLedgerEntry {
  id: string;
  bookingId: string;
  bookingCode: string;
  providerId: string;
  providerName: string;
  finalBillValueInr: number;
  commissionRatePercent: number; // e.g. 8.0
  commissionAmountInr: number;    // e.g. 120
  status: 'PENDING' | 'INVOICED' | 'PAID' | 'DISPUTED';
  settlementBatchId?: string;
  settledAt?: string;
  createdAt: string;
}

export type SalesLeadStage =
  | '01_LEAD'
  | '02_DISCUSS'
  | '03_VERIFY'
  | '04_ACTIVATE'
  | '05_CONFIGURE'
  | '06_GO_LIVE';

export interface SalesLeadNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
  type: 'CALL' | 'DEMO' | 'DOC_UPLOAD' | 'INTERNAL_NOTE';
}

export interface SalesLead {
  id: string;
  leadCode: string; // e.g. LEAD-PAT-101
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: 'Patna';
  locality: PatnaLocality;
  pincode: PatnaPincode;
  category: BookingCategory;
  stage: SalesLeadStage;
  assignedRep: string;
  commercialPlanProposed: CommercialConfig;
  estimatedMonthlyBookings: number;
  notes: SalesLeadNote[];
  createdAt: string;
  updatedAt: string;
}
