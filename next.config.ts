import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The homepage's placeholder imagery is hand-authored, locally hosted
    // SVG illustration (no external hosts, nothing user-supplied), so it's
    // safe to allow through next/image; the strict CSP below still blocks
    // any script execution inside an SVG. Swap for real product photos via
    // `images.remotePatterns` once product_images URLs point at Vercel
    // Blob / an image CDN.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
