import { BookingCategory } from '@/types/booking';
import { PATNA_PROVIDERS } from './patnaProviders';

export interface ProviderServiceItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
}

export interface ProviderDoctorItem {
  id: string;
  name: string;
  qualification: string;
  specialty: string;
}

export interface ProviderRoomTypeItem {
  id: string;
  name: string;
  pricePerNight: number;
  maxGuests: number;
  bedType: string;
  amenities: string[];
}

export interface ProviderAddonItem {
  id: string;
  name: string;
  price: number;
  durationMinutes?: number;
  description: string;
}

export interface ProviderReviewItem {
  id: string;
  authorName: string;
  city: string;
  rating: number;
  date: string;
  serviceBooked: string;
  comment: string;
  isVerifiedBooking: boolean;
}

export interface MockProvider {
  id: string;
  slug: string;
  name: string;
  legalBusinessName: string;
  category: BookingCategory;
  subCategory: string;
  tagline: string;
  description: string;
  city: 'Patna';
  locality: string;
  pincode: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isSponsored?: boolean;
  isOpenNow: boolean;
  operatingHours: {
    days: string;
    hours: string;
    sundayHours?: string;
  };
  priceRange: {
    min: number;
    max: number;
    currency: 'INR';
  };
  startingPriceInr: number;
  nextAvailableSlot: string; // e.g. "Today, 2:30 PM"
  availableDates: string[]; // ["2026-11-19", "2026-11-20", "2026-11-21"]
  timeSlots: string[]; // ["10:00 AM", "11:30 AM", "02:30 PM", "04:00 PM", "06:30 PM"]
  images: string[];
  badges: string[];
  services: ProviderServiceItem[];
  phone: string;
  email?: string;
  gstin?: string;
  calculatedDistanceKm?: number; // Injected dynamically relative to search destination
  
  // Category-specific details
  doctors?: ProviderDoctorItem[];
  departments?: string[];
  branches?: string[];
  roomTypes?: ProviderRoomTypeItem[];
  seatingAreas?: string[];
  staffOrBays?: string[];
  addons?: ProviderAddonItem[];
  
  // Policy & Reviews
  cancellationPolicy: string;
  disclaimer?: string;
  reviews: ProviderReviewItem[];
}

export interface CityDestination {
  city: string;
  state: string;
  pincodePrefix: string;
  centerCoordinates: {
    lat: number;
    lng: number;
  };
  popularLocalities: Array<{
    name: string;
    pincode: string;
    coordinates: { lat: number; lng: number };
  }>;
}

export const DESTINATION_REGISTRY: Record<string, CityDestination> = {
  patna: {
    city: 'Patna',
    state: 'Bihar',
    pincodePrefix: '800',
    centerCoordinates: { lat: 25.5941, lng: 85.1376 },
    popularLocalities: [
      { name: 'Fraser Road', pincode: '800001', coordinates: { lat: 25.6093, lng: 85.1376 } },
      { name: 'Boring Road', pincode: '800001', coordinates: { lat: 25.6179, lng: 85.1158 } },
      { name: 'Kankarbagh', pincode: '800020', coordinates: { lat: 25.5920, lng: 85.1550 } },
      { name: 'Bailey Road', pincode: '800014', coordinates: { lat: 25.6110, lng: 85.0830 } },
      { name: 'Rajendra Nagar', pincode: '800016', coordinates: { lat: 25.6015, lng: 85.1610 } },
      { name: 'Dakbunglow', pincode: '800001', coordinates: { lat: 25.6050, lng: 85.1350 } },
      { name: 'Patliputra Colony', pincode: '800013', coordinates: { lat: 25.6310, lng: 85.1100 } },
      { name: 'Danapur', pincode: '801503', coordinates: { lat: 25.6310, lng: 85.0450 } },
      { name: 'Ashok Rajpath', pincode: '800004', coordinates: { lat: 25.6205, lng: 85.1680 } },
      { name: 'Raja Bazaar', pincode: '800014', coordinates: { lat: 25.6140, lng: 85.0920 } },
      { name: 'Exhibition Road', pincode: '800001', coordinates: { lat: 25.6070, lng: 85.1420 } },
      { name: 'Anisabad', pincode: '800002', coordinates: { lat: 25.5820, lng: 85.0970 } },
      { name: 'Lalganj', pincode: '844121', coordinates: { lat: 25.8670, lng: 85.1780 } },
    ],
  },
};

export const MOCK_PROVIDERS_DATA: MockProvider[] = PATNA_PROVIDERS as unknown as MockProvider[];
