import { DESTINATION_REGISTRY } from '@/data/mockProviders';

/**
 * Calculates distance in kilometers between two geo-coordinates using the Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place (e.g. 2.4 km)
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface ResolvedDestination {
  city: string;
  state: string;
  locality?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  displayText: string;
}

/**
 * Resolves freeform destination search query (locality, or 6-digit Indian PIN code)
 * Strictly defaults to Patna, Bihar for launch
 */
export function resolveDestination(input: string): ResolvedDestination {
  const query = (input || '').trim().toLowerCase();

  // 1. Check PIN code matches
  if (/^\d{6}$/.test(query)) {
    // Lalganj (Vaishali / Patna corridor PIN)
    if (query === '844121') {
      return {
        city: 'Patna',
        state: 'Bihar',
        locality: 'Lalganj',
        coordinates: { lat: 25.8670, lng: 85.1780 },
        displayText: 'Lalganj (to Patna Corridor - 844121)',
      };
    }

    if (query.startsWith('800') || query.startsWith('801')) {
      const matchLoc = DESTINATION_REGISTRY.patna.popularLocalities.find(
        (l) => l.pincode === query
      );
      return {
        city: 'Patna',
        state: 'Bihar',
        locality: matchLoc ? matchLoc.name : undefined,
        coordinates: matchLoc ? matchLoc.coordinates : DESTINATION_REGISTRY.patna.centerCoordinates,
        displayText: matchLoc ? `${matchLoc.name}, Patna (${query})` : `Patna, Bihar (${query})`,
      };
    }
  }

  // 2. Check Lalganj special destination-to-Patna search flow
  if (query.includes('lalganj')) {
    return {
      city: 'Patna',
      state: 'Bihar',
      locality: 'Lalganj',
      coordinates: { lat: 25.8670, lng: 85.1780 },
      displayText: 'Lalganj (to Patna Corridor)',
    };
  }

  // 3. Check Patna Localities
  const patnaDest = DESTINATION_REGISTRY.patna;
  for (const loc of patnaDest.popularLocalities) {
    if (
      query.includes(loc.name.toLowerCase()) ||
      loc.name.toLowerCase().includes(query)
    ) {
      return {
        city: 'Patna',
        state: 'Bihar',
        locality: loc.name,
        coordinates: loc.coordinates,
        displayText: `${loc.name}, Patna`,
      };
    }
  }

  // Default fallback: Patna, Bihar
  return {
    city: 'Patna',
    state: 'Bihar',
    coordinates: DESTINATION_REGISTRY.patna.centerCoordinates,
    displayText: 'Patna, Bihar',
  };
}

/**
 * Simulated GPS User Location for "Near Me" mode
 * In production, uses navigator.geolocation; fallback is set to Fraser Road, Patna
 */
export const DEFAULT_USER_NEAR_ME_COORDS = {
  lat: 25.6093,
  lng: 85.1376, // Fraser Road, Patna
  city: 'Patna',
  locality: 'Fraser Road',
};
