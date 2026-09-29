import { NextResponse } from "next/server";

export interface NormalizedLocation {
  id: string;
  title: string;
  subtitle: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  street?: string;
  formattedAddress: string;
}

// Map common localized country names to standard English names
const COUNTRY_MAP: Record<string, string> = {
  italia: "Italy",
  italy: "Italy",
  espana: "Spain",
  españa: "Spain",
  spain: "Spain",
  france: "France",
  deutschland: "Germany",
  germany: "Germany",
  "united states": "United States",
  usa: "United States",
  "united kingdom": "United Kingdom",
  uk: "United Kingdom",
  india: "India",
  bharat: "India",
  schweiz: "Switzerland",
  suisse: "Switzerland",
  switzerland: "Switzerland",
  österreich: "Austria",
  austria: "Austria",
  nederland: "Netherlands",
  netherlands: "Netherlands",
  belgique: "Belgium",
  belgië: "Belgium",
  belgium: "Belgium",
  japan: "Japan",
  china: "China",
  australia: "Australia",
  canada: "Canada",
  uae: "United Arab Emirates",
  "united arab emirates": "United Arab Emirates",
  morocco: "Morocco",
  turkey: "Turkey",
  türkiye: "Turkey",
  brazil: "Brazil",
  brasil: "Brazil",
  mexico: "Mexico",
  méxico: "Mexico",
  egypt: "Egypt",
  argentina: "Argentina",
  peru: "Peru",
  perú: "Peru",
  colombia: "Colombia",
};

function normalizeCountry(rawCountry?: string): string {
  if (!rawCountry) return "Italy";
  const cleaned = rawCountry.trim().toLowerCase();
  return COUNTRY_MAP[cleaned] || rawCountry;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results: NormalizedLocation[] = [];

  // 1. Check for 6-digit Indian PIN codes
  if (/^\d{6}$/.test(query)) {
    try {
      const pinRes = await fetch(`https://api.postalpincode.in/pincode/${query}`, {
        headers: { "Accept": "application/json" },
        next: { revalidate: 3600 },
      });
      if (pinRes.ok) {
        const pinData = await pinRes.json();
        if (pinData && pinData[0]?.Status === "Success" && Array.isArray(pinData[0]?.PostOffice)) {
          for (const po of pinData[0].PostOffice.slice(0, 5)) {
            const cityName = po.District || po.Division || po.Circle || "New Delhi";
            results.push({
              id: `in-${query}-${po.Name}`,
              title: `${po.Name}, ${cityName}`,
              subtitle: `${po.State}, India • PIN ${query}`,
              city: cityName,
              state: po.State,
              country: "India",
              postalCode: query,
              street: po.Name,
              formattedAddress: `${po.Name}, ${cityName}, ${po.State} ${query}, India`,
            });
          }
          if (results.length > 0) {
            return NextResponse.json({ results });
          }
        }
      }
    } catch {
      // Fallback to OpenStreetMap/Photon below
    }
  }

  // 2. Query OpenStreetMap Nominatim with a proper User-Agent
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=6`;

    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "VacayFlorenceSupplierOnboarding/1.0 (info@vacayflorence.com)",
        "Accept-Language": "en, it",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const addr = item.address || {};
          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            addr.county ||
            item.name ||
            "";
          const state = addr.state || addr.region || "";
          const country = normalizeCountry(addr.country);
          const postalCode = addr.postcode || "";
          const street = addr.road || addr.street || addr.suburb || "";

          if (city || postalCode) {
            const title = street
              ? `${street}, ${city || country}`
              : city
              ? `${city}, ${state || country}`
              : item.display_name.split(",")[0];

            const subtitle = [
              postalCode ? `Postal Code: ${postalCode}` : null,
              state,
              country,
            ]
              .filter(Boolean)
              .join(" • ");

            results.push({
              id: `osm-${item.place_id}`,
              title,
              subtitle,
              city: city || "Florence",
              state,
              country,
              postalCode,
              street,
              formattedAddress: item.display_name,
            });
          }
        }
      }
    }
  } catch {
    // Nominatim failed, fallback to Photon below
  }

  // 3. Fallback: Query Komoot Photon API if Nominatim returned few or no results
  if (results.length < 3) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`;
      const photonRes = await fetch(photonUrl, {
        headers: { "Accept": "application/json" },
        next: { revalidate: 3600 },
      });

      if (photonRes.ok) {
        const photonData = await photonRes.json();
        if (photonData && Array.isArray(photonData.features)) {
          for (const feat of photonData.features) {
            const props = feat.properties || {};
            const city = props.city || props.town || props.name || "";
            const state = props.state || props.county || "";
            const country = normalizeCountry(props.country);
            const postalCode = props.postcode || "";
            const street = props.street || "";

            const key = `${city}-${postalCode}-${country}`;
            if (!results.some((r) => `${r.city}-${r.postalCode}-${r.country}` === key)) {
              results.push({
                id: `photon-${props.osm_id || Math.random()}`,
                title: street ? `${street}, ${city}` : `${city}, ${country}`,
                subtitle: [
                  postalCode ? `Postal Code: ${postalCode}` : null,
                  state,
                  country,
                ]
                  .filter(Boolean)
                  .join(" • "),
                city: city || "Florence",
                state,
                country,
                postalCode,
                street,
                formattedAddress: `${props.name || ""}, ${city}, ${country}`,
              });
            }
          }
        }
      }
    } catch {
      // Return whatever results we have
    }
  }

  return NextResponse.json({ results: results.slice(0, 8) });
}
