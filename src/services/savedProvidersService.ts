import { INITIAL_SAVED_PROVIDERS, SavedProviderItem } from '@/data/mockDashboardBookings';

const STORAGE_KEY_SAVED = 'bookkaro_saved_patna_providers_v1';

let savedProvidersState: SavedProviderItem[] = [...INITIAL_SAVED_PROVIDERS];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

function loadFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        savedProvidersState = parsed;
      }
    }
  } catch {
    // fallback to in-memory state
  }
}

function saveToStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedProvidersState));
  } catch {
    // ignore
  }
}

// Initial hydration on client
loadFromStorage();

export const savedProvidersService = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSavedProviders(): SavedProviderItem[] {
    loadFromStorage();
    return [...savedProvidersState];
  },

  isProviderSaved(providerId: string): boolean {
    loadFromStorage();
    return savedProvidersState.some(
      (p) => p.providerId === providerId || p.id === providerId
    );
  },

  toggleSaveProvider(provider: {
    id?: string;
    providerId: string;
    name: string;
    category: 'healthcare' | 'hotels' | 'restaurants' | 'salon' | 'vehicle_care';
    subCategory?: string;
    city?: string;
    locality?: string;
    rating: number;
    reviewCount: number;
    startingPriceInr: number;
    image: string;
  }): boolean {
    loadFromStorage();
    const existingIndex = savedProvidersState.findIndex(
      (p) => p.providerId === provider.providerId || p.id === provider.id
    );

    let isNowSaved: boolean;
    if (existingIndex !== -1) {
      // Remove from saved
      savedProvidersState = savedProvidersState.filter((_, idx) => idx !== existingIndex);
      isNowSaved = false;
    } else {
      // Add to saved
      const newItem: SavedProviderItem = {
        id: provider.id || `fav-${Date.now().toString(36)}`,
        providerId: provider.providerId,
        name: provider.name,
        category: provider.category,
        subCategory: provider.subCategory || 'Patna Verified Partner',
        city: provider.city || 'Patna',
        locality: provider.locality || 'Patna Central',
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        startingPriceInr: provider.startingPriceInr,
        image: provider.image,
        savedAt: new Date().toISOString().split('T')[0],
      };
      savedProvidersState = [newItem, ...savedProvidersState];
      isNowSaved = true;
    }

    saveToStorage();
    notifyListeners();
    return isNowSaved;
  },

  removeSavedProvider(providerIdOrId: string): void {
    loadFromStorage();
    savedProvidersState = savedProvidersState.filter(
      (p) => p.id !== providerIdOrId && p.providerId !== providerIdOrId
    );
    saveToStorage();
    notifyListeners();
  },
};
