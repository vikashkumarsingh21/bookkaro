'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutGrid,
  KanbanSquare,
  ShieldCheck,
  Scale,
  SlidersHorizontal,
  Building2,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';
import { useAdminPortal } from '@/context/AdminPortalContext';

// Static Admin Routes
const ADMIN_ROUTES = [
  {
    title: 'Overview & Marketplace Scorecard',
    category: 'Route',
    href: '/admin',
    icon: LayoutGrid,
    subtitle: 'Primary KPIs, conversion rates, and exception queue',
  },
  {
    title: 'Sales CRM & Merchant Onboarding Pipeline',
    category: 'Route',
    href: '/admin/crm',
    icon: KanbanSquare,
    subtitle: '6-stage Kanban and table pipeline',
  },
  {
    title: 'Patna KYC Verification Queue',
    category: 'Route',
    href: '/admin/verifications',
    icon: ShieldCheck,
    subtitle: 'Audit trade licenses, PMC, FSSAI & issue Provider IDs',
  },
  {
    title: 'Dispute Escalation & Resolution Center',
    category: 'Route',
    href: '/admin/disputes',
    icon: Scale,
    subtitle: 'Arbitrate customer booking grievances and counter refunds',
  },
  {
    title: 'Platform Controls & Immutable Audit Logs',
    category: 'Route',
    href: '/admin/controls',
    icon: SlidersHorizontal,
    subtitle: 'Category switches, radius, Grievance Officer, and DPDP logs',
  },
];

interface AdminQuickJumpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminQuickJumpModal: React.FC<AdminQuickJumpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { crmLeads, disputes } = useAdminPortal();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamic search results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return ADMIN_ROUTES.map((r) => ({ ...r, type: 'ROUTE' as const }));
    }

    const matchedRoutes = ADMIN_ROUTES
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q)
      )
      .map((r) => ({ ...r, type: 'ROUTE' as const }));

    const matchedLeads = crmLeads
      .filter(
        (l) =>
          l.brandDisplayName.toLowerCase().includes(q) ||
          l.applicationReference.toLowerCase().includes(q) ||
          l.locality.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      )
      .map((l) => ({
        title: `${l.brandDisplayName} (${l.applicationReference})`,
        subtitle: `${l.locality}, Patna • Stage: ${l.stage.replace('_', ' ')} • ${l.category.toUpperCase()}`,
        href: `/admin/crm`,
        icon: Building2,
        category: 'Merchant Application',
        type: 'LEAD' as const,
      }));

    const matchedDisputes = disputes
      .filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.bookingReference.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          d.reason.toLowerCase().includes(q)
      )
      .map((d) => ({
        title: `${d.id}: #${d.bookingReference} – ${d.customerName}`,
        subtitle: `${d.reason} • Status: ${d.status.replace('_', ' ')}`,
        href: `/admin/disputes`,
        icon: AlertTriangle,
        category: 'Escalated Dispute',
        type: 'DISPUTE' as const,
      }));

    return [...matchedRoutes, ...matchedLeads, ...matchedDisputes];
  }, [query, crmLeads, disputes]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4 bg-[#000000]/60 backdrop-blur-none animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-[6px] border border-[#DCDCD8] overflow-hidden animate-in zoom-in-95 duration-100 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#DCDCD8] flex items-center gap-3 bg-[#F8F8F7]">
          <Search className="w-4 h-4 text-[#525259] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Patna providers, applications (APP-PAT-...), disputes, routes... (ESC to close)"
            className="flex-1 bg-transparent text-xs font-mono text-[#151517] outline-none placeholder:text-[#525259]/60"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#525259] hover:text-[#151517] hover:bg-[#DCDCD8]/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#DCDCD8] p-1.5">
          {searchResults.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#525259] space-y-1">
              <div>No matching Patna records found for &quot;{query}&quot;.</div>
              <div className="text-[11px] font-mono text-[#525259]/70">
                Try searching &quot;Hotel&quot;, &quot;Handi&quot;, &quot;APP-PAT&quot;, or &quot;DISP&quot;.
              </div>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={`${item.href}-${idx}`}
                  type="button"
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  className="w-full text-left p-2.5 rounded-[4px] hover:bg-[#F2F2F0] transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-[4px] bg-[#F2F2F0] border border-[#DCDCD8] flex items-center justify-center text-[#151517] shrink-0 group-hover:bg-white transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#151517] truncate">
                          {item.title}
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#F2F2F0] text-[#525259] border border-[#DCDCD8] shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#525259] truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#525259] group-hover:translate-x-0.5 group-hover:text-[#6B1D2F] transition-all shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-3.5 py-2 bg-[#F8F8F7] border-t border-[#DCDCD8] flex items-center justify-between text-[11px] text-[#525259] font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.2 rounded bg-white border border-[#DCDCD8] text-[10px]">
                Cmd+K
              </kbd>{' '}
              toggle
            </span>
            <span>
              <kbd className="px-1 py-0.2 rounded bg-white border border-[#DCDCD8] text-[10px]">
                ESC
              </kbd>{' '}
              close
            </span>
          </div>
          <span className="text-[#6B1D2F] font-semibold">BOOKKARO Patna Admin Console</span>
        </div>
      </div>
    </div>
  );
};
