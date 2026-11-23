import { BookingStatus, BookingCategory } from '@/types/booking';

export interface MerchantProfile {
  id: string;
  name: string;
  legalBusinessName: string;
  category: BookingCategory;
  city: string;
  locality: string;
  gstin: string;
  panNumber: string;
  complianceNumber: string;
  complianceType: string;
  verificationBadge: string;
  phone: string;
  email: string;
  revenueModel: 'COMMISSION' | 'SUBSCRIPTION';
}

export const MERCHANT_PROFILES: MerchantProfile[] = [
  {
    id: 'prov-pat-02',
    name: 'Hotel Maurya & Heritage Suites',
    legalBusinessName: 'Maurya Hospitality Ventures LLP',
    category: 'hotels',
    city: 'Patna',
    locality: 'South Gandhi Maidan',
    gstin: '10AABCM9988H1Z1',
    panNumber: 'AABCM9988H',
    complianceNumber: 'HOTEL-REG/BR/2021/44',
    complianceType: 'DOT 4-Star Certified Hospitality',
    verificationBadge: 'Verified Luxury Heritage Partner',
    phone: '+91 612 220 1000',
    email: 'reservations@hotelmaurya.com',
    revenueModel: 'COMMISSION',
  },
  {
    id: 'prov-pat-03',
    name: 'Bawarchi Heritage Fine Dining & Banquets',
    legalBusinessName: 'Bawarchi Gourmet Foods Pvt Ltd',
    category: 'restaurants',
    city: 'Patna',
    locality: 'Boring Road',
    gstin: '10AABCB5544K1Z2',
    panNumber: 'AABCB5544K',
    complianceNumber: 'FSSAI/2023/BR/1109',
    complianceType: 'FSSAI Central Food Safety License',
    verificationBadge: 'Verified Fine Dining Partner',
    phone: '+91 612 255 8899',
    email: 'events@bawarchipatna.com',
    revenueModel: 'COMMISSION',
  },
  {
    id: 'prov-pat-04',
    name: 'Magnolia Organic Salon & Ayurvedic Spa',
    legalBusinessName: 'Magnolia Wellness Care LLP',
    category: 'salon',
    city: 'Patna',
    locality: 'Kankarbagh',
    gstin: '10AABCM3322P1Z5',
    panNumber: 'AABCM3322P',
    complianceNumber: 'AYUSH/BR/2022/882',
    complianceType: 'Ayush Certified Wellness Clinic',
    verificationBadge: 'Verified Premium Salon & Spa',
    phone: '+91 94310 77889',
    email: 'booking@magnoliapatna.in',
    revenueModel: 'COMMISSION',
  },
  // Retained for backward compatibility with existing unit test fixtures
  {
    id: 'prov-pat-01',
    name: 'Patliputra Pediatric & Child Care Clinic',
    legalBusinessName: 'Patliputra Child Health Care Pvt Ltd',
    category: 'healthcare',
    city: 'Patna',
    locality: 'Fraser Road',
    gstin: '10AABCP4455Q1Z8',
    panNumber: 'AABCP4455Q',
    complianceNumber: 'NABH/2024/BR/0981',
    complianceType: 'NABH Clinic Accreditation',
    verificationBadge: 'Verified Medical Establishment',
    phone: '+91 94310 11223',
    email: 'care@patliputrachildcare.in',
    revenueModel: 'COMMISSION',
  },
];

export interface PortalBookingItem {
  id: string;
  bookingReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: string;
  category: BookingCategory;
  categoryDetails: {
    doctorOrDepartment?: string;
    visitType?: string;
    branchName?: string;
    roomType?: string;
    nights?: number;
    guestCount?: number;
    partySize?: number;
    seatingArea?: string;
    vehicleMakeModel?: string;
    vehicleType?: string;
    vehicleRegNumber?: string;
    staffOrBay?: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  estimatedPriceInr: number;
  finalRealizedPriceInr?: number;
  commissionPercentage: number;
  status: BookingStatus;
  createdAt: string;
  specialInstructions?: string;
  declineReason?: string;
  checkInPin?: string;
}

export interface StaffMemberItem {
  id: string;
  name: string;
  role: 'PARTNER_STAFF' | 'PARTNER_OWNER';
  email: string;
  phone: string;
  assignedBranch: string;
  status: 'ACTIVE' | 'INACTIVE';
  addedDate: string;
}

export const INITIAL_STAFF_MEMBERS: StaffMemberItem[] = [
  {
    id: 'stf-001',
    name: 'Suresh Kumar',
    role: 'PARTNER_STAFF',
    email: 'suresh.desk@hotelmaurya.com',
    phone: '+91 94310 44551',
    assignedBranch: 'South Gandhi Maidan Executive Wing',
    status: 'ACTIVE',
    addedDate: '12 Oct 2026',
  },
  {
    id: 'stf-002',
    name: 'Pooja Verma',
    role: 'PARTNER_STAFF',
    email: 'pooja.concierge@hotelmaurya.com',
    phone: '+91 98350 22334',
    assignedBranch: 'South Gandhi Maidan Executive Wing',
    status: 'ACTIVE',
    addedDate: '01 Nov 2026',
  },
  {
    id: 'stf-003',
    name: 'Manoj Pandey',
    role: 'PARTNER_STAFF',
    email: 'manoj.banquets@hotelmaurya.com',
    phone: '+91 91220 88990',
    assignedBranch: 'Fraser Road Heritage Dining Pavilion',
    status: 'ACTIVE',
    addedDate: '10 Nov 2026',
  },
];

export const INITIAL_PORTAL_BOOKINGS: PortalBookingItem[] = [
  {
    id: 'p-req-001',
    bookingReference: 'BK-PAT-2026-9102',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 94310 88219',
    customerEmail: 'ananya.sharma@gmail.com',
    serviceName: 'Heritage Superior King Room Stay',
    category: 'hotels',
    categoryDetails: {
      roomType: 'Heritage Superior King',
      nights: 2,
      guestCount: 2,
      branchName: 'South Gandhi Maidan Executive Wing',
    },
    scheduledDate: '2026-11-20',
    scheduledTime: '02:00 PM',
    estimatedPriceInr: 4500,
    commissionPercentage: 8.0,
    status: 'REQUESTED',
    checkInPin: '4821',
    createdAt: '2026-11-19T09:15:00+05:30',
    specialInstructions: 'Late check-in expected around 8:00 PM due to Patna flight arrival. Request quiet corner room.',
  },
  {
    id: 'p-req-002',
    bookingReference: 'BK-PAT-2026-9103',
    customerName: 'Rohit Raj Srivastava',
    customerPhone: '+91 98350 44122',
    customerEmail: 'rohit.srivastava@bihartech.in',
    serviceName: 'Imperial Family Banquet Table',
    category: 'restaurants',
    categoryDetails: {
      partySize: 6,
      seatingArea: 'Courtyard Fountain Garden',
      branchName: 'Fraser Road Heritage Dining Pavilion',
    },
    scheduledDate: '2026-11-20',
    scheduledTime: '07:30 PM',
    estimatedPriceInr: 3200,
    commissionPercentage: 8.0,
    status: 'REQUESTED',
    checkInPin: '5190',
    createdAt: '2026-11-19T09:40:00+05:30',
    specialInstructions: 'Celebrating anniversary dinner. Kindly arrange quiet courtyard table and candle decor.',
  },
  {
    id: 'p-req-003',
    bookingReference: 'BK-PAT-2026-9104',
    customerName: 'Sunita Mehra',
    customerPhone: '+91 91223 77654',
    customerEmail: 'sunita.mehra@patnapower.gov.in',
    serviceName: 'Luxury Ayurvedic Body & Hair Ritual',
    category: 'salon',
    categoryDetails: {
      visitType: '60-Min Ayurvedic Rejuvenation',
      branchName: 'South Gandhi Maidan Executive Wing',
    },
    scheduledDate: '2026-11-20',
    scheduledTime: '04:30 PM',
    estimatedPriceInr: 2800,
    commissionPercentage: 8.0,
    status: 'REQUESTED',
    checkInPin: '3310',
    createdAt: '2026-11-19T10:10:00+05:30',
    specialInstructions: 'Prefers female Ayurvedic therapist and complimentary herbal steam bath.',
  },
  {
    id: 'p-req-004',
    bookingReference: 'BK-PAT-2026-8812',
    customerName: 'Vikramaditya Sengupta',
    customerPhone: '+91 98450 12345',
    customerEmail: 'vikram.sen@bookkaro.in',
    serviceName: 'Deluxe Courtyard Suite Reservation',
    category: 'hotels',
    categoryDetails: {
      roomType: 'Deluxe Courtyard Suite',
      nights: 3,
      guestCount: 2,
      branchName: 'South Gandhi Maidan Executive Wing',
    },
    scheduledDate: '2026-11-20',
    scheduledTime: '01:00 PM',
    estimatedPriceInr: 7500,
    commissionPercentage: 8.0,
    status: 'CONFIRMED',
    checkInPin: '4192',
    createdAt: '2026-11-18T16:00:00+05:30',
    specialInstructions: 'Corporate guest arriving via Patna Airport. Airport pickup requested.',
  },
  {
    id: 'p-req-005',
    bookingReference: 'BK-PAT-2026-8815',
    customerName: 'Dr. Alok Kumar',
    customerPhone: '+91 94314 99011',
    customerEmail: 'alok.pmch@biharmedical.org',
    serviceName: 'Executive Fine Dining Tasting Menu',
    category: 'restaurants',
    categoryDetails: {
      partySize: 4,
      seatingArea: 'Private Dining Alcove',
      branchName: 'Fraser Road Heritage Dining Pavilion',
    },
    scheduledDate: '2026-11-20',
    scheduledTime: '08:30 PM',
    estimatedPriceInr: 4800,
    commissionPercentage: 8.0,
    status: 'CONFIRMED',
    checkInPin: '7823',
    createdAt: '2026-11-18T18:20:00+05:30',
  },
  {
    id: 'p-req-006',
    bookingReference: 'BK-PAT-2026-8401',
    customerName: 'Preeti Kumari',
    customerPhone: '+91 98351 00293',
    customerEmail: 'preeti.patna@outlook.com',
    serviceName: 'Aroma Therapy Full Body Wellness Spa',
    category: 'salon',
    categoryDetails: {
      visitType: '60-Min Aromatherapy Session',
      branchName: 'South Gandhi Maidan Executive Wing',
    },
    scheduledDate: '2026-11-19',
    scheduledTime: '11:00 AM',
    estimatedPriceInr: 2500,
    finalRealizedPriceInr: 2500,
    commissionPercentage: 8.0,
    status: 'COMPLETED',
    createdAt: '2026-11-18T10:00:00+05:30',
  },
  {
    id: 'p-req-007',
    bookingReference: 'BK-PAT-2026-8402',
    customerName: 'Amitosh Mishra',
    customerPhone: '+91 94700 33419',
    customerEmail: 'amitosh.mishra@biharpolice.gov.in',
    serviceName: 'Heritage Executive Suite Stay',
    category: 'hotels',
    categoryDetails: {
      roomType: 'Heritage Executive Suite',
      nights: 1,
      guestCount: 2,
      branchName: 'South Gandhi Maidan Executive Wing',
    },
    scheduledDate: '2026-11-19',
    scheduledTime: '12:00 PM',
    estimatedPriceInr: 5800,
    finalRealizedPriceInr: 6400, // Includes room dining service
    commissionPercentage: 8.0,
    status: 'COMPLETED',
    createdAt: '2026-11-18T14:00:00+05:30',
    specialInstructions: 'In-room fine dining breakfast included upon checkout.',
  },
  {
    id: 'p-req-008',
    bookingReference: 'BK-PAT-2026-8201',
    customerName: 'Rajeev Nandan',
    customerPhone: '+91 98359 88120',
    customerEmail: 'rajeev.nandan@gmail.com',
    serviceName: 'Private Boardroom & High Tea Reservation',
    category: 'hotels',
    categoryDetails: {
      roomType: 'Executive Boardroom',
      branchName: 'South Gandhi Maidan Executive Wing',
    },
    scheduledDate: '2026-11-18',
    scheduledTime: '03:00 PM',
    estimatedPriceInr: 8000,
    commissionPercentage: 8.0,
    status: 'DECLINED',
    declineReason: 'Banquet wing fully booked for State Tourism Conference.',
    createdAt: '2026-11-18T14:30:00+05:30',
  },
  {
    id: 'p-req-009',
    bookingReference: 'BK-PAT-2026-8199',
    customerName: 'Kunal Kishore',
    customerPhone: '+91 93041 22910',
    customerEmail: 'kunal.kishore@gmail.com',
    serviceName: 'Saturday Evening Terrace Table',
    category: 'restaurants',
    categoryDetails: {
      partySize: 4,
      seatingArea: 'Skyline Terrace',
      branchName: 'Fraser Road Heritage Dining Pavilion',
    },
    scheduledDate: '2026-11-18',
    scheduledTime: '08:00 PM',
    estimatedPriceInr: 2400,
    commissionPercentage: 8.0,
    status: 'NO_SHOW',
    createdAt: '2026-11-18T11:00:00+05:30',
  },
];

export interface PortalServiceItem {
  id: string;
  name: string;
  category: BookingCategory;
  durationMinutes: number;
  priceInr: number;
  description: string;
  isActive: boolean;
  depositRequired: boolean;
  depositInr?: number;
}

export const INITIAL_SERVICE_CATALOG: PortalServiceItem[] = [
  {
    id: 'srv-pat-01',
    name: 'Heritage Superior King Room Stay',
    category: 'hotels',
    durationMinutes: 1440,
    priceInr: 4500,
    description: 'Luxury air-conditioned heritage king room with complimentary breakfast, high-speed WiFi, and 24/7 room service.',
    isActive: true,
    depositRequired: false,
  },
  {
    id: 'srv-pat-02',
    name: 'Deluxe Courtyard Suite Reservation',
    category: 'hotels',
    durationMinutes: 1440,
    priceInr: 7500,
    description: 'Spacious multi-room luxury suite facing courtyard fountain gardens with welcome refreshments and express check-in.',
    isActive: true,
    depositRequired: false,
  },
  {
    id: 'srv-pat-03',
    name: 'Imperial Family Dining Table (Spice Court)',
    category: 'restaurants',
    durationMinutes: 90,
    priceInr: 3200,
    description: 'Reserved prime dining table with welcome mocktails and chef curated regional Mauryan degustation menu.',
    isActive: true,
    depositRequired: false,
  },
  {
    id: 'srv-pat-04',
    name: 'Luxury Ayurvedic Body & Hair Ritual',
    category: 'salon',
    durationMinutes: 60,
    priceInr: 2800,
    description: 'Traditional Ayurvedic warm herbal oil body abhyanga followed by head massage and eucalyptus steam therapy.',
    isActive: true,
    depositRequired: false,
  },
  {
    id: 'srv-pat-05',
    name: 'Private Boardroom & High Tea Reservation',
    category: 'hotels',
    durationMinutes: 180,
    priceInr: 8000,
    description: '12-seat executive corporate boardroom equipped with AV projector, high-speed fiber internet, and bespoke high tea.',
    isActive: false,
    depositRequired: false,
  },
];

export interface BranchItem {
  id: string;
  branchName: string;
  isFlagship: boolean;
  address: string;
  locality: string;
  city: string;
  pincode: string;
  phone: string;
  managerName: string;
  status: 'ACTIVE' | 'MAINTENANCE';
}

export const INITIAL_BRANCHES: BranchItem[] = [
  {
    id: 'br-01',
    branchName: 'South Gandhi Maidan Executive Wing & Grand Suites',
    isFlagship: true,
    address: 'South Gandhi Maidan, Near Collectorate',
    locality: 'South Gandhi Maidan',
    city: 'Patna',
    pincode: '800001',
    phone: '+91 612 220 1000',
    managerName: 'Rajiv Malhotra (General Manager)',
    status: 'ACTIVE',
  },
  {
    id: 'br-02',
    branchName: 'Fraser Road Heritage Dining Pavilion',
    isFlagship: false,
    address: 'Dak Bungalow Crossing, Fraser Road',
    locality: 'Fraser Road',
    city: 'Patna',
    pincode: '800001',
    phone: '+91 612 255 8899',
    managerName: 'Kavita Singh (F&B Director)',
    status: 'ACTIVE',
  },
];

export interface DaySchedule {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export const INITIAL_WEEKLY_SCHEDULE: DaySchedule[] = [
  { day: 'Monday', isOpen: true, openTime: '07:00 AM', closeTime: '11:00 PM' },
  { day: 'Tuesday', isOpen: true, openTime: '07:00 AM', closeTime: '11:00 PM' },
  { day: 'Wednesday', isOpen: true, openTime: '07:00 AM', closeTime: '11:00 PM' },
  { day: 'Thursday', isOpen: true, openTime: '07:00 AM', closeTime: '11:00 PM' },
  { day: 'Friday', isOpen: true, openTime: '07:00 AM', closeTime: '11:30 PM' },
  { day: 'Saturday', isOpen: true, openTime: '07:00 AM', closeTime: '11:30 PM' },
  { day: 'Sunday', isOpen: true, openTime: '08:00 AM', closeTime: '11:00 PM' },
];

export interface SubscriptionData {
  tierName: string;
  monthlyFeeInr: number;
  billingCycle: string;
  nextRenewalDate: string;
  currentBookingsUsed: number;
  bookingLimit: number;
  branchLimit: number;
  activeBranches: number;
  staffSeatsLimit: number;
  activeStaffSeats: number;
  invoices: {
    id: string;
    invoiceNumber: string;
    date: string;
    amountInr: number;
    gstInr: number;
    totalInr: number;
    status: 'PAID' | 'DUE';
    paymentMethod: string;
  }[];
}

export const INITIAL_SUBSCRIPTION_DATA: SubscriptionData = {
  tierName: 'BOOKKARO Merchant Growth Tier',
  monthlyFeeInr: 3999,
  billingCycle: 'Monthly (Auto-debit via e-NACH)',
  nextRenewalDate: '01 Dec 2026',
  currentBookingsUsed: 142,
  bookingLimit: 500,
  branchLimit: 3,
  activeBranches: 2,
  staffSeatsLimit: 10,
  activeStaffSeats: 6,
  invoices: [
    {
      id: 'inv-sub-001',
      invoiceNumber: 'INV-BK-2026-1102',
      date: '01 Nov 2026',
      amountInr: 3999,
      gstInr: 720,
      totalInr: 4719,
      status: 'PAID',
      paymentMethod: 'HDFC Corporate NetBanking',
    },
    {
      id: 'inv-sub-002',
      invoiceNumber: 'INV-BK-2026-1002',
      date: '01 Oct 2026',
      amountInr: 3999,
      gstInr: 720,
      totalInr: 4719,
      status: 'PAID',
      paymentMethod: 'HDFC Corporate NetBanking',
    },
    {
      id: 'inv-sub-003',
      invoiceNumber: 'INV-BK-2026-0902',
      date: '01 Sep 2026',
      amountInr: 3999,
      gstInr: 720,
      totalInr: 4719,
      status: 'PAID',
      paymentMethod: 'UPI AutoPay (ICICI)',
    },
  ],
};

export interface CommissionLedgerRow {
  bookingId: string;
  bookingReference: string;
  customerName: string;
  serviceCompleted: string;
  completedDate: string;
  finalBillValueInr: number;
  commissionPercentage: number;
  platformFeePayableInr: number;
  netMerchantPayoutInr: number;
  payoutStatus: 'SETTLED' | 'PENDING_T_PLUS_1';
  utrNumber?: string;
}

export const INITIAL_COMMISSION_LEDGER: CommissionLedgerRow[] = [
  {
    bookingId: 'p-req-007',
    bookingReference: 'BK-PAT-2026-8402',
    customerName: 'Amitosh Mishra',
    serviceCompleted: 'Heritage Executive Suite Stay + Room Dining',
    completedDate: '19 Nov 2026',
    finalBillValueInr: 6400,
    commissionPercentage: 8.0,
    platformFeePayableInr: 512,
    netMerchantPayoutInr: 5888,
    payoutStatus: 'PENDING_T_PLUS_1',
  },
  {
    bookingId: 'p-req-006',
    bookingReference: 'BK-PAT-2026-8401',
    customerName: 'Preeti Kumari',
    serviceCompleted: 'Aroma Therapy Full Body Wellness Spa',
    completedDate: '19 Nov 2026',
    finalBillValueInr: 2500,
    commissionPercentage: 8.0,
    platformFeePayableInr: 200,
    netMerchantPayoutInr: 2300,
    payoutStatus: 'PENDING_T_PLUS_1',
  },
  {
    bookingId: 'p-req-010',
    bookingReference: 'BK-PAT-2026-8319',
    customerName: 'Vivek Ranjan',
    serviceCompleted: 'Heritage Superior King Room (Weekend)',
    completedDate: '18 Nov 2026',
    finalBillValueInr: 4500,
    commissionPercentage: 8.0,
    platformFeePayableInr: 360,
    netMerchantPayoutInr: 4140,
    payoutStatus: 'SETTLED',
    utrNumber: 'HDFC261118990142',
  },
  {
    bookingId: 'p-req-011',
    bookingReference: 'BK-PAT-2026-8290',
    customerName: 'Meenakshi Sahay',
    serviceCompleted: 'Imperial Banquet Dinner Table (4 Pax)',
    completedDate: '18 Nov 2026',
    finalBillValueInr: 3200,
    commissionPercentage: 8.0,
    platformFeePayableInr: 256,
    netMerchantPayoutInr: 2944,
    payoutStatus: 'SETTLED',
    utrNumber: 'HDFC261118990142',
  },
  {
    bookingId: 'p-req-012',
    bookingReference: 'BK-PAT-2026-8154',
    customerName: 'Dr. Tarun Verma',
    serviceCompleted: 'Deluxe Courtyard Suite (2 Nights)',
    completedDate: '17 Nov 2026',
    finalBillValueInr: 15000,
    commissionPercentage: 8.0,
    platformFeePayableInr: 1200,
    netMerchantPayoutInr: 13800,
    payoutStatus: 'SETTLED',
    utrNumber: 'HDFC261117441920',
  },
  {
    bookingId: 'p-req-013',
    bookingReference: 'BK-PAT-2026-8091',
    customerName: 'Shambhavi Devi',
    serviceCompleted: 'Luxury Ayurvedic Body & Hair Ritual',
    completedDate: '17 Nov 2026',
    finalBillValueInr: 2800,
    commissionPercentage: 8.0,
    platformFeePayableInr: 224,
    netMerchantPayoutInr: 2576,
    payoutStatus: 'SETTLED',
    utrNumber: 'HDFC261117441920',
  },
];
