import type { TrustHighlight } from "@/lib/types";

export function TrustIconGlyph({ icon }: { icon: TrustHighlight["icon"] }) {
  const common = {
    className: "h-6 w-6",
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.8-5.3-2.8-5.3 2.8 1.1-5.8-4.3-4.1 5.9-.7L12 3.5z" />
        </svg>
      );
    case "support":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M7.5 15v-2a4.5 4.5 0 019 0v2" />
          <rect x="5.5" y="13.5" width="3" height="4" rx="1" />
          <rect x="15.5" y="13.5" width="3" height="4" rx="1" />
        </svg>
      );
    case "confirmation":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M4 9.5h16" />
          <path d="M8.5 14l2.3 2.3L16 11.5" />
        </svg>
      );
    default:
      return null;
  }
}
