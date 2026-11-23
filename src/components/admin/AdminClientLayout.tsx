'use client';

import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import { AdminPortalProvider } from '@/context/AdminPortalContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/Button';

export const AdminClientLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { currentWorkspace, setWorkspace } = useWorkspace();

  const isAdmin = currentWorkspace === 'ADMIN';

  return (
    <AdminPortalProvider>
      {!isAdmin ? (
        <div className="min-h-screen bg-[#F2F2F0] text-[#151517] flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-[6px] border border-[#DCDCD8] p-6 sm:p-8 space-y-5 text-center shadow-sm">
            <div className="w-14 h-14 rounded-[6px] bg-[#FCEBEC] border border-[#F8D7DA] flex items-center justify-center text-[#911D23] mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#911D23] bg-[#FCEBEC] px-2.5 py-1 rounded-[4px] border border-[#F8D7DA]">
                Strict Access Boundary
              </span>
              <h1 className="font-semibold text-xl sm:text-2xl text-[#151517] tracking-tight mt-1">
                Administrator Authorization Required
              </h1>
              <p className="text-xs text-[#525259] leading-relaxed">
                Your active preview workspace role is currently{' '}
                <strong className="text-[#151517] font-mono">[{currentWorkspace}]</strong>. Accessing the Patna sales CRM, auditing trade licences, arbitrating disputes, and toggling platform compliance controls requires{' '}
                <strong className="text-[#6B1D2F] font-mono">ADMIN</strong> authority.
              </p>
            </div>

            <div className="p-3.5 rounded-[6px] bg-[#F8F8F7] border border-[#DCDCD8] text-left text-xs text-[#525259] space-y-1">
              <div className="font-semibold text-[#151517] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#165234]" />
                <span>Dev Role Preview Switcher Available</span>
              </div>
              <div className="text-[11px] leading-relaxed">
                Click below to switch your session to the Admin role and inspect all Phase 7 operational consoles.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <Button
                href="/"
                variant="outline"
                size="md"
                leftIcon={<Home className="w-4 h-4" />}
                className="w-full sm:w-auto text-xs rounded-[6px]"
              >
                Storefront
              </Button>
              <button
                type="button"
                onClick={() => setWorkspace('ADMIN')}
                className="w-full sm:w-auto px-4 py-2 rounded-[6px] bg-[#6B1D2F] hover:bg-[#521523] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Switch to ADMIN Role</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-canvas text-ink flex font-sans">
          {/* Persistent Left Rail */}
          <AdminSidebar
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          {/* Main Content Viewport */}
          <div className="flex-1 min-w-0 flex flex-col">
            <AdminHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
            <main className="flex-1 p-3.5 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto space-y-5">
              {children}
            </main>
          </div>
        </div>
      )}
    </AdminPortalProvider>
  );
};
