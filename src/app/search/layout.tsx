import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Patna Hotels, Dining & Salons | BOOKKARO Discovery',
  description:
    'Discover and reserve verified boutique stays, fine dining tables, and premium wellness salons across Fraser Road, Boring Road, and Bailey Road, Patna.',
  openGraph: {
    title: 'Discover & Book Curated Hospitality in Patna | BOOKKARO',
    description:
      'Curated boutique stays, chef-driven dining rooms, and wellness sanctuaries in Patna with under-90s merchant confirmation.',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
