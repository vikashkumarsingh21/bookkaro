import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MOCK_PROVIDERS_DATA } from '@/data/mockProviders';
import { ProviderDetailClient } from '@/components/provider/ProviderDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return MOCK_PROVIDERS_DATA.map((provider) => ({
    id: provider.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const provider = MOCK_PROVIDERS_DATA.find(
    (p) => p.id.toLowerCase() === id.toLowerCase() || p.slug.toLowerCase() === id.toLowerCase()
  );

  if (!provider) {
    return {
      title: 'Provider Not Found | BOOKKARO India',
      description: 'The requested service provider could not be located in our verified roster.',
    };
  }

  const categoryLabel = provider.category.replace('_', ' ').toUpperCase();

  return {
    title: `${provider.name} • ${provider.locality}, ${provider.city} | BOOKKARO`,
    description: `${provider.tagline} — Direct booking & appointments at ${provider.name} in ${provider.locality}, ${provider.city}. Verified ${categoryLabel} slots.`,
    openGraph: {
      title: `${provider.name} | Verified ${categoryLabel} Booking`,
      description: provider.tagline,
      images: provider.images.length > 0 ? [{ url: provider.images[0] }] : [],
    },
  };
}

export default async function ProviderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const provider = MOCK_PROVIDERS_DATA.find(
    (p) => p.id.toLowerCase() === id.toLowerCase() || p.slug.toLowerCase() === id.toLowerCase()
  );

  if (!provider) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':
      provider.category === 'hotels'
        ? 'Hotel'
        : provider.category === 'restaurants'
        ? 'Restaurant'
        : 'HealthAndBeautyBusiness',
    name: provider.name,
    description: provider.description || provider.tagline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: provider.address,
      addressLocality: provider.locality,
      addressRegion: 'Bihar',
      postalCode: '800001',
      addressCountry: 'IN',
    },
    telephone: provider.phone,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: provider.rating,
      reviewCount: provider.reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
    priceRange: `₹${provider.priceRange.min} - ₹${provider.priceRange.max}`,
    image: provider.images,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProviderDetailClient provider={provider} />
    </>
  );
}
