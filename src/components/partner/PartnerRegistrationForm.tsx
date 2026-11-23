'use client';

import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Hotel,
  UtensilsCrossed,
  Scissors,
  ArrowRight,
  ArrowLeft,
  Mail,
  User,
  Clock,
  FileText,
  UploadCloud,
  Trash2,
  Check,
  AlertCircle,
  CreditCard,
  Percent,
} from 'lucide-react';
import { BookingCategory, PATNA_LOCALITIES } from '@/types/bookkaro';
import {
  partnerOnboardingService,
  PartnerApplication,
  PartnerUploadedDocument,
  PartnerKYCDocumentType,
  LAUNCH_SUBSCRIPTION_PLANS,
} from '@/services/partnerOnboardingService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface PartnerRegistrationFormProps {
  onSuccess: (application: PartnerApplication) => void;
}

export const PartnerRegistrationForm: React.FC<PartnerRegistrationFormProps> = ({
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Business & Category
  const [category, setCategory] = useState<BookingCategory>('hotels');
  const [businessLegalName, setBusinessLegalName] = useState('');
  const [brandDisplayName, setBrandDisplayName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2: Branch & Location
  const [locality, setLocality] = useState<string>(PATNA_LOCALITIES[0].name);
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [openTime, setOpenTime] = useState('09:00 AM');
  const [closeTime, setCloseTime] = useState('08:00 PM');
  const [daysOpen, setDaysOpen] = useState('Mon - Sat');

  // Step 3: KYC Documents
  const [uploadedDocs, setUploadedDocs] = useState<PartnerUploadedDocument[]>([]);

  // Step 4: Commercial Plan & Declaration
  const [commercialModel, setCommercialModel] = useState<'SUBSCRIPTION' | 'COMMISSION'>('COMMISSION');
  const [selectedSubscriptionTier, setSelectedSubscriptionTier] = useState<'FREE' | 'BASIC' | 'BUSINESS_PRO'>('BASIC');
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected locality metadata
  const currentLocalityData = PATNA_LOCALITIES.find((l) => l.name === locality) || PATNA_LOCALITIES[0];

  const categoryCards: { id: BookingCategory; label: string; icon: React.ElementType; hint: string }[] = [
    { id: 'hotels', label: 'Hotels & Stays', icon: Hotel, hint: 'Boutique suites, rooms & banquets' },
    { id: 'restaurants', label: 'Dining & Cafes', icon: UtensilsCrossed, hint: 'Table slots & Champaran handi' },
    { id: 'salon', label: 'Salons & Spas', icon: Scissors, hint: 'Styling stations & therapies' },
  ];

  const requiredDocSpecs = partnerOnboardingService.getCategoryRequiredDocuments(category);

  // Handle Locality change to auto-update PIN
  const handleLocalityChange = (newLocalityName: string) => {
    setLocality(newLocalityName);
  };

  // Upload or Sample simulation
  const handleSimulateUpload = (spec: { type: PartnerKYCDocumentType; title: string }, sampleName?: string) => {
    const existingIndex = uploadedDocs.findIndex((d) => d.type === spec.type);
    const newDoc: PartnerUploadedDocument = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: spec.type,
      title: spec.title,
      fileName: sampleName || `${spec.type.toLowerCase()}_patna_cert.pdf`,
      fileSize: `${(0.8 + Math.random() * 1.4).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    if (existingIndex !== -1) {
      setUploadedDocs((prev) => prev.map((d, i) => (i === existingIndex ? newDoc : d)));
    } else {
      setUploadedDocs((prev) => [...prev, newDoc]);
    }
  };

  const handleRemoveDoc = (docType: PartnerKYCDocumentType) => {
    setUploadedDocs((prev) => prev.filter((d) => d.type !== docType));
  };

  // Step Validation
  const validateStep1 = () => {
    if (!businessLegalName.trim()) return 'Please enter your registered Business Legal Name';
    if (!brandDisplayName.trim()) return 'Please enter your Brand / Storefront Display Name';
    if (!ownerName.trim()) return 'Please enter Owner / Primary Signatory Name';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return 'Please enter a valid 10-digit mobile number';
    if (!email.includes('@') || !email.includes('.')) return 'Please enter a valid business email address';
    return null;
  };

  const validateStep2 = () => {
    if (!streetAddress.trim()) return 'Please enter your Patna street address';
    if (!landmark.trim()) return 'Please provide a nearby landmark';
    return null;
  };

  const validateStep3 = () => {
    const missingDocs = requiredDocSpecs.filter(
      (spec) => spec.isMandatory && !uploadedDocs.some((d) => d.type === spec.type)
    );
    if (missingDocs.length > 0) {
      return `Please upload all mandatory documents (${missingDocs.length} remaining: ${missingDocs[0].title})`;
    }
    return null;
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const err = validateStep3();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setStep(4);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!declarationAgreed) {
      setErrorMsg('Please confirm the statutory compliance declaration before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeCommissionRate = partnerOnboardingService.getCategoryCommissionRate(category);
      const selectedPlanObj =
        LAUNCH_SUBSCRIPTION_PLANS.find((p) => p.id === selectedSubscriptionTier) ||
        LAUNCH_SUBSCRIPTION_PLANS[1];

      const application = partnerOnboardingService.submitApplication({
        businessLegalName: businessLegalName.trim(),
        brandDisplayName: brandDisplayName.trim(),
        category,
        ownerName: ownerName.trim(),
        phone: `+91 ${phone.replace(/\D/g, '').slice(-10)}`,
        email: email.trim().toLowerCase(),
        locality: currentLocalityData.name,
        pincode: currentLocalityData.pincode,
        streetAddress: streetAddress.trim(),
        landmark: landmark.trim(),
        operatingHours: {
          openTime,
          closeTime,
          daysOpen,
        },
        commercialModel,
        commercialDetails: {
          commissionPercentage: commercialModel === 'COMMISSION' ? activeCommissionRate : undefined,
          monthlyFeeInr: commercialModel === 'SUBSCRIPTION' ? selectedPlanObj.priceInr : undefined,
          tierName:
            commercialModel === 'COMMISSION'
              ? `Pay-As-You-Earn (${activeCommissionRate}% per visit)`
              : `${selectedPlanObj.name} (₹${selectedPlanObj.priceInr}/mo)`,
        },
        documents: uploadedDocs,
      });

      setIsSubmitting(false);
      onSuccess(application);
    } catch {
      setIsSubmitting(false);
      setErrorMsg('An error occurred while submitting your application. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 4-Step Matte Stepper Bar (Responsive & zero overflow on 360px mobile) */}
      <div className="bg-white rounded-xl border border-[#E2DDD5] p-3 sm:p-4">
        {/* Mobile Compact Progress (<640px) */}
        <div className="block sm:hidden space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#141413]">
            <span className="text-[#143D2B] font-bold">Step {step} of 4</span>
            <span className="text-[#52524E]">
              {step === 1 && 'Business & Category'}
              {step === 2 && 'Branch & Location'}
              {step === 3 && 'KYC & Compliance'}
              {step === 4 && 'Commercials & Review'}
            </span>
          </div>
          <div className="w-full bg-[#F3F1EC] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#143D2B] h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop / Tablet Stepper (>=640px) */}
        <div className="hidden sm:grid grid-cols-4 gap-2">
          {[
            { num: 1, label: 'Business & Category', desc: 'Brand & contact info' },
            { num: 2, label: 'Branch & Location', desc: 'Patna address & hours' },
            { num: 3, label: 'KYC & Compliance', desc: 'Trade & tax docs' },
            { num: 4, label: 'Commercials & Review', desc: 'Plan selection' },
          ].map((item) => {
            const isDone = step > item.num;
            const isCurrent = step === item.num;
            return (
              <div
                key={item.num}
                className={`
                  p-2.5 rounded-lg border text-left transition-colors flex items-center gap-2.5
                  ${
                    isCurrent
                      ? 'border-[#143D2B] bg-[#EBF2EE]'
                      : isDone
                      ? 'border-[#C8DBD1] bg-[#FAF9F6]'
                      : 'border-transparent text-[#78716C]'
                  }
                `}
              >
                <div
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${
                      isDone
                        ? 'bg-[#143D2B] text-white'
                        : isCurrent
                        ? 'bg-[#143D2B] text-white'
                        : 'bg-[#F3F1EC] text-[#78716C] border border-[#E2DDD5]'
                    }
                  `}
                >
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : item.num}
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-xs font-semibold truncate leading-tight ${
                      isCurrent ? 'text-[#143D2B]' : isDone ? 'text-[#141413]' : 'text-[#78716C]'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-[10px] text-[#52524E] truncate mt-0.5">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F8D7DA] text-xs text-[#9E2A2B] flex items-start gap-2.5 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 1: BUSINESS & CATEGORY INFO */}
      {/* ========================================================= */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Vertical Selector */}
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#143D2B]">
                Step 01 / Vertical
              </span>
              <h2 className="font-heading text-lg font-bold text-[#141413] mt-0.5">
                Select Your Patna Business Category
              </h2>
              <p className="text-xs text-[#52524E]">
                Select the primary vertical under which you operate in Patna.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryCards.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setUploadedDocs([]); // reset uploaded docs for new category specs
                    }}
                    className={`
                      p-3.5 rounded-xl border text-left transition-colors flex items-start gap-3 cursor-pointer
                      ${
                        isSelected
                          ? 'border-[#143D2B] bg-[#EBF2EE] text-[#143D2B]'
                          : 'border-[#E2DDD5] bg-white text-[#141413] hover:border-[#143D2B]'
                      }
                    `}
                  >
                    <div
                      className={`
                        w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border
                        ${
                          isSelected
                            ? 'bg-[#143D2B] text-white border-[#143D2B]'
                            : 'bg-[#FAF9F6] text-[#52524E] border-[#E2DDD5]'
                        }
                      `}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-heading text-xs font-bold leading-tight">
                        {cat.label}
                      </div>
                      <div className="text-[11px] text-[#52524E] mt-0.5 line-clamp-1">
                        {cat.hint}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legal & Brand Particulars */}
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#143D2B]">
                Entity &amp; Identity
              </span>
              <h3 className="font-heading text-base font-bold text-[#141413] mt-0.5">
                Practice &amp; Owner Credentials
              </h3>
              <p className="text-xs text-[#52524E]">
                Used for KYC, invoice generation, and customer counter verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#141413]">
                  Business Legal Entity Name <span className="text-[#C25E28]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#52524E] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="E.g., Maurya Grand Hospitality Pvt. Ltd."
                    value={businessLegalName}
                    onChange={(e) => setBusinessLegalName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413]"
                  />
                </div>
                <span className="text-[10px] text-[#52524E]">As registered on PAN / GSTIN / Trade Licence</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#141413]">
                  Brand / Storefront Display Name <span className="text-[#C25E28]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#52524E] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="E.g., Dr. Arvind Verma – DM Cardiology Clinic"
                    value={brandDisplayName}
                    onChange={(e) => setBrandDisplayName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413]"
                  />
                </div>
                <span className="text-[10px] text-[#52524E]">Shown to local customers on discovery search</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#141413]">
                  Owner / Managing Signatory Name <span className="text-[#C25E28]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#52524E] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="E.g., Dr. Arvind Verma / Rohan Singhania"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#141413]">
                  Direct WhatsApp / Mobile Number <span className="text-[#C25E28]">*</span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#E2DDD5] bg-[#FAF9F6] text-xs font-mono text-[#52524E]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98450 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-r-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413]"
                  />
                </div>
                <span className="text-[10px] text-[#52524E]">For instant SMS/WhatsApp slot alerts</span>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#141413]">
                  Official Business Email Address <span className="text-[#C25E28]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#52524E] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="info@yourdomain.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413]"
                  />
                </div>
                <span className="text-[10px] text-[#52524E]">For monthly commercial ledger and statements</span>
              </div>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Branch &amp; Location
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: PATNA BRANCH & LOCATION */}
      {/* ========================================================= */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#143D2B]">
                Step 02 / Geography
              </span>
              <h2 className="font-heading text-lg font-bold text-[#141413] mt-0.5">
                Patna Branch &amp; Operating Schedule
              </h2>
              <p className="text-xs text-[#52524E]">
                Accurate address enables distance calculations and arrival times for customers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Locality Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#141413]">
                  Patna Locality / Zone <span className="text-[#C25E28]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#52524E] absolute left-3 top-3" />
                  <select
                    value={locality}
                    onChange={(e) => handleLocalityChange(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413] cursor-pointer"
                  >
                    {PATNA_LOCALITIES.map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name} (PIN: {loc.pincode}) – {loc.zone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Postal Code & City */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#141413]">
                  City &amp; PIN Code (Synchronized)
                </label>
                <input
                  type="text"
                  disabled
                  value={`Patna, Bihar – ${currentLocalityData.pincode} (${currentLocalityData.zone})`}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2DDD5] bg-[#FAF9F6] text-[#52524E] font-medium"
                />
              </div>

              {/* Full Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#141413]">
                  Street Address / Premise Number <span className="text-[#C25E28]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Grand Plaza, 2nd Floor, Opposite Tiwary Bechar Complex, Kankarbagh Main Road"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413]"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#141413]">
                  Prominent Local Landmark <span className="text-[#C25E28]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Near Doctors Colony Crossing & Patna Central Mall"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413]"
                />
              </div>

              {/* Hours / Schedule */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#141413]">
                  Daily Opening Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#52524E] absolute left-3 top-3" />
                  <select
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413] cursor-pointer"
                  >
                    {['07:00 AM', '08:00 AM', '08:30 AM', '09:00 AM', '10:00 AM', '11:00 AM'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#141413]">
                  Daily Closing Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#52524E] absolute left-3 top-3" />
                  <select
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413] cursor-pointer"
                  >
                    {['06:00 PM', '07:00 PM', '08:00 PM', '08:30 PM', '09:00 PM', '10:00 PM', '11:00 PM'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#141413]">
                  Operating Days
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Mon - Sat', 'All 7 Days', 'Mon - Fri'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDaysOpen(d)}
                      className={`
                        p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer
                        ${
                          daysOpen === d
                            ? 'border-[#143D2B] bg-[#EBF2EE] text-[#143D2B] font-semibold'
                            : 'border-[#E2DDD5] bg-white text-[#52524E] hover:border-[#141413]'
                        }
                      `}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back: Business Info
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: KYC &amp; Compliance
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: KYC & COMPLIANCE UPLOAD UI */}
      {/* ========================================================= */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#143D2B]">
                  Step 03 / Compliance
                </span>
                <span className="text-xs text-[#52524E]">
                  {uploadedDocs.length} of {requiredDocSpecs.length} Documents Attached
                </span>
              </div>
              <h2 className="font-heading text-lg font-bold text-[#141413] mt-0.5">
                KYC &amp; Category Compliance Documents
              </h2>
              <p className="text-xs text-[#52524E]">
                Patna field officers verify all documents within 24–48 hours before issuing merchant credentials.
              </p>
            </div>

            {/* Quick Demo Helper Notice */}
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#52524E]">
                <ShieldCheck className="w-4 h-4 text-[#143D2B] shrink-0" />
                <span>Quick Testing Mode: Click <strong>&quot;Simulate Upload&quot;</strong> on any document to attach a verified PDF.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  requiredDocSpecs.forEach((spec) => {
                    handleSimulateUpload(spec);
                  });
                }}
              >
                Attach All Sample Docs
              </Button>
            </div>

            {/* Documents List */}
            <div className="space-y-3 pt-2">
              {requiredDocSpecs.map((spec) => {
                const uploaded = uploadedDocs.find((d) => d.type === spec.type);
                return (
                  <div
                    key={spec.type}
                    className={`
                      p-4 rounded-xl border transition-colors
                      ${
                        uploaded
                          ? 'border-[#C8DBD1] bg-[#FAF9F6]'
                          : 'border-[#E2DDD5] bg-white hover:border-[#143D2B]/50'
                      }
                    `}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 ${uploaded ? 'text-[#143D2B]' : 'text-[#52524E]'}`} />
                          <h4 className="font-heading font-semibold text-xs text-[#141413]">
                            {spec.title}
                          </h4>
                          {spec.isMandatory && (
                            <Badge variant="terracotta" size="sm">
                              Mandatory
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-[#52524E] leading-relaxed">
                          {spec.description}
                        </p>
                      </div>

                      {/* Upload Controls or Attached Preview */}
                      <div className="shrink-0 flex items-center gap-2">
                        {uploaded ? (
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#C8DBD1]">
                            <div className="text-left">
                              <div className="text-xs font-semibold text-[#143D2B] flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span className="font-mono text-[11px]">{uploaded.fileName}</span>
                              </div>
                              <div className="text-[10px] text-[#52524E]">
                                Size: {uploaded.fileSize} • Ready for Audit
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(spec.type)}
                              className="p-1.5 text-[#9E2A2B] hover:bg-[#FDF2F2] rounded-md transition-colors cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleSimulateUpload(spec, file.name);
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                              >
                                Choose File
                              </Button>
                            </label>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSimulateUpload(spec)}
                              className="text-[11px] text-[#52524E]"
                            >
                              Simulate Upload
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Venue Photos 3-Slot Visual Preview */}
                    {spec.type === 'VENUE_PHOTOS' && uploaded && (
                      <div className="mt-3 pt-3 border-t border-[#C8DBD1]/60 grid grid-cols-3 gap-2">
                        {[
                          { slot: 'Exterior & Facade', sub: 'Photo 1 • Road Signage' },
                          { slot: 'Front Desk / Reception', sub: 'Photo 2 • Check-in Point' },
                          { slot: 'Guest / Service Bay', sub: 'Photo 3 • Dining / Suite / Salon' },
                        ].map((shot, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-white border border-[#C8DBD1] text-center space-y-1">
                            <div className="w-full h-11 rounded bg-[#FAF9F6] border border-dashed border-[#C8DBD1] flex items-center justify-center text-[10px] text-[#143D2B] font-mono font-medium">
                              ✓ Shot {idx + 1} Attached
                            </div>
                            <div className="text-[10px] font-semibold text-[#141413] truncate">{shot.slot}</div>
                            <div className="text-[9px] text-[#78716C] truncate">{shot.sub}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setStep(2)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back: Branch Location
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Commercials &amp; Review
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 4: COMMERCIAL PLAN SELECTION & FINAL REVIEW */}
      {/* ========================================================= */}
      {step === 4 && (
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          {/* Commercial Model Comparison */}
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#143D2B]">
                Step 04 / Commercials
              </span>
              <h2 className="font-heading text-lg font-bold text-[#141413] mt-0.5">
                Select Your Operating Commercial Model
              </h2>
              <p className="text-xs text-[#52524E]">
                Transparent rates tailored for Patna hospitality. Switch or upgrade models anytime from your partner front desk.
              </p>
            </div>

            {/* Model Type Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Fixed Monthly Subscription */}
              <div
                onClick={() => setCommercialModel('SUBSCRIPTION')}
                className={`
                  p-5 rounded-xl border text-left transition-colors flex flex-col justify-between cursor-pointer
                  ${
                    commercialModel === 'SUBSCRIPTION'
                      ? 'border-[#143D2B] bg-[#FAF9F6] ring-1 ring-[#143D2B]'
                      : 'border-[#E2DDD5] bg-white hover:border-[#143D2B]/50'
                  }
                `}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#143D2B] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      Model A: 3-Tier Monthly Subscription
                    </span>
                    {commercialModel === 'SUBSCRIPTION' && (
                      <span className="w-5 h-5 rounded-full bg-[#143D2B] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="font-heading text-xl font-black text-[#141413]">
                      ₹0 to ₹999 <span className="text-xs font-normal text-[#52524E]">/ month</span>
                    </div>
                    <div className="text-xs font-semibold text-[#143D2B] mt-0.5">
                      0% Commission on Completed Bookings (Keep 100% Bill Revenue)
                    </div>
                  </div>

                  <p className="text-xs text-[#52524E] leading-relaxed">
                    Flat predictability. Choose between Free Launch, Basic Growth (₹499/mo), or Business Pro (₹999/mo).
                  </p>
                </div>

                {commercialModel === 'SUBSCRIPTION' && (
                  <div className="mt-4 pt-3 border-t border-[#E2DDD5] space-y-2">
                    <span className="text-[11px] font-semibold text-[#141413] block">
                      Choose Your Subscription Tier:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {LAUNCH_SUBSCRIPTION_PLANS.map((plan) => {
                        const isChosen = selectedSubscriptionTier === plan.id;
                        return (
                          <div
                            key={plan.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubscriptionTier(plan.id as 'FREE' | 'BASIC' | 'BUSINESS_PRO');
                            }}
                            className={`p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                              isChosen
                                ? 'border-[#143D2B] bg-[#EBF2EE] text-[#143D2B]'
                                : 'border-[#E2DDD5] bg-white text-[#52524E] hover:border-[#143D2B]'
                            }`}
                          >
                            <div className="font-heading text-xs font-bold truncate">{plan.name}</div>
                            <div className="font-mono text-sm font-black mt-0.5 tabular-nums">
                              ₹{plan.priceInr}
                              <span className="text-[10px] font-normal text-[#52524E]">/mo</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Option B: Pay-As-You-Earn Category Commission */}
              <div
                onClick={() => setCommercialModel('COMMISSION')}
                className={`
                  p-5 rounded-xl border text-left transition-colors flex flex-col justify-between cursor-pointer
                  ${
                    commercialModel === 'COMMISSION'
                      ? 'border-[#143D2B] bg-[#FAF9F6] ring-1 ring-[#143D2B]'
                      : 'border-[#E2DDD5] bg-white hover:border-[#143D2B]/50'
                  }
                `}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C25E28] flex items-center gap-1.5">
                      <Percent className="w-4 h-4" />
                      Model B: Pay-As-You-Earn Commission
                    </span>
                    {commercialModel === 'COMMISSION' && (
                      <span className="w-5 h-5 rounded-full bg-[#143D2B] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="font-heading text-xl font-black text-[#141413] tabular-nums">
                      ₹0 Upfront{' '}
                      <span className="text-xs font-normal text-[#52524E]">
                        ({partnerOnboardingService.getCategoryCommissionRate(category)}% per visit)
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#C25E28] mt-0.5">
                      Pay only when customer shows up and counter PIN check-in is verified
                    </div>
                  </div>

                  <ul className="text-xs text-[#52524E] space-y-1.5 pt-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#143D2B] shrink-0" />
                      <span>
                        <strong>Hotels &amp; Stays:</strong> 10% • <strong>Dining:</strong> 5% • <strong>Salons:</strong> 10%
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#143D2B] shrink-0" />
                      <span>
                        Auditable ledger math: e.g. {category === 'restaurants' ? '₹1,500 table bill × 5% = ₹75' : '₹2,500 bill × 10% = ₹250'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#143D2B] shrink-0" />
                      <span>Disputed or cancelled bookings are automatically fee-exempt</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2DDD5] text-[11px] text-[#78716C]">
                  Zero operational risk. Ideal for testing new booking volume in Patna.
                </div>
              </div>
            </div>
          </div>

          {/* Final Application Summary Card */}
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-[#141413]">
              Application Summary Review
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E2DDD5]">
                <span className="text-[#52524E] uppercase font-semibold text-[10px] block">
                  Brand &amp; Legal Entity
                </span>
                <span className="font-bold text-[#141413] mt-0.5 block">{brandDisplayName}</span>
                <span className="text-[11px] text-[#52524E] block truncate">{businessLegalName}</span>
                <span className="capitalize text-[10px] text-[#143D2B] font-semibold mt-1 block">
                  Category: {category.replace('_', ' ')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E2DDD5]">
                <span className="text-[#52524E] uppercase font-semibold text-[10px] block">
                  Patna Branch Address
                </span>
                <span className="font-bold text-[#141413] mt-0.5 block">{locality}, {currentLocalityData.pincode}</span>
                <span className="text-[11px] text-[#52524E] block truncate">{streetAddress}</span>
                <span className="text-[10px] text-[#52524E] block mt-1">
                  Hours: {openTime} - {closeTime} ({daysOpen})
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E2DDD5]">
                <span className="text-[#52524E] uppercase font-semibold text-[10px] block">
                  Commercials &amp; KYC Docs
                </span>
                <span className="font-bold text-[#141413] mt-0.5 block">
                  {commercialModel === 'COMMISSION'
                    ? `Pay-As-You-Earn (${partnerOnboardingService.getCategoryCommissionRate(category)}%)`
                    : `${LAUNCH_SUBSCRIPTION_PLANS.find(p => p.id === selectedSubscriptionTier)?.name} (₹${LAUNCH_SUBSCRIPTION_PLANS.find(p => p.id === selectedSubscriptionTier)?.priceInr}/mo)`}
                </span>
                <span className="text-[11px] text-[#143D2B] font-semibold block mt-0.5">
                  ✓ {uploadedDocs.length} Compliance Docs Attached
                </span>
                <span className="text-[10px] text-[#52524E] block mt-1">
                  Signatory: {ownerName} (+91 {phone.slice(-10)})
                </span>
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={declarationAgreed}
                  onChange={(e) => setDeclarationAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-[#E2DDD5] text-[#143D2B] focus:ring-[#143D2B] cursor-pointer"
                />
                <span className="text-xs text-[#52524E] leading-relaxed select-none">
                  I hereby declare that all business particulars, premises addresses, and uploaded compliance documents are true and accurate. I authorize BOOKKARO (Patna Operations) to conduct KYC background checks and premises inspection as per Bihar Municipal and commercial laws.
                </span>
              </label>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setStep(3)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back: KYC Uploads
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting || !declarationAgreed}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Application for Patna Verification'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
