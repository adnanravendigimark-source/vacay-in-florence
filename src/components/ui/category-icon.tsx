import type { CategoryIcon } from "@/lib/types";

export function CategoryIconGlyph({ icon, className = "h-5 w-5" }: { icon: CategoryIcon; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "landmark":
      return (
        <svg {...common}>
          <path d="M4 21h16" />
          <path d="M5 21V10M9 21V10M15 21V10M19 21V10" />
          <path d="M3 10l9-6 9 6" />
        </svg>
      );
    case "museum":
      return (
        <svg {...common}>
          <rect x="3.5" y="4" width="17" height="14" rx="1.5" />
          <path d="M3.5 15.5l4.5-4.5 3 3 4-5 5.5 6.5" />
          <circle cx="16" cy="8" r="1.4" />
        </svg>
      );
    case "tour-guide":
      return (
        <svg {...common}>
          <circle cx="12" cy="6" r="2.6" />
          <path d="M6 21c0-4 2.7-6.5 6-6.5s6 2.5 6 6.5" />
          <path d="M15 10.5l4-1.2v4l-4-1.1" />
        </svg>
      );
    case "food-wine":
      return (
        <svg {...common}>
          <path d="M7 3h10l-1.2 8.2a3.8 3.8 0 01-7.6 0L7 3z" />
          <path d="M12 15v6M8.5 21h7" />
        </svg>
      );
    case "day-trip":
      return (
        <svg {...common}>
          <rect x="3" y="10" width="18" height="7" rx="2" />
          <circle cx="7.5" cy="17.5" r="1.6" />
          <circle cx="16.5" cy="17.5" r="1.6" />
          <path d="M5 10l2-4h10l2 4" />
        </svg>
      );
    case "outdoor":
      return (
        <svg {...common}>
          <path d="M3 19l6-11 4 7 2-3 6 7z" />
          <circle cx="17" cy="6" r="1.8" />
        </svg>
      );
    default:
      return null;
  }
}
