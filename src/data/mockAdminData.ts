import { BookingCategory } from '@/types/booking';

export type OnboardingStage =
  | '01_LEAD'
  | '02_DISCUSS'
  | '03_VERIFY'
  | '04_ACTIVATE'
  | '05_CONFIGURE'
  | '06_GO_LIVE';

export interface CommercialPlanConfig {
  type: 'SUBSCRIPTION' | 'COMMISSION';
  subscriptionTier?: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  monthlyFeeInr?: number;
  commissionPercentage?: number;
}

export interface ActivityNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
  type: 'CALL' | 'DEMO' | 'DOC_UPLOAD' | 'INTERNAL_NOTE';
}

export interface CrmLeadItem {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  locality: string;
  category: BookingCategory;
  stage: OnboardingStage;
  assignedSalesRep: string;
  estimatedMonthlyBookings: number;
  commercialPlan: CommercialPlanConfig;
  notes: ActivityNote[];
  createdAt: string;
  updatedAt: string;
}

export interface VerificationApplication {
  id: string;
  tempReference: string;
  providerId?: string;
  businessName: string;
  legalEntityName: string;
  category: BookingCategory;
  subCategory: string;
  city: string;
  locality: string;
  streetAddress: string;
  pincode: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  panNumber: string;
  licenseType: string;
  licenseNumber: string;
  documents: {
    title: string;
    type: 'GST_CERTIFICATE' | 'PAN_CARD' | 'TRADE_LICENSE' | 'MEDICAL_COUNCIL' | 'PREMISE_PHOTO';
    status: 'VERIFIED' | 'PENDING' | 'REJECTED';
    fileName: string;
  }[];
  verificationStatus: 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'VERIFIED';
  submittedAt: string;
  assignedInspector: string;
  rejectionOrChangeReason?: string;
}

export interface PlatformDisputeItem {
  ticketId: string;
  bookingReference: string;
  customerName: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  category: BookingCategory;
  reason: string;
  description: string;
  billAmountInr: number;
  filedAt: string;
  status: 'OPEN' | 'INVESTIGATING' | 'REFUNDED' | 'DISMISSED';
  merchantExplanation?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    role: 'ADMIN' | 'SYSTEM' | 'MERCHANT' | 'CUSTOMER';
  };
  action: string;
  target: string;
  details: string;
  ipAddress: string;
}

export interface CityLaunchItem {
  id: string;
  cityName: string;
  state: string;
  status: 'ACTIVE' | 'PRE_LAUNCH' | 'PLANNING';
  activeProvidersCount: number;
  monthlyBookings: number;
  targetLaunchDate?: string;
}

export interface CategoryControlItem {
  id: BookingCategory;
  name: string;
  isEnabled: boolean;
  standardCommissionPercentage: number;
  defaultSearchRadiusKm: number;
  instantBookingPermitted: boolean;
  totalActiveProviders: number;
}

// -------------------------------------------------------------
// INITIAL MOCK DATASETS
// -------------------------------------------------------------

export const INITIAL_CRM_LEADS: CrmLeadItem[] = [
  {
    id: 'crm-001',
    businessName: 'Dr. Mukherjee Skin & Laser Cosmetology',
    contactPerson: 'Dr. Swagata Mukherjee',
    phone: '+91 94310 77112',
    email: 'dr.swagata@skincarepatna.in',
    city: 'Patna',
    locality: 'Boring Canal Road',
    category: 'healthcare',
    stage: '01_LEAD',
    assignedSalesRep: 'Rohan Verma (Patna Cluster)',
    estimatedMonthlyBookings: 180,
    commercialPlan: { type: 'COMMISSION', commissionPercentage: 8.0 },
    notes: [
      {
        id: 'n-1',
        author: 'Rohan Verma',
        timestamp: '19 Nov 2026, 11:20 AM',
        text: 'Initial outreach call. Clinic receives 25+ patient enquiries per day via phone. Interested in digital slot booking.',
        type: 'CALL',
      },
    ],
    createdAt: '2026-11-19',
    updatedAt: '2026-11-19',
  },
  {
    id: 'crm-002',
    businessName: 'Royal Champaran Ahuna Handi & Courtyard Dining',
    contactPerson: 'Harshvardhan Kumar',
    phone: '+91 94311 33419',
    email: 'harsh@champarandining.com',
    city: 'Patna',
    locality: 'Boring Canal Road',
    category: 'restaurants',
    stage: '01_LEAD',
    assignedSalesRep: 'Rohan Verma (Patna Cluster)',
    estimatedMonthlyBookings: 350,
    commercialPlan: { type: 'COMMISSION', commissionPercentage: 5.0 },
    notes: [
      {
        id: 'n-2',
        author: 'Rohan Verma',
        timestamp: '18 Nov 2026, 04:30 PM',
        text: 'Lead inbound via Partner Page. Wants table reservation token system to reduce weekend terrace queues.',
        type: 'CALL',
      },
    ],
    createdAt: '2026-11-18',
    updatedAt: '2026-11-18',
  },
  {
    id: 'crm-003',
    businessName: 'AutoSpeed German Car Detailing Studio Patna',
    contactPerson: 'Gaurav Srivastava',
    phone: '+91 94310 99441',
    email: 'gaurav@autospeedpatna.in',
    city: 'Patna',
    locality: 'Patliputra Industrial Area',
    category: 'vehicle_care',
    stage: '02_DISCUSS',
    assignedSalesRep: 'Pooja Jha (Patna Cluster)',
    estimatedMonthlyBookings: 120,
    commercialPlan: { type: 'SUBSCRIPTION', subscriptionTier: 'GROWTH', monthlyFeeInr: 3999 },
    notes: [
      {
        id: 'n-3',
        author: 'Pooja Jha',
        timestamp: '18 Nov 2026, 02:15 PM',
        text: 'Completed Zoom walkthrough of Merchant Console. Demoed bay allocation and SMS customer vouchers.',
        type: 'DEMO',
      },
    ],
    createdAt: '2026-11-17',
    updatedAt: '2026-11-18',
  },
  {
    id: 'crm-004',
    businessName: 'City Heart Diagnostics & 4D Ultrasound',
    contactPerson: 'Dr. Neeraj Pandey',
    phone: '+91 94314 55091',
    email: 'contact@cityheartpatna.org',
    city: 'Patna',
    locality: 'Kankarbagh',
    category: 'healthcare',
    stage: '02_DISCUSS',
    assignedSalesRep: 'Rohan Verma (Patna Cluster)',
    estimatedMonthlyBookings: 240,
    commercialPlan: { type: 'COMMISSION', commissionPercentage: 7.5 },
    notes: [
      {
        id: 'n-4',
        author: 'Rohan Verma',
        timestamp: '17 Nov 2026, 12:00 PM',
        text: 'Discussed OPD timing integrations. Doctor agreed to designate 2 morning slots per day exclusively for BOOKKARO.',
        type: 'INTERNAL_NOTE',
      },
    ],
    createdAt: '2026-11-16',
    updatedAt: '2026-11-17',
  },
  {
    id: 'crm-005',
    businessName: 'Grand Regency Boutique Express Hotel Patna',
    contactPerson: 'Manish Kumar (General Manager)',
    phone: '+91 612 221 8820',
    email: 'gm@grandregencypatna.com',
    city: 'Patna',
    locality: 'Bailey Road',
    category: 'hotels',
    stage: '03_VERIFY',
    assignedSalesRep: 'Rohan Verma (Patna Cluster)',
    estimatedMonthlyBookings: 90,
    commercialPlan: { type: 'SUBSCRIPTION', subscriptionTier: 'ENTERPRISE', monthlyFeeInr: 7999 },
    notes: [
      {
        id: 'n-5',
        author: 'Rohan Verma',
        timestamp: '17 Nov 2026, 05:00 PM',
        text: 'Commercial contract signed. GST certificate and Fire NOC uploaded to verification desk.',
        type: 'DOC_UPLOAD',
      },
    ],
    createdAt: '2026-11-15',
    updatedAt: '2026-11-17',
  },
  {
    id: 'crm-006',
    businessName: 'Blossom Organic Hair & Nail Spa Patna',
    contactPerson: 'Khyati Mishra',
    phone: '+91 612 254 9988',
    email: 'khyati@blossomspapatna.in',
    city: 'Patna',
    locality: 'Kankarbagh',
    category: 'salon',
    stage: '03_VERIFY',
    assignedSalesRep: 'Pooja Jha (Patna Cluster)',
    estimatedMonthlyBookings: 160,
    commercialPlan: { type: 'COMMISSION', commissionPercentage: 10.0 },
    notes: [
      {
        id: 'n-6',
        author: 'Pooja Jha',
        timestamp: '16 Nov 2026, 03:30 PM',
        text: 'Physical premises inspected by field officer. Salon setup is verified with 6 luxury stations.',
        type: 'INTERNAL_NOTE',
      },
    ],
    createdAt: '2026-11-14',
    updatedAt: '2026-11-16',
  },
  {
    id: 'crm-007',
    businessName: 'Magadh Advanced Orthopedic Clinic',
    contactPerson: 'Dr. S. K. Sinha (MS Ortho)',
    phone: '+91 94310 22339',
    email: 'drsksinha@magadhortho.in',
    city: 'Patna',
    locality: 'Rajendra Nagar',
    category: 'healthcare',
    stage: '04_ACTIVATE',
    assignedSalesRep: 'Rohan Verma (Patna Cluster)',
    estimatedMonthlyBookings: 200,
    commercialPlan: { type: 'COMMISSION', commissionPercentage: 8.0 },
    notes: [
      {
        id: 'n-7',
        author: 'Compliance Desk',
        timestamp: '16 Nov 2026, 11:00 AM',
        text: 'KYC verified. Provider ID PROV-PAT-07 generated. Merchant Portal credentials dispatched via SMS.',
        type: 'INTERNAL_NOTE',
      },
    ],
    createdAt: '2026-11-12',
    updatedAt: '2026-11-16',
  },
  {
    id: 'crm-008',
    businessName: 'The Champaran Royal Rasoi Patna',
    contactPerson: 'Bhavesh Singh',
    phone: '+91 612 233 8812',
    email: 'bhavesh@champaranroyal.in',
    city: 'Patna',
    locality: 'Saguna More, Danapur',
    category: 'restaurants',
    stage: '05_CONFIGURE',
    assignedSalesRep: 'Rohan Verma (Patna Cluster)',
    estimatedMonthlyBookings: 420,
    commercialPlan: { type: 'COMMISSION', commissionPercentage: 6.0 },
    notes: [
      {
        id: 'n-8',
        author: 'Nirav Dave',
        timestamp: '15 Nov 2026, 06:00 PM',
        text: 'Table categories configured: AC Family Hall, Open Courtyard, Private Gazebo. Testing booking requests.',
        type: 'INTERNAL_NOTE',
      },
    ],
    createdAt: '2026-11-10',
    updatedAt: '2026-11-15',
  },
  {
    id: 'crm-009',
    businessName: 'Patliputra Pediatric & Child Care Clinic',
    contactPerson: 'Dr. R. K. Verma',
    phone: '+91 94310 11223',
    email: 'care@patliputrachildcare.in',
    city: 'Patna',
    locality: 'Fraser Road',
    category: 'healthcare',
    stage: '06_GO_LIVE',
    assignedSalesRep: 'Rohan Verma (Patna Cluster)',
    estimatedMonthlyBookings: 320,
    commercialPlan: { type: 'COMMISSION', commissionPercentage: 8.0 },
    notes: [
      {
        id: 'n-9',
        author: 'Rohan Verma',
        timestamp: '10 Nov 2026, 10:00 AM',
        text: 'Live in search index! Receiving 15+ verified bookings daily with 98% acceptance rate.',
        type: 'INTERNAL_NOTE',
      },
    ],
    createdAt: '2026-11-01',
    updatedAt: '2026-11-10',
  },
];

export const INITIAL_VERIFICATIONS_QUEUE: VerificationApplication[] = [
  {
    id: 'ver-001',
    tempReference: 'APP-PAT-2026-091',
    businessName: 'Magadh Dental Implant & Laser Studio',
    legalEntityName: 'Magadh Advanced Oral Care LLP',
    category: 'healthcare',
    subCategory: 'Implantology & Oral Surgery',
    city: 'Patna',
    locality: 'Kankarbagh',
    streetAddress: 'Plot 42, Main Road, Near Malahi Pakri Chowk',
    pincode: '800020',
    contactPerson: 'Dr. Anurag Kashyap (MDS)',
    phone: '+91 94310 66551',
    email: 'anurag@magadhdental.in',
    gstin: '10AAACM4419Q1Z4',
    panNumber: 'AAACM4419Q',
    licenseType: 'State Dental Council Registration',
    licenseNumber: 'BDC/2018/DENT/4491',
    documents: [
      {
        title: 'GST Registration Certificate (Form REG-06)',
        type: 'GST_CERTIFICATE',
        status: 'VERIFIED',
        fileName: 'GST_REG06_MagadhDental.pdf',
      },
      {
        title: 'Permanent Account Number Card',
        type: 'PAN_CARD',
        status: 'VERIFIED',
        fileName: 'PAN_AAACM4419Q.jpg',
      },
      {
        title: 'Bihar State Dental Council License',
        type: 'MEDICAL_COUNCIL',
        status: 'VERIFIED',
        fileName: 'BDC_Registration_Doc.pdf',
      },
      {
        title: 'Clinic Reception & Sterilization Bay Photos',
        type: 'PREMISE_PHOTO',
        status: 'VERIFIED',
        fileName: 'Premise_Sterile_OPD_01.jpg',
      },
    ],
    verificationStatus: 'PENDING_REVIEW',
    submittedAt: '19 Nov 2026, 10:30 AM',
    assignedInspector: 'Pooja Jha (Senior Compliance Officer)',
  },
  {
    id: 'ver-002',
    tempReference: 'APP-PAT-2026-104',
    businessName: 'The Imperial Heights Boutique Retreat Patna',
    legalEntityName: 'Imperial Hospitality Capital Bihar Pvt Ltd',
    category: 'hotels',
    subCategory: 'Boutique Hotel & Executive Rooms',
    city: 'Patna',
    locality: 'Bailey Road',
    streetAddress: '14 Bailey Road, Near Patna Zoo Gate 2, Patna',
    pincode: '800014',
    contactPerson: 'Karan Mehra (Managing Director)',
    phone: '+91 612 223 9900',
    email: 'karan@imperialheightspatna.in',
    gstin: '10AABCI9920K1ZX',
    panNumber: 'AABCI9920K',
    licenseType: 'Bihar Tourism & Municipal Corporation Hotel License',
    licenseNumber: 'PMC-HOTEL/2023/112',
    documents: [
      {
        title: 'GST Certificate (Bihar Circle)',
        type: 'GST_CERTIFICATE',
        status: 'VERIFIED',
        fileName: 'Patna_GST_Imperial.pdf',
      },
      {
        title: 'Bihar Fire Safety NOC',
        type: 'TRADE_LICENSE',
        status: 'PENDING',
        fileName: 'Fire_NOC_Renewal_Nov2026.pdf',
      },
      {
        title: 'Hotel Entrance & Deluxe Suite Photos',
        type: 'PREMISE_PHOTO',
        status: 'VERIFIED',
        fileName: 'Suite_Interior_View.jpg',
      },
    ],
    verificationStatus: 'PENDING_REVIEW',
    submittedAt: '18 Nov 2026, 04:15 PM',
    assignedInspector: 'Pooja Jha (Senior Compliance Officer)',
  },
  {
    id: 'ver-003',
    tempReference: 'APP-PAT-2026-088',
    businessName: 'Shreeji Authentic Vegetarian Dining & Lounge Patna',
    legalEntityName: 'Shreeji Caterers & Hospitality Partnership Patna',
    category: 'restaurants',
    subCategory: 'Pure Vegetarian Dining',
    city: 'Patna',
    locality: 'Exhibition Road',
    streetAddress: 'Opposite LIC Building, Exhibition Road, Patna',
    pincode: '800001',
    contactPerson: 'Jitendra Vora',
    phone: '+91 612 245 1102',
    email: 'jitendra@shreejipatna.in',
    gstin: '10AAJFS8810P1Z2',
    panNumber: 'AAJFS8810P',
    licenseType: 'FSSAI State License (Food Safety)',
    licenseNumber: 'FSSAI-10723024000412',
    documents: [
      {
        title: 'FSSAI 5-Star Clean Kitchen Certificate',
        type: 'TRADE_LICENSE',
        status: 'VERIFIED',
        fileName: 'FSSAI_Certificate_Shreeji.pdf',
      },
      {
        title: 'GST Registration Certificate',
        type: 'GST_CERTIFICATE',
        status: 'PENDING',
        fileName: 'GST_Provisional_Copy.jpg',
      },
    ],
    verificationStatus: 'CHANGES_REQUESTED',
    rejectionOrChangeReason: 'GST document uploaded is provisional registration; please provide final Form REG-06 showing active status.',
    submittedAt: '17 Nov 2026, 02:00 PM',
    assignedInspector: 'Pooja Jha (Senior Compliance Officer)',
  },
];

export const INITIAL_PLATFORM_DISPUTES: PlatformDisputeItem[] = [
  {
    ticketId: 'DISP-2026-4491',
    bookingReference: 'BK-PAT-2026-7721',
    customerName: 'Deepak Chawla',
    customerPhone: '+91 98223 99881',
    providerId: 'prov-del-03',
    providerName: 'Biryani Mahal & Awadhi Dum Kitchen Patna',
    category: 'restaurants',
    reason: 'Merchant delayed table seating by >45 minutes past booked time',
    description: 'Arrived at 8:30 PM with confirmed token. Hostess reassigned table to walk-in patrons. Had to wait 45 minutes on pavement with elderly parents.',
    billAmountInr: 525,
    filedAt: '19 Nov 2026, 12:45 PM',
    status: 'OPEN',
    merchantExplanation: 'Restaurant was experiencing extreme VIP rush on Fraser Road. Requested customer to take complimentary drinks while table was set.',
  },
  {
    ticketId: 'DISP-2026-3810',
    bookingReference: 'BK-PAT-2026-4412',
    customerName: 'Kavita Roy',
    customerPhone: '+91 98350 11928',
    providerId: 'prov-pat-04',
    providerName: 'Kaya Kalp Ayurvedic Hair & Skin Spa',
    category: 'salon',
    reason: 'Billing discrepancy / unexpected extra charge demanded at reception',
    description: 'Booking showed all-inclusive INR 1,299. Reception demanded additional INR 400 stating herbal shampoo was an add-on.',
    billAmountInr: 1699,
    filedAt: '18 Nov 2026, 06:15 PM',
    status: 'INVESTIGATING',
    merchantExplanation: 'Therapist used premium Nilgiri cold-pressed argan concoction upon verbal request from client.',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-001',
    timestamp: '19 Nov 2026, 07:15 PM',
    actor: { name: 'Pooja Jha', role: 'ADMIN' },
    action: 'APPROVED_KYC',
    target: 'prov-pat-05 (Ganga Motors Bosch)',
    details: 'Verified Bosch Service Franchise License and approved KYC shield.',
    ipAddress: '103.212.144.18 (Patna Office VPN)',
  },
  {
    id: 'log-002',
    timestamp: '19 Nov 2026, 06:30 PM',
    actor: { name: 'System Mediator', role: 'SYSTEM' },
    action: 'DISPUTE_ESCALATION_TRIGGER',
    target: 'DISP-2026-4491',
    details: 'Automated 4-hour SLA notice dispatched to merchant Biryani Mahal.',
    ipAddress: '10.0.4.12 (Internal Cron)',
  },
  {
    id: 'log-003',
    timestamp: '19 Nov 2026, 04:10 PM',
    actor: { name: 'Pooja Jha', role: 'ADMIN' },
    action: 'ASSIGNED_COMMERCIAL_PLAN',
    target: 'Grand Regency Boutique (Patna)',
    details: 'Configured Enterprise Monthly Plan at INR 7,999/mo + 18% GST.',
    ipAddress: '103.212.144.18 (Patna Office VPN)',
  },
  {
    id: 'log-004',
    timestamp: '19 Nov 2026, 02:45 PM',
    actor: { name: 'Rohan Verma', role: 'ADMIN' },
    action: 'ADVANCED_STAGE',
    target: 'Magadh Orthopedic Clinic',
    details: 'Advanced from 03_VERIFY to 04_ACTIVATE after credential sign-off.',
    ipAddress: '103.212.144.18 (Patna Office VPN)',
  },
  {
    id: 'log-005',
    timestamp: '19 Nov 2026, 11:00 AM',
    actor: { name: 'Automated Bank Gateway', role: 'SYSTEM' },
    action: 'DAILY_PAYOUT_BATCH_SETTLED',
    target: 'Batch #PAY-20261119-BR01',
    details: 'Disbursed INR 1,48,250 via HDFC NEFT across 14 merchant bank accounts.',
    ipAddress: '10.0.2.88 (Payment Gateway)',
  },
];

export const INITIAL_CITIES: CityLaunchItem[] = [
  {
    id: 'city-01',
    cityName: 'Fraser Road & Central Hub',
    state: 'Patna, Bihar',
    status: 'ACTIVE',
    activeProvidersCount: 6,
    monthlyBookings: 340,
  },
  {
    id: 'city-02',
    cityName: 'Boring Road & Patliputra',
    state: 'Patna, Bihar',
    status: 'ACTIVE',
    activeProvidersCount: 4,
    monthlyBookings: 210,
  },
  {
    id: 'city-03',
    cityName: 'Kankarbagh & Rajendra Nagar',
    state: 'Patna, Bihar',
    status: 'ACTIVE',
    activeProvidersCount: 3,
    monthlyBookings: 180,
  },
  {
    id: 'city-04',
    cityName: 'Bailey Road & Danapur',
    state: 'Patna, Bihar',
    status: 'ACTIVE',
    activeProvidersCount: 2,
    monthlyBookings: 130,
  },
  {
    id: 'city-05',
    cityName: 'Lalganj Corridor (Vaishali)',
    state: 'Bihar',
    status: 'ACTIVE',
    activeProvidersCount: 1,
    monthlyBookings: 60,
  },
  {
    id: 'city-06',
    cityName: 'Muzaffarpur Cluster',
    state: 'Bihar',
    status: 'PLANNING',
    activeProvidersCount: 0,
    monthlyBookings: 0,
    targetLaunchDate: 'Q1 2027',
  },
];

export const INITIAL_CATEGORIES_CONTROL: CategoryControlItem[] = [
  {
    id: 'healthcare',
    name: 'Healthcare & Dental Clinics',
    isEnabled: true,
    standardCommissionPercentage: 8.0,
    defaultSearchRadiusKm: 10,
    instantBookingPermitted: true,
    totalActiveProviders: 38,
  },
  {
    id: 'hotels',
    name: 'Hotels & Heritage Boutique Suites',
    isEnabled: true,
    standardCommissionPercentage: 12.0,
    defaultSearchRadiusKm: 25,
    instantBookingPermitted: false, // Requires merchant confirmation
    totalActiveProviders: 24,
  },
  {
    id: 'restaurants',
    name: 'Restaurants & Courtyard Dining',
    isEnabled: true,
    standardCommissionPercentage: 5.0,
    defaultSearchRadiusKm: 10,
    instantBookingPermitted: true,
    totalActiveProviders: 32,
  },
  {
    id: 'salon',
    name: 'Salons & Ayurvedic Spas',
    isEnabled: true,
    standardCommissionPercentage: 10.0,
    defaultSearchRadiusKm: 8,
    instantBookingPermitted: true,
    totalActiveProviders: 26,
  },
  {
    id: 'vehicle_care',
    name: 'Auto Detailing & Bosch Workshops',
    isEnabled: true,
    standardCommissionPercentage: 8.0,
    defaultSearchRadiusKm: 15,
    instantBookingPermitted: true,
    totalActiveProviders: 22,
  },
];
