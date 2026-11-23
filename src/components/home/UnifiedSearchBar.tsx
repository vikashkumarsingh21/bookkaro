'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Compass,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { BookingCategory } from '@/types/booking';
import { PATNA_LOCALITIES } from '@/types/bookkaro';

interface UnifiedSearchBarProps {
  initialQuery?: string;
  initialDestination?: string;
  initialNearMe?: boolean;
  initialRadius?: number;
  initialDate?: string;
  initialCategory?: BookingCategory | 'all';
  compact?: boolean;
}

export const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  initialQuery = '',
  initialDestination = 'Patna',
  initialNearMe = false,
  initialRadius = 10,
  initialDate = '2026-11-19',
  initialCategory = 'all',
  compact = false,
}) => {
  const router = useRouter();

  const [serviceQuery, setServiceQuery] = useState(initialQuery);
  const [destination, setDestination] = useState(initialDestination);
  const [isNearMe, setIsNearMe] = useState(initialNearMe);
  const [radius, setRadius] = useState<number>(initialRadius);
  const [date] = useState(initialDate);
  const [selectedCategory, setSelectedCategory] = useState<BookingCategory | 'all'>(
    initialCategory
  );
  const [showRadiusMenu, setShowRadiusMenu] = useState(false);

  const radiusOptions = [
    { value: 5, label: '5 km', hint: 'Walking / Hyperlocal' },
    { value: 10, label: '10 km', hint: 'Within Metro City' },
    { value: 25, label: '25 km', hint: 'Suburban / Outer Ring' },
    { value: 50, label: '50 km', hint: 'Regional / Inter-District' },
  ];

  const quickPopularSuggestions = [
    { label: 'Luxury Stays on Fraser Road', q: 'Luxury Stay', loc: 'Fraser Road, Patna', cat: 'hotels' as BookingCategory },
    { label: 'Champaran Handi on Boring Road', q: 'Champaran Handi', loc: 'Boring Road, Patna', cat: 'restaurants' as BookingCategory },
    { label: 'Ayurvedic Spas in Patliputra', q: 'Ayurvedic Spa', loc: 'Patliputra Colony, Patna', cat: 'salon' as BookingCategory },
  ];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();
    if (serviceQuery.trim()) params.set('q', serviceQuery.trim());
    if (selectedCategory !== 'all') params.set('cat', selectedCategory);
    if (isNearMe) {
      params.set('nearMe', 'true');
    } else if (destination.trim()) {
      params.set('dest', destination.trim());
    }
    params.set('radius', radius.toString());
    if (date) params.set('date', date);

    router.push(`/search?${params.toString()}`);
  };

  const applySuggestion = (suggestion: { q: string; loc: string; cat?: BookingCategory }) => {
    setServiceQuery(suggestion.q);
    setDestination(suggestion.loc);
    setIsNearMe(false);
    if (suggestion.cat) setSelectedCategory(suggestion.cat);

    const params = new URLSearchParams();
    params.set('q', suggestion.q);
    params.set('dest', suggestion.loc);
    if (suggestion.cat) params.set('cat', suggestion.cat);
    params.set('radius', radius.toString());
    params.set('date', date);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Main Unified Search Container: Crisp Warm Ivory card with hairline border */}
      <form
        onSubmit={handleSearch}
        className={`
          bg-[#FCFBF8] rounded-2xl border border-[#DDD5C7] transition-all shadow-[0_2px_8px_rgba(20,20,19,0.04)]
          ${compact ? 'p-2' : 'p-3 sm:p-4'}
        `}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* 1. What / Service Query */}
          <div className="md:col-span-5 relative">
            <div className="flex items-center px-3 py-2 rounded-xl bg-white border border-[#8A8175] focus-within:border-[#163829] focus-within:ring-1 focus-within:ring-[#163829] transition-all">
              <Search className="w-4 h-4 text-[#595148] shrink-0 mr-2.5" />
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#595148] leading-none mb-1">
                  Venue or Experience
                </span>
                <input
                  type="text"
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  placeholder="e.g. Heritage Suite, Champaran Handi, Hair Spa..."
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#1C1815] placeholder-[#595148]/60 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Where / Destination or Near Me */}
          <div className="md:col-span-4 relative">
            <div className="flex items-center px-3 py-2 rounded-xl bg-white border border-[#8A8175] focus-within:border-[#163829] focus-within:ring-1 focus-within:ring-[#163829] transition-all">
              <MapPin className="w-4 h-4 text-[#163829] shrink-0 mr-2.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#595148] leading-none">
                    Patna Location
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNearMe(!isNearMe);
                      if (!isNearMe) setDestination('Current Location (Near Me)');
                      else setDestination('Patna');
                    }}
                    className="text-[10px] font-bold text-[#163829] hover:underline cursor-pointer"
                  >
                    {isNearMe ? 'Custom Locality' : 'Use Near Me'}
                  </button>
                </div>
                {isNearMe ? (
                  <div className="text-xs sm:text-sm font-semibold text-[#163829] flex items-center gap-1.5 py-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#163829] animate-pulse" />
                    <span>Near Me GPS (Patna Metro)</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    list="home-patna-localities"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Locality or PIN (e.g. Fraser Rd, 800001)"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#1C1815] placeholder-[#595148]/60 focus:outline-none"
                  />
                )}
                <datalist id="home-patna-localities">
                  {PATNA_LOCALITIES.map((loc) => (
                    <option
                      key={loc.name}
                      value={`${loc.name}, Patna (${loc.pincode})`}
                    />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* 3. Search Radius Selector & Action Button */}
          <div className="md:col-span-3 flex items-center gap-2">
            {/* Radius Button */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowRadiusMenu(!showRadiusMenu)}
                className="h-12 px-3 rounded-xl bg-white border border-[#8A8175] text-xs font-semibold text-[#1C1815] hover:border-[#163829] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Discovery Radius"
              >
                <Sliders className="w-3.5 h-3.5 text-[#595148]" />
                <span className="tabular-nums">{radius} km</span>
                <ChevronDown className="w-3 h-3 text-[#595148]" />
              </button>

              {showRadiusMenu && (
                <div
                  className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#FCFBF8] border border-[#DDD5C7] p-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100 shadow-lg text-left"
                  onMouseLeave={() => setShowRadiusMenu(false)}
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#595148]">
                    Max Radial Distance
                  </div>
                  {radiusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setRadius(opt.value);
                        setShowRadiusMenu(false);
                      }}
                      className={`
                        w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-[#EAE3D5] transition-colors
                        ${radius === opt.value ? 'bg-[#EAE3D5] text-[#163829] font-bold' : 'text-[#1C1815]'}
                      `}
                    >
                      <span className="tabular-nums">{opt.label}</span>
                      <span className="text-[10px] text-[#595148]">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Action: Deep Heritage Forest button with crisp Ivory text */}
            <button
              type="submit"
              className="flex-1 h-12 px-5 rounded-xl bg-[#163829] hover:bg-[#0F271C] text-[#FCFBF8] text-xs sm:text-sm font-bold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-none border border-[#163829] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#163829]"
            >
              <Search className="w-4 h-4 text-[#FCFBF8]" />
              <span>Discover</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        {!compact && (
          <div className="mt-3 pt-3 border-t border-[#DDD5C7]/70 flex flex-wrap items-center gap-1.5 text-xs text-[#595148]">
            <span className="text-[11px] font-semibold text-[#1C1815] flex items-center gap-1 mr-1">
              <Compass className="w-3 h-3 text-[#163829]" />
              <span>Patna Curations:</span>
            </span>
            {quickPopularSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applySuggestion(item)}
                className="px-2.5 py-1 rounded-lg bg-[#EAE3D5]/50 hover:bg-[#EAE3D5] text-[#1C1815] font-medium text-[11px] transition-colors cursor-pointer border border-[#DDD5C7]/50"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
