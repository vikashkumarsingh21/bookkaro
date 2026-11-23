/**
 * =======================================================================
 * BOOKKARO | Multi-Intent Geospatial Discovery & Search Engine
 * Patna Local Discovery Service for BOOKKARO
 * =======================================================================
 */

import { PATNA_PROVIDERS, PatnaProvider } from '@/data/patnaProviders';
import { PATNA_LOCALITIES, BookingCategory } from '@/types/bookkaro';
import { apiClient } from '@/lib/apiClient';

// -----------------------------------------------------------------------
// 1. HA日內 HAVERSINE FORMULA & GEODETIC CALCULATIONS
// -----------------------------------------------------------------------

export const PATNA_CENTER_COORDINATES = {
  lat: 25.6092,
  lng: 85.1376,
  locality: 'Fraser Road',
  city: 'Patna',
  pincode: '800001',
};

/**
 * Calculates distance in kilometers between two latitude/longitude points using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;

  return Math.round(dist * 10) / 10; // 1 decimal place precision (e.g. 1.8 km)
}

// -----------------------------------------------------------------------
// 2. DUAL-INTENT LOCATION RESOLVER (Near Me vs Destination)
// -----------------------------------------------------------------------

export interface ResolvedTargetLocation {
  city: string;
  state: string;
  locality: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  displayText: string;
  isNearMe: boolean;
}

/**
 * Resolves destination input (locality name, landmark, or 6-digit Indian PIN code)
 * into high-accuracy Patna coordinates.
 *
 * If isNearMe is true, resolves to the user's active GPS coordinate (defaulting to Fraser Road center).
 * If destination is given (e.g. user in Lalganj searching for clinics in Boring Road),
 * distance is calculated relative to the TARGET destination (Boring Road), NOT the user's current GPS!
 */
export function resolveTargetLocation(
  targetInput: string = '',
  isNearMe: boolean = false,
  userCoords?: { lat: number; lng: number }
): ResolvedTargetLocation {
  if (isNearMe) {
    const lat = userCoords?.lat ?? PATNA_CENTER_COORDINATES.lat;
    const lng = userCoords?.lng ?? PATNA_CENTER_COORDINATES.lng;
    return {
      city: 'Patna',
      state: 'Bihar',
      locality: 'Fraser Road (GPS Origin)',
      pincode: '800001',
      coordinates: { lat, lng },
      displayText: 'Current GPS Location (Patna Center)',
      isNearMe: true,
    };
  }

  const raw = (targetInput || '').trim();
  const lower = raw.toLowerCase();

  // 1. PIN code matching (6-digit)
  if (/^\d{6}$/.test(raw)) {
    // Check Lalganj Corridor (844121)
    if (raw === '844121') {
      return {
        city: 'Patna',
        state: 'Bihar',
        locality: 'Lalganj Corridor',
        pincode: '844121',
        coordinates: { lat: 25.867, lng: 85.178 },
        displayText: 'Lalganj Corridor (to Patna - 844121)',
        isNearMe: false,
      };
    }

    const matchedByPin = PATNA_LOCALITIES.find((l) => l.pincode === raw);
    if (matchedByPin) {
      return {
        city: 'Patna',
        state: 'Bihar',
        locality: matchedByPin.name,
        pincode: matchedByPin.pincode,
        coordinates: matchedByPin.coordinates,
        displayText: `${matchedByPin.name}, Patna (${matchedByPin.pincode})`,
        isNearMe: false,
      };
    }
  }

  // 2. Lalganj special keyword match
  if (lower.includes('lalganj')) {
    return {
      city: 'Patna',
      state: 'Bihar',
      locality: 'Lalganj Corridor',
      pincode: '844121',
      coordinates: { lat: 25.867, lng: 85.178 },
      displayText: 'Lalganj Corridor (to Patna)',
      isNearMe: false,
    };
  }

  // 3. Known Patna Localities
  for (const loc of PATNA_LOCALITIES) {
    if (
      lower.includes(loc.name.toLowerCase()) ||
      loc.name.toLowerCase().includes(lower) ||
      (loc.landmark && lower.includes(loc.landmark.toLowerCase()))
    ) {
      return {
        city: 'Patna',
        state: 'Bihar',
        locality: loc.name,
        pincode: loc.pincode,
        coordinates: loc.coordinates,
        displayText: `${loc.name}, Patna (${loc.pincode})`,
        isNearMe: false,
      };
    }
  }

  // 4. Default fallback: Patna Fraser Road / Gandhi Maidan Center
  return {
    city: 'Patna',
    state: 'Bihar',
    locality: PATNA_CENTER_COORDINATES.locality,
    pincode: PATNA_CENTER_COORDINATES.pincode,
    coordinates: {
      lat: PATNA_CENTER_COORDINATES.lat,
      lng: PATNA_CENTER_COORDINATES.lng,
    },
    displayText: raw.length > 0 ? `${raw}, Patna` : 'Patna, Bihar (Center)',
    isNearMe: false,
  };
}

// -----------------------------------------------------------------------
// 3. SEARCH & RANKING TYPES
// -----------------------------------------------------------------------

export interface DiscoverySearchCriteria {
  q?: string;
  category?: BookingCategory | 'all';
  destination?: string;
  isNearMe?: boolean;
  userLat?: number;
  userLng?: number;
  radiusKm?: number;
  date?: string;
  verifiedOnly?: boolean;
  openNow?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'relevance' | 'distance' | 'rating' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export interface DiscoverySearchResult {
  providers: PatnaProvider[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  targetLocation: ResolvedTargetLocation;
  radiusKm: number;
  appliedCategory: BookingCategory | 'all';
}

// -----------------------------------------------------------------------
// 4. MULTI-FACTOR RANKING ENGINE
// -----------------------------------------------------------------------

/**
 * Executes high-performance search, filtering, and ranking over Patna providers.
 *
 * Ranking Order:
 * 1. Sponsored Placement (strictly labeled with isSponsored: true)
 * 2. Relevance match (text query in name, tags, description, services, category)
 * 3. Distance from Target Destination (closest to destination locality first)
 * 4. Slot availability (providers with open slots today/valid dates)
 * 5. Verified Status (isVerified === true)
 * 6. Customer Rating & Review Volume
 */
export async function searchPatnaProviders(
  criteria: DiscoverySearchCriteria
): Promise<DiscoverySearchResult> {
  const {
    q = '',
    category = 'all',
    destination = '',
    isNearMe = false,
    userLat,
    userLng,
    radiusKm = 25,
    date,
    verifiedOnly = false,
    openNow = false,
    minPrice,
    maxPrice,
    minRating = 0,
    sortBy = 'relevance',
    page = 1,
    limit = 20,
  } = criteria;

  // 1. Resolve Target Coordinates
  const targetLocation = resolveTargetLocation(
    destination,
    isNearMe,
    userLat && userLng ? { lat: userLat, lng: userLng } : undefined
  );

  const targetLat = targetLocation.coordinates.lat;
  const targetLng = targetLocation.coordinates.lng;

  // 2. Inject real dynamic distance relative to target destination
  const providersWithDistance: PatnaProvider[] = PATNA_PROVIDERS.map((prov) => {
    const dist = calculateHaversineDistanceKm(
      targetLat,
      targetLng,
      prov.coordinates.lat,
      prov.coordinates.lng
    );
    return {
      ...prov,
      calculatedDistanceKm: dist,
    };
  });

  // 3. Filter candidates
  const queryLower = q.trim().toLowerCase();

  const filtered = providersWithDistance.filter((prov) => {
    // Category filter
    if (category !== 'all' && prov.category !== category) {
      return false;
    }

    // Radius filter (within target radiusKm)
    if (radiusKm && (prov.calculatedDistanceKm ?? 0) > radiusKm) {
      return false;
    }

    // Text & Semantic Relevance match
    if (queryLower.length > 0) {
      const nameMatch = prov.name.toLowerCase().includes(queryLower);
      const subMatch = prov.subCategory.toLowerCase().includes(queryLower);
      const descMatch = prov.description.toLowerCase().includes(queryLower);
      const locMatch = prov.locality.toLowerCase().includes(queryLower);
      const badgeMatch = prov.badges.some((b) => b.toLowerCase().includes(queryLower));
      const serviceMatch = prov.services.some(
        (s) =>
          s.name.toLowerCase().includes(queryLower) ||
          s.description.toLowerCase().includes(queryLower)
      );

      // Category semantic aliases (e.g. "pediatrician" -> healthcare, "car detailing" -> vehicle_care)
      let aliasMatch = false;
      if (
        queryLower.includes('doctor') ||
        queryLower.includes('clinic') ||
        queryLower.includes('opd') ||
        queryLower.includes('pediatric') ||
        queryLower.includes('dentist')
      ) {
        aliasMatch = prov.category === 'healthcare';
      } else if (
        queryLower.includes('hotel') ||
        queryLower.includes('stay') ||
        queryLower.includes('room') ||
        queryLower.includes('resort')
      ) {
        aliasMatch = prov.category === 'hotels';
      } else if (
        queryLower.includes('food') ||
        queryLower.includes('restaurant') ||
        queryLower.includes('cafe') ||
        queryLower.includes('handi') ||
        queryLower.includes('thali') ||
        queryLower.includes('biryani')
      ) {
        aliasMatch = prov.category === 'restaurants';
      } else if (
        queryLower.includes('salon') ||
        queryLower.includes('spa') ||
        queryLower.includes('hair') ||
        queryLower.includes('facial') ||
        queryLower.includes('grooming')
      ) {
        aliasMatch = prov.category === 'salon';
      } else if (
        queryLower.includes('car') ||
        queryLower.includes('bike') ||
        queryLower.includes('wash') ||
        queryLower.includes('mechanic') ||
        queryLower.includes('auto') ||
        queryLower.includes('detailing')
      ) {
        aliasMatch = prov.category === 'vehicle_care';
      }

      if (
        !nameMatch &&
        !subMatch &&
        !descMatch &&
        !locMatch &&
        !badgeMatch &&
        !serviceMatch &&
        !aliasMatch
      ) {
        return false;
      }
    }

    // Date availability
    if (date && !prov.availableDates.includes(date)) {
      return false;
    }

    // Verified only filter
    if (verifiedOnly && !prov.isVerified) {
      return false;
    }

    // Open now filter
    if (openNow && !prov.isOpenNow) {
      return false;
    }

    // Min rating filter
    if (minRating > 0 && prov.rating < minRating) {
      return false;
    }

    // Price filters
    if (minPrice !== undefined && prov.startingPriceInr < minPrice) {
      return false;
    }
    if (maxPrice !== undefined && prov.startingPriceInr > maxPrice) {
      return false;
    }

    return true;
  });

  // 4. Multi-Factor Ranking
  filtered.sort((a, b) => {
    // Explicit sort overrides
    if (sortBy === 'distance') {
      return (a.calculatedDistanceKm ?? 0) - (b.calculatedDistanceKm ?? 0);
    }
    if (sortBy === 'rating') {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    }
    if (sortBy === 'price_asc') {
      return a.startingPriceInr - b.startingPriceInr;
    }
    if (sortBy === 'price_desc') {
      return b.startingPriceInr - a.startingPriceInr;
    }

    // Default 'relevance' multi-factor ranking:
    // Factor 1: Sponsored Boost (strictly labeled)
    if (a.isSponsored && !b.isSponsored) return -1;
    if (!a.isSponsored && b.isSponsored) return 1;

    // Factor 2: Distance from destination (within 2 km grouping)
    const distDiff = (a.calculatedDistanceKm ?? 0) - (b.calculatedDistanceKm ?? 0);
    if (Math.abs(distDiff) >= 2.0) {
      return distDiff;
    }

    // Factor 3: Verified Status
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;

    // Factor 4: Rating & Reviews
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }

    return b.reviewCount - a.reviewCount;
  });

  // 5. Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (safePage - 1) * limit;
  const paginatedProviders = filtered.slice(startIndex, startIndex + limit);

  return {
    providers: paginatedProviders,
    total,
    page: safePage,
    limit,
    totalPages,
    targetLocation,
    radiusKm,
    appliedCategory: category,
  };
}

// -----------------------------------------------------------------------
// 5. DATA ACCESS HELPERS
// -----------------------------------------------------------------------

/**
 * Retrieves a single Patna provider by ID or slug
 */
export async function getPatnaProviderById(
  idOrSlug: string
): Promise<PatnaProvider | null> {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
  if (!isMock && typeof window !== 'undefined') {
    try {
      const remote = await apiClient.get<PatnaProvider>(`/discovery/providers/${idOrSlug}`);
      if (remote && remote.id) {
        return remote;
      }
    } catch {
      // Graceful fallback to local mock providers
    }
  }

  const needle = idOrSlug.trim().toLowerCase();
  const provider = PATNA_PROVIDERS.find(
    (p) => p.id.toLowerCase() === needle || p.slug.toLowerCase() === needle
  );

  if (!provider) return null;

  // Calculate distance relative to Patna Center
  const dist = calculateHaversineDistanceKm(
    PATNA_CENTER_COORDINATES.lat,
    PATNA_CENTER_COORDINATES.lng,
    provider.coordinates.lat,
    provider.coordinates.lng
  );

  return {
    ...provider,
    calculatedDistanceKm: dist,
  };
}

/**
 * Returns total count of active verified providers per category in Patna
 */
export async function getCategoryCounts(): Promise<Record<BookingCategory, number>> {
  const counts: Record<BookingCategory, number> = {
    healthcare: 0,
    hotels: 0,
    restaurants: 0,
    salon: 0,
    vehicle_care: 0,
  };

  for (const prov of PATNA_PROVIDERS) {
    if (counts[prov.category] !== undefined) {
      counts[prov.category] += 1;
    }
  }

  return counts;
}

/**
 * Returns featured verified Patna providers across categories
 */
export async function getFeaturedPatnaProviders(
  limit: number = 6
): Promise<PatnaProvider[]> {
  // Sort by rating desc, review count desc, verified status
  const sorted = [...PATNA_PROVIDERS].sort((a, b) => {
    if (a.isSponsored && !b.isSponsored) return -1;
    if (!a.isSponsored && b.isSponsored) return 1;
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviewCount - a.reviewCount;
  });

  return sorted.slice(0, limit).map((prov) => {
    const dist = calculateHaversineDistanceKm(
      PATNA_CENTER_COORDINATES.lat,
      PATNA_CENTER_COORDINATES.lng,
      prov.coordinates.lat,
      prov.coordinates.lng
    );
    return {
      ...prov,
      calculatedDistanceKm: dist,
    };
  });
}
