import React from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ProviderPortalClientLayout } from '@/components/provider-portal/ProviderPortalClientLayout';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-partner-display',
  display: 'swap',
});

export default function ProviderPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-workspace="partner"
      className={`${plusJakarta.variable} font-sans min-h-screen bg-canvas text-ink`}
    >
      <ProviderPortalClientLayout>{children}</ProviderPortalClientLayout>
    </div>
  );
}
