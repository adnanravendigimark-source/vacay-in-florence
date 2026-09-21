"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";

export { useLenis } from "lenis/react";

/**
 * Wraps a subtree with Lenis-powered smooth (eased/inertial) scrolling,
 * matching the buttery scroll feel of travelnextlvl.de. `root` attaches
 * Lenis to the window/document instead of rendering a wrapper div, so it
 * doesn't change this page's DOM structure or affect other routes — it's
 * mounted locally (currently just /home-2), not in the root layout.
 *
 * Respects prefers-reduced-motion: when set, this renders children
 * directly and scrolling stays native.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        duration: 1.15,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
      }}
    >
      {children}
    </ReactLenis>
  );
}
