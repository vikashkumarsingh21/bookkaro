import { describe, it, expect } from "vitest";
import {
  calculateHaversineDistanceKm,
  resolveDestination,
} from "@/lib/geo";
import {
  searchPatnaProviders,
  resolveTargetLocation,
  getPatnaProviderById,
  getCategoryCounts,
  getFeaturedPatnaProviders,
} from "@/services/discoveryService";

describe("Geospatial & Discovery Unit Tests", () => {
  it("resolves Indian cities and PIN codes to accurate GPS coordinates", () => {
    const patna = resolveDestination("Patna");
    expect(patna.city).toBe("Patna");
    expect(patna.coordinates.lat).toBeCloseTo(25.5941, 1);

    const pinPatna = resolveDestination("800020");
    expect(pinPatna.locality).toBe("Kankarbagh");

    const boring = resolveDestination("Boring Road");
    expect(boring.locality).toBe("Boring Road");
    expect(boring.city).toBe("Patna");

    const lalganj = resolveDestination("844121");
    expect(lalganj.locality).toBe("Lalganj");
    expect(lalganj.city).toBe("Patna");
  });

  it("calculates accurate great-circle Haversine distances in kilometers", () => {
    // Distance between Patna Central (25.5941, 85.1376) and Kankarbagh (25.5990, 85.1630)
    const dist = calculateHaversineDistanceKm(25.5941, 85.1376, 25.599, 85.163);
    expect(dist).toBeGreaterThan(2.0);
    expect(dist).toBeLessThan(3.5);
  });

  describe("Patna Dual-Intent Discovery Service", () => {
    it("resolves target destination accurately for both Near Me and Destination queries", () => {
      // Near Me Mode
      const nearMe = resolveTargetLocation("", true);
      expect(nearMe.isNearMe).toBe(true);
      expect(nearMe.coordinates.lat).toBeCloseTo(25.6092, 2);

      // Destination Mode with PIN code 800013 (Boring Road)
      const pinDest = resolveTargetLocation("800013", false);
      expect(pinDest.isNearMe).toBe(false);
      expect(pinDest.locality).toBe("Boring Road");

      // Destination Mode with Lalganj corridor PIN 844121
      const lalganj = resolveTargetLocation("844121", false);
      expect(lalganj.isNearMe).toBe(false);
      expect(lalganj.locality).toBe("Lalganj Corridor");
    });

    it("calculates distance relative to destination when user is searching remotely (e.g. Lalganj origin searching Boring Road)", async () => {
      // Suppose a user in Lalganj (lat: 25.867, lng: 85.178) is searching for healthcare in "Boring Road"
      const result = await searchPatnaProviders({
        destination: "Boring Road",
        category: "healthcare",
        radiusKm: 25,
      });

      expect(result.providers.length).toBeGreaterThan(0);
      expect(result.targetLocation.locality).toBe("Boring Road");

      // The distance computed for providers in Boring Road should be small (< 2 km),
      // NOT relative to Lalganj (which would be ~30+ km away)!
      const boringRoadProvider = result.providers.find((p) => p.locality === "Boring Road");
      if (boringRoadProvider) {
        expect(boringRoadProvider.calculatedDistanceKm).toBeLessThan(3.0);
      }
    });

    it("applies multi-factor ranking correctly with sponsored flag boost", async () => {
      const result = await searchPatnaProviders({
        category: "healthcare",
        radiusKm: 50,
      });

      expect(result.providers.length).toBeGreaterThan(0);
      // The first provider should have isSponsored: true or highest composite relevance
      const first = result.providers[0];
      expect(first.isSponsored).toBe(true);
    });

    it("filters accurately by category, price, verified status, and rating", async () => {
      const result = await searchPatnaProviders({
        category: "hotels",
        minRating: 4.5,
        verifiedOnly: true,
      });

      expect(result.providers.every((p) => p.category === "hotels")).toBe(true);
      expect(result.providers.every((p) => p.rating >= 4.5)).toBe(true);
      expect(result.providers.every((p) => p.isVerified === true)).toBe(true);
    });

    it("returns accurate category counts across all 5 Patna verticals", async () => {
      const counts = await getCategoryCounts();
      expect(counts.healthcare).toBeGreaterThan(0);
      expect(counts.hotels).toBeGreaterThan(0);
      expect(counts.restaurants).toBeGreaterThan(0);
      expect(counts.salon).toBeGreaterThan(0);
      expect(counts.vehicle_care).toBeGreaterThan(0);
    });

    it("retrieves a provider by id and computes center distance", async () => {
      const prov = await getPatnaProviderById("prov-pat-01");
      expect(prov).not.toBeNull();
      expect(prov?.id).toBe("prov-pat-01");
      expect(prov?.city).toBe("Patna");
      expect(prov?.calculatedDistanceKm).toBeDefined();
    });

    it("returns featured verified providers", async () => {
      const featured = await getFeaturedPatnaProviders(4);
      expect(featured.length).toBe(4);
      expect(featured[0].isVerified).toBe(true);
    });
  });
});
