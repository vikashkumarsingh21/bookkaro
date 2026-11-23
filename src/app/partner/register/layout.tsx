import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner Onboarding & Merchant Registration | BOOKKARO Patna',
  description:
    'Register your hotel, dining establishment, or salon on BOOKKARO Patna. Choose between 3 transparent monthly subscription tiers or pay-as-you-earn commission.',
  openGraph: {
    title: 'List Your Hospitality Establishment in Patna | BOOKKARO',
    description:
      'Fast 24-48h KYC verification, verified offline counter PIN check-ins, and daily T+1 commercial settlements.',
  },
};

export default function PartnerRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
