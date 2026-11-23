/**
 * =======================================================================
 * BOOKKARO | Patna-Only Provider Seed Dataset
 * Verified Local Merchants across 5 Core Marketplace Categories
 * Curated for Exclusive Launch in Patna, Bihar
 * =======================================================================
 */

import { BookingCategory } from '@/types/bookkaro';

export interface ProviderService {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
}

export interface ProviderDoctor {
  id: string;
  name: string;
  qualification: string;
  specialty: string;
}

export interface ProviderRoomType {
  id: string;
  name: string;
  pricePerNight: number;
  maxGuests: number;
  bedType: string;
  amenities: string[];
}

export interface ProviderAddon {
  id: string;
  name: string;
  price: number;
  durationMinutes?: number;
  description: string;
}

export interface ProviderReview {
  id: string;
  authorName: string;
  city: string;
  rating: number;
  date: string;
  serviceBooked: string;
  comment: string;
  isVerifiedBooking: boolean;
}

export interface PatnaProvider {
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
  nextAvailableSlot: string;
  availableDates: string[];
  timeSlots: string[];
  images: string[];
  badges: string[];
  services: ProviderService[];
  phone: string;
  email: string;
  gstin: string;
  doctors?: ProviderDoctor[];
  departments?: string[];
  branches?: string[];
  roomTypes?: ProviderRoomType[];
  menuHighlights?: string[];
  seatingTypes?: string[];
  stylists?: string[];
  staffOrBays?: string[];
  addons?: ProviderAddon[];
  cancellationPolicy: string;
  disclaimer: string;
  reviews: ProviderReview[];
  calculatedDistanceKm?: number;
}

export const PATNA_PROVIDERS: PatnaProvider[] = [
  // -------------------------------------------------------------
  // 1. HEALTHCARE - FRASER ROAD
  // -------------------------------------------------------------
  {
    id: 'prov-pat-01',
    slug: 'patliputra-pediatric-child-care-fraser-road',
    name: 'Patliputra Pediatric & Child Care Clinic',
    legalBusinessName: 'Patliputra Child Health Care Pvt Ltd',
    category: 'healthcare',
    subCategory: 'Pediatrics & Vaccination',
    tagline: 'Leading infant and pediatric specialist OPD near Fraser Road',
    description:
      'NABH-registered clinic led by Dr. R. K. Verma (MD Pediatrics, PMCH Patna). Dedicated growth assessment, newborn screening, sterile immunisation chambers, and zero-wait scheduled consultations.',
    city: 'Patna',
    locality: 'Fraser Road',
    pincode: '800001',
    address: 'Dak Bungalow Crossing, Fraser Road, Patna, Bihar',
    coordinates: { lat: 25.6085, lng: 85.1382 },
    rating: 4.9,
    reviewCount: 384,
    isVerified: true,
    isSponsored: true,
    isOpenNow: true,
    operatingHours: {
      days: 'Monday – Saturday',
      hours: '09:00 AM – 08:00 PM',
      sundayHours: '10:00 AM – 02:00 PM (Emergency OPD Only)',
    },
    priceRange: { min: 600, max: 1500, currency: 'INR' },
    startingPriceInr: 600,
    nextAvailableSlot: 'Today, 2:30 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23'],
    timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM', '06:30 PM'],
    images: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['NABH Accredited', 'PMCH Alumnus', 'Digital Prescriptions', 'Zero Waiting Queue'],
    services: [
      { id: 's-101', name: 'Pediatric Specialist OPD Consultation', price: 600, durationMinutes: 20, description: 'Complete vitals check, milestone review, and digital prescription.' },
      { id: 's-102', name: 'Comprehensive Child Immunization Package', price: 1500, durationMinutes: 30, description: 'WHO-recommended vaccines with certified cold-chain guarantee.' },
      { id: 's-103', name: 'Newborn Developmental & Growth Audit', price: 900, durationMinutes: 25, description: 'Weight velocity, head circumference, and motor milestone mapping.' },
    ],
    phone: '+91 94310 11223',
    email: 'care@patliputrachildcare.in',
    gstin: '10AABCP4455Q1Z8',
    doctors: [
      { id: 'doc-1', name: 'Dr. R. K. Verma', qualification: 'MBBS, MD (Pediatrics, PMCH)', specialty: 'Chief Pediatrician (22 yrs exp)' },
      { id: 'doc-2', name: 'Dr. Ananya Sen', qualification: 'MBBS, DCH', specialty: 'Neonatologist & Child Immunologist' },
    ],
    departments: ['Pediatrics & Child OPD', 'Newborn Screening & Vaccination', 'Pediatric Dental'],
    branches: ['Fraser Road Main Center', 'Boring Road OPD Annex'],
    cancellationPolicy: 'Free cancellation up to 2 hours before scheduled slot. Consultation fee payable at clinic desk upon arrival.',
    disclaimer: 'Appointment booking only; no medical records stored on BOOKKARO servers. Your consultation is managed directly on the clinic medical roster.',
    reviews: [
      {
        id: 'rev-1',
        authorName: 'Sunil Kumar Mishra',
        city: 'Patna',
        rating: 5,
        date: '14 Nov 2026',
        serviceBooked: 'Pediatric Specialist OPD Consultation',
        comment: 'Booked on BOOKKARO at 11 AM, arrived at Fraser Road at 2:25 PM. Dr. Verma attended to my son within 5 minutes. No queue at all!',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 2. HOTELS - FRASER ROAD
  // -------------------------------------------------------------
  {
    id: 'prov-pat-02',
    slug: 'hotel-maurya-prestige-suites-fraser-road',
    name: 'Hotel Maurya Prestige & Business Suites',
    legalBusinessName: 'Maurya Hospitality Patna Limited',
    category: 'hotels',
    subCategory: 'Luxury Business Stay',
    tagline: 'Historic luxury suites overlooking Gandhi Maidan with fine dining',
    description:
      'Premier 5-star hospitality in central Patna. Elegant air-conditioned suites with Ganga river views, high-speed Wi-Fi, business centre, multi-cuisine dining, and airport transfers.',
    city: 'Patna',
    locality: 'Fraser Road',
    pincode: '800001',
    address: 'South Gandhi Maidan, Fraser Road, Patna, Bihar',
    coordinates: { lat: 25.6134, lng: 85.1438 },
    rating: 4.8,
    reviewCount: 642,
    isVerified: true,
    isSponsored: false,
    isOpenNow: true,
    operatingHours: { days: 'All 7 Days', hours: '24 Hours Front Desk Check-in' },
    priceRange: { min: 4500, max: 12000, currency: 'INR' },
    startingPriceInr: 4500,
    nextAvailableSlot: 'Instant Check-in Available',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23'],
    timeSlots: ['12:00 PM Check-in', '02:00 PM Check-in', '06:00 PM Check-in'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['DOT 4-Star Certified', 'Ganga View Lounge', 'Airport Chauffeur', 'Complimentary Buffet Breakfast'],
    services: [
      { id: 's-201', name: 'Executive Deluxe AC Room', price: 4500, durationMinutes: 1440, description: 'King bed, garden view, work desk, 50-inch smart TV, high-speed Wi-Fi.' },
      { id: 's-202', name: 'Maurya Club Business Suite', price: 7200, durationMinutes: 1440, description: 'Separate living room, complimentary airport pick-up, cocktail hour access.' },
    ],
    phone: '+91 612 220 1000',
    email: 'reservations@hotelmaurya.com',
    gstin: '10AAACM9988H1ZZ',
    roomTypes: [
      { id: 'rt-1', name: 'Executive Deluxe Room', pricePerNight: 4500, maxGuests: 2, bedType: '1 King Bed', amenities: ['Free Wi-Fi', 'Complimentary Breakfast', 'AC', 'Bathtub'] },
      { id: 'rt-2', name: 'Maurya Club Suite', pricePerNight: 7200, maxGuests: 3, bedType: '1 King Bed + Sofa Bed', amenities: ['Airport Pick-up', 'Club Lounge Access', 'Express Check-out'] },
    ],
    cancellationPolicy: '100% Free Cancellation up to 24 hours prior to check-in (12:00 PM).',
    disclaimer: 'Valid Government Photo ID mandatory for all adult guests during physical check-in.',
    reviews: [
      {
        id: 'rev-4',
        authorName: 'Vikramaditya Sahay',
        city: 'Patna (Danapur)',
        rating: 5,
        date: '10 Nov 2026',
        serviceBooked: 'Executive Deluxe AC Room',
        comment: 'Room was immaculate, Wi-Fi speeds clocked 120 Mbps. Best hotel in Bihar.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 3. RESTAURANTS - FRASER ROAD
  // -------------------------------------------------------------
  {
    id: 'prov-pat-03',
    slug: 'bansi-vihar-pure-vegetarian-fraser-road',
    name: 'Bansi Vihar Pure Vegetarian Dining',
    legalBusinessName: 'Bansi Vihar Food Products LLP',
    category: 'restaurants',
    subCategory: 'South Indian & North Indian Thali',
    tagline: 'Iconic pure vegetarian restaurant famous for crispy Masala Dosas & Thalis',
    description:
      'Patna landmark since 1990. Celebrated for ghee-roasted Masala Dosas, Filter Coffee, and North Indian deluxe thalis with pristine hygienic kitchen standards.',
    city: 'Patna',
    locality: 'Fraser Road',
    pincode: '800001',
    address: 'Near Mona Cinema, Fraser Road, Patna, Bihar',
    coordinates: { lat: 25.6071, lng: 85.1369 },
    rating: 4.8,
    reviewCount: 920,
    isVerified: true,
    isSponsored: false,
    isOpenNow: true,
    operatingHours: { days: 'Monday – Sunday', hours: '08:00 AM – 10:30 PM' },
    priceRange: { min: 200, max: 800, currency: 'INR' },
    startingPriceInr: 200,
    nextAvailableSlot: 'Today, 1:15 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['12:30 PM', '01:15 PM', '02:00 PM', '07:30 PM', '08:45 PM'],
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['FSSAI 5-Star Kitchen', 'Pure Veg Certified', 'Instant Table Token', 'Zero Queue Guarantee'],
    services: [
      { id: 's-301', name: 'Priority Table Reservation (4 Pax)', price: 200, durationMinutes: 60, description: 'Direct seating token; reservation fee fully adjusted against food bill.' },
      { id: 's-302', name: 'Family Feast Table Reservation (6-8 Pax)', price: 400, durationMinutes: 75, description: 'Reserved corner booth in AC family dining hall.' },
    ],
    phone: '+91 612 222 5599',
    email: 'contact@bansiviharpatna.in',
    gstin: '10AAAFB3322P1Z1',
    menuHighlights: ['Special Butter Masala Dosa', 'Mysore Ghee Roast', 'Royal Delux Thali', 'Madras Filter Coffee'],
    seatingTypes: ['Ground Floor Fast Dining', '1st Floor Family AC Hall', 'Corner Booth'],
    cancellationPolicy: 'Token reservation fee fully refundable up to 30 mins before reservation time.',
    disclaimer: 'Table held for 15 minutes past reserved slot time before release to walk-in waiting list.',
    reviews: [
      {
        id: 'rev-6',
        authorName: 'Amitabh Sen',
        city: 'Patna',
        rating: 5,
        date: '12 Nov 2026',
        serviceBooked: 'Priority Table Reservation (4 Pax)',
        comment: 'Sunday lunch at Bansi Vihar usually has 40 min waiting. With BOOKKARO token, we walked straight in!',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 4. SALON & SPA - BORING ROAD
  // -------------------------------------------------------------
  {
    id: 'prov-pat-04',
    slug: 'kaya-kalp-ayurvedic-wellness-salon-boring-road',
    name: 'Kaya Kalp Ayurvedic Wellness & Salon',
    legalBusinessName: 'Kaya Kalp Salon & Spa Bihar LLP',
    category: 'salon',
    subCategory: 'Ayurvedic Spa & Hair Styling',
    tagline: 'Authentic Kerala herbal therapies, keratin hair detox & bridal salon',
    description:
      'Premier wellness center in Boring Road. Expert Ayurvedic therapists and certified stylists providing authentic Shirodhara, organic hair spas, and bespoke bridal packages.',
    city: 'Patna',
    locality: 'Boring Road',
    pincode: '800013',
    address: 'Near Panchmukhi Mandir, Boring Canal Road, Patna, Bihar',
    coordinates: { lat: 25.6192, lng: 85.1135 },
    rating: 4.9,
    reviewCount: 412,
    isVerified: true,
    isSponsored: true,
    isOpenNow: true,
    operatingHours: { days: 'Tuesday – Sunday (Mon Closed)', hours: '10:00 AM – 08:30 PM' },
    priceRange: { min: 499, max: 4500, currency: 'INR' },
    startingPriceInr: 499,
    nextAvailableSlot: 'Today, 4:00 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['11:00 AM', '01:30 PM', '04:00 PM', '06:00 PM'],
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['Certified Ayurvedic Herbs', 'L’Oréal Professional Partner', 'Private Therapy Suites', 'Disposable Linens'],
    services: [
      { id: 's-401', name: 'Senior Stylist Haircut & Deep Conditioning', price: 499, durationMinutes: 45, description: 'Personalized face-mapping haircut with steam hair detox.' },
      { id: 's-402', name: 'Authentic Kerala Shirodhara & Scalp Therapy', price: 1800, durationMinutes: 60, description: 'Warm medicated herbal oil drip therapy for stress relief and hair fall reduction.' },
    ],
    phone: '+91 98350 22334',
    email: 'appointments@kayakalppatna.in',
    gstin: '10AAEFK2211R1ZU',
    stylists: ['Vikram Jha (Master Stylist)', 'Pooja Anand (Ayurvedic Specialist)', 'Simran Kaur (Bridal Lead)'],
    cancellationPolicy: 'Free cancellation up to 3 hours prior to appointment.',
    disclaimer: 'Patch test mandatory 24 hours prior for chemical hair treatments.',
    reviews: [
      {
        id: 'rev-8',
        authorName: 'Priyanka Roy',
        city: 'Patna',
        rating: 5,
        date: '09 Nov 2026',
        serviceBooked: 'Authentic Kerala Shirodhara & Scalp Therapy',
        comment: 'Authentic herbal oils, serene private suite. You can actually relax without waiting at the desk.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 5. VEHICLE CARE - BAILEY ROAD
  // -------------------------------------------------------------
  {
    id: 'prov-pat-05',
    slug: 'ganga-precision-auto-care-bailey-road',
    name: 'Ganga Precision Auto Care & Ceramic',
    legalBusinessName: 'Ganga Motors & Detailing Private Limited',
    category: 'vehicle_care',
    subCategory: 'High-Pressure Wash & Detailing',
    tagline: 'State-of-the-art automatic underbody wash, 10H ceramic coating & OBD-II scan',
    description:
      'High-tech automotive workshop on Bailey Road. 3 automatic wash bays, computerized wheel alignment, ceramic paint protection, and genuine spare replacement with zero wait time.',
    city: 'Patna',
    locality: 'Bailey Road',
    pincode: '800014',
    address: 'Near Patna Zoo Gate 2, Bailey Road, Patna, Bihar',
    coordinates: { lat: 25.6115, lng: 85.0921 },
    rating: 4.8,
    reviewCount: 512,
    isVerified: true,
    isSponsored: false,
    isOpenNow: true,
    operatingHours: { days: 'Monday – Sunday', hours: '08:30 AM – 08:00 PM' },
    priceRange: { min: 450, max: 14500, currency: 'INR' },
    startingPriceInr: 450,
    nextAvailableSlot: 'Today, 3:00 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['10:00 AM', '11:30 AM', '01:00 PM', '03:00 PM', '05:00 PM'],
    images: [
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['Bosch Authorized Partner', 'Meguiar’s Detailing Studio', 'Automated Underbody Ramp', 'AC Customer Lounge'],
    services: [
      { id: 's-501', name: 'Express High-Pressure Foam Wash + Vacuum', price: 450, durationMinutes: 35, description: 'Snow foam shampoo, 140-bar underbody blaster, cabin vacuum, dashboard polish.' },
      { id: 's-502', name: 'Complete 3M Deep Interior Spa', price: 1699, durationMinutes: 90, description: 'Dry cleaning upholstery, roof lining scrub, ozone AC duct sanitization.' },
    ],
    phone: '+91 612 258 9911',
    email: 'service@gangamotorspatna.in',
    gstin: '10AAACG9981K1Z2',
    staffOrBays: ['High-Pressure Jet Bay 1', 'Hydraulic Lift Bay 2', 'Dust-Free Ceramic Coating Studio'],
    cancellationPolicy: 'Free cancellation up to 1 hour before booked bay slot.',
    disclaimer: 'Valuables should be removed from vehicle prior to handoff.',
    reviews: [
      {
        id: 'rev-10',
        authorName: 'Ranjeet Prasad',
        city: 'Patna',
        rating: 5,
        date: '15 Nov 2026',
        serviceBooked: 'Express High-Pressure Foam Wash + Vacuum',
        comment: 'Drove in from Saguna More. Bay was empty and waiting for my car at exactly 3 PM. Cleaned in 30 mins.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 6. HEALTHCARE - DAKBUNGLOW / EXHIBITION ROAD
  // -------------------------------------------------------------
  {
    id: 'prov-raj-01',
    slug: 'sterling-dental-implantology-dakbunglow',
    name: 'Sterling Dental & Oral Implantology Patna',
    legalBusinessName: 'Sterling Dental Care Bihar LLP',
    category: 'healthcare',
    subCategory: 'Dentistry & Maxillofacial',
    tagline: 'Painless computer-guided implants and digital OPG x-ray diagnostics',
    description:
      'Premier dental implantology centre on Exhibition Road. Led by Dr. Alok Kumar (MDS Oral Surgery). Advanced sterilization autoclaves and painless single-sitting root canals.',
    city: 'Patna',
    locality: 'Dakbunglow',
    pincode: '800001',
    address: 'Exhibition Road, Near Big Bazaar, Patna, Bihar',
    coordinates: { lat: 25.6095, lng: 85.1395 },
    rating: 4.9,
    reviewCount: 310,
    isVerified: true,
    isSponsored: false,
    isOpenNow: true,
    operatingHours: { days: 'Monday – Saturday', hours: '10:00 AM – 07:30 PM' },
    priceRange: { min: 500, max: 25000, currency: 'INR' },
    startingPriceInr: 500,
    nextAvailableSlot: 'Today, 5:30 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['10:30 AM', '12:00 PM', '03:30 PM', '05:30 PM'],
    images: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['German Kavo Dental Chairs', 'Class-B Autoclave', 'Digital Intraoral 3D Scanner'],
    services: [
      { id: 's-601', name: 'Digital OPG X-Ray & Comprehensive Dental Health Assessment', price: 500, durationMinutes: 25, description: 'High-res full jaw scan, caries check, and treatment blueprint.' },
      { id: 's-602', name: 'Laser Teeth Whitening & Ultrasonic Scaling', price: 2200, durationMinutes: 45, description: 'Stain removal and enamel-safe LED brightening.' },
    ],
    phone: '+91 612 232 4011',
    email: 'info@sterlingdentalpatna.in',
    gstin: '10AAJFS8810P1Z2',
    cancellationPolicy: 'Free cancellation up to 2 hours prior to scheduled appointment.',
    disclaimer: 'Consultation fee payable at clinic reception.',
    reviews: [
      {
        id: 'rev-11',
        authorName: 'Manoj Bajpayee Singh',
        city: 'Patna',
        rating: 5,
        date: '11 Nov 2026',
        serviceBooked: 'Digital OPG X-Ray & Dental Health Assessment',
        comment: 'Very polite clinic staff, spotless hygiene, and absolutely painless diagnosis.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 7. HOTELS - BAILEY ROAD
  // -------------------------------------------------------------
  {
    id: 'prov-raj-02',
    slug: 'the-royal-grand-heritage-suites-bailey-road',
    name: 'The Royal Grand Heritage Suites Patna',
    legalBusinessName: 'Royal Grand Hospitality Bihar Pvt Ltd',
    category: 'hotels',
    subCategory: 'Heritage Stay & Boutique Hotel',
    tagline: 'Palatial architecture, peaceful courtyards, and conference amenities',
    description:
      'Boutique heritage-inspired retreat along Bailey Road. Handcrafted teak furniture, tranquil central fountain courtyard, 24-hour restaurant, and conference suites.',
    city: 'Patna',
    locality: 'Bailey Road',
    pincode: '800014',
    address: 'Bailey Road, Near Rupaspur Flyover, Patna, Bihar',
    coordinates: { lat: 25.6148, lng: 85.0782 },
    rating: 4.8,
    reviewCount: 380,
    isVerified: true,
    isSponsored: false,
    isOpenNow: true,
    operatingHours: { days: 'All 7 Days', hours: '24 Hours Front Desk' },
    priceRange: { min: 3800, max: 9500, currency: 'INR' },
    startingPriceInr: 3800,
    nextAvailableSlot: 'Today, 12:00 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['12:00 PM Check-in', '03:00 PM Check-in'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['Heritage Architecture', 'Fountain Courtyard', 'Complimentary Breakfast', 'Free Parking'],
    services: [
      { id: 's-701', name: 'Courtyard View Deluxe Room', price: 3800, durationMinutes: 1440, description: 'Spacious king bedroom opening into central garden courtyard.' },
      { id: 's-702', name: 'Maharaja Royal Suite', price: 6800, durationMinutes: 1440, description: 'Living room, antique decor, private balcony, complimentary high tea.' },
    ],
    phone: '+91 612 258 7700',
    email: 'contact@royalgrandpatna.com',
    gstin: '10AABCR9911L1Z4',
    cancellationPolicy: 'Free cancellation up to 24 hours prior to check-in.',
    disclaimer: 'Valid Govt photo ID required at check-in.',
    reviews: [
      {
        id: 'rev-12',
        authorName: 'Deepak Varma',
        city: 'Patna',
        rating: 5,
        date: '05 Nov 2026',
        serviceBooked: 'Courtyard View Deluxe Room',
        comment: 'Peaceful stay away from noisy traffic. The courtyard tea in the evening was magnificent.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 8. RESTAURANTS - PATLIPUTRA COLONY
  // -------------------------------------------------------------
  {
    id: 'prov-raj-03',
    slug: 'patliputra-heritage-courtyard-dining',
    name: 'Patliputra Heritage Courtyard Dining',
    legalBusinessName: 'Patliputra Epicurean Dining LLP',
    category: 'restaurants',
    subCategory: 'Authentic Bihari & Awadhi Handi',
    tagline: 'Clay-pot Champaran Ahuna Handi, Litti Chokha & Mughlai grilled kebabs',
    description:
      'Authentic open-air courtyard restaurant celebrating slow-cooked earthen pot delicacies. Mustard oil marinades, fresh village ghee, and wood-fired tandoor specialties.',
    city: 'Patna',
    locality: 'Patliputra Colony',
    pincode: '800013',
    address: 'Near Patliputra Golambar, Patliputra Colony, Patna, Bihar',
    coordinates: { lat: 25.6264, lng: 85.1118 },
    rating: 4.9,
    reviewCount: 520,
    isVerified: true,
    isSponsored: true,
    isOpenNow: true,
    operatingHours: { days: 'Monday – Sunday', hours: '12:00 PM – 11:00 PM' },
    priceRange: { min: 350, max: 1200, currency: 'INR' },
    startingPriceInr: 350,
    nextAvailableSlot: 'Today, 7:30 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['12:30 PM', '01:30 PM', '07:30 PM', '09:00 PM'],
    images: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['Slow-Cooked Ahuna Handi', 'FSSAI Certified', 'Live Folk Sitar', 'Reserved Terrace Gazebo'],
    services: [
      { id: 's-801', name: 'Terrace Gazebo Priority Table (4 Pax)', price: 350, durationMinutes: 60, description: 'Reserved table with welcome appetizers and guaranteed seating.' },
      { id: 's-802', name: 'Champaran Handi Experience Family Table (6 Pax)', price: 600, durationMinutes: 75, description: 'Table pre-booked with clay-pot live presentation.' },
    ],
    phone: '+91 612 227 4488',
    email: 'info@patliputracourtyard.in',
    gstin: '10AAAFP8812K1Z9',
    cancellationPolicy: 'Full refund up to 1 hour prior to booking.',
    disclaimer: 'Table held for 15 minutes past slot time.',
    reviews: [
      {
        id: 'rev-13',
        authorName: 'Sanjay Kashyap',
        city: 'Patna',
        rating: 5,
        date: '10 Nov 2026',
        serviceBooked: 'Terrace Gazebo Priority Table',
        comment: 'Authentic Ahuna Handi flavor! Zero wait time with BOOKKARO reservation.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 9. SALON & SPA - KANKARBAGH
  // -------------------------------------------------------------
  {
    id: 'prov-raj-04',
    slug: 'oasis-ayurvedic-spa-salon-kankarbagh',
    name: 'Oasis Ayurvedic Hair & Body Spa Patna',
    legalBusinessName: 'Oasis Wellness Bihar Partnership',
    category: 'salon',
    subCategory: 'Hair Detox & Reflexology',
    tagline: 'Steam herbal body polish, deep tissue reflexology & organic hair spa',
    description:
      'Premier salon & spa in Kankarbagh Doctors Colony. Dedicated reflexology lounges, certified female & male therapists, organic cruelty-free hair care products, and calming sitar melodies.',
    city: 'Patna',
    locality: 'Kankarbagh',
    pincode: '800020',
    address: 'Near Old Bypass Road, Kankarbagh, Patna, Bihar',
    coordinates: { lat: 25.5925, lng: 85.1542 },
    rating: 4.8,
    reviewCount: 340,
    isVerified: true,
    isSponsored: false,
    isOpenNow: true,
    operatingHours: { days: 'Monday – Sunday', hours: '10:00 AM – 08:30 PM' },
    priceRange: { min: 450, max: 3200, currency: 'INR' },
    startingPriceInr: 450,
    nextAvailableSlot: 'Today, 3:30 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['11:00 AM', '01:00 PM', '03:30 PM', '06:00 PM'],
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['Organic Kerala Oils', 'Individual Steam Chambers', 'Hygienic Disposable Kits'],
    services: [
      { id: 's-901', name: 'Deep Relaxing Herbal Head Massage & Steam', price: 450, durationMinutes: 40, description: 'Warm bhringraj oil massage followed by aromatic herbal steam.' },
      { id: 's-902', name: 'Full Body Ayurvedic Abhyanga & Steam', price: 1600, durationMinutes: 60, description: 'Synchronized therapeutic full body massage with medicated sesame oil.' },
    ],
    phone: '+91 612 235 6677',
    email: 'care@oasisspapatna.in',
    gstin: '10AAAFO1100M1ZX',
    cancellationPolicy: 'Free cancellation up to 2 hours before slot.',
    disclaimer: 'Please arrive 10 minutes prior to scheduled session.',
    reviews: [
      {
        id: 'rev-14',
        authorName: 'Neelam Kumari',
        city: 'Patna',
        rating: 5,
        date: '07 Nov 2026',
        serviceBooked: 'Deep Relaxing Herbal Head Massage',
        comment: 'Soothing environment, very skilled therapists. Will definitely book again.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 10. VEHICLE CARE - RAJENDRA NAGAR
  // -------------------------------------------------------------
  {
    id: 'prov-raj-05',
    slug: 'patna-speed-auto-spa-rajendra-nagar',
    name: 'Patna Speed Auto Spa & Ceramic Studio',
    legalBusinessName: 'Patna Speed Auto Ventures LLP',
    category: 'vehicle_care',
    subCategory: 'Automated Foam Wash & Underbody Jet',
    tagline: 'High-speed automated foam wash, chassis anti-rust, and graphene ceramic coating',
    description:
      'Equipped with 160-bar pressure jets, pH-neutral citrus foam shampoo, and paint correction booths near Rajendra Nagar Stadium. Complete turnaround in 30 minutes.',
    city: 'Patna',
    locality: 'Rajendra Nagar',
    pincode: '800016',
    address: 'Near Moin-ul-Haq Stadium Road, Rajendra Nagar, Patna, Bihar',
    coordinates: { lat: 25.6012, lng: 85.1635 },
    rating: 4.8,
    reviewCount: 460,
    isVerified: true,
    isSponsored: false,
    isOpenNow: true,
    operatingHours: { days: 'Monday – Sunday', hours: '08:00 AM – 08:00 PM' },
    priceRange: { min: 499, max: 12500, currency: 'INR' },
    startingPriceInr: 499,
    nextAvailableSlot: 'Today, 2:00 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
    images: [
      'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['160-Bar Jet Wash', '30-Minute Turnaround', 'Graphene Coating Certified'],
    services: [
      { id: 's-1001', name: 'Full High-Pressure Foam Underbody Wash & Cabin Vacuum', price: 499, durationMinutes: 30, description: 'Chassis blast, tyre shine, microfiber body dry, cabin vacuum.' },
      { id: 's-1002', name: 'Ceramic Glass & Paint Glaze Booster', price: 1499, durationMinutes: 60, description: 'Hydrophobic rain repellent and deep gloss enhancement.' },
    ],
    phone: '+91 612 225 7805',
    email: 'service@patnaspeedauto.in',
    gstin: '10AAACP9944F1Z8',
    cancellationPolicy: 'Free cancellation. Pay at workshop desk.',
    disclaimer: 'Customer waiting lounge with live bay CCTV monitors.',
    reviews: [
      {
        id: 'rev-15',
        authorName: 'Ravi Teja Sinha',
        city: 'Patna',
        rating: 5,
        date: '04 Nov 2026',
        serviceBooked: 'Full High-Pressure Foam Underbody Wash',
        comment: 'Fast, spotless underbody wash. Staff takes great care with alloy wheels.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 11. HEALTHCARE - KANKARBAGH
  // -------------------------------------------------------------
  {
    id: 'prov-del-01',
    slug: 'heartline-cardiology-diagnostics-kankarbagh',
    name: 'Heartline Advanced Cardiology & Diagnostics Patna',
    legalBusinessName: 'Heartline Medical Services Bihar Pvt Ltd',
    category: 'healthcare',
    subCategory: 'Cardiology & Diagnostic OPD',
    tagline: 'Senior DM Cardiologists, 2D-Echo, TMT, and cardiac rehabilitation',
    description:
      'Premier cardiac daycare clinic in Kankarbagh Doctors Colony led by AIIMS/IGIMS trained specialists. Comprehensive cardiac evaluations, ECG, Holter monitoring, and pathology.',
    city: 'Patna',
    locality: 'Kankarbagh',
    pincode: '800020',
    address: 'Main Road, Doctors Colony, Kankarbagh, Patna, Bihar',
    coordinates: { lat: 25.5908, lng: 85.1519 },
    rating: 4.9,
    reviewCount: 470,
    isVerified: true,
    isSponsored: true,
    isOpenNow: true,
    operatingHours: { days: 'Monday – Saturday', hours: '08:30 AM – 07:30 PM' },
    priceRange: { min: 800, max: 3500, currency: 'INR' },
    startingPriceInr: 800,
    nextAvailableSlot: 'Today, 4:15 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['09:30 AM', '11:30 AM', '02:00 PM', '04:15 PM', '06:00 PM'],
    images: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['AIIMS Trained Faculty', 'GE Healthcare 2D-Echo', 'Emergency Cardiac ECG', 'NABH Accredited'],
    services: [
      { id: 's-1101', name: 'Comprehensive Cardiologist Consultation & 12-Lead ECG', price: 800, durationMinutes: 30, description: 'Senior DM Cardiologist consultation, computerized ECG review, risk assessment.' },
      { id: 's-1102', name: 'Advanced Color Doppler 2D-Echo Test', price: 1800, durationMinutes: 30, description: 'High-precision GE machine evaluation with immediate printed medical report.' },
    ],
    phone: '+91 612 238 9012',
    email: 'care@heartlinepatna.in',
    gstin: '10AABCH2299J1Z3',
    doctors: [
      { id: 'doc-4', name: 'Dr. Arvind Verma', qualification: 'MBBS, MD, DM (Cardiology, AIIMS)', specialty: 'Senior Consultant Cardiologist' },
    ],
    cancellationPolicy: 'Free cancellation up to 2 hours prior to slot.',
    disclaimer: 'Secondary opinion service; please bring prior ECG reports.',
    reviews: [
      {
        id: 'rev-16',
        authorName: 'Dr. Neeraj Pandey',
        city: 'Patna',
        rating: 5,
        date: '02 Nov 2026',
        serviceBooked: 'Comprehensive Cardiologist Consultation & ECG',
        comment: 'Dr. Verma takes time to explain every detail. No rushed 2-minute appointment.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 12. HOTELS - DANAPUR
  // -------------------------------------------------------------
  {
    id: 'prov-del-02',
    slug: 'the-imperial-court-business-hotel-danapur',
    name: 'The Imperial Court Business Hotel Patna',
    legalBusinessName: 'Imperial Court Hospitality Danapur Pvt Ltd',
    category: 'hotels',
    subCategory: 'Executive Airport Stay',
    tagline: 'Modern executive suites, airport shuttle & soundproof work pods',
    description:
      'Strategic corporate hotel at Saguna More, Danapur. Soundproofed rooms with ergonomic work desks, 24-hour room service, and rapid 15-minute connectivity to Patna Airport.',
    city: 'Patna',
    locality: 'Danapur',
    pincode: '801503',
    address: 'Near Saguna More, Bailey Road, Danapur, Patna, Bihar',
    coordinates: { lat: 25.6295, lng: 85.0482 },
    rating: 4.8,
    reviewCount: 395,
    isVerified: true,
    isSponsored: false,
    isOpenNow: true,
    operatingHours: { days: 'All 7 Days', hours: '24 Hours Front Desk' },
    priceRange: { min: 3200, max: 7500, currency: 'INR' },
    startingPriceInr: 3200,
    nextAvailableSlot: 'Today, 1:00 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['12:00 PM Check-in', '02:00 PM Check-in'],
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['Airport Shuttle', 'High-Speed Wi-Fi (150 Mbps)', 'Ergonomic Work Desk'],
    services: [
      { id: 's-1201', name: 'Corporate Business Deluxe Room', price: 3200, durationMinutes: 1440, description: 'Soundproofed room with king bed, work station, and hot breakfast.' },
      { id: 's-1202', name: 'Executive Suite with Airport Transfer', price: 5500, durationMinutes: 1440, description: 'Spacious suite with complimentary airport pick-up or drop.' },
    ],
    phone: '+91 612 249 1100',
    email: 'frontdesk@imperialcourtpatna.com',
    gstin: '10AAACI9912K1Z5',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    disclaimer: 'Valid photo ID required at check-in.',
    reviews: [
      {
        id: 'rev-17',
        authorName: 'Gaurav Bhasin',
        city: 'Patna',
        rating: 5,
        date: '30 Oct 2026',
        serviceBooked: 'Corporate Business Deluxe Room',
        comment: 'Close to airport, seamless check-in, spotless bathroom and good food.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 13. RESTAURANTS - ASHOK RAJPATH / DAKBUNGLOW
  // -------------------------------------------------------------
  {
    id: 'prov-del-03',
    slug: 'biryani-mahal-awadhi-dum-kitchen-patna',
    name: 'Biryani Mahal & Awadhi Dum Kitchen Patna',
    legalBusinessName: 'Biryani Mahal Hospitality Patna LLP',
    category: 'restaurants',
    subCategory: 'Awadhi Biryani & Mughlai Kebabs',
    tagline: 'Legendary slow-cooked Awadhi mutton biryani and tandoori seekh',
    description:
      'Beloved culinary institution near Dakbunglow & Ashok Rajpath. Charcoal-sealed degs, fragrant basmati rice, tender handi meat, and authentic Galouti kebabs.',
    city: 'Patna',
    locality: 'Ashok Rajpath',
    pincode: '800004',
    address: 'Near Patna College Gate, Ashok Rajpath, Patna, Bihar',
    coordinates: { lat: 25.6201, lng: 85.1678 },
    rating: 4.8,
    reviewCount: 780,
    isVerified: true,
    isSponsored: false,
    isOpenNow: true,
    operatingHours: { days: 'Monday – Sunday', hours: '11:30 AM – 10:45 PM' },
    priceRange: { min: 280, max: 950, currency: 'INR' },
    startingPriceInr: 280,
    nextAvailableSlot: 'Today, 1:30 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['12:30 PM', '01:30 PM', '07:00 PM', '08:30 PM'],
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['Heritage Recipe Since 1996', 'Dum-Pukht Cooking', 'Instant Table Seating'],
    services: [
      { id: 's-1301', name: 'Priority Table Reservation for 4 Pax', price: 280, durationMinutes: 60, description: 'Skip the weekend queue; token adjusted in full against food bill.' },
      { id: 's-1302', name: 'Family Feast Table for 6 Pax', price: 450, durationMinutes: 75, description: 'Reserved AC booth for family gatherings.' },
    ],
    phone: '+91 612 223 4803',
    email: 'contact@biryanimahalpatna.in',
    gstin: '10AAAFB4499P1Z7',
    cancellationPolicy: 'Refundable up to 1 hour before scheduled dining.',
    disclaimer: 'Table held for 15 minutes past slot time.',
    reviews: [
      {
        id: 'rev-18',
        authorName: 'Kunal Kishore',
        city: 'Patna',
        rating: 5,
        date: '25 Oct 2026',
        serviceBooked: 'Priority Table Reservation for 4 Pax',
        comment: 'Best Dum Biryani in Patna! Table was waiting for us right on time.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 14. SALON & SPA - BORING ROAD
  // -------------------------------------------------------------
  {
    id: 'prov-del-04',
    slug: 'looks-privilege-hair-aesthetics-boring-road',
    name: 'Looks Privilege Hair & Aesthetics Studio Patna',
    legalBusinessName: 'Looks Salon Bihar Franchise LLP',
    category: 'salon',
    subCategory: 'Luxury Hair Styling & Grooming',
    tagline: 'Celebrity hairstyling, Olaplex hair bond therapy & groom packages',
    description:
      'Ultra-luxury salon on Boring Road. International hair masters, bespoke men’s grooming, keratin treatments, and bridal styling in private VIP styling rooms.',
    city: 'Patna',
    locality: 'Boring Road',
    pincode: '800013',
    address: 'Boring Canal Road, Near Panchmukhi Mandir, Boring Road, Patna, Bihar',
    coordinates: { lat: 25.6178, lng: 85.1142 },
    rating: 4.8,
    reviewCount: 390,
    isVerified: true,
    isSponsored: false,
    isOpenNow: true,
    operatingHours: { days: 'Monday – Sunday', hours: '10:00 AM – 09:00 PM' },
    priceRange: { min: 550, max: 5500, currency: 'INR' },
    startingPriceInr: 550,
    nextAvailableSlot: 'Today, 5:00 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['11:30 AM', '02:00 PM', '05:00 PM', '07:00 PM'],
    images: [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['Olaplex Certified', 'Dyson Pro Styling Equipment', 'VIP Grooming Lounge'],
    services: [
      { id: 's-1401', name: 'Senior Director Haircut & Moroccan Beard Grooming', price: 550, durationMinutes: 45, description: 'Consultation, scalp wash, scissor cut, hot towel beard finish.' },
      { id: 's-1402', name: 'Olaplex Bond Rebuilding & Deep Hair Spa', price: 2200, durationMinutes: 60, description: 'Molecular repair treatment for chemical-damaged hair.' },
    ],
    phone: '+91 612 255 1904',
    email: 'boringroad@lookspatna.in',
    gstin: '10AAACL7788M1Z2',
    cancellationPolicy: 'Free cancellation up to 2 hours before scheduled slot.',
    disclaimer: 'Sanitized single-use capes and razors guaranteed.',
    reviews: [
      {
        id: 'rev-19',
        authorName: 'Abhishek Sen',
        city: 'Patna',
        rating: 5,
        date: '18 Oct 2026',
        serviceBooked: 'Senior Director Haircut & Beard Grooming',
        comment: 'Top-notch haircut. Very professional stylists who actually listen.',
        isVerifiedBooking: true,
      },
    ],
  },

  // -------------------------------------------------------------
  // 15. VEHICLE CARE - BAILEY ROAD / DANAPUR
  // -------------------------------------------------------------
  {
    id: 'prov-del-05',
    slug: 'pitstop-express-car-wash-ceramic-bailey-road',
    name: 'Pitstop Express Car Wash & 10H Ceramic Patna',
    legalBusinessName: 'Pitstop Auto Detailing Bihar LLP',
    category: 'vehicle_care',
    subCategory: 'Car Wash & Detailing',
    tagline: 'Underbody blaster ramp, snow foam wash & 10H ceramic coating',
    description:
      'High-volume detailing station on Bailey Road near Gola Road. 3 dedicated pressure bays, mechanized underbody washing, paint de-ironing, and rapid 30-min turnaround.',
    city: 'Patna',
    locality: 'Bailey Road',
    pincode: '801503',
    address: 'Gola Road More, Bailey Road, Patna, Bihar',
    coordinates: { lat: 25.6189, lng: 85.0682 },
    rating: 4.8,
    reviewCount: 580,
    isVerified: true,
    isSponsored: false,
    isOpenNow: true,
    operatingHours: { days: 'Monday – Sunday', hours: '08:00 AM – 08:30 PM' },
    priceRange: { min: 450, max: 15000, currency: 'INR' },
    startingPriceInr: 450,
    nextAvailableSlot: 'Today, 2:45 PM',
    availableDates: ['2026-11-20', '2026-11-21', '2026-11-22'],
    timeSlots: ['10:00 AM', '12:00 PM', '02:45 PM', '04:30 PM'],
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80',
    ],
    badges: ['Bosch Service Partner', 'Underbody Anti-Rust', 'Express 30-min Turnaround'],
    services: [
      { id: 's-1501', name: 'Signature Foam Wash + Underbody Jet', price: 450, durationMinutes: 30, description: 'pH-neutral foam, underbody blast, glass polish, cabin vacuum.' },
      { id: 's-1502', name: 'Complete 3M Interior Spa & AC Sanitization', price: 1899, durationMinutes: 75, description: 'Leather seat enrichment, carpet shampoo, anti-bacterial ozone mist.' },
    ],
    phone: '+91 612 250 2244',
    email: 'baileyroad@pitstopautocare.in',
    gstin: '10AABCP8877K1Z9',
    staffOrBays: ['High-Pressure Jet Bay 1', 'Interior Upholstery Spa Bay 2', 'Mechanical Bay'],
    cancellationPolicy: 'Free cancellation. Pay at workshop.',
    disclaimer: 'Zero queue guaranteed when booking via BOOKKARO.',
    reviews: [
      {
        id: 'rev-20',
        authorName: 'Vikas Batra',
        city: 'Patna',
        rating: 5,
        date: '07 Nov 2026',
        serviceBooked: 'Signature Foam Wash + Underbody Jet',
        comment: 'Done in 30 mins while waiting in AC lounge. Car looks spotless.',
        isVerifiedBooking: true,
      },
    ],
  },
];
