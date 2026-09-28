import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // jsdom (pulled in by isomorphic-dompurify, used server-side to sanitize
  // rich blog-post HTML — see src/lib/blog/rich-content.ts) does dynamic,
  // environment-sensing requires that Turbopack's bundler doesn't handle
  // correctly; bundling it broke module evaluation under `next dev` with
  // "webidl.util.markAsUncloneable is not a function". Marking it (and its
  // wrapper) external makes Next.js load it via plain Node `require()`
  // instead of bundling it — jsdom's own docs recommend exactly this for
  // any bundler. See https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages
  serverExternalPackages: ["jsdom", "isomorphic-dompurify"],
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
