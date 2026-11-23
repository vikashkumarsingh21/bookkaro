'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Clock,
  Building2,
} from 'lucide-react';
import { PartnerRegistrationForm } from '@/components/partner/PartnerRegistrationForm';
import { PartnerApplicationTracker } from '@/components/partner/PartnerApplicationTracker';
import { PartnerApplication } from '@/services/partnerOnboardingService';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion/Reveal';

type ActiveViewTab = 'register' | 'track';

export default function PartnerRegisterPage() {
  const [activeTab, setActiveTab] = useState<ActiveViewTab>('register');
  const [submittedApplication, setSubmittedApplication] = useState<PartnerApplication | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegistrationSuccess = (app: PartnerApplication) => {
    setSubmittedApplication(app);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink pb-24">
      {/* Editorial Header */}
      <section className="bg-surface border-b border-border-subtle py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-border-subtle text-primary text-xs font-semibold">
            <span>Patna Partner Onboarding • BOOKKARO</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink">
            List Your Establishment in Patna
          </h1>

          <p className="text-xs sm:text-base text-ink-muted max-w-2xl mx-auto leading-relaxed">
            Eliminate walk-in crowd congestion, publish verified schedules, and accept guaranteed arrival tokens across Fraser Road, Boring Road, Kankarbagh &amp; Bailey Road.
          </p>

          {/* Primary View Switcher Tabs */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex p-1 bg-surface-subtle rounded-xl border border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setSubmittedApplication(null);
                }}
                className={`
                  px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2
                  ${activeTab === 'register' && !submittedApplication
                    ? 'bg-surface text-ink shadow-xs border border-border-subtle'
                    : 'text-ink-muted hover:text-ink'
                  }
                `}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Register New Establishment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('track');
                  setSubmittedApplication(null);
                }}
                className={`
                  px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2
                  ${activeTab === 'track' || submittedApplication
                    ? 'bg-surface text-ink shadow-xs border border-border-subtle'
                    : 'text-ink-muted hover:text-ink'
                  }
                `}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Track Application Status</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        <Reveal>
          {/* State A: Immediate Submission Confirmation Card */}
          {submittedApplication ? (
            <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-10 text-center space-y-6 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#EBF2EE] text-[#143D2B] flex items-center justify-center mx-auto border border-[#C8DBD1]">
                <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#143D2B]">
                  Application Successfully Transmitted
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#141413]">
                  Welcome to BOOKKARO Patna
                </h2>
                <p className="text-xs sm:text-sm text-[#52524E] max-w-lg mx-auto leading-relaxed">
                  Thank you, <strong>{submittedApplication.ownerName}</strong>. Your registration for{' '}
                  <strong>{submittedApplication.brandDisplayName}</strong> ({submittedApplication.locality}, Patna) has been allocated to our Patna Urban Onboarding Desk.
                </p>
              </div>

              {/* Reference Voucher Box */}
              <div className="p-5 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-3 text-left">
                <div className="flex items-center justify-between gap-2 border-b border-[#E2DDD5] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#52524E] block">
                      Your Tracking Reference ID
                    </span>
                    <div className="font-mono text-xl sm:text-2xl font-bold text-[#141413] mt-0.5">
                      {submittedApplication.applicationReference}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(submittedApplication.applicationReference)}
                    leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#143D2B]" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copied ? 'Copied' : 'Copy ID'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#52524E] block text-[10px]">Verification SLA:</span>
                    <span className="font-semibold text-[#143D2B]">24–48 Hours</span>
                  </div>
                  <div>
                    <span className="text-[#52524E] block text-[10px]">Assigned Cluster:</span>
                    <span className="font-semibold text-[#141413]">Fraser Road Desk (Patna HQ)</span>
                  </div>
                </div>
              </div>

              {/* 3-Step Next Process Summary */}
              <div className="p-4 rounded-xl bg-white border border-[#E2DDD5] text-left space-y-3">
                <span className="text-xs font-bold text-[#141413] block">
                  What Happens Next?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="w-5 h-5 rounded-full bg-[#143D2B] text-white flex items-center justify-center text-[10px] font-bold">
                      1
                    </div>
                    <div className="font-semibold text-[#141413]">Telephonic Call</div>
                    <div className="text-[11px] text-[#52524E]">
                      Our rep calls your registered phone to confirm services &amp; pricing.
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="w-5 h-5 rounded-full bg-[#143D2B] text-white flex items-center justify-center text-[10px] font-bold">
                      2
                    </div>
                    <div className="font-semibold text-[#141413]">Premise Inspection</div>
                    <div className="text-[11px] text-[#52524E]">
                      Patna field inspector verifies clinic/shop licences and signboards.
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="w-5 h-5 rounded-full bg-[#143D2B] text-white flex items-center justify-center text-[10px] font-bold">
                      3
                    </div>
                    <div className="font-semibold text-[#141413]">Provider ID Issued</div>
                    <div className="text-[11px] text-[#52524E]">
                      Merchant credentials dispatched; instant booking goes live.
                    </div>
                  </div>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setActiveTab('track');
                    setSubmittedApplication(null);
                  }}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Track Live Application Progress
                </Button>

                <Button href="/" variant="outline" size="md">
                  Return to Home
                </Button>
              </div>
            </div>
          ) : activeTab === 'register' ? (
            /* State B: Multi-Step Registration Form */
            <PartnerRegistrationForm onSuccess={handleRegistrationSuccess} />
          ) : (
            /* State C: Live Application Status Tracker */
            <PartnerApplicationTracker
              initialReference={submittedApplication ? (submittedApplication as PartnerApplication).applicationReference : undefined}
              onNavigateToRegister={() => {
                setActiveTab('register');
                setSubmittedApplication(null);
              }}
            />
          )}
        </Reveal>
      </main>
    </div>
  );
}
