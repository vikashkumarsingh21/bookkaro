'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  KanbanSquare,
  ShieldCheck,
  Scale,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { useAdminPortal } from '@/context/AdminPortalContext';

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { pendingVerificationsCount, openDisputesCount } = useAdminPortal();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      label: 'Overview & Scorecard',
      shortLabel: 'Overview',
      href: '/admin',
      icon: LayoutGrid,
      exact: true,
      badge: null,
    },
    {
      label: 'Sales CRM Pipeline',
      shortLabel: 'CRM Pipeline',
      href: '/admin/crm',
      icon: KanbanSquare,
      exact: false,
      badge: null,
    },
    {
      label: 'KYC Verifications',
      shortLabel: 'KYC Review',
      href: '/admin/verifications',
      icon: ShieldCheck,
      exact: false,
      badge: pendingVerificationsCount > 0 ? `${pendingVerificationsCount}` : null,
      badgeVariant: 'warning' as const,
    },
    {
      label: 'Disputes & Ledger',
      shortLabel: 'Disputes',
      href: '/admin/disputes',
      icon: Scale,
      exact: false,
      badge: openDisputesCount > 0 ? `${openDisputesCount}` : null,
      badgeVariant: 'critical' as const,
    },
    {
      label: 'Controls & Audit Logs',
      shortLabel: 'Controls & Logs',
      href: '/admin/controls',
      icon: SlidersHorizontal,
      exact: false,
      badge: null,
    },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const sidebarBody = (collapsed: boolean, isMobile: boolean) => (
    <div className="h-full flex flex-col justify-between p-3 bg-[#141416] text-[#F2F2F0] border-r border-[#26262B]">
      {/* Top Branding & Navigation */}
      <div className="space-y-4">
        {/* Header / Brand */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-[#26262B]">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 group focus-visible:outline-none min-w-0"
          >
            <div className="w-8 h-8 rounded-[6px] bg-[#6B1D2F] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 tracking-wider">
              BK
            </div>
            {(!collapsed || isMobile) && (
              <div className="min-w-0">
                <div className="font-semibold text-xs text-[#F2F2F0] tracking-tight truncate leading-none">
                  BOOKKARO <span className="text-[#6B1D2F] font-mono text-[10px]">OPS</span>
                </div>
                <div className="text-[10px] text-[#A8A8B0] font-mono tracking-wider uppercase mt-1 truncate">
                  Patna Central
                </div>
              </div>
            )}
          </Link>

          {isMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-[6px] text-[#A8A8B0] hover:text-[#F2F2F0] hover:bg-[#1E1E22] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1 rounded-[6px] text-[#A8A8B0] hover:text-[#F2F2F0] hover:bg-[#1E1E22] transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar to icons'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Patna Pilot Status Badge */}
        {(!collapsed || isMobile) && (
          <div className="px-2.5 py-2 rounded-[6px] bg-[#1E1E24] border border-[#2D2D35] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#165234] animate-pulse shrink-0" />
              <span className="font-mono text-[#D4D4DC] text-[10px] truncate">
                Patna Pilot Active
              </span>
            </div>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#2A2A33] text-[#A8A8B0] uppercase">
              10 Hubs
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {(!collapsed || isMobile) && (
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#A8A8B0] px-2.5 pb-1">
              Operations Rail
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed && !isMobile ? item.label : undefined}
                className={`
                  flex items-center ${
                    collapsed && !isMobile ? 'justify-center px-2 py-2.5' : 'justify-between px-2.5 py-2'
                  } rounded-[6px] text-xs transition-colors group relative
                  ${
                    active
                      ? 'bg-[#1E1E22] text-[#FFFFFF] font-medium border-l-2 border-[#6B1D2F]'
                      : 'text-[#A8A8B0] hover:text-[#F2F2F0] hover:bg-[#1A1A1E]'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-[#FFFFFF]' : 'text-[#A8A8B0] group-hover:text-[#F2F2F0]'
                    }`}
                  />
                  {(!collapsed || isMobile) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {(!collapsed || isMobile) && item.badge && (
                  <span
                    className={`
                      ml-2 px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold tabular-nums shrink-0
                      ${
                        item.badgeVariant === 'critical'
                          ? 'bg-[#911D23] text-white'
                          : 'bg-[#7C4B06] text-white'
                      }
                    `}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Badge Dot Indicator */}
                {collapsed && !isMobile && item.badge && (
                  <span
                    className={`
                      absolute top-1.5 right-1.5 w-2 h-2 rounded-full
                      ${
                        item.badgeVariant === 'critical'
                          ? 'bg-[#911D23]'
                          : 'bg-[#7C4B06]'
                      }
                    `}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Utility Controls */}
      <div className="space-y-2 pt-3 border-t border-[#26262B]">
        {(!collapsed || isMobile) && (
          <div className="px-2 py-1.5 rounded-[6px] bg-[#1A1A1E] border border-[#26262B] text-[10px] font-mono text-[#A8A8B0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#F2F2F0] font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#6B1D2F]" />
                ADMIN ROLE
              </span>
              <span className="text-[9px] text-[#165234] font-bold">AUTHORIZED</span>
            </div>
            <div className="text-[9px] text-[#A8A8B0]/80 truncate">
              DPDP 1-Year Retention Lock
            </div>
          </div>
        )}

        <Link
          href="/"
          className={`
            flex items-center ${
              collapsed && !isMobile ? 'justify-center p-2' : 'justify-between px-2.5 py-1.5'
            } rounded-[6px] text-xs text-[#A8A8B0] hover:text-[#F2F2F0] hover:bg-[#1A1A1E] transition-colors
          `}
          title={collapsed && !isMobile ? 'Customer Discovery' : undefined}
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#A8A8B0]" />
            {(!collapsed || isMobile) && <span>Live Storefront</span>}
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-mono text-[10px] text-[#A8A8B0]">↗</span>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Inverted-L Left Rail */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 shrink-0 z-30 transition-all duration-200 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarBody(isCollapsed, false)}
      </aside>

      {/* Mobile Slide-Over Drawer (<1024px, safe on 360px viewport) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#000000]/70 backdrop-blur-none transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarBody(false, true)}
          </div>
        </div>
      )}
    </>
  );
};
