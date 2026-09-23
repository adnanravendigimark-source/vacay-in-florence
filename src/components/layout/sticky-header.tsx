"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";

export function StickyHeader({
  children,
  renderContent,
}: {
  children?: ReactNode;
  renderContent?: (scrolled: boolean, isHome: boolean) => ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Only pages that render a full-bleed hero banner right at the top
  // (which the transparent/negative-margin header is designed to overlap)
  // belong here. /blog/[slug] article pages start with a plain breadcrumb
  // + heading instead, so including a blanket /blog prefix pulled that
  // content up underneath the sticky header — see /blog/[slug]/page.tsx.
  const isHeroPage =
    pathname === "/" ||
    pathname.startsWith("/experiences") ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/category");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isHeroPage
          ? scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-200/80 py-0"
            : "bg-transparent -mb-20 border-0 py-1"
          : "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-200/80 py-0"
      }`}
    >
      {renderContent ? renderContent(scrolled, isHome) : children}
    </header>
  );
}


