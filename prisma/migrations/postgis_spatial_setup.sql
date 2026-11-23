-- ============================================================================
-- BOOKKARO PostGIS Spatial Database Migration & Setup
-- Multi-Category Local Discovery & Booking Engine (Radius & Destination Search)
-- ============================================================================

-- 1. Enable PostGIS Extension on PostgreSQL
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Spatial GIST Index on Branch Coordinates
-- This creates a spatial index on the geography point (WGS84 EPSG:4326) derived from longitude & latitude.
-- Enables sub-millisecond execution for ST_DWithin and ST_Distance queries across millions of branches.
CREATE INDEX IF NOT EXISTS idx_branch_spatial_location
ON "Branch"
USING GIST (
  (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography)
);

-- 3. Production PostGIS Query Example: Nearby Branch Discovery with Radius & Relevance
-- Input Parameters:
--   $1: Origin Longitude (e.g. 85.1376 for Patna)
--   $2: Origin Latitude  (e.g. 25.5941 for Patna)
--   $3: Radius in Meters (e.g. 5000 for 5km, 10000 for 10km, 25000 for 25km)
--   $4: Category Filter  (e.g. 'HEALTHCARE' or NULL)
--
-- Query:
/*
SELECT 
    b.id AS branch_id,
    b.name AS branch_name,
    b.locality,
    b.city,
    b.pincode,
    b.latitude,
    b.longitude,
    p.id AS provider_id,
    p."providerCode",
    p."businessName",
    p.category,
    p.rating,
    p."reviewCount",
    p."verificationStatus",
    ROUND(
      (ST_Distance(
        ST_SetSRID(ST_MakePoint(b.longitude, b.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) / 1000.0)::numeric, 2
    ) AS distance_km
FROM "Branch" b
INNER JOIN "Provider" p ON b."providerId" = p.id
WHERE 
    b."isActive" = true
    AND p."verificationStatus" = 'VERIFIED'
    AND ($4::"ProviderCategory" IS NULL OR p.category = $4::"ProviderCategory")
    AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(b.longitude, b.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3 -- Radius in meters (e.g. 5000)
    )
ORDER BY 
    distance_km ASC,
    p.rating DESC
LIMIT 50;
*/
