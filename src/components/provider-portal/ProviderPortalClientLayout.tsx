'use client';

import React, { useState } from 'react';
import { ProviderPortalProvider, useProviderPortal } from '@/context/ProviderPortalContext';
import { ProviderPortalSidebar } from '@/components/provider-portal/ProviderPortalSidebar';
import { ProviderPortalHeader } from '@/components/provider-portal/ProviderPortalHeader';

function ProviderPortalLayoutInner({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { activeMerchant, setActiveMerchant, pendingCount } = useProviderPortal();

  return (
    <div className="min-h-screen bg-canvas text-ink flex">
      {/* Left Sidebar */}
      <ProviderPortalSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <ProviderPortalHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          activeMerchant={activeMerchant}
          onChangeMerchant={setActiveMerchant}
          pendingCount={pendingCount}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function ProviderPortalClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProviderPortalProvider>
      <ProviderPortalLayoutInner>{children}</ProviderPortalLayoutInner>
    </ProviderPortalProvider>
  );
}
