import { BookingCategory } from '@/types/bookkaro';
import { apiClient } from '@/lib/apiClient';

export type PartnerOnboardingStage =
  | '01_LEAD'
  | '02_DISCUSS'
  | '03_VERIFY'
  | '04_ACTIVATE'
  | '05_CONFIGURE'
  | '06_GO_LIVE';

export type PartnerKYCDocumentType =
  | 'BUSINESS_PAN'
  | 'GSTIN_CERTIFICATE'
  | 'UDYAM_REGISTRATION'
  | 'OWNER_AADHAAR'
  | 'TRADE_LICENSE'
  | 'CLINICAL_ESTABLISHMENT_REG'
  | 'FSSAI_LICENSE'
  | 'HOTEL_FIRE_NOC'
  | 'RTO_WORKSHOP_REG'
  | 'COSMETOLOGY_CERT'
  | 'VENUE_PHOTOS'
  | 'BANK_PASSBOOK_OR_CHEQUE';

export interface PartnerUploadedDocument {
  id: string;
  type: PartnerKYCDocumentType;
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'CHANGES_REQUESTED' | 'REJECTED';
  note?: string;
}

export interface PartnerApplicationTimelineEvent {
  stage: PartnerOnboardingStage;
  timestamp: string;
  title: string;
  description: string;
  actor: string;
}

export interface PartnerApplication {
  id: string;
  applicationReference: string; // e.g. "APP-PAT-2026-8492"
  businessLegalName: string;
  brandDisplayName: string;
  category: BookingCategory;
  ownerName: string;
  phone: string;
  email: string;
  locality: string;
  pincode: string;
  streetAddress: string;
  landmark?: string;
  operatingHours: {
    openTime: string;
    closeTime: string;
    daysOpen: string;
  };
  commercialModel: 'SUBSCRIPTION' | 'COMMISSION';
  commercialDetails: {
    commissionPercentage?: number;
    monthlyFeeInr?: number;
    tierName?: string;
  };
  documents: PartnerUploadedDocument[];
  stage: PartnerOnboardingStage;
  status: 'PENDING_KYC' | 'UNDER_REVIEW' | 'VERIFIED' | 'CHANGES_REQUESTED' | 'ACTIVATED';
  assignedInspector?: string;
  reviewerNotes?: string;
  expectedSlaHours: number;
  timeline: PartnerApplicationTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type CreatePartnerApplicationDto = Omit<
  PartnerApplication,
  'id' | 'applicationReference' | 'stage' | 'status' | 'timeline' | 'createdAt' | 'updatedAt' | 'expectedSlaHours'
>;

const STORAGE_KEY_APPLICATIONS = 'bookkaro_patna_partner_applications_v1';

export const INITIAL_PATNA_APPLICATIONS: PartnerApplication[] = [
  {
    id: 'app-pat-seed-01',
    applicationReference: 'APP-PAT-2026-8492',
    businessLegalName: 'M/s Magadh Heart & Multispeciality Clinic Pvt. Ltd.',
    brandDisplayName: 'Magadh Heart & Diabetes Care Clinic',
    category: 'healthcare',
    ownerName: 'Dr. Alok Nath Verma',
    phone: '+91 98350 44321',
    email: 'dr.alok@magadhheart.in',
    locality: 'Kankarbagh',
    pincode: '800020',
    streetAddress: 'Plot 42, Doctors Colony Main Road',
    landmark: 'Opposite Tiwary Bechar Complex',
    operatingHours: {
      openTime: '09:00 AM',
      closeTime: '08:00 PM',
      daysOpen: 'Mon - Sat',
    },
    commercialModel: 'COMMISSION',
    commercialDetails: {
      commissionPercentage: 8.0,
      tierName: 'Standard Pay-Per-Completed-Visit',
    },
    documents: [
      {
        id: 'doc-1',
        type: 'BUSINESS_PAN',
        title: 'Business PAN Card',
        fileName: 'magadh_heart_pan.pdf',
        fileSize: '1.2 MB',
        uploadedAt: '2026-11-18T10:00:00+05:30',
        status: 'VERIFIED',
      },
      {
        id: 'doc-2',
        type: 'OWNER_AADHAAR',
        title: 'Owner Doctor Aadhaar / Photo ID',
        fileName: 'dr_alok_aadhaar.pdf',
        fileSize: '950 KB',
        uploadedAt: '2026-11-18T10:05:00+05:30',
        status: 'VERIFIED',
      },
      {
        id: 'doc-3',
        type: 'TRADE_LICENSE',
        title: 'Patna Municipal Corporation Trade Licence',
        fileName: 'pmc_trade_lic_2026.pdf',
        fileSize: '1.8 MB',
        uploadedAt: '2026-11-18T10:10:00+05:30',
        status: 'VERIFIED',
      },
      {
        id: 'doc-4',
        type: 'CLINICAL_ESTABLISHMENT_REG',
        title: 'Bihar Clinical Establishment Registration (CEA)',
        fileName: 'bihar_cea_reg_2025.pdf',
        fileSize: '2.4 MB',
        uploadedAt: '2026-11-18T10:15:00+05:30',
        status: 'PENDING',
        note: 'Under field inspection verification by Patna Urban Health Inspector.',
      },
    ],
    stage: '03_VERIFY',
    status: 'UNDER_REVIEW',
    assignedInspector: 'Siddharth Roy (Senior Patna Operations Lead)',
    reviewerNotes: 'Physical premises inspected at Kankarbagh Doctors Colony. Doctor OPD counter and ECG diagnostics room found compliant. Awaiting final seal verification.',
    expectedSlaHours: 24,
    timeline: [
      {
        stage: '01_LEAD',
        timestamp: '2026-11-18T10:20:00+05:30',
        title: 'Registration Form Submitted',
        description: 'Practice application received via BOOKKARO Patna onboarding portal.',
        actor: 'Applicant',
      },
      {
        stage: '02_DISCUSS',
        timestamp: '2026-11-18T14:30:00+05:30',
        title: 'Telephonic Screening Completed',
        description: 'Consultation fee, 30-min slot buffer, and 8% commission model agreed.',
        actor: 'BOOKKARO Onboarding Desk (Fraser Rd)',
      },
      {
        stage: '03_VERIFY',
        timestamp: '2026-11-19T11:00:00+05:30',
        title: 'KYC & Premises Inspection in Progress',
        description: 'PMC Trade licence verified. Clinical Establishment registration document undergoing cross-check.',
        actor: 'Field Inspector Siddharth Roy',
      },
    ],
    createdAt: '2026-11-18T10:20:00+05:30',
    updatedAt: '2026-11-19T11:00:00+05:30',
  },
  {
    id: 'app-pat-seed-02',
    applicationReference: 'APP-PAT-2026-3190',
    businessLegalName: 'Boring Road Auto Spa & Detailing Studio',
    brandDisplayName: 'Torque Clean Ceramic Lounge',
    category: 'vehicle_care',
    ownerName: 'Manish Pandey',
    phone: '+91 98450 77123',
    email: 'contact@torqueclean.in',
    locality: 'Boring Road',
    pincode: '800013',
    streetAddress: 'Shop 12, Canal Crossing Road, Near Loyola Gate',
    landmark: 'Beside Punjab National Bank',
    operatingHours: {
      openTime: '08:30 AM',
      closeTime: '08:30 PM',
      daysOpen: 'All 7 Days',
    },
    commercialModel: 'SUBSCRIPTION',
    commercialDetails: {
      monthlyFeeInr: 2499,
      tierName: 'Fixed Growth Plan (0% Commission)',
    },
    documents: [
      {
        id: 'doc-10',
        type: 'BUSINESS_PAN',
        title: 'Business PAN Card',
        fileName: 'torque_clean_pan.pdf',
        fileSize: '1.1 MB',
        uploadedAt: '2026-11-17T11:00:00+05:30',
        status: 'VERIFIED',
      },
      {
        id: 'doc-11',
        type: 'OWNER_AADHAAR',
        title: 'Owner Aadhaar / Photo ID',
        fileName: 'manish_pandey_id.pdf',
        fileSize: '820 KB',
        uploadedAt: '2026-11-17T11:05:00+05:30',
        status: 'VERIFIED',
      },
      {
        id: 'doc-12',
        type: 'TRADE_LICENSE',
        title: 'Patna Municipal Corporation Trade Licence',
        fileName: 'torque_clean_trade_lic.pdf',
        fileSize: '1.5 MB',
        uploadedAt: '2026-11-17T11:10:00+05:30',
        status: 'VERIFIED',
      },
      {
        id: 'doc-13',
        type: 'RTO_WORKSHOP_REG',
        title: 'Automotive Workshop Trade Registration',
        fileName: 'auto_workshop_reg.pdf',
        fileSize: '1.3 MB',
        uploadedAt: '2026-11-17T11:15:00+05:30',
        status: 'VERIFIED',
      },
    ],
    stage: '06_GO_LIVE',
    status: 'ACTIVATED',
    assignedInspector: 'Pooja Kashyap (Patna Onboarding Lead)',
    reviewerNotes: 'All 3 jet wash bays and 10H ceramic coating booth verified. Merchant credentials issued and catalog configured. Active on Patna discovery.',
    expectedSlaHours: 0,
    timeline: [
      {
        stage: '01_LEAD',
        timestamp: '2026-11-17T11:20:00+05:30',
        title: 'Registration Form Submitted',
        description: 'Auto spa registered from Boring Road cluster.',
        actor: 'Applicant',
      },
      {
        stage: '02_DISCUSS',
        timestamp: '2026-11-17T15:00:00+05:30',
        title: 'Plan Finalized',
        description: 'Chose ₹2,499/mo subscription with 0% commission.',
        actor: 'Onboarding Team',
      },
      {
        stage: '03_VERIFY',
        timestamp: '2026-11-18T10:30:00+05:30',
        title: 'KYC & Trade Licence Verified',
        description: 'All 4 documents verified by PMC inspector.',
        actor: 'Pooja Kashyap',
      },
      {
        stage: '04_ACTIVATE',
        timestamp: '2026-11-18T16:00:00+05:30',
        title: 'Partner ID & Credentials Dispatched',
        description: 'Provider ID PROV-PAT-AUTO-09 generated.',
        actor: 'System Automation',
      },
      {
        stage: '05_CONFIGURE',
        timestamp: '2026-11-19T09:30:00+05:30',
        title: 'Catalog & 3-Bay Roster Configured',
        description: 'Foam wash, ceramic coating and interior detailing live.',
        actor: 'Partner Staff',
      },
      {
        stage: '06_GO_LIVE',
        timestamp: '2026-11-19T14:00:00+05:30',
        title: 'Partner Go-Live in Patna',
        description: 'Published on BOOKKARO Patna home & search.',
        actor: 'BOOKKARO Patna Admin',
      },
    ],
    createdAt: '2026-11-17T11:20:00+05:30',
    updatedAt: '2026-11-19T14:00:00+05:30',
  },
];

let applicationsState: PartnerApplication[] = [...INITIAL_PATNA_APPLICATIONS];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

function loadFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        applicationsState = parsed;
      }
    }
  } catch {
    // fallback to in-memory state
  }
}

function saveToStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(applicationsState));
  } catch {
    // ignore
  }
}

// Initial hydration on client
loadFromStorage();

export const partnerOnboardingService = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getAllApplications(): PartnerApplication[] {
    loadFromStorage();
    return [...applicationsState];
  },

  getApplicationByReference(ref: string): PartnerApplication | undefined {
    loadFromStorage();
    const cleanRef = ref.trim().toUpperCase();
    return applicationsState.find(
      (app) => app.applicationReference.toUpperCase() === cleanRef || app.id === cleanRef
    );
  },

  /**
   * Submit a new partner application with unique APP-PAT-2026-XXXX ID
   */
  submitApplication(payload: CreatePartnerApplicationDto): PartnerApplication {
    loadFromStorage();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const applicationReference = `APP-PAT-2026-${randomSuffix}`;
    const id = `app-pat-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newApplication: PartnerApplication = {
      ...payload,
      id,
      applicationReference,
      stage: '01_LEAD',
      status: 'PENDING_KYC',
      expectedSlaHours: 48,
      assignedInspector: 'Patna Urban Cluster Desk (Fraser Rd)',
      reviewerNotes: 'Application registered on web portal. Scheduled for telephonic onboarding screening.',
      timeline: [
        {
          stage: '01_LEAD',
          timestamp: now,
          title: 'Application Transmitted',
          description: `Partner registration submitted for ${payload.locality}, Patna. Allocated tracking reference #${applicationReference}.`,
          actor: 'Applicant',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    applicationsState = [newApplication, ...applicationsState];
    saveToStorage();
    notifyListeners();

    // Asynchronously synchronize with live backend if in browser and not in pure mock test mode
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_API !== 'true') {
      apiClient
        .post('/partner/applications', {
          brandName: payload.brandDisplayName,
          legalName: payload.businessLegalName,
          category: payload.category,
          locality: payload.locality,
          pincode: payload.pincode,
          address: payload.streetAddress,
          contactName: payload.ownerName,
          contactEmail: payload.email,
          contactPhone: payload.phone.replace(/\D/g, '').slice(-10),
          commercialPlan:
            payload.commercialModel === 'COMMISSION'
              ? 'COMMISSION_STANDARD'
              : payload.commercialDetails?.tierName || 'BASIC',
        })
        .catch(() => {
          // Graceful fallback to local application state
        });
    }

    return newApplication;
  },

  /**
   * Update application stage (Used by Admin CRM & Verification Pipeline)
   */
  updateApplicationStage(
    referenceOrId: string,
    newStage: PartnerOnboardingStage,
    note?: string
  ): PartnerApplication {
    loadFromStorage();
    const cleanRef = referenceOrId.trim().toUpperCase();
    const index = applicationsState.findIndex(
      (app) =>
        app.applicationReference.toUpperCase() === cleanRef ||
        app.id.toUpperCase() === cleanRef ||
        app.id === referenceOrId
    );

    if (index === -1) {
      throw new Error(`Application ${referenceOrId} not found`);
    }

    const current = applicationsState[index];
    const now = new Date().toISOString();

    const stageTitles: Record<PartnerOnboardingStage, string> = {
      '01_LEAD': 'Application Received',
      '02_DISCUSS': 'Commercial Plan Agreed',
      '03_VERIFY': 'KYC & Physical Premises Verification',
      '04_ACTIVATE': 'Merchant Account Activated',
      '05_CONFIGURE': 'Catalog & Slots Configured',
      '06_GO_LIVE': 'Live in Patna Discovery',
    };

    const updatedTimeline: PartnerApplicationTimelineEvent[] = [
      ...current.timeline,
      {
        stage: newStage,
        timestamp: now,
        title: stageTitles[newStage],
        description: note || `Application advanced to stage ${newStage}`,
        actor: 'BOOKKARO Patna Verification Desk',
      },
    ];

    let newStatus = current.status;
    if (newStage === '03_VERIFY') newStatus = 'UNDER_REVIEW';
    if (newStage === '04_ACTIVATE') newStatus = 'VERIFIED';
    if (newStage === '06_GO_LIVE') newStatus = 'ACTIVATED';

    const updated: PartnerApplication = {
      ...current,
      stage: newStage,
      status: newStatus,
      reviewerNotes: note || current.reviewerNotes,
      timeline: updatedTimeline,
      updatedAt: now,
    };

    applicationsState[index] = updated;
    saveToStorage();
    notifyListeners();
    return updated;
  },

  /**
   * Advance stage alias for Admin Service integration
   */
  advanceStage(
    referenceOrId: string,
    newStage: PartnerOnboardingStage,
    actor?: string,
    note?: string
  ): PartnerApplication {
    loadFromStorage();
    const cleanRef = referenceOrId.trim().toUpperCase();
    const index = applicationsState.findIndex(
      (app) =>
        app.applicationReference.toUpperCase() === cleanRef ||
        app.id.toUpperCase() === cleanRef ||
        app.id === referenceOrId
    );

    if (index === -1) {
      throw new Error(`Application ${referenceOrId} not found`);
    }

    const current = applicationsState[index];
    const now = new Date().toISOString();

    const stageTitles: Record<PartnerOnboardingStage, string> = {
      '01_LEAD': 'Application Received',
      '02_DISCUSS': 'Commercial Plan Agreed',
      '03_VERIFY': 'KYC & Physical Premises Verification',
      '04_ACTIVATE': 'Merchant Account Activated',
      '05_CONFIGURE': 'Catalog & Slots Configured',
      '06_GO_LIVE': 'Live in Patna Discovery',
    };

    const updatedTimeline: PartnerApplicationTimelineEvent[] = [
      ...current.timeline,
      {
        stage: newStage,
        timestamp: now,
        title: stageTitles[newStage] || newStage,
        description: note || `Application advanced to stage ${newStage}`,
        actor: actor || 'BOOKKARO Patna Verification Desk',
      },
    ];

    let newStatus = current.status;
    if (newStage === '03_VERIFY') newStatus = 'UNDER_REVIEW';
    if (newStage === '04_ACTIVATE') newStatus = 'VERIFIED';
    if (newStage === '06_GO_LIVE') newStatus = 'ACTIVATED';

    const updated: PartnerApplication = {
      ...current,
      stage: newStage,
      status: newStatus,
      reviewerNotes: note || current.reviewerNotes,
      timeline: updatedTimeline,
      updatedAt: now,
    };

    applicationsState[index] = updated;
    saveToStorage();
    notifyListeners();
    return updated;
  },

  /**
   * Update individual KYC document verification status
   */
  updateDocumentStatus(
    applicationId: string,
    docId: string,
    status: 'PENDING' | 'VERIFIED' | 'CHANGES_REQUESTED' | 'REJECTED',
    note?: string
  ): PartnerApplication {
    loadFromStorage();
    const index = applicationsState.findIndex(
      (app) => app.id === applicationId || app.applicationReference === applicationId
    );

    if (index === -1) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const current = applicationsState[index];
    const updatedDocs = current.documents.map((doc) =>
      doc.id === docId ? { ...doc, status, note } : doc
    );

    let newStatus = current.status;
    if (status === 'CHANGES_REQUESTED') newStatus = 'CHANGES_REQUESTED';

    const updated: PartnerApplication = {
      ...current,
      documents: updatedDocs,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    applicationsState[index] = updated;
    saveToStorage();
    notifyListeners();
    return updated;
  },

  /**
   * Update reviewer notes on an application
   */
  updateReviewerNotes(applicationId: string, notes: string): PartnerApplication {
    loadFromStorage();
    const index = applicationsState.findIndex(
      (app) => app.id === applicationId || app.applicationReference === applicationId
    );

    if (index === -1) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const current = applicationsState[index];
    const updated: PartnerApplication = {
      ...current,
      reviewerNotes: notes,
      updatedAt: new Date().toISOString(),
    };

    applicationsState[index] = updated;
    saveToStorage();
    notifyListeners();
    return updated;
  },

  /**
   * Helper to get category required document list
   */
  getCategoryRequiredDocuments(category: BookingCategory): {
    type: PartnerKYCDocumentType;
    title: string;
    description: string;
    isMandatory: boolean;
  }[] {
    const commonDocs: {
      type: PartnerKYCDocumentType;
      title: string;
      description: string;
      isMandatory: boolean;
    }[] = [
      {
        type: 'BUSINESS_PAN',
        title: 'Business PAN or GSTIN Certificate',
        description: 'Mandatory PAN card in entity name or GSTIN 10-digit Bihar registration certificate.',
        isMandatory: true,
      },
      {
        type: 'OWNER_AADHAAR',
        title: 'Owner / Authorized Signatory Aadhaar or Photo ID',
        description: 'Government photo identity card of the primary doctor, owner, or managing partner.',
        isMandatory: true,
      },
      {
        type: 'TRADE_LICENSE',
        title: 'Patna Municipal Corporation (PMC) Trade Licence',
        description: 'Valid Trade / Shop & Establishment Licence issued by Patna Municipal Corporation.',
        isMandatory: true,
      },
      {
        type: 'VENUE_PHOTOS',
        title: 'Business / Establishment Photographs (Up to 3 Photos)',
        description: 'Clear exterior facade, reception front desk, and interior dining/room/styling station photos.',
        isMandatory: true,
      },
      {
        type: 'BANK_PASSBOOK_OR_CHEQUE',
        title: 'Bank Passbook / Cancelled Cheque',
        description: 'Beneficiary bank document showing A/c Name, Account Number & IFSC for T+1 settlements.',
        isMandatory: true,
      },
    ];

    const categorySpecificDocs: Record<
      BookingCategory,
      {
        type: PartnerKYCDocumentType;
        title: string;
        description: string;
        isMandatory: boolean;
      }
    > = {
      healthcare: {
        type: 'CLINICAL_ESTABLISHMENT_REG',
        title: 'Bihar Clinical Establishment Act (CEA) Registration',
        description: 'Valid CEA registration certificate or State Medical Council certificate of chief doctor.',
        isMandatory: true,
      },
      restaurants: {
        type: 'FSSAI_LICENSE',
        title: 'FSSAI Food Safety Licence (Patna)',
        description: '14-digit FSSAI licence or registration certificate for commercial food handling.',
        isMandatory: true,
      },
      hotels: {
        type: 'HOTEL_FIRE_NOC',
        title: 'Hotel Trade Licence & Fire Safety NOC',
        description: 'Bihar Fire Services clearance certificate and municipal lodging authorization.',
        isMandatory: true,
      },
      salon: {
        type: 'COSMETOLOGY_CERT',
        title: 'Cosmetology & Salon Sanitation Certificate',
        description: 'Professional beauty academy diploma or local health sanitation certificate.',
        isMandatory: true,
      },
      vehicle_care: {
        type: 'RTO_WORKSHOP_REG',
        title: 'Automotive Workshop / RTO Testing Authorization',
        description: 'Commercial workshop permit or pollution testing center authorization.',
        isMandatory: true,
      },
    };

    return [...commonDocs, categorySpecificDocs[category]];
  },

  /**
   * Client-aligned Category-wise Commission Rates for Patna launch:
   * - Hotels & Stays: 10%
   * - Dining & Cafes: 5%
   * - Salons & Spas: 10%
   */
  getCategoryCommissionRate(category: BookingCategory): number {
    switch (category) {
      case 'hotels':
        return 10.0;
      case 'restaurants':
        return 5.0;
      case 'salon':
        return 10.0;
      case 'healthcare':
        return 8.0;
      case 'vehicle_care':
        return 8.0;
      default:
        return 10.0;
    }
  },

  /**
   * Client-aligned 3-Tier Launch Subscription Plans:
   * - Free: ₹0/mo
   * - Basic: ₹499/mo
   * - Business Pro: ₹999/mo
   */
  LAUNCH_SUBSCRIPTION_PLANS: [
    {
      id: 'FREE',
      name: 'Free Launch Tier',
      priceInr: 0,
      billingCycle: 'Forever Free',
      description: 'Standard business profile, search discovery & basic booking access.',
      features: [
        'Verified business listing on BOOKKARO Patna',
        'Standard search placement & locality tags',
        'Basic booking requests & offline PIN verification',
        'Single front-desk receptionist login',
      ],
      isPopular: false,
    },
    {
      id: 'BASIC',
      name: 'Basic Growth Plan',
      priceInr: 499,
      billingCycle: 'Per Month (Auto-Debit)',
      description: 'Enhanced locality ranking & standard business performance analytics.',
      features: [
        'Higher search ranking across Fraser Rd & Boring Rd',
        'Standard booking volume & conversion analytics',
        'Up to 3 staff counter accounts',
        'SMS + WhatsApp instant customer arrival alerts',
      ],
      isPopular: true,
    },
    {
      id: 'BUSINESS_PRO',
      name: 'Business Pro Suite',
      priceInr: 999,
      billingCycle: 'Per Month (Auto-Debit)',
      description: 'Featured top listing, advanced financial ledgers & priority concierge desk.',
      features: [
        'Top-of-category Featured Partner badge',
        'Full commercial CSV statements & tax invoicing',
        'Unlimited staff accounts across multiple bays/wings',
        'Priority 24/7 dedicated account manager desk',
      ],
      isPopular: false,
    },
  ],
};

export const LAUNCH_SUBSCRIPTION_PLANS = partnerOnboardingService.LAUNCH_SUBSCRIPTION_PLANS;

