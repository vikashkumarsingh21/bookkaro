import { BookingCategory } from '@/types/booking';
import { MockProvider, MOCK_PROVIDERS_DATA } from '@/data/mockProviders';
import {
  calculateHaversineDistanceKm,
  resolveDestination,
  DEFAULT_USER_NEAR_ME_COORDS,
} from './geo';

export interface SearchFilterCriteria {
  query?: string;
  category?: BookingCategory | 'all';
  destinationInput?: string; // e.g. "Patna", "Kalawad Road", "800001"
  isNearMe?: boolean;
  radiusKm?: number; // 5, 10, 25, 50
  selectedDate?: string; // YYYY-MM-DD
  minRating?: number;
  maxPriceInr?: number;
  verifiedOnly?: boolean;
  openNowOnly?: boolean;
  sortBy?: 'relevance' | 'distance' | 'rating' | 'price_asc' | 'price_desc';
}

export interface SearchRankingResult {
  providers: MockProvider[];
  totalMatches: number;
  effectiveDestination: {
    displayText: string;
    coordinates: { lat: number; lng: number };
    isNearMe: boolean;
  };
}

export function executeDiscoverySearch(
  criteria: SearchFilterCriteria
): SearchRankingResult {
  const {
    query = '',
    category = 'all',
    destinationInput = '',
    isNearMe = false,
    radiusKm = 25,
    selectedDate,
    minRating = 0,
    maxPriceInr,
    verifiedOnly = false,
    openNowOnly = false,
    sortBy = 'relevance',
  } = criteria;

  // 1. Determine origin coordinates for distance calculation
  let originCoords = DEFAULT_USER_NEAR_ME_COORDS;
  let displayText = 'Current Location (Near Me)';

  if (!isNearMe && destinationInput.trim().length > 0) {
    const resolved = resolveDestination(destinationInput);
    originCoords = {
      lat: resolved.coordinates.lat,
      lng: resolved.coordinates.lng,
      city: resolved.city,
      locality: resolved.locality || resolved.city,
    };
    displayText = resolved.displayText;
  } else if (!isNearMe) {
    // If neither near me nor custom location was typed, resolve to Patna as default
    const resolved = resolveDestination('Patna');
    originCoords = {
      lat: resolved.coordinates.lat,
      lng: resolved.coordinates.lng,
      city: resolved.city,
      locality: resolved.locality || resolved.city,
    };
    displayText = resolved.displayText;
  }

  // 2. Compute distance for all providers from this destination point
  const providersWithDistance: MockProvider[] = MOCK_PROVIDERS_DATA.map((prov) => {
    const dist = calculateHaversineDistanceKm(
      originCoords.lat,
      originCoords.lng,
      prov.coordinates.lat,
      prov.coordinates.lng
    );
    return {
      ...prov,
      calculatedDistanceKm: dist,
    };
  });

  // 3. Filter by criteria
  const qLower = query.trim().toLowerCase();

  const filtered = providersWithDistance.filter((prov) => {
    // Category match
    if (category !== 'all' && prov.category !== category) {
      return false;
    }

    // Query match across name, subCategory, services, description, and locality
    if (qLower.length > 0) {
      const nameMatch = prov.name.toLowerCase().includes(qLower);
      const subMatch = prov.subCategory.toLowerCase().includes(qLower);
      const descMatch = prov.description.toLowerCase().includes(qLower);
      const locMatch = prov.locality.toLowerCase().includes(qLower);
      const cityMatch = prov.city.toLowerCase().includes(qLower);
      const serviceMatch = prov.services.some((s) =>
        s.name.toLowerCase().includes(qLower)
      );

      // Category semantic aliases (e.g. "car wash" -> vehicle_care, "doctor" -> healthcare)
      let aliasMatch = false;
      if (qLower.includes('car wash') || qLower.includes('wash') || qLower.includes('mechanic')) {
        aliasMatch = prov.category === 'vehicle_care';
      } else if (qLower.includes('clinic') || qLower.includes('doctor') || qLower.includes('opd')) {
        aliasMatch = prov.category === 'healthcare';
      } else if (qLower.includes('hotel') || qLower.includes('stay') || qLower.includes('room')) {
        aliasMatch = prov.category === 'hotels';
      } else if (qLower.includes('food') || qLower.includes('restaurant') || qLower.includes('thali') || qLower.includes('table')) {
        aliasMatch = prov.category === 'restaurants';
      } else if (qLower.includes('salon') || qLower.includes('hair') || qLower.includes('spa')) {
        aliasMatch = prov.category === 'salon';
      }

      if (!nameMatch && !subMatch && !descMatch && !locMatch && !cityMatch && !serviceMatch && !aliasMatch) {
        return false;
      }
    }

    // Radius filter (only if provider is further than radiusKm)
    if (radiusKm && (prov.calculatedDistanceKm ?? 9999) > radiusKm) {
      return false;
    }

    // Date availability
    if (selectedDate && !prov.availableDates.includes(selectedDate)) {
      return false;
    }

    // Rating filter
    if (minRating > 0 && prov.rating < minRating) {
      return false;
    }

    // Max Price filter
    if (maxPriceInr !== undefined && maxPriceInr > 0 && prov.startingPriceInr > maxPriceInr) {
      return false;
    }

    // Verified only filter
    if (verifiedOnly && !prov.isVerified) {
      return false;
    }

    // Open now filter
    if (openNowOnly && !prov.isOpenNow) {
      return false;
    }

    return true;
  });

  // 4. Rank results according to CORE PRODUCT LOGIC:
  // "Ranking rule: Relevance first, then distance from selected destination, real availability, verified status, and rating. Clearly label any future paid placement as 'Sponsored'."
  filtered.sort((a, b) => {
    // If specific sort requested
    if (sortBy === 'distance') {
      return (a.calculatedDistanceKm ?? 0) - (b.calculatedDistanceKm ?? 0);
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'price_asc') {
      return a.startingPriceInr - b.startingPriceInr;
    }
    if (sortBy === 'price_desc') {
      return b.startingPriceInr - a.startingPriceInr;
    }

    // Default 'relevance' composite score:
    // 1. Sponsored boost
    if (a.isSponsored && !b.isSponsored) return -1;
    if (!a.isSponsored && b.isSponsored) return 1;

    // 2. Distance from selected destination
    const distDiff = (a.calculatedDistanceKm ?? 0) - (b.calculatedDistanceKm ?? 0);
    if (Math.abs(distDiff) >= 1.5) {
      return distDiff;
    }

    // 3. Verified status
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;

    // 4. Rating & reviews
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }

    return b.reviewCount - a.reviewCount;
  });

  return {
    providers: filtered,
    totalMatches: filtered.length,
    effectiveDestination: {
      displayText,
      coordinates: originCoords,
      isNearMe,
    },
  };
}
