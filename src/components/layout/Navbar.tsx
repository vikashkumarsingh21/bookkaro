'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  Menu,
  X,
  Building2,
  ShieldCheck,
  User,
  Users,
  ChevronDown,
  Hotel,
  UtensilsCrossed,
  Scissors,
  Calendar,
  LogIn,
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { WorkspaceView } from '@/types/booking';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentWorkspace, setWorkspace, selectedCity, setSelectedCity, availableCities } =
    useWorkspace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Dev-only role preview guard for production security
  const isRolePreviewEnabled =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ENABLE_ROLE_PREVIEW === 'true';

  // Hide Customer marketing Navbar inside operational app shells (/provider-portal and /admin)
  if (pathname.startsWith('/provider-portal') || pathname.startsWith('/admin')) {
    return null;
  }

  // Strict 3-category customer navigation + My Bookings + Sign In
  const navLinks = [
    { label: 'Hotels', href: '/search?cat=hotels&dest=Patna', icon: Hotel },
    { label: 'Dining', href: '/search?cat=restaurants&dest=Patna', icon: UtensilsCrossed },
    { label: 'Salons', href: '/search?cat=salon&dest=Patna', icon: Scissors },
    { label: 'My Bookings', href: '/dashboard', icon: Calendar },
    { label: 'Sign In', href: '/login', icon: LogIn },
  ];

  const roleOptions: {
    id: WorkspaceView;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    tag: string;
    targetHref: string;
  }[] = [
      {
        id: 'CUSTOMER',
        label: 'Customer',
        shortLabel: 'Customer',
        icon: User,
        tag: 'Customer Discovery & Booking',
        targetHref: '/dashboard',
      },
      {
        id: 'PARTNER_OWNER',
        label: 'Partner Owner',
        shortLabel: 'Owner',
        icon: Building2,
        tag: 'Merchant Ops & Financial Ledger',
        targetHref: '/provider-portal',
      },
      {
        id: 'PARTNER_STAFF',
        label: 'Partner Staff',
        shortLabel: 'Staff',
        icon: Users,
        tag: 'Branch Queue & PIN Verification',
        targetHref: '/provider-portal',
      },
      {
        id: 'ADMIN',
        label: 'Admin',
        shortLabel: 'Admin',
        icon: ShieldCheck,
        tag: 'Platform Governance & Sales CRM',
        targetHref: '/admin',
      },
    ];

  const cleanCityDisplay = selectedCity
    .replace(' (All Zones)', '')
    .replace(/ \(\d+\)/, '');

  const activeRoleObj =
    roleOptions.find(
      (r) =>
        r.id === currentWorkspace ||
        (r.id === 'PARTNER_OWNER' && currentWorkspace === 'PROVIDER')
    ) || roleOptions[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-border-subtle transition-all">
      {/* 1. SLIM DEV & ROLE PREVIEW UTILITY STRIP */}
      <div className="bg-[#191613] text-[#D6CEC2] text-[11px] py-1 px-4 sm:px-6 border-b border-[#2A241F]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 shrink-0">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A56A]" />
            <span className="font-semibold tracking-wider uppercase text-[#C5A56A]">
              BOOKKARO
            </span>
            <span className="text-[#D6CEC2]/60 hidden sm:inline">
              • Patna Hospitality Launch
            </span>
          </div>

          {/* Compact Dev-Only Role Preview Dropdown (strictly guarded against production exposure) */}
          {isRolePreviewEnabled && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#231F1B] border border-[#3A332C] text-[#D6CEC2] hover:text-[#FCFBF8] text-[10px] font-medium transition-colors"
                title="Switch Active Persona Preview"
              >
                <span className="text-[#D6CEC2]/60">Preview:</span>
                <span className="text-[#FCFBF8] font-semibold" suppressHydrationWarning>
                  {activeRoleObj.label}
                </span>
                <ChevronDown className="w-2.5 h-2.5 text-[#D6CEC2]/70" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-52 rounded-lg bg-[#191613] border border-[#3A332C] p-1 z-50 shadow-xl"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#D6CEC2]/50">
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
                          w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-medium transition-colors
                          ${isActive
                            ? 'bg-[#163829] text-[#FCFBF8]'
                            : 'text-[#D6CEC2]/80 hover:text-[#FCFBF8] hover:bg-[#2A241F]'
                          }
                        `}
                      >
                        <span className="flex items-center gap-1.5">
                          <Icon className="w-3 h-3 text-[#C5A56A]" />
                          <span>{role.label}</span>
                        </span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#C5A56A]" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN SINGLE-LINE NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Typographic Mark + Compact Locality Pill */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            href="/"
            className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-fg group-hover:bg-primary-hover transition-colors shadow-none shrink-0">
              <span className="font-serif font-black text-sm tracking-tight">BK</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-ink leading-none">
                BOOK<span className="text-primary">KARO</span>
              </span>
              <span className="text-[9px] font-semibold tracking-widest text-ink-muted uppercase mt-0.5">
                Patna Concierge
              </span>
            </div>
          </Link>

          {/* Compact Locality Selector Pill */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border-subtle bg-surface-subtle text-xs font-semibold text-ink hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-medium text-ink-muted">Patna:</span>
              <span className="text-ink font-semibold truncate max-w-[110px]" suppressHydrationWarning>
                {cleanCityDisplay}
              </span>
              <ChevronDown className="w-3 h-3 text-ink-muted shrink-0" />
            </button>

            {cityDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-60 rounded-xl bg-surface border border-border-subtle py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100 shadow-lg"
                onMouseLeave={() => setCityDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  Select Patna Launch Hub
                </div>
                {availableCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city);
                      setCityDropdownOpen(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-surface-subtle transition-colors
                      ${selectedCity === city ? 'text-primary font-semibold bg-surface-subtle' : 'text-ink'}
                    `}
                  >
                    <span>{city}</span>
                    {selectedCity === city && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Exactly 4 Concise Hospitality Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith('/search') && pathname.includes(link.href.split('?')[1]));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-control)] text-xs font-medium transition-colors
                  ${isActive
                    ? 'bg-surface-subtle text-primary font-semibold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-subtle'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action: List Business + High-Contrast Matte Partner Hub CTA */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <Link
            href="/partner/register"
            className="text-xs font-medium text-ink-muted hover:text-ink transition-colors px-2 py-1"
          >
            List Business
          </Link>

          <Link
            href="/provider-portal"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[#163829] !text-[#FCFBF8] hover:bg-[#0F271C] text-xs font-bold transition-all shadow-none border border-[#163829] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>Partner Hub</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-ink hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-ink" />}
          </button>
        </div>
      </div>

      {/* 3. MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-subtle bg-surface px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
          {/* Mobile Locality Picker */}
          <div className="p-3 bg-surface-subtle rounded-[var(--radius-control)] border border-border-subtle space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" />
              <span>Current Patna Locality:</span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-surface text-ink text-xs font-semibold py-1.5 px-2.5 rounded border border-border-subtle focus:outline-none focus:border-primary"
            >
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* 4 Concise Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-control)] text-xs font-medium text-ink hover:bg-surface-subtle transition-colors"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-border-subtle flex flex-col gap-2">
            <Link
              href="/partner/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-[var(--radius-control)] text-xs font-semibold text-ink-muted hover:text-ink border border-border-subtle bg-surface-subtle"
            >
              List Your Establishment in Patna
            </Link>
            <Link
              href="/provider-portal"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-[var(--radius-control)] text-xs font-bold bg-[#163829] !text-[#FCFBF8] hover:bg-[#0F271C] border border-[#163829]"
            >
              Enter Partner Hub
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
