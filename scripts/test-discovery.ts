import { searchProviders } from "../src/services/discovery.service";
import { resolveDestination, calculateHaversineDistanceKm } from "../src/lib/geo";

async function runDiscoveryTests() {
  console.log("=================================================");
  console.log("🧭 BOOKKARO Module 2 Geospatial Discovery Tests");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${label}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${label}`);
      failed++;
    }
  }

  // 1. Destination Resolver Tests
  console.log("1. Destination Resolution (City, Locality & PIN code)");
  const destPatna = resolveDestination("Patna");
  assert(destPatna.city === "Patna" && destPatna.coordinates.lat === 25.5941, "City 'Patna' resolved to center coordinates");

  const destPincode = resolveDestination("800020");
  assert(destPincode.city === "Patna" && destPincode.locality === "Kankarbagh", "PIN code 800020 resolved to Kankarbagh, Patna");

  const destRajkot = resolveDestination("Rajkot");
  assert(destRajkot.city === "Rajkot" && destRajkot.coordinates.lat === 22.3039, "City 'Rajkot' resolved to center coordinates");

  const destDelhi = resolveDestination("110001");
  assert(destDelhi.city === "Delhi" && destDelhi.locality === "Connaught Place", "PIN code 110001 resolved to Connaught Place, Delhi");

  // 2. Haversine Distance Calculation
  console.log("\n2. Geospatial Distance Calculation (WGS84)");
  // Distance from Fraser Road (25.6093, 85.1376) to Kankarbagh (25.5920, 85.1550) ~ 2.6 km
  const dist = calculateHaversineDistanceKm(25.6093, 85.1376, 25.5920, 85.1550);
  assert(dist >= 2.0 && dist <= 3.5, `Patna inter-locality distance accurate (${dist} km)`);

  // 3. Nearby Search (GPS Mode - Fraser Road, Patna)
  console.log("\n3. 'Near Me' Search (User's GPS Lat/Lng + 5 km Radius)");
  const nearbyResult = await searchProviders({
    lat: 25.6093,
    lng: 85.1376,
    radiusKm: 5,
  });

  assert(nearbyResult.providers.length > 0, `Discovered ${nearbyResult.providers.length} providers within 5 km GPS radius`);
  assert(nearbyResult.providers.every((p) => p.distanceKm <= 5.0), "All returned providers strictly within 5.0 km radius");
  assert(nearbyResult.providers[0].distanceKm <= nearbyResult.providers[nearbyResult.providers.length - 1].distanceKm, "Distance sorted ascending");

  // 4. Destination Search (User in Lalganj searching for 'Patna' providers)
  console.log("\n4. Destination Search (User searching outside current GPS)");
  const destSearchResult = await searchProviders({
    city: "Patna",
    radiusKm: 15,
  });
  assert(destSearchResult.resolvedDestination.city === "Patna", "Destination resolved to target city Patna");
  assert(destSearchResult.providers.every((p) => p.nearestBranch.city === "Patna"), "Providers returned from target destination city");

  // 5. Category Filtering
  console.log("\n5. Category-Specific Multi-Intent Filtering");
  const clinicResult = await searchProviders({
    category: "healthcare",
    city: "Patna",
    radiusKm: 25,
  });
  assert(clinicResult.providers.length > 0, `Discovered ${clinicResult.providers.length} Healthcare clinics`);
  assert(clinicResult.providers.every((p) => p.category === "HEALTHCARE"), "All returned providers match HEALTHCARE");

  const salonResult = await searchProviders({
    category: "salon",
    city: "Rajkot",
    radiusKm: 25,
  });
  assert(salonResult.providers.length > 0, `Discovered ${salonResult.providers.length} Salons in Rajkot`);
  assert(salonResult.providers.every((p) => p.category === "SALON"), "All returned providers match SALON");

  // 6. Ranking Order & Sponsored Placements
  console.log("\n6. Strict Ranking Order & Sponsored Placement Verification");
  const rankedResult = await searchProviders({
    city: "Patna",
    radiusKm: 25,
  });
  const firstProvider = rankedResult.providers[0];
  assert(firstProvider.isSponsored === true, "Sponsored placement is prioritized at the top with clear label");
  assert(typeof firstProvider.startingPriceInr === "number", "Starting price in INR correctly populated");
  assert(typeof firstProvider.nextAvailableSlot === "string", "Next available slot dynamically calculated");

  // 7. Text Search & Keyword Relevance
  console.log("\n7. Text Search Relevance");
  const textSearchResult = await searchProviders({
    q: "Pediatric",
    city: "Patna",
    radiusKm: 25,
  });
  assert(textSearchResult.providers.some((p) => p.businessName.includes("Pediatric")), "Found provider matching text search 'Pediatric'");

  // 8. Pagination Verification
  console.log("\n8. Pagination Verification");
  const pageResult = await searchProviders({
    city: "Patna",
    radiusKm: 50,
    page: 1,
    limit: 2,
  });
  assert(pageResult.providers.length <= 2, "Page limit of 2 respected");
  assert(pageResult.pagination.limit === 2, "Pagination metadata limit matched");
  assert(pageResult.pagination.total >= pageResult.providers.length, "Pagination total count accurate");

  console.log(`\n=================================================`);
  console.log(`🎯 Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`=================================================`);

  if (failed > 0) process.exit(1);
}

runDiscoveryTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
