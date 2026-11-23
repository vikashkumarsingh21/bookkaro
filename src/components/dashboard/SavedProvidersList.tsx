import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Star,
  Trash2,
  Bookmark,
  ChevronRight,
  Search,
} from 'lucide-react';
import { SavedProviderItem } from '@/data/mockDashboardBookings';
import { Button } from '@/components/ui/Button';

interface SavedProvidersListProps {
  savedProviders: SavedProviderItem[];
  onRemoveSaved: (id: string) => void;
}

export const SavedProvidersList: React.FC<SavedProvidersListProps> = ({
  savedProviders,
  onRemoveSaved,
}) => {
  if (savedProviders.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-[#E2DDD5] p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FAF1EB] border border-[#F3DEC9] flex items-center justify-center text-[#C25E28] mx-auto">
          <Bookmark className="w-7 h-7 stroke-[1.75]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-lg text-ink">
            No Saved Patna Places Yet
          </h3>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            Bookmark your preferred heritage stays, dining rooms, or beauty salons in Patna to request slots with one tap.
          </p>
        </div>
        <div className="pt-2">
          <Button
            href="/search"
            variant="primary"
            size="sm"
            leftIcon={<Search className="w-3.5 h-3.5" />}
          >
            Explore Verified Establishments in Patna
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {savedProviders.map((provider) => (
        <div
          key={provider.id}
          className="bg-white rounded-xl border border-[#E2DDD5] overflow-hidden hover:border-[#143D2B] transition-colors flex flex-col justify-between group"
        >
          <div>
            {/* Thumbnail Header with Category & Remove Action */}
            <div className="relative aspect-[16/10] w-full bg-[#F3F1EC] border-b border-[#E2DDD5]">
              <Image
                src={provider.image}
                alt={provider.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-[#141413]/85 text-white text-[10px] font-semibold uppercase tracking-wider backdrop-blur-none">
                {provider.category.replace('_', ' ')}
              </div>
              <button
                type="button"
                onClick={() => onRemoveSaved(provider.id)}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white text-[#9E2A2B] hover:text-[#9E2A2B] border border-[#E2DDD5] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#143D2B] cursor-pointer"
                title="Remove from saved"
                aria-label={`Remove ${provider.name} from saved`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Details */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs font-semibold text-[#52524E]">
                  {provider.subCategory}
                </span>
                <div className="flex items-center gap-1 font-semibold text-[#141413]">
                  <Star className="w-3.5 h-3.5 fill-[#143D2B] text-[#143D2B]" />
                  <span>{provider.rating}</span>
                  <span className="text-[#52524E] font-normal">({provider.reviewCount})</span>
                </div>
              </div>

              <h4 className="font-heading font-semibold text-sm text-[#141413] line-clamp-1 hover:text-[#143D2B] transition-colors">
                <Link href={`/provider/${provider.providerId}`}>
                  {provider.name}
                </Link>
              </h4>

              <div className="flex items-center gap-1.5 text-xs text-[#52524E]">
                <MapPin className="w-3.5 h-3.5 text-[#143D2B] shrink-0" />
                <span className="truncate">
                  {provider.locality}, {provider.city}
                </span>
              </div>
            </div>
          </div>

          {/* Card Footer: Starting Price & Request Slot Button */}
          <div className="px-4 py-3 bg-[#FAF9F6] border-t border-[#E2DDD5] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#52524E] block leading-none">
                Starting Rate
              </span>
              <span className="font-heading font-bold text-sm text-[#141413] tabular-nums">
                ₹{provider.startingPriceInr.toLocaleString('en-IN')}
              </span>
            </div>

            <Button
              href={`/provider/${provider.providerId}`}
              variant="primary"
              size="sm"
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Request Slot
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
