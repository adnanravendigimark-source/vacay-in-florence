import "server-only";

/**
 * Server-side geocoding for product meeting points. Called by
 * getProductBySlug (src/lib/data/products.ts) exactly when a product has
 * an address (meetingPoint/City/Country) but no stored meetingLat/meetingLng
 * yet, then the resolved coordinates are written back to that product row —
 * so the same address is geocoded once, ever, not on every page view.
 *
 * Uses Mapbox's Geocoding API with a SECRET server-only token
 * (MAPBOX_SERVER_TOKEN) that never reaches the client — distinct from
 * NEXT_PUBLIC_MAPBOX_TOKEN, which is the public token the interactive map
 * widget uses in the browser. Keeping these separate is the point: a
 * leaked/scraped public map token can only render map tiles, never spend
 * the account's geocoding request quota.
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
}

export interface GeocodeAddressInput {
  address: string | null;
  city: string | null;
  country: string | null;
}

// Small in-memory de-dupe so a burst of concurrent requests for the same
// still-ungeocoded product (e.g. several tabs loading the same page before
// the DB write-back lands) doesn't fire the same geocoding call twice.
const inFlight = new Map<string, Promise<GeocodeResult | null>>();

export async function geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeResult | null> {
  const parts = [input.address, input.city, input.country].filter(
    (p): p is string => Boolean(p && p.trim())
  );
  if (parts.length === 0) return null;

  const token = process.env.MAPBOX_SERVER_TOKEN;
  if (!token) {
    console.warn(
      "[geocoding] MAPBOX_SERVER_TOKEN is not set — skipping geocoding. See .env.example."
    );
    return null;
  }

  const query = parts.join(", ");
  const cacheKey = query.toLowerCase();

  const existing = inFlight.get(cacheKey);
  if (existing) return existing;

  const promise = (async (): Promise<GeocodeResult | null> => {
    try {
      const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
        `?access_token=${token}&limit=1`;

      // Geocoding results for a real-world street address don't change, so
      // this is safe to cache at the fetch layer too — it's a bonus on top
      // of the DB write-back, useful the first time a brand-new address is
      // requested by more than one concurrent request.
      const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });

      if (!res.ok) {
        console.error(`[geocoding] Mapbox request failed: ${res.status} ${res.statusText}`);
        return null;
      }

      const data = await res.json();
      const feature = data?.features?.[0];
      const center = feature?.center; // Mapbox returns [lng, lat]

      if (!Array.isArray(center) || center.length !== 2) {
        return null;
      }

      const [lng, lat] = center;
      if (typeof lat !== "number" || typeof lng !== "number") return null;

      return { lat, lng };
    } catch (err) {
      console.error("[geocoding] Failed to geocode address:", err);
      return null;
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, promise);
  return promise;
}
