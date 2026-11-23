import React from 'react';
import { Building2, Search, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ProviderNotFound() {
  return (
    <div className="min-h-[70vh] bg-[#FAF9F6] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E2DC] p-8 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF1EB] border border-[#E5E2DC] flex items-center justify-center mx-auto mb-6 text-[#C25E28]">
          <Building2 className="w-8 h-8 stroke-[1.75]" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-[#FAF1EB] text-[#C25E28] font-semibold text-xs tracking-wider uppercase mb-3">
          Provider Not Listed
        </span>

        <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">
          Establishment Not Found
        </h1>

        <p className="mt-3 text-sm text-ink-muted leading-relaxed">
          The requested hotel, restaurant, or salon establishment could not be found or may have temporarily delisted their booking calendar.
        </p>

        <div className="mt-6 pt-6 border-t border-border-subtle space-y-3">
          <Button
            href="/search"
            variant="primary"
            fullWidth
            leftIcon={<Search className="w-4 h-4" />}
          >
            Browse Verified Venues in Patna
          </Button>

          <Button
            href="/"
            variant="outline"
            fullWidth
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Return to Home
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#52524E]">
          <MapPin className="w-3.5 h-3.5 text-[#143D2B]" />
          <span>Active across Patna &amp; Bihar Launch Corridors</span>
        </div>
      </div>
    </div>
  );
}
