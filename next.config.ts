import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Note: the experience-location-map is rendered client-side with
    // Mapbox GL JS (WebGL canvas tiles), not next/image, so no Mapbox
    // remotePatterns entry is needed here. src/lib/geocoding.ts talks to
    // api.mapbox.com directly via fetch(), server-side only.
  },
};

export default nextConfig;
