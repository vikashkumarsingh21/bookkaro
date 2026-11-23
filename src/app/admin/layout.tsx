import React from 'react';
import { JetBrains_Mono } from 'next/font/google';
import { AdminClientLayout } from '@/components/admin/AdminClientLayout';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-workspace="admin"
      className={`${jetbrainsMono.variable} font-sans min-h-screen bg-canvas text-ink`}
    >
      <AdminClientLayout>{children}</AdminClientLayout>
    </div>
  );
}
