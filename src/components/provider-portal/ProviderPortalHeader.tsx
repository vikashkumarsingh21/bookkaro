'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  Building2,
  ExternalLink,
  ChevronDown,
  Clock,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { MERCHANT_PROFILES, MerchantProfile } from '@/data/mockProviderPortalData';
import { Button } from '@/components/ui/Button';
import { useWorkspace } from '@/context/WorkspaceContext';
import { WorkspaceView } from '@/types/booking';

interface ProviderPortalHeaderProps {
  onOpenMobileSidebar: () => void;
  activeMerchant: MerchantProfile;
  onChangeMerchant: (merchant: MerchantProfile) => void;
  pendingCount?: number;
}

export const ProviderPortalHeader: React.FC<ProviderPortalHeaderProps> = ({
  onOpenMobileSidebar,
  activeMerchant,
  onChangeMerchant,
  pendingCount = 3,
}) => {
  const [merchantDropdownOpen, setMerchantDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isAcceptingBookings, setIsAcceptingBookings] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('Fri, 21 Nov 2026 • 17:00');

  // Dev-only role preview guard for production security
  const isRolePreviewEnabled =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ENABLE_ROLE_PREVIEW === 'true';

  const { currentWorkspace, setWorkspace } = useWorkspace();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) +
          ' • ' +
          now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roleOptions: {
    id: WorkspaceView;
    label: string;
    icon: React.ElementType;
    targetHref: string;
  }[] = [
    {
      id: 'PARTNER_OWNER',
      label: 'Partner Owner',
      icon: Building2,
      targetHref: '/provider-portal',
    },
    {
      id: 'PARTNER_STAFF',
      label: 'Partner Staff',
      icon: Users,
      targetHref: '/provider-portal',
    },
    {
      id: 'CUSTOMER',
      label: 'Customer Storefront',
      icon: User,
      targetHref: '/dashboard',
    },
    {
      id: 'ADMIN',
      label: 'Platform Admin',
      icon: ShieldCheck,
      targetHref: '/admin',
    },
  ];

  return (
    <header className="sticky top-0 z-20 bg-surface border-b border-border-subtle h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-none">
      {/* Left: Mobile Menu Toggle & Managed Establishment Selector */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle border border-border-subtle lg:hidden shrink-0"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Venue Switcher Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMerchantDropdownOpen(!merchantDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border-subtle hover:border-primary/50 bg-surface-subtle transition-colors text-left"
          >
            <div className="w-6 h-6 rounded bg-[#241D18] text-[#E0824E] flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-[#E0824E]" />
            </div>
            <div className="hidden sm:block min-w-0 max-w-[180px] md:max-w-xs">
              <div className="text-xs font-bold text-ink truncate">
                {activeMerchant.name}
              </div>
              <div className="text-[10px] text-ink-muted font-mono truncate">
                ID: {activeMerchant.id} • {activeMerchant.locality}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-ink-muted shrink-0" />
          </button>

          {merchantDropdownOpen && (
            <div
              className="absolute left-0 mt-1.5 w-72 rounded-xl bg-surface border border-border-subtle shadow-xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100"
              onMouseLeave={() => setMerchantDropdownOpen(false)}
            >
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Switch Managed Establishment
              </div>
              {MERCHANT_PROFILES.map((m) => {
                const isCurrent = m.id === activeMerchant.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onChangeMerchant(m);
                      setMerchantDropdownOpen(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2 text-xs font-medium flex items-start justify-between gap-2 hover:bg-surface-subtle transition-colors
                      ${isCurrent ? 'bg-surface-subtle text-primary font-bold' : 'text-ink'}
                    `}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{m.name}</div>
                      <div className="text-[10px] text-ink-muted truncate">
                        {m.locality}, {m.city} ({m.category.replace('_', ' ')})
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Shift Clock (Desktop) */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subtle border border-border-subtle text-xs text-ink-muted tabular-nums">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold text-ink" suppressHydrationWarning>
            {currentTimeStr}
          </span>
        </div>
      </div>

      {/* Right: Live Triage Pill, Store State, Public Listing & Persona Switcher */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Live "Pending Requests" Count Pill (Terracotta) */}
        <Link
          href="/provider-portal/bookings"
          className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-full bg-[#FCEFE8] border border-[#F5C2B0] text-[#9C421C] text-xs font-bold hover:bg-[#F9DFD4] transition-colors"
          title="Triage incoming customer requests under <90s SLA"
        >
          <span className="w-2 h-2 rounded-full bg-[#9C421C] animate-pulse shrink-0" />
          <span className="tabular-nums">{pendingCount}</span>
          <span className="hidden sm:inline">Pending Triage</span>
        </Link>

        {/* Live Accepting Online Bookings Toggle */}
        <button
          type="button"
          onClick={() => setIsAcceptingBookings(!isAcceptingBookings)}
          className={`
            hidden md:flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer
            ${
              isAcceptingBookings
                ? 'bg-[#EBF3EF] text-[#21503A] border-[#C3DDD0]'
                : 'bg-[#FCECEC] text-[#942228] border-[#F5C2C4]'
            }
          `}
          title="Toggle accepting online slot requests"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAcceptingBookings ? 'bg-[#21503A] animate-pulse' : 'bg-[#942228]'
            }`}
          />
          <span>{isAcceptingBookings ? 'Front-Desk Online' : 'Front-Desk Paused'}</span>
        </button>

        {/* Quick link back to Public Storefront */}
        <Button
          href={`/provider/${activeMerchant.id}`}
          target="_blank"
          variant="outline"
          size="sm"
          rightIcon={<ExternalLink className="w-3 h-3 text-ink-muted" />}
          className="hidden lg:inline-flex text-xs h-8 px-2.5"
        >
          Storefront Listing
        </Button>

        {/* Dev-Only Role Preview Switcher Dropdown */}
        {isRolePreviewEnabled && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#241D18] text-[#F6F2EB] border border-[#382E27] text-[11px] font-semibold transition-colors hover:bg-[#332922]"
              title="Switch Active Persona"
            >
              <span className="text-[#C4B9AD] hidden sm:inline">Role:</span>
              <span className="text-[#E0824E] font-bold" suppressHydrationWarning>
                {currentWorkspace === 'PARTNER_STAFF' ? 'Staff' : 'Owner'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#C4B9AD]" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-52 rounded-xl bg-[#241D18] border border-[#382E27] p-1.5 z-50 shadow-2xl text-left"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#C4B9AD]">
                  Switch Active Persona
                </div>
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isActive =
                    currentWorkspace === role.id ||
                    (role.id === 'PARTNER_OWNER' && currentWorkspace === 'PROVIDER');
                  return (
                    <Link
                      key={role.id}
                      href={role.targetHref}
                      onClick={() => {
                        setWorkspace(role.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors
                        ${
                          isActive
                            ? 'bg-[#9C421C] text-white'
                            : 'text-[#C4B9AD] hover:text-[#F6F2EB] hover:bg-[#332922]'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-[#E0824E]" />
                        <span>{role.label}</span>
                      </span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#E0824E]" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
