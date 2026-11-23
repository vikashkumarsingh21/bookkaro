'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Clock,
  Receipt,
  HeartHandshake,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide public marketing footer inside operational app consoles (/provider-portal and /admin)
  if (pathname.startsWith('/provider-portal') || pathname.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="w-full bg-[#191613] text-[#FAF9F6] border-t border-[#2A241F] pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Trust & Guarantee Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-[#2A241F]">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#231F1B] flex items-center justify-center shrink-0 text-[#FAF9F6] border border-[#3A332C]">
              <Clock className="w-5 h-5 text-[#C5A56A]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white tracking-tight">
                Instant Slot Guarantee
              </h4>
              <p className="text-xs text-[#D6CEC2]/80 mt-1 leading-relaxed">
                Zero waiting at venues. Direct slot requests with under 90s partner confirmation.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#231F1B] flex items-center justify-center shrink-0 text-[#FAF9F6] border border-[#3A332C]">
              <Receipt className="w-5 h-5 text-[#C5A56A]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white tracking-tight">
                100% GST Invoicing
              </h4>
              <p className="text-xs text-[#D6CEC2]/80 mt-1 leading-relaxed">
                Legitimate tax invoices for every booking with transparent price breakdowns.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#231F1B] flex items-center justify-center shrink-0 text-[#FAF9F6] border border-[#3A332C]">
              <ShieldCheck className="w-5 h-5 text-[#C5A56A]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white tracking-tight">
                KYC-Verified Partners
              </h4>
              <p className="text-xs text-[#D6CEC2]/80 mt-1 leading-relaxed">
                Hand-inspected boutique stays, chef-driven dining rooms &amp; licensed wellness salons.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#231F1B] flex items-center justify-center shrink-0 text-[#FAF9F6] border border-[#3A332C]">
              <HeartHandshake className="w-5 h-5 text-[#C5A56A]" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white tracking-tight">
                Fair Merchant Terms
              </h4>
              <p className="text-xs text-[#D6CEC2]/80 mt-1 leading-relaxed">
                Transparent revenue models: Flat monthly subscription or minimal commission.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-[#2A241F]">
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#163829] flex items-center justify-center text-[#FCFBF8] font-serif font-black text-sm">
                BK
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-white">
                BOOK<span className="text-[#C5A56A]">KARO</span>
              </span>
            </div>
            <p className="text-xs text-[#D6CEC2]/80 mt-3 max-w-sm leading-relaxed">
              Patna&apos;s curated local hospitality concierge. Curated boutique stays, dining rooms &amp; wellness salons across Fraser Road, Boring Road, Bailey Road &amp; Patliputra Colony.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-xs text-[#D6CEC2]">
              <CheckCircle2 className="w-4 h-4 text-[#C5A56A]" />
              <span>Patna Hospitality Launch • Zero Arrival Lag</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="font-serif text-xs font-semibold uppercase tracking-wider text-[#C5A56A] mb-3.5">
              Patna Curations
            </h5>
            <ul className="space-y-2 text-xs text-[#D6CEC2]/80">
              <li>
                <Link href="/search?cat=hotels&dest=Patna" className="hover:text-white transition-colors">
                  Hotels &amp; Heritage Stays
                </Link>
              </li>
              <li>
                <Link href="/search?cat=restaurants&dest=Patna" className="hover:text-white transition-colors">
                  Fine Dining &amp; Cafes
                </Link>
              </li>
              <li>
                <Link href="/search?cat=salon&dest=Patna" className="hover:text-white transition-colors">
                  Salons &amp; Spa Sanctuaries
                </Link>
              </li>
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h5 className="font-serif text-xs font-semibold uppercase tracking-wider text-[#C5A56A] mb-3.5">
              Partner Hub
            </h5>
            <ul className="space-y-2 text-xs text-[#D6CEC2]/80">
              <li>
                <Link href="/partner/register" className="hover:text-white transition-colors">
                  List Your Establishment
                </Link>
              </li>
              <li>
                <Link href="/provider-portal" className="hover:text-white transition-colors">
                  Partner Front Desk
                </Link>
              </li>
              <li>
                <Link href="/partner/register" className="hover:text-white transition-colors">
                  Track Application
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Vendor Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h5 className="font-serif text-xs font-semibold uppercase tracking-wider text-[#C5A56A] mb-3.5">
              Company &amp; Support
            </h5>
            <ul className="space-y-2 text-xs text-[#D6CEC2]/80">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About BOOKKARO
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Fraser Road Helpdesk
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy (DPDP)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service &amp; Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Operating Corridors Strip */}
        <div className="py-4 border-b border-[#2A241F] flex flex-wrap items-center justify-between gap-3 text-xs text-[#D6CEC2]/70">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#C5A56A]" />
            <span className="font-medium text-[#FAF9F6]">Active Patna Corridors:</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span>Fraser Road (800001)</span>
            <span>•</span>
            <span>Boring Road &amp; Canal (800013)</span>
            <span>•</span>
            <span>Kankarbagh Colony (800020)</span>
            <span>•</span>
            <span>Bailey Road &amp; Patliputra (800014)</span>
            <span>•</span>
            <span>Danapur &amp; Saguna More (801503)</span>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D6CEC2]/60">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
            <span>&copy; {new Date().getFullYear()} BOOKKARO. Patna, Bihar. All rights reserved.</span>
            <span className="hidden sm:inline text-[#D6CEC2]/30">•</span>
            <span>
              Designed by{' '}
              <a
                href="https://axivontech.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D6CEC2] hover:text-[#C5A56A] transition-colors underline-offset-4 hover:underline"
              >
                Axivon Technologies
              </a>
            </span>
          </div>
          <div className="flex items-center space-x-5">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms &amp; Refunds
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Grievance Officer
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
