import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admin experience images are entered as freeform URLs (no upload/CDN
    // yet), so any HTTPS host must be allowed here or next/image throws
    // "hostname is not configured" the first time someone pastes a URL
    // from a new source (seen with a Google Images thumbnail host).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
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
