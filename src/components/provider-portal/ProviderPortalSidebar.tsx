'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck2,
  Sliders,
  Receipt,
  Store,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
  Building2,
  Lock,
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';

interface ProviderPortalSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendingCount?: number;
}

export const ProviderPortalSidebar: React.FC<ProviderPortalSidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  pendingCount = 3,
}) => {
  const pathname = usePathname();
  const { currentWorkspace, setWorkspace } = useWorkspace();

  const isStaff = currentWorkspace === 'PARTNER_STAFF';

  const allNavItems = [
    {
      label: 'Front-Desk Overview',
      href: '/provider-portal',
      icon: LayoutDashboard,
      badge: null,
      exact: true,
      ownerOnly: false,
    },
    {
      label: 'Incoming Triage Queue',
      href: '/provider-portal/bookings',
      icon: CalendarCheck2,
      badge: pendingCount > 0 ? `${pendingCount} new` : null,
      exact: false,
      ownerOnly: false,
    },
    {
      label: 'Services & Schedule',
      href: '/provider-portal/services',
      icon: Sliders,
      badge: null,
      exact: false,
      ownerOnly: true,
    },
    {
      label: 'Billing & Commission Ledger',
      href: '/provider-portal/billing',
      icon: Receipt,
      badge: null,
      exact: false,
      ownerOnly: true,
    },
  ];

  const visibleNavItems = allNavItems.filter((item) => !isStaff || !item.ownerOnly);

  const isActive = (item: (typeof allNavItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-[#241D18] text-[#F6F2EB] border-r border-[#382E27] select-none">
      {/* Top Branding & Venue Identity */}
      <div className="space-y-4">
        {/* Brand header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#382E27]">
          <Link
            href="/provider-portal"
            className="flex items-center gap-2.5 group focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-[#E0824E] text-[#241D18] flex items-center justify-center font-black transition-transform group-hover:scale-105 shrink-0">
              <Store className="w-5 h-5 text-[#241D18]" />
            </div>
            <div>
              <div className="font-[var(--font-partner-display)] font-bold text-base text-[#F6F2EB] leading-none tracking-tight">
                BOOK<span className="text-[#E0824E]">KARO</span>
              </div>
              <div className="text-[10px] font-semibold text-[#C4B9AD] uppercase tracking-wider mt-0.5">
                Warm Atelier Desk
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#C4B9AD] hover:text-[#F6F2EB] hover:bg-[#332922] lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patna Venue Identity Card */}
        <div className="p-3 rounded-lg bg-[#2E2520] border border-[#3E332B] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#C4B9AD]">
              Patna Establishment
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight uppercase bg-[#21503A] text-[#F6F2EB] border border-[#2F6B4E]">
              <ShieldCheck className="w-2.5 h-2.5 text-[#E0824E]" />
              <span>KYC Verified</span>
            </span>
          </div>

          <div className="flex items-start gap-2 pt-0.5">
            <Building2 className="w-4 h-4 text-[#E0824E] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#F6F2EB] truncate">
                Hotel Maurya &amp; Heritage Suites
              </div>
              <div className="text-[10px] font-mono text-[#C4B9AD] truncate">
                ID: BK-PRV-PAT-001 • Fraser Rd
              </div>
            </div>
          </div>
        </div>

        {/* Role Access Persona Bar */}
        <div className="p-2.5 rounded-lg bg-[#2E2520] border border-[#3E332B] space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#C4B9AD] font-semibold">Active Mode:</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                isStaff
                  ? 'bg-[#382E27] text-[#C4B9AD]'
                  : 'bg-[#9C421C] text-[#F6F2EB]'
              }`}
            >
              {isStaff ? 'Branch Staff' : 'Owner Executive'}
            </span>
          </div>

          {/* Role quick toggle */}
          <div className="flex gap-1 pt-1 border-t border-[#382E27]">
            <button
              type="button"
              onClick={() => setWorkspace('PARTNER_OWNER')}
              className={`
                flex-1 py-1 px-1.5 text-[10px] font-bold rounded transition-colors text-center
                ${
                  !isStaff
                    ? 'bg-[#9C421C] text-white shadow-xs'
                    : 'bg-[#241D18] text-[#C4B9AD] hover:text-[#F6F2EB] border border-[#382E27]'
                }
              `}
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => setWorkspace('PARTNER_STAFF')}
              className={`
                flex-1 py-1 px-1.5 text-[10px] font-bold rounded transition-colors text-center
                ${
                  isStaff
                    ? 'bg-[#9C421C] text-white shadow-xs'
                    : 'bg-[#241D18] text-[#C4B9AD] hover:text-[#F6F2EB] border border-[#382E27]'
                }
              `}
            >
              Staff
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C4B9AD]/70 px-2 pb-1">
            {isStaff ? 'Front-Desk Queue' : 'Workspace Modules'}
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all
                  ${
                    active
                      ? 'bg-[#332922] text-[#F6F2EB] border-l-4 border-[#E0824E]'
                      : 'text-[#C4B9AD] hover:text-[#F6F2EB] hover:bg-[#2B231D]'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-[#E0824E]' : 'text-[#C4B9AD]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`
                      px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tabular-nums
                      ${
                        active
                          ? 'bg-[#9C421C] text-white'
                          : 'bg-[#E0824E]/20 text-[#E0824E] border border-[#E0824E]/40'
                      }
                    `}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Locked items for staff to convey clear boundary */}
          {isStaff && (
            <div className="pt-2 space-y-1">
              <div className="px-2 text-[9px] font-bold text-[#C4B9AD]/70 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-[#E0824E]" />
                <span>Owner Only (Restricted)</span>
              </div>
              <div className="px-3 py-2 text-xs text-[#C4B9AD]/50 flex items-center justify-between rounded-lg bg-[#2E2520]/40">
                <span>Services &amp; Schedule</span>
                <span className="text-[9px] bg-[#382E27] text-[#C4B9AD] px-1.5 py-0.5 rounded">Locked</span>
              </div>
              <div className="px-3 py-2 text-xs text-[#C4B9AD]/50 flex items-center justify-between rounded-lg bg-[#2E2520]/40">
                <span>Billing &amp; Ledger</span>
                <span className="text-[9px] bg-[#382E27] text-[#C4B9AD] px-1.5 py-0.5 rounded">Locked</span>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Switch to Marketplace & Help */}
      <div className="space-y-2 pt-3 border-t border-[#382E27]">
        <Link
          href="/"
          className="flex items-center justify-between p-2.5 rounded-lg bg-[#2E2520] border border-[#3E332B] text-xs font-semibold text-[#F6F2EB] hover:border-[#E0824E] hover:bg-[#332922] transition-colors group"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#E0824E]" />
            <span>Customer Storefront</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#C4B9AD] group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <div className="px-2 py-1 text-[10px] text-[#C4B9AD]/80 leading-snug">
          BOOKKARO Partner Desk • Patna Launch
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar: Roasted Walnut, 256px sticky */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#141413]/70 transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
