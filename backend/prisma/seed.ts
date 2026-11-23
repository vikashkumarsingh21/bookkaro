import { PrismaClient, Role, CommercialModel, SubscriptionTier, ProviderStatus, BookingStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BCRYPT_SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting BOOKKARO Patna Database Seed...');

  // 1. Password Hashes
  const defaultPasswordHash = await bcrypt.hash('Bookkaro@Patna2026!', BCRYPT_SALT_ROUNDS);

  // 2. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bookkaro.in' },
    update: {},
    create: {
      fullName: 'Rajeshwar Sinha (Admin)',
      email: 'admin@bookkaro.in',
      phone: '9431011000',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✓ Admin seeded: ${adminUser.email}`);

  // 3. Customer User
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@bookkaro.in' },
    update: {},
    create: {
      fullName: 'Vikramaditya Sengupta',
      email: 'customer@bookkaro.in',
      phone: '9845012345',
      passwordHash: defaultPasswordHash,
      role: Role.CUSTOMER,
      isActive: true,
    },
  });
  console.log(`✓ Customer seeded: ${customerUser.email}`);

  // 4. Partner Owners & Providers (Strict 3 Categories: hotels, restaurants, salon)
  const providersData = [
    // -------------------------------------------------------------------------
    // HOTELS (10% Commission)
    // -------------------------------------------------------------------------
    {
      code: 'BK-PRV-PAT-1001',
      brandName: 'Hotel Maurya Prestige & Business Suites',
      legalName: 'Maurya Hospitality Patna Limited',
      category: 'hotels',
      locality: 'Fraser Road',
      pincode: '800001',
      address: 'South Gandhi Maidan, Fraser Road, Patna, Bihar',
      latitude: 25.6134,
      longitude: 85.1438,
      commissionRate: 10.0,
      rating: 4.8,
      reviewCount: 642,
      isVerified: true,
      isSponsored: true,
      ownerEmail: 'partner.maurya@bookkaro.in',
      ownerName: 'Sanjay K. Maurya',
      ownerPhone: '9431001001',
      photos: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'All 7 Days', hours: '24 Hours Front Desk' },
      services: [
        { name: 'Executive Deluxe AC Room', priceInr: 4500, durationMins: 1440, description: 'King bed, garden view, high-speed Wi-Fi.' },
        { name: 'Maurya Club Business Suite', priceInr: 7200, durationMins: 1440, description: 'Separate lounge, complimentary airport chauffeur.' },
        { name: 'Presidential Royal Suite', priceInr: 12000, durationMins: 1440, description: 'Luxury panoramic Ganges view, butler service.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1002',
      brandName: 'Lemon Tree Premier Patna',
      legalName: 'Carnation Hotels Bihar Pvt Ltd',
      category: 'hotels',
      locality: 'Dakbunglow',
      pincode: '800001',
      address: 'Plot No. 876, Exhibition Road, Dakbunglow, Patna, Bihar',
      latitude: 25.607,
      longitude: 85.142,
      commissionRate: 10.0,
      rating: 4.7,
      reviewCount: 412,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.lemontree@bookkaro.in',
      ownerName: 'Alok N. Verma',
      ownerPhone: '9431001002',
      photos: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'All 7 Days', hours: '24 Hours Front Desk' },
      services: [
        { name: 'Superior King Room', priceInr: 4200, durationMins: 1440, description: 'Ergonomic work desk, LED TV, complimentary breakfast.' },
        { name: 'Premier Executive Suite', priceInr: 6500, durationMins: 1440, description: 'Spacious living area, express laundry, late checkout.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1003',
      brandName: 'Hotel Panache Luxury Stay',
      legalName: 'Panache Hospitality Enterprises LLP',
      category: 'hotels',
      locality: 'Fraser Road',
      pincode: '800001',
      address: 'Opp. Commerce College, Fraser Road, Patna, Bihar',
      latitude: 25.6095,
      longitude: 85.138,
      commissionRate: 10.0,
      rating: 4.6,
      reviewCount: 320,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.panache@bookkaro.in',
      ownerName: 'Vikas R. Panache',
      ownerPhone: '9431001003',
      photos: [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'All 7 Days', hours: '24 Hours Front Desk' },
      services: [
        { name: 'Club Classic Room', priceInr: 3800, durationMins: 1440, description: 'Cozy queen accommodation, premium linen.' },
        { name: 'Royal Panache Suite', priceInr: 5900, durationMins: 1440, description: 'Luxury suite with mini-bar and buffet inclusion.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1004',
      brandName: 'Patliputra Exotica Hotel & Banquets',
      legalName: 'Patliputra Exotica Hotels Private Limited',
      category: 'hotels',
      locality: 'Dakbunglow',
      pincode: '800001',
      address: 'Dakbunglow Crossing, Exhibition Road, Patna, Bihar',
      latitude: 25.6052,
      longitude: 85.1355,
      commissionRate: 10.0,
      rating: 4.5,
      reviewCount: 285,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.exotica@bookkaro.in',
      ownerName: 'Manish K. Gupta',
      ownerPhone: '9431001004',
      photos: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'All 7 Days', hours: '24 Hours Front Desk' },
      services: [
        { name: 'Deluxe Corporate Room', priceInr: 3400, durationMins: 1440, description: 'Comfortable business stay with complimentary buffet.' },
        { name: 'Exotica Grand Room', priceInr: 4800, durationMins: 1440, description: 'Spacious deluxe room with premium city view.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1005',
      brandName: 'The Grand Empire Hotel',
      legalName: 'Grand Empire Resorts & Hotels Bihar',
      category: 'hotels',
      locality: 'Bailey Road',
      pincode: '800014',
      address: 'Raja Bazaar, Near Flyover, Bailey Road, Patna, Bihar',
      latitude: 25.6115,
      longitude: 85.0835,
      commissionRate: 10.0,
      rating: 4.7,
      reviewCount: 310,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.grandempire@bookkaro.in',
      ownerName: 'Deepak S. Empire',
      ownerPhone: '9431001005',
      photos: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'All 7 Days', hours: '24 Hours Front Desk' },
      services: [
        { name: 'Imperial Deluxe Room', priceInr: 4100, durationMins: 1440, description: 'Luxury King bedroom with high-speed fiber internet.' },
        { name: 'Presidential Family Suite', priceInr: 7500, durationMins: 1440, description: 'Two interconnected rooms, living area, dining table.' },
      ],
    },

    // -------------------------------------------------------------------------
    // RESTAURANTS / DINING (5% Commission)
    // -------------------------------------------------------------------------
    {
      code: 'BK-PRV-PAT-1006',
      brandName: 'Bansi Vihar Pure Vegetarian Dining',
      legalName: 'Bansi Vihar Food Products LLP',
      category: 'restaurants',
      locality: 'Fraser Road',
      pincode: '800001',
      address: 'Near Mona Cinema, Fraser Road, Patna, Bihar',
      latitude: 25.6071,
      longitude: 85.1369,
      commissionRate: 5.0,
      rating: 4.8,
      reviewCount: 890,
      isVerified: true,
      isSponsored: true,
      ownerEmail: 'partner.bansivihar@bookkaro.in',
      ownerName: 'Rameshwar Jha',
      ownerPhone: '9431001006',
      photos: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'Monday – Sunday', hours: '08:00 AM – 10:30 PM' },
      services: [
        { name: 'Special Butter Masala Dosa Table Booking', priceInr: 220, durationMins: 45, description: 'Crispy ghee dosa with 3 chutneys & piping hot sambar.' },
        { name: 'Royal South Indian Deluxe Thali', priceInr: 350, durationMins: 60, description: 'Unlimited kootu, rasam, curd, vadai, appalam & payasam.' },
        { name: 'Filter Coffee & Mysore Pak Combo', priceInr: 140, durationMins: 30, description: 'Traditional brass tumbler filter coffee with warm ghee sweet.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1007',
      brandName: 'Pind Balluchi Heritage Dining',
      legalName: 'Pind Hospitality Ventures Patna',
      category: 'restaurants',
      locality: 'Boring Road',
      pincode: '800013',
      address: 'Pushpanjali Complex, Boring Road Crossing, Patna, Bihar',
      latitude: 25.6182,
      longitude: 85.116,
      commissionRate: 5.0,
      rating: 4.7,
      reviewCount: 540,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.pindballuchi@bookkaro.in',
      ownerName: 'Harpreet Singh',
      ownerPhone: '9431001007',
      photos: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'Monday – Sunday', hours: '12:00 PM – 11:00 PM' },
      services: [
        { name: 'Dal Makhani & Amritsari Kulcha Platter', priceInr: 420, durationMins: 60, description: 'Slow-cooked black lentils simmered overnight with butter.' },
        { name: 'Murgh Makhani Punjabi Feast', priceInr: 680, durationMins: 75, description: 'Tender chicken tikka in velvety tomato gravy with butter naan.' },
        { name: 'Family Buffet Table Reservation', priceInr: 1200, durationMins: 90, description: 'Reserved table for 4 with unlimited appetizers & main course.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1008',
      brandName: "Kapil Dev's Elevens Restaurant & Lounge",
      legalName: 'Elevens Sports Dine & Lounge Patna',
      category: 'restaurants',
      locality: 'Fraser Road',
      pincode: '800001',
      address: 'Dumraon Palace, Fraser Road, Patna, Bihar',
      latitude: 25.608,
      longitude: 85.137,
      commissionRate: 5.0,
      rating: 4.6,
      reviewCount: 430,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.elevens@bookkaro.in',
      ownerName: 'Aditya S. Sinha',
      ownerPhone: '9431001008',
      photos: [
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'Monday – Sunday', hours: '11:30 AM – 11:00 PM' },
      services: [
        { name: 'Multi-Cuisine Fine Dining Table', priceInr: 500, durationMins: 60, description: 'Curated sports-themed dining experience with mocktail on arrival.' },
        { name: 'Tandoori Kebab Platter Reservation', priceInr: 750, durationMins: 60, description: 'Assorted chicken, mutton, and fish kebabs fresh off the grill.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1009',
      brandName: 'Mainland China Patna',
      legalName: 'Speciality Restaurants East Division',
      category: 'restaurants',
      locality: 'Dakbunglow',
      pincode: '800001',
      address: 'Maurya Lok Complex, Dakbunglow Road, Patna, Bihar',
      latitude: 25.6055,
      longitude: 85.136,
      commissionRate: 5.0,
      rating: 4.8,
      reviewCount: 610,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.mainlandchina@bookkaro.in',
      ownerName: 'Chen Wei / Anupam Dey',
      ownerPhone: '9431001009',
      photos: [
        'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'Monday – Sunday', hours: '12:30 PM – 11:00 PM' },
      services: [
        { name: 'Dim Sum & Jumbo Prawns Banquet', priceInr: 950, durationMins: 75, description: 'Handcrafted dim sums served with signature fiery dip.' },
        { name: 'Hakka Noodles & Szechuan Combo', priceInr: 580, durationMins: 60, description: 'Wok-tossed noodles paired with spicy Szechuan chicken/paneer.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1010',
      brandName: 'Biryani Mahal Legendary Awadhi Kitchen',
      legalName: 'Biryani Mahal Heritage Foods',
      category: 'restaurants',
      locality: 'Fraser Road',
      pincode: '800001',
      address: 'Opp. Patna Junction Overbridge, Fraser Road, Patna, Bihar',
      latitude: 25.603,
      longitude: 85.1345,
      commissionRate: 5.0,
      rating: 4.9,
      reviewCount: 1250,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.biryanimahal@bookkaro.in',
      ownerName: 'Md. Tariq Anwar',
      ownerPhone: '9431001010',
      photos: [
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'Monday – Sunday', hours: '11:00 AM – 11:00 PM' },
      services: [
        { name: 'Special Awadhi Dum Mutton Biryani', priceInr: 380, durationMins: 45, description: 'Slow-cooked in handi with fragrant long-grain basmati & saffron.' },
        { name: 'Kolkata Style Chicken Biryani with Chaap', priceInr: 320, durationMins: 45, description: 'Served with signature melt-in-mouth potato & egg.' },
        { name: 'Shahi Firni Dessert Platter', priceInr: 120, durationMins: 30, description: 'Clay-pot chilled saffron rice pudding garnished with pistachios.' },
      ],
    },

    // -------------------------------------------------------------------------
    // SALONS & SPAS (10% Commission)
    // -------------------------------------------------------------------------
    {
      code: 'BK-PRV-PAT-1011',
      brandName: 'The Jawed Habib Premium Hair & Beauty',
      legalName: 'Jawed Habib Hair Studio Patna Franchise',
      category: 'salon',
      locality: 'Boring Road',
      pincode: '800013',
      address: '2nd Floor, Grand Plaza, Near Alankar Jewellers, Boring Road, Patna',
      latitude: 25.6175,
      longitude: 85.115,
      commissionRate: 10.0,
      rating: 4.8,
      reviewCount: 470,
      isVerified: true,
      isSponsored: true,
      ownerEmail: 'partner.jawedhabib@bookkaro.in',
      ownerName: 'Kunal K. Sharma',
      ownerPhone: '9431001011',
      photos: [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'Monday – Sunday', hours: '10:00 AM – 09:00 PM' },
      services: [
        { name: 'Master Haircut & Beard Architecture', priceInr: 650, durationMins: 45, description: 'Precision styling by senior artistic director with head wash.' },
        { name: 'Luxury Moroccan Argan Hair Spa', priceInr: 1500, durationMins: 60, description: 'Deep nourishing therapy for damaged & dry hair texture.' },
        { name: 'Clarifying Charcoal Detox Facial', priceInr: 1800, durationMins: 60, description: 'Removes deep impurities, blackheads, and restores natural glow.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1012',
      brandName: 'Lakmé Salon Patna Landmark Studio',
      legalName: 'Lakme Lever Beauty Services Patna',
      category: 'salon',
      locality: 'Fraser Road',
      pincode: '800001',
      address: 'Ashok Cinema Building, Fraser Road, Patna, Bihar',
      latitude: 25.609,
      longitude: 85.1372,
      commissionRate: 10.0,
      rating: 4.9,
      reviewCount: 580,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.lakme@bookkaro.in',
      ownerName: 'Priyanka Sen',
      ownerPhone: '9431001012',
      photos: [
        'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'Monday – Sunday', hours: '10:00 AM – 08:30 PM' },
      services: [
        { name: 'HD Bridal Makeup & Styling', priceInr: 9500, durationMins: 180, description: 'High-definition airbrush bridal makeover with draping.' },
        { name: 'Perfect Radiance Facial & De-tan', priceInr: 2400, durationMins: 75, description: 'Brightening collagen treatment with botanical serum infusion.' },
        { name: 'Advanced Keratin Hair Smoothing', priceInr: 4500, durationMins: 120, description: 'Frizz-free smoothness lasting up to 4 months.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1013',
      brandName: 'Toni & Guy Hairdressing Studio',
      legalName: 'Toni & Guy North India Partner',
      category: 'salon',
      locality: 'Patliputra Colony',
      pincode: '800013',
      address: 'Plot 45, Main Road, Patliputra Colony, Patna, Bihar',
      latitude: 25.6315,
      longitude: 85.1105,
      commissionRate: 10.0,
      rating: 4.8,
      reviewCount: 340,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.toniandguy@bookkaro.in',
      ownerName: 'Saurabh T. Roy',
      ownerPhone: '9431001013',
      photos: [
        'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'Tuesday – Sunday (Mon Closed)', hours: '10:00 AM – 08:00 PM' },
      services: [
        { name: 'Precision Creative Cut & Blowdry', priceInr: 1200, durationMins: 60, description: 'Bespoke European cut consultation tailored to face structure.' },
        { name: 'Balayage & Global Color Contour', priceInr: 5500, durationMins: 150, description: 'Seamless hand-painted color graduation with Olaplex bond.' },
        { name: 'Kérastase Chronologiste Caviar Ritual', priceInr: 3200, durationMins: 90, description: 'Total hair rejuvenation treatment with mimetic caviar pearls.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1014',
      brandName: 'Naturals Unisex Salon & Bridal Spa',
      legalName: 'Naturals Grooming Services Bihar',
      category: 'salon',
      locality: 'Kankarbagh',
      pincode: '800020',
      address: 'Opp. Malahi Pakri Chowk, Kankarbagh Main Road, Patna',
      latitude: 25.5925,
      longitude: 85.1555,
      commissionRate: 10.0,
      rating: 4.7,
      reviewCount: 390,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.naturals@bookkaro.in',
      ownerName: 'Reena Kumari',
      ownerPhone: '9431001014',
      photos: [
        'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'Monday – Sunday', hours: '09:30 AM – 08:30 PM' },
      services: [
        { name: 'Organic Fruit Cleanup & De-Tan', priceInr: 850, durationMins: 45, description: 'Natural antioxidant fruit pulp treatment for sensitive skin.' },
        { name: 'Deep Conditioning Aloe Hair Spa', priceInr: 950, durationMins: 50, description: 'Intensive scalp hydration with ozone steam therapy.' },
        { name: "Men's Executive Grooming Package", priceInr: 1100, durationMins: 60, description: 'Haircut, beard trim, detan pack & shoulder massage.' },
      ],
    },
    {
      code: 'BK-PRV-PAT-1015',
      brandName: 'VLCC Wellness & Aesthetic Clinic',
      legalName: 'VLCC Health Care Limited Patna',
      category: 'salon',
      locality: 'Bailey Road',
      pincode: '800014',
      address: 'Near Pillar No. 54, Bailey Road, Patna, Bihar',
      latitude: 25.6112,
      longitude: 85.0832,
      commissionRate: 10.0,
      rating: 4.7,
      reviewCount: 310,
      isVerified: true,
      isSponsored: false,
      ownerEmail: 'partner.vlcc@bookkaro.in',
      ownerName: 'Dr. Neha Srivastava',
      ownerPhone: '9431001015',
      photos: [
        'https://images.unsplash.com/photo-1512290900672-1f55b9a896a7?auto=format&fit=crop&w=1200&q=80',
      ],
      operatingHours: { days: 'Monday – Sunday', hours: '09:00 AM – 08:00 PM' },
      services: [
        { name: 'Gold Radiance Facial Therapy', priceInr: 2200, durationMins: 75, description: '24K gold foil infused anti-aging facial for instant luminosity.' },
        { name: 'Body Contour Slimming Session', priceInr: 3500, durationMins: 90, description: 'Targeted ultrasound cavitation with lymphatic drainage therapy.' },
        { name: 'Laser Hair Reduction Consultation', priceInr: 1500, durationMins: 45, description: 'US FDA-approved triple-wavelength diode laser patch test.' },
      ],
    },
  ];

  for (const p of providersData) {
    // 1. Create or find partner owner user
    const owner = await prisma.user.upsert({
      where: { email: p.ownerEmail },
      update: {},
      create: {
        fullName: p.ownerName,
        email: p.ownerEmail,
        phone: p.ownerPhone,
        passwordHash: defaultPasswordHash,
        role: Role.PARTNER_OWNER,
        isActive: true,
      },
    });

    // 2. Create or update Provider
    const provider = await prisma.provider.upsert({
      where: { providerCode: p.code },
      update: {
        brandName: p.brandName,
        legalName: p.legalName,
        category: p.category,
        locality: p.locality,
        pincode: p.pincode,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        commissionRate: p.commissionRate,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isVerified: p.isVerified,
        isSponsored: p.isSponsored,
        operatingHours: p.operatingHours,
        photos: p.photos,
        status: ProviderStatus.ACTIVE,
      },
      create: {
        providerCode: p.code,
        ownerId: owner.id,
        brandName: p.brandName,
        legalName: p.legalName,
        category: p.category,
        locality: p.locality,
        pincode: p.pincode,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        commissionRate: p.commissionRate,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isVerified: p.isVerified,
        isSponsored: p.isSponsored,
        commercialModel: CommercialModel.COMMISSION,
        subscriptionTier: SubscriptionTier.BUSINESS_PRO,
        operatingHours: p.operatingHours,
        photos: p.photos,
        status: ProviderStatus.ACTIVE,
      },
    });

    // 3. Upsert Services
    for (const s of p.services) {
      const existingService = await prisma.serviceItem.findFirst({
        where: { providerId: provider.id, name: s.name },
      });

      if (existingService) {
        await prisma.serviceItem.update({
          where: { id: existingService.id },
          data: {
            priceInr: s.priceInr,
            durationMins: s.durationMins,
            description: s.description,
            isActive: true,
          },
        });
      } else {
        await prisma.serviceItem.create({
          data: {
            providerId: provider.id,
            name: s.name,
            priceInr: s.priceInr,
            durationMins: s.durationMins,
            description: s.description,
            isActive: true,
          },
        });
      }
    }

    console.log(`✓ Seeded ${p.category.toUpperCase()}: ${p.brandName} (${p.locality})`);
  }

  // 5. Seed Realistic Verified Bookings & Reviews for Customer Vikramaditya
  const mauryaProvider = await prisma.provider.findUnique({
    where: { providerCode: 'BK-PRV-PAT-1001' },
  });

  if (mauryaProvider) {
    const bookingMaurya = await prisma.booking.upsert({
      where: { bookingCode: 'BK-PAT-4902' },
      update: {},
      create: {
        bookingCode: 'BK-PAT-4902',
        venuePin: '4902',
        customerId: customerUser.id,
        providerId: mauryaProvider.id,
        category: 'hotels',
        status: BookingStatus.COMPLETED,
        slotDate: '2026-11-10',
        slotTime: '12:00 PM Check-in',
        categoryDetails: { roomName: 'Executive Deluxe AC Room', nights: 1, guests: 2 },
        estimatedAmountInr: 4500,
        finalBillInr: 4500,
        paymentStatus: PaymentStatus.PAID,
      },
    });

    // Verified review
    await prisma.review.upsert({
      where: { bookingId: bookingMaurya.id },
      update: {},
      create: {
        bookingId: bookingMaurya.id,
        providerId: mauryaProvider.id,
        customerId: customerUser.id,
        rating: 5,
        comment: 'Room was immaculate, Wi-Fi clocked 120 Mbps. Outstanding front desk service in central Patna.',
        tags: ['Ganges View', 'Fast Wi-Fi', 'Courteous Staff'],
      },
    });

    // Commission ledger
    await prisma.commissionLedger.upsert({
      where: { bookingId: bookingMaurya.id },
      update: {},
      create: {
        bookingId: bookingMaurya.id,
        providerId: mauryaProvider.id,
        finalBillInr: 4500,
        commissionRate: 10.0,
        commissionAmountInr: 450,
        netPayoutInr: 4050,
        status: 'PAID',
      },
    });
  }

  const bansiProvider = await prisma.provider.findUnique({
    where: { providerCode: 'BK-PRV-PAT-1006' },
  });

  if (bansiProvider) {
    const bookingBansi = await prisma.booking.upsert({
      where: { bookingCode: 'BK-PAT-8120' },
      update: {},
      create: {
        bookingCode: 'BK-PAT-8120',
        venuePin: '8120',
        customerId: customerUser.id,
        providerId: bansiProvider.id,
        category: 'restaurants',
        status: BookingStatus.COMPLETED,
        slotDate: '2026-11-15',
        slotTime: '01:30 PM',
        categoryDetails: { partySize: 3, seating: 'Ground Floor AC' },
        estimatedAmountInr: 710,
        finalBillInr: 710,
        paymentStatus: PaymentStatus.PAID,
      },
    });

    await prisma.review.upsert({
      where: { bookingId: bookingBansi.id },
      update: {},
      create: {
        bookingId: bookingBansi.id,
        providerId: bansiProvider.id,
        customerId: customerUser.id,
        rating: 5,
        comment: 'Crispy butter masala dosas and authentic South Indian filter coffee. Seamless counter check-in with PIN.',
        tags: ['Authentic Taste', 'Hygienic', 'Value for Money'],
      },
    });

    await prisma.commissionLedger.upsert({
      where: { bookingId: bookingBansi.id },
      update: {},
      create: {
        bookingId: bookingBansi.id,
        providerId: bansiProvider.id,
        finalBillInr: 710,
        commissionRate: 5.0,
        commissionAmountInr: 35.5,
        netPayoutInr: 674.5,
        status: 'PAID',
      },
    });
  }

  console.log('✅ BOOKKARO Patna Database Seeding Finished Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
