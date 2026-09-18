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
        isHome
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

