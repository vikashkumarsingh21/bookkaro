/**
 * BOOKKARO Patna Launch Locality & Geocoding Registry
 * Precise geographical coordinates and postal codes for Patna, Bihar
 */

export interface PatnaLocalityDef {
  name: string;
  pincode: string;
  lat: number;
  lng: number;
  aliases: string[];
}

export const PATNA_CENTER_COORDINATES = {
  lat: 25.5941,
  lng: 85.1376,
  name: 'Patna Center',
  pincode: '800001',
};

export const PATNA_LOCALITY_REGISTRY: Record<string, PatnaLocalityDef> = {
  'boring-road': {
    name: 'Boring Road',
    pincode: '800013',
    lat: 25.6179,
    lng: 85.1158,
    aliases: ['boring road', 'boring canal road', 'nageshwar colony', 'anandpuri', '800013'],
  },
  'kankarbagh': {
    name: 'Kankarbagh',
    pincode: '800020',
    lat: 25.5920,
    lng: 85.1550,
    aliases: ['kankarbagh', 'tiwari bechar', 'pc colony', 'lohia nagar', '800020'],
  },
  'fraser-road': {
    name: 'Fraser Road',
    pincode: '800001',
    lat: 25.6093,
    lng: 85.1376,
    aliases: ['fraser road', 'frazer road', 'dak bungalow', 'dakbunglow', 'gandhi maidan', '800001'],
  },
  'bailey-road': {
    name: 'Bailey Road',
    pincode: '800014',
    lat: 25.6110,
    lng: 85.0830,
    aliases: ['bailey road', 'jawaharlal nehru marg', 'raja bazaar', 'saguna more', '800014'],
  },
  'rajendra-nagar': {
    name: 'Rajendra Nagar',
    pincode: '800016',
    lat: 25.6015,
    lng: 85.1610,
    aliases: ['rajendra nagar', 'rajendranagar', 'kumhrar', 'machhua toli', '800016'],
  },
  'dakbunglow': {
    name: 'Dakbunglow',
    pincode: '800001',
    lat: 25.6050,
    lng: 85.1350,
    aliases: ['dakbunglow', 'dak bungalow crossing', 'maurya lok', 'exhibition road', 'station road'],
  },
  'ashok-rajpath': {
    name: 'Ashok Rajpath',
    pincode: '800004',
    lat: 25.6205,
    lng: 85.1680,
    aliases: ['ashok rajpath', 'pmch', 'patna college', 'patna university', 'govind mitra road', '800004'],
  },
  'danapur': {
    name: 'Danapur',
    pincode: '801503',
    lat: 25.6310,
    lng: 85.0450,
    aliases: ['danapur', 'danapur cantt', 'khagaul', 'digha', '801503'],
  },
  'patliputra-colony': {
    name: 'Patliputra Colony',
    pincode: '800013',
    lat: 25.6310,
    lng: 85.1100,
    aliases: ['patliputra', 'patliputra colony', 'kurji', 'alpana market', 'gosaintola'],
  },
  'lalganj-corridor': {
    name: 'Lalganj Corridor',
    pincode: '844121',
    lat: 25.8670,
    lng: 85.1780,
    aliases: ['lalganj', 'lalganj corridor', 'vaishali to patna', '844121'],
  },
};

/**
 * Fast Haversine formula calculation for distance in kilometers
 */
export const haversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
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
  const distance = R * c;

  // Return rounded to 1 decimal place (e.g. 2.4 km)
  return Math.round(distance * 10) / 10;
};

export interface ResolveGeoInput {
  lat?: number | null;
  lng?: number | null;
  locality?: string | null;
  pincode?: string | null;
}

export interface ResolvedTargetLocation {
  lat: number;
  lng: number;
  localityName: string;
  pincode: string;
  isPatnaResolved: boolean;
}

/**
 * Resolves destination search coordinates from target Patna locality or PIN code.
 * Computes distances relative to the selected target destination in Patna, NOT the client's current GPS.
 */
export const resolveTargetCoordinates = (input: ResolveGeoInput): ResolvedTargetLocation => {
  const { lat, lng, locality, pincode } = input;

  // 1. Direct explicit numeric coordinates provided
  if (
    typeof lat === 'number' &&
    !isNaN(lat) &&
    typeof lng === 'number' &&
    !isNaN(lng) &&
    lat >= 25.0 &&
    lat <= 26.5 &&
    lng >= 84.5 &&
    lng <= 86.0
  ) {
    return {
      lat,
      lng,
      localityName: locality || 'Custom Patna Coordinates',
      pincode: pincode || '800001',
      isPatnaResolved: true,
    };
  }

  const queryLocality = (locality || '').trim().toLowerCase();
  const queryPincode = (pincode || '').trim();

  // 2. Match by 6-digit PIN code
  if (/^\d{6}$/.test(queryPincode)) {
    for (const key of Object.keys(PATNA_LOCALITY_REGISTRY)) {
      const item = PATNA_LOCALITY_REGISTRY[key];
      if (item.pincode === queryPincode) {
        return {
          lat: item.lat,
          lng: item.lng,
          localityName: item.name,
          pincode: item.pincode,
          isPatnaResolved: true,
        };
      }
    }
  }

  // 3. Match by locality name or alias
  if (queryLocality) {
    for (const key of Object.keys(PATNA_LOCALITY_REGISTRY)) {
      const item = PATNA_LOCALITY_REGISTRY[key];
      if (
        item.name.toLowerCase() === queryLocality ||
        item.aliases.some((alias) => queryLocality.includes(alias) || alias.includes(queryLocality))
      ) {
        return {
          lat: item.lat,
          lng: item.lng,
          localityName: item.name,
          pincode: item.pincode,
          isPatnaResolved: true,
        };
      }
    }
  }

  // 4. Fallback to Central Fraser Road / Dakbunglow Operations Desk
  return {
    lat: 25.6093,
    lng: 85.1376,
    localityName: 'Fraser Road (Central Patna)',
    pincode: '800001',
    isPatnaResolved: true,
  };
};
