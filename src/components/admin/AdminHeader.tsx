'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Shield,
  AlertTriangle,
  Search,
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAdminPortal } from '@/context/AdminPortalContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { WorkspaceView } from '@/types/booking';
import { AdminQuickJumpModal } from './AdminQuickJumpModal';

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenMobileSidebar,
}) => {
  const pathname = usePathname();
  const { pendingVerificationsCount, openDisputesCount } = useAdminPortal();
  const { currentWorkspace, setWorkspace } = useWorkspace();
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Dev-only role preview guard for production security
  const isRolePreviewEnabled =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ENABLE_ROLE_PREVIEW === 'true';

  // Global Cmd + K / Ctrl + K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickJumpOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Derive breadcrumb from pathname
  const getBreadcrumbTitle = () => {
    if (pathname === '/admin') return 'Overview & Scorecard';
    if (pathname.startsWith('/admin/crm')) return 'Sales CRM Pipeline';
    if (pathname.startsWith('/admin/verifications')) return 'KYC Verifications';
    if (pathname.startsWith('/admin/disputes')) return 'Disputes & Ledger';
    if (pathname.startsWith('/admin/controls')) return 'Controls & Audit Logs';
    return 'Console';
  };

  const roleList: { id: WorkspaceView; label: string; icon: React.ElementType }[] = [
    { id: 'ADMIN', label: 'Admin (Current)', icon: ShieldCheck },
    { id: 'PARTNER_OWNER', label: 'Partner Owner', icon: Building2 },
    { id: 'PARTNER_STAFF', label: 'Partner Staff', icon: Users },
    { id: 'CUSTOMER', label: 'Customer', icon: User },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-[#DCDCD8] h-[52px] px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Mobile Toggle & Hierarchical Breadcrumbs */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="p-1.5 rounded-[6px] text-[#525259] hover:text-[#151517] hover:bg-[#F2F2F0] border border-[#DCDCD8] lg:hidden shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumbs */}
          <div className="min-w-0 flex items-center gap-1.5 text-xs">
            <Link
              href="/admin"
              className="text-[#525259] hover:text-[#151517] transition-colors truncate hidden sm:inline"
            >
              Admin Console
            </Link>
            <ChevronRight className="w-3 h-3 text-[#A8A8B0] shrink-0 hidden sm:inline" />
            <span className="font-semibold text-[#151517] truncate">
              {getBreadcrumbTitle()}
            </span>
          </div>
        </div>

        {/* Center: Quick Command Palette Trigger (Cmd + K) */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-2">
          <button
            type="button"
            onClick={() => setQuickJumpOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] border border-[#DCDCD8] bg-[#F8F8F7] hover:bg-[#F2F2F0] text-xs text-[#525259] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-[#525259] shrink-0" />
              <span className="truncate">Quick jump (leads, providers, tickets)...</span>
            </div>
            <kbd className="px-1.5 py-0.2 rounded bg-white border border-[#DCDCD8] text-[10px] font-mono text-[#525259] shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Operational Status Badges & Role Preview Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={() => setQuickJumpOpen(true)}
            className="md:hidden p-1.5 rounded-[6px] text-[#525259] hover:text-[#151517] border border-[#DCDCD8] bg-[#F8F8F7]"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Patna Pilot Active Badge */}
          <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD] font-mono text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#165234]" />
            <span>Patna Pilot</span>
          </span>

          {/* Pending Verifications Badge */}
          {pendingVerificationsCount > 0 && (
            <Link
              href="/admin/verifications"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#FBF2DF] text-[#7C4B06] border border-[#F3DEC9] text-xs font-semibold font-mono tabular-nums transition-colors hover:bg-[#F5E6CA]"
              title={`${pendingVerificationsCount} provider KYC applications awaiting inspection`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C4B06] animate-pulse" />
              <span>{pendingVerificationsCount} KYC Pending</span>
            </Link>
          )}

          {/* Open Disputes Badge */}
          {openDisputesCount > 0 && (
            <Link
              href="/admin/disputes"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#FCEBEC] text-[#911D23] border border-[#F8D7DA] text-xs font-semibold font-mono tabular-nums transition-colors hover:bg-[#F8D7DA]"
              title={`${openDisputesCount} escalated customer booking disputes`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#911D23]" />
              <span className="hidden sm:inline">{openDisputesCount} Disputes</span>
              <span className="sm:hidden">{openDisputesCount}</span>
            </Link>
          )}

          {/* Dev-Only Role Preview Switcher Dropdown */}
          {isRolePreviewEnabled && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#1A1A1D] text-white text-xs font-mono font-medium hover:bg-[#0B0B0D] transition-colors"
              >
                <Shield className="w-3 h-3 text-[#E0824E]" />
                <span className="hidden sm:inline">Role:</span>
                <span className="font-bold">{currentWorkspace}</span>
                <ChevronDown className="w-3 h-3 text-[#A8A8B0]" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-52 rounded-[6px] bg-white border border-[#DCDCD8] shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#525259] border-b border-[#DCDCD8]">
                    Switch Role Preview
                  </div>
                  {roleList.map((r) => {
                    const Icon = r.icon;
                    const isCurrent = currentWorkspace === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setWorkspace(r.id);
                          setRoleDropdownOpen(false);
                        }}
                        className={`
                          w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors
                          ${
                            isCurrent
                              ? 'bg-[#F2F2F0] text-[#151517] font-semibold'
                              : 'text-[#525259] hover:bg-[#F8F8F7] hover:text-[#151517]'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-[#525259]" />
                          <span>{r.label}</span>
                        </div>
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6B1D2F]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Working Quick Jump Command Palette Modal */}
      <AdminQuickJumpModal
        isOpen={quickJumpOpen}
        onClose={() => setQuickJumpOpen(false)}
      />
    </>
  );
};
