import { NextRequest } from "next/server";
import { searchProviders, SearchProvidersQuery } from "@/services/discovery.service";
import { apiSuccess } from "@/lib/api-response";
import { handleApiError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams: SearchProvidersQuery = {
      q: searchParams.get("q") || undefined,
      category: searchParams.get("category") || undefined,
      lat: searchParams.has("lat") ? Number(searchParams.get("lat")) : undefined,
      lng: searchParams.has("lng") ? Number(searchParams.get("lng")) : undefined,
      city: searchParams.get("city") || undefined,
      pincode: searchParams.get("pincode") || undefined,
      radiusKm: searchParams.has("radiusKm")
        ? Number(searchParams.get("radiusKm"))
        : searchParams.has("radius")
        ? Number(searchParams.get("radius"))
        : 5,
      date: searchParams.get("date") || undefined,
      verifiedOnly:
        searchParams.get("verifiedOnly") === "true" ||
        searchParams.get("verified") === "true",
      openNow: searchParams.get("openNow") === "true",
      minPrice: searchParams.has("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.has("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      minRating: searchParams.has("minRating")
        ? Number(searchParams.get("minRating"))
        : undefined,
      page: searchParams.has("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.has("limit") ? Number(searchParams.get("limit")) : 10,
      sortBy: (searchParams.get("sortBy") as SearchProvidersQuery["sortBy"]) || "relevance",
    };

    const results = await searchProviders(queryParams);

    return apiSuccess(results);
  } catch (error) {
    return handleApiError(error);
  }
}
