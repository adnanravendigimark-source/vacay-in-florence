import React from "react";
import Link from "next/link";
import Image from "next/image";

interface VacayLogoProps {
  className?: string;
  variant?: "light" | "dark" | "default";
  iconOnly?: boolean;
}

export function VacayLogo({
  className = "",
  variant = "light",
}: VacayLogoProps) {
  const isLight = variant === "light";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg ${className}`}
      aria-label="VacayIn Florence — Home"
    >
      <div className="relative flex items-center shrink-0">
        <Image
          src={isLight ? "/images/vacayin-florence-logo-white.png" : "/images/vacayin-florence-logo.png"}
          alt="VacayIn Florence"
          width={220}
          height={82}
          priority
          className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
    </Link>
  );
}

