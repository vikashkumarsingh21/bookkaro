import prisma from '../../config/db';
import { NotFoundError } from '../../utils/errors';
import { haversineDistanceKm, resolveTargetCoordinates } from '../../utils/patnaGeo';
import { SearchQueryParams } from './discovery.validation';
import { Prisma } from '@prisma/client';

export interface ProviderSearchResultItem {
  id: string;
  providerCode: string;
  brandName: string;
  legalName: string;
  category: string;
  locality: string;
  pincode: string;
  address: string;
  latitude: number;
  longitude: number;
  isVerified: boolean;
  isSponsored: boolean;
  rating: number;
  reviewCount: number;
  commercialModel: string;
  commissionRate: number;
  subscriptionTier: string;
  operatingHours: unknown;
  photos: string[];
  startingPriceInr: number;
  distanceKm: number;
  services: {
    id: string;
    name: string;
    priceInr: number;
    durationMins: number | null;
  }[];
}

export class DiscoveryService {
  /**
   * Search active Patna providers with target locality geodistance and ranking
   */
  async search(params: SearchQueryParams) {
    const {
      q,
      category,
      lat,
      lng,
      locality,
      pincode,
      radiusKm,
      minPrice,
      maxPrice,
      minRating,
      verifiedOnly,
      page,
      limit,
    } = params;

    // 1. Resolve destination coordinates from target locality/pincode
    const targetLocation = resolveTargetCoordinates({ lat, lng, locality, pincode });

    // 2. Build indexed Prisma WHERE conditions
    const where: Prisma.ProviderWhereInput = {
      status: 'ACTIVE',
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (verifiedOnly) {
      where.isVerified = true;
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    // Text search query across name, locality, address
    if (q) {
      where.OR = [
        { brandName: { contains: q, mode: 'insensitive' } },
        { legalName: { contains: q, mode: 'insensitive' } },
        { locality: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }

    // 3. Lightweight query execution
    const providers = await prisma.provider.findMany({
      where,
      select: {
        id: true,
        providerCode: true,
        brandName: true,
        legalName: true,
        category: true,
        locality: true,
        pincode: true,
        address: true,
        latitude: true,
        longitude: true,
        isVerified: true,
        isSponsored: true,
        rating: true,
        reviewCount: true,
        commercialModel: true,
        commissionRate: true,
        subscriptionTier: true,
        operatingHours: true,
        photos: true,
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            priceInr: true,
            durationMins: true,
          },
        },
      },
    });

    // 4. Compute geospatial distance & starting prices
    let items: ProviderSearchResultItem[] = providers.map((p) => {
      const distanceKm = haversineDistanceKm(
        targetLocation.lat,
        targetLocation.lng,
        p.latitude,
        p.longitude
      );

      const parsedServices = p.services.map((s) => ({
        id: s.id,
        name: s.name,
        priceInr: Number(s.priceInr),
        durationMins: s.durationMins,
      }));

      const servicePrices = parsedServices.map((s) => s.priceInr);
      const startingPriceInr = servicePrices.length > 0 ? Math.min(...servicePrices) : 0;

      return {
        id: p.id,
        providerCode: p.providerCode,
        brandName: p.brandName,
        legalName: p.legalName,
        category: p.category,
        locality: p.locality,
        pincode: p.pincode,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        isVerified: p.isVerified,
        isSponsored: p.isSponsored,
        rating: p.rating,
        reviewCount: p.reviewCount,
        commercialModel: p.commercialModel,
        commissionRate: p.commissionRate,
        subscriptionTier: p.subscriptionTier,
        operatingHours: p.operatingHours,
        photos: p.photos,
        startingPriceInr,
        distanceKm,
        services: parsedServices,
      };
    });

    // 5. In-memory radius filter (within radiusKm of target Patna destination)
    if (radiusKm) {
      items = items.filter((item) => item.distanceKm <= radiusKm);
    }

    // 6. Price filter
    if (minPrice !== undefined) {
      items = items.filter((item) => item.startingPriceInr >= minPrice);
    }
    if (maxPrice !== undefined) {
      items = items.filter((item) => item.startingPriceInr <= maxPrice);
    }

    // 7. Deterministic Ranking:
    // isSponsored (first) -> Distance from target location -> isVerified -> rating
    items.sort((a, b) => {
      if (a.isSponsored !== b.isSponsored) {
        return a.isSponsored ? -1 : 1;
      }
      if (a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.isVerified !== b.isVerified) {
        return a.isVerified ? -1 : 1;
      }
      return b.rating - a.rating;
    });

    // 8. Pagination
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      total,
      page,
      totalPages,
      targetLocation: {
        lat: targetLocation.lat,
        lng: targetLocation.lng,
        localityName: targetLocation.localityName,
        pincode: targetLocation.pincode,
      },
    };
  }

  /**
   * Get single provider details by ID or code
   */
  async getProviderById(id: string) {
    const provider = await prisma.provider.findFirst({
      where: {
        OR: [{ id }, { providerCode: id }],
        status: 'ACTIVE',
      },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { priceInr: 'asc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundError(
        `Provider with reference '${id}' was not found or is currently suspended in Patna.`
      );
    }

    const services = provider.services.map((s) => ({
      ...s,
      priceInr: Number(s.priceInr),
    }));

    return {
      ...provider,
      services,
    };
  }

  /**
   * Get top featured providers across Hotels, Dining, and Salons + live category metrics
   */
  async getFeatured() {
    const [hotels, restaurants, salons, hotelsCount, restaurantsCount, salonCount] =
      await Promise.all([
        prisma.provider.findMany({
          where: { category: 'hotels', status: 'ACTIVE', isVerified: true },
          include: {
            services: { where: { isActive: true }, take: 2 },
          },
          orderBy: [{ isSponsored: 'desc' }, { rating: 'desc' }],
          take: 4,
        }),
        prisma.provider.findMany({
          where: { category: 'restaurants', status: 'ACTIVE', isVerified: true },
          include: {
            services: { where: { isActive: true }, take: 2 },
          },
          orderBy: [{ isSponsored: 'desc' }, { rating: 'desc' }],
          take: 4,
        }),
        prisma.provider.findMany({
          where: { category: 'salon', status: 'ACTIVE', isVerified: true },
          include: {
            services: { where: { isActive: true }, take: 2 },
          },
          orderBy: [{ isSponsored: 'desc' }, { rating: 'desc' }],
          take: 4,
        }),
        prisma.provider.count({ where: { category: 'hotels', status: 'ACTIVE' } }),
        prisma.provider.count({ where: { category: 'restaurants', status: 'ACTIVE' } }),
        prisma.provider.count({ where: { category: 'salon', status: 'ACTIVE' } }),
      ]);

    return {
      categories: {
        hotels: {
          count: hotelsCount,
          items: hotels,
        },
        restaurants: {
          count: restaurantsCount,
          items: restaurants,
        },
        salons: {
          count: salonCount,
          items: salons,
        },
      },
    };
  }
}

export const discoveryService = new DiscoveryService();
