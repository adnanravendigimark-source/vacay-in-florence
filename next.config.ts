import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack's experimental persistent disk cache for `next dev` is ON
  // by default in Next 16 (experimental.turbopackFileSystemCacheForDev
  // defaults to true) — it writes an on-disk database of .sst/.meta
  // files to .next/dev/cache/turbopack/. Any non-graceful dev-server
  // stop (Ctrl+C, a crash, a hot-reload race) can leave that database
  // torn mid-write, and Turbopack then panics on the next request
  // ("block header truncated", "No such file or directory" for a
  // referenced .sst file) and aborts the whole process — the repeating
  // dev-server-crashes-on-its-own issue. Disabling it falls back to
  // Turbopack's in-memory cache only: slightly slower cold starts after
  // each restart, but nothing left on disk that can corrupt.
  // See https://nextjs.org/docs/app/api-reference/config/next-config-js/experimental
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
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
