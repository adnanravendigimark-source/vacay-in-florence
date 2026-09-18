import React from "react";
import Link from "next/link";

interface VacayLogoProps {
  className?: string;
  variant?: "light" | "dark" | "default";
  iconOnly?: boolean;
}

export function VacayLogo({
  className = "",
  variant = "light",
  iconOnly = false,
}: VacayLogoProps) {
  const isDark = variant === "dark";
  const primaryColor = isDark ? "#142d22" : "#ffffff";
  const accentColor = isDark ? "#c1502e" : "#f59e0b";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 transition-all duration-200 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg ${className}`}
      aria-label="VACAY in Florence — Home"
    >
      {/* Modern High-Visibility Florence Duomo Emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 44 44"
          className="h-9 w-9 sm:h-10 sm:w-10 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Base Platform Line */}
          <path
            d="M4 38H40"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Cathedral Arcade Base */}
          <path
            d="M6 38V31H28V38"
            stroke={primaryColor}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Arches */}
          <path
            d="M9 38V33C9 32 9.8 31.2 10.8 31.2C11.8 31.2 12.6 32 12.6 33V38"
            stroke={primaryColor}
            strokeWidth="1.8"
          />
          <path
            d="M14.7 38V32.5C14.7 31.4 15.6 30.5 16.7 30.5C17.8 30.5 18.7 31.4 18.7 32.5V38"
            stroke={primaryColor}
            strokeWidth="1.8"
          />
          <path
            d="M20.8 38V33C20.8 32 21.6 31.2 22.6 31.2C23.6 31.2 24.4 32 24.4 33V38"
            stroke={primaryColor}
            strokeWidth="1.8"
          />

          {/* Drum Tier */}
          <path
            d="M7 31V26H27V31"
            stroke={primaryColor}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="11" cy="28.5" r="1.2" fill={accentColor} />
          <circle cx="17" cy="28.5" r="1.2" fill={accentColor} />
          <circle cx="23" cy="28.5" r="1.2" fill={accentColor} />

          {/* Brunelleschi Dome */}
          <path
            d="M7 26C7 16.5 12 10 17 10C22 10 27 16.5 27 26Z"
            fill={isDark ? "rgba(20,45,34,0.15)" : "rgba(255,255,255,0.25)"}
            stroke={primaryColor}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Center Rib */}
          <path
            d="M17 10V26"
            stroke={primaryColor}
            strokeWidth="1.8"
          />
          {/* Side Ribs */}
          <path
            d="M12 13.5C14.5 17.5 15.5 21.5 15.5 26"
            stroke={primaryColor}
            strokeWidth="1.2"
            strokeOpacity="0.85"
          />
          <path
            d="M22 13.5C19.5 17.5 18.5 21.5 18.5 26"
            stroke={primaryColor}
            strokeWidth="1.2"
            strokeOpacity="0.85"
          />

          {/* Lantern & Spire Cross */}
          <rect x="15" y="6" width="4" height="4" fill={primaryColor} rx="0.5" />
          <line x1="17" y1="6" x2="17" y2="2" stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="15" y1="3.5" x2="19" y2="3.5" stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round" />

          {/* Giotto's Campanile Bell Tower (Right) */}
          <path
            d="M31 38V7H37V38"
            stroke={primaryColor}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M30 7H38L34 3L30 7Z" fill={primaryColor} />
          <line x1="31" y1="15" x2="37" y2="15" stroke={primaryColor} strokeWidth="1.4" />
          <line x1="31" y1="23" x2="37" y2="23" stroke={primaryColor} strokeWidth="1.4" />
          <line x1="31" y1="31" x2="37" y2="31" stroke={primaryColor} strokeWidth="1.4" />
          {/* Arched windows in tower */}
          <path d="M33 13V11C33 10.5 33.5 10 34 10C34.5 10 35 10.5 35 11V13" stroke={primaryColor} strokeWidth="1.2" />
          <path d="M33 21V19C33 18.5 33.5 18 34 18C34.5 18 35 18.5 35 19V21" stroke={primaryColor} strokeWidth="1.2" />
          <path d="M33 29V27C33 26.5 33.5 26 34 26C34.5 26 35 26.5 35 27V29" stroke={primaryColor} strokeWidth="1.2" />
        </svg>
      </div>

      {/* Brand Typography (Crisp White & Clear) */}
      {!iconOnly && (
        <div className="flex flex-col text-left leading-none select-none drop-shadow-md">
          <span
            className={`text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.24em] uppercase ${
              isDark ? "text-neutral-800" : "text-white/95"
            }`}
          >
            VACAY IN
          </span>
          <span
            className={`font-display text-[20px] sm:text-[22px] font-bold tracking-tight mt-0.5 ${
              isDark ? "text-[#142d22]" : "text-white"
            }`}
          >
            Florence
          </span>
        </div>
      )}
    </Link>
  );
}
