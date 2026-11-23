import { describe, it, expect } from 'vitest';
import { partnerOnboardingService } from '@/services/partnerOnboardingService';
import { PATNA_LOCALITIES, BookingCategory } from '@/types/bookkaro';

describe('Partner Onboarding & KYC Compliance Engine', () => {
  it('generates unique Patna Application Reference IDs adhering to format APP-PAT-2026-XXXX', () => {
    const app = partnerOnboardingService.submitApplication({
      businessLegalName: 'Test Healthcare Care Diagnostics Pvt. Ltd.',
      brandDisplayName: 'Dr. Test Patna Clinic',
      category: 'healthcare',
      ownerName: 'Dr. Test Kumar',
      phone: '+91 98350 99999',
      email: 'test@clinic.in',
      locality: 'Kankarbagh',
      pincode: '800020',
      streetAddress: 'Doctors Colony, Patna',
      landmark: 'Near Tiwary Bechar',
      operatingHours: {
        openTime: '09:00 AM',
        closeTime: '08:00 PM',
        daysOpen: 'Mon - Sat',
      },
      commercialModel: 'COMMISSION',
      commercialDetails: {
        commissionPercentage: 8.0,
      },
      documents: [
        {
          id: 'doc-test-1',
          type: 'BUSINESS_PAN',
          title: 'Business PAN',
          fileName: 'pan.pdf',
          fileSize: '1.0 MB',
          uploadedAt: new Date().toISOString(),
          status: 'PENDING',
        },
      ],
    });

    expect(app.applicationReference).toMatch(/^APP-PAT-2026-\d{4}$/);
    expect(app.stage).toBe('01_LEAD');
    expect(app.status).toBe('PENDING_KYC');
    expect(app.timeline.length).toBeGreaterThanOrEqual(1);
    expect(app.timeline[0].stage).toBe('01_LEAD');
  });

  it('validates category-specific mandatory KYC document requirements', () => {
    const categories: BookingCategory[] = [
      'healthcare',
      'hotels',
      'restaurants',
      'salon',
      'vehicle_care',
    ];

    categories.forEach((cat) => {
      const requiredDocs = partnerOnboardingService.getCategoryRequiredDocuments(cat);

      // Must have 3 common mandatory documents
      const pan = requiredDocs.find((d) => d.type === 'BUSINESS_PAN');
      const aadhaar = requiredDocs.find((d) => d.type === 'OWNER_AADHAAR');
      const tradeLic = requiredDocs.find((d) => d.type === 'TRADE_LICENSE');

      expect(pan).toBeDefined();
      expect(aadhaar).toBeDefined();
      expect(tradeLic).toBeDefined();

      // Must have category-conditional document
      if (cat === 'healthcare') {
        expect(requiredDocs.some((d) => d.type === 'CLINICAL_ESTABLISHMENT_REG')).toBe(true);
      } else if (cat === 'restaurants') {
        expect(requiredDocs.some((d) => d.type === 'FSSAI_LICENSE')).toBe(true);
      } else if (cat === 'hotels') {
        expect(requiredDocs.some((d) => d.type === 'HOTEL_FIRE_NOC')).toBe(true);
      } else if (cat === 'salon') {
        expect(requiredDocs.some((d) => d.type === 'COSMETOLOGY_CERT')).toBe(true);
      } else if (cat === 'vehicle_care') {
        expect(requiredDocs.some((d) => d.type === 'RTO_WORKSHOP_REG')).toBe(true);
      }
    });
  });

  it('synchronizes Patna localities and valid PIN codes across registrations', () => {
    const kankarbagh = PATNA_LOCALITIES.find((l) => l.name === 'Kankarbagh');
    const boringRoad = PATNA_LOCALITIES.find((l) => l.name === 'Boring Road');
    const fraserRoad = PATNA_LOCALITIES.find((l) => l.name === 'Fraser Road');

    expect(kankarbagh?.pincode).toBe('800020');
    expect(boringRoad?.pincode).toBe('800013');
    expect(fraserRoad?.pincode).toBe('800001');
  });

  it('advances 6-stage onboarding lifecycle with auditable timeline events', () => {
    const app = partnerOnboardingService.submitApplication({
      businessLegalName: 'M/s Patna Bistro & Awadhi Handi',
      brandDisplayName: 'Patna Heritage Bistro',
      category: 'restaurants',
      ownerName: 'Vikas Roy',
      phone: '+91 98450 11111',
      email: 'vikas@patnabistro.in',
      locality: 'Fraser Road',
      pincode: '800001',
      streetAddress: 'Dakbunglow Crossing, Fraser Road',
      operatingHours: {
        openTime: '11:00 AM',
        closeTime: '11:00 PM',
        daysOpen: 'All 7 Days',
      },
      commercialModel: 'COMMISSION',
      commercialDetails: {
        commissionPercentage: 8.0,
      },
      documents: [],
    });

    const ref = app.applicationReference;

    // Advance to 02_DISCUSS
    const stage2 = partnerOnboardingService.updateApplicationStage(
      ref,
      '02_DISCUSS',
      'Phone interview completed with restaurant general manager.'
    );
    expect(stage2.stage).toBe('02_DISCUSS');

    // Advance to 03_VERIFY
    const stage3 = partnerOnboardingService.updateApplicationStage(
      ref,
      '03_VERIFY',
      'FSSAI food hygiene and kitchen premise inspected.'
    );
    expect(stage3.stage).toBe('03_VERIFY');
    expect(stage3.status).toBe('UNDER_REVIEW');

    // Advance to 06_GO_LIVE
    const stage6 = partnerOnboardingService.updateApplicationStage(
      ref,
      '06_GO_LIVE',
      'Table inventory and Champaran Handi menu live in discovery.'
    );
    expect(stage6.stage).toBe('06_GO_LIVE');
    expect(stage6.status).toBe('ACTIVATED');
    expect(stage6.timeline.length).toBe(4); // 01_LEAD + 02_DISCUSS + 03_VERIFY + 06_GO_LIVE
  });

  it('retrieves applications case-insensitively and reactively notifies subscribers', () => {
    let notified = false;
    const unsubscribe = partnerOnboardingService.subscribe(() => {
      notified = true;
    });

    const app = partnerOnboardingService.submitApplication({
      businessLegalName: 'Boring Road Family Salon',
      brandDisplayName: 'Boring Road Cuts & Spa',
      category: 'salon',
      ownerName: 'Rashmi Kumari',
      phone: '+91 98350 22222',
      email: 'rashmi@salon.in',
      locality: 'Boring Road',
      pincode: '800013',
      streetAddress: 'Canal Road',
      operatingHours: {
        openTime: '10:00 AM',
        closeTime: '08:00 PM',
        daysOpen: 'Mon - Sat',
      },
      commercialModel: 'SUBSCRIPTION',
      commercialDetails: {
        monthlyFeeInr: 2499,
      },
      documents: [],
    });

    expect(notified).toBe(true);

    const lowercaseFound = partnerOnboardingService.getApplicationByReference(
      app.applicationReference.toLowerCase()
    );
    expect(lowercaseFound).toBeDefined();
    expect(lowercaseFound?.brandDisplayName).toBe('Boring Road Cuts & Spa');

    unsubscribe();
  });
});
