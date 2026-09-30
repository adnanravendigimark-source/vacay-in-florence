import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, searchProducts } from "@/lib/data/products";
import { getStaffContext } from "@/lib/require-user";
import { Container } from "@/components/ui/container";
import { SingleExperienceBookingCard } from "@/components/experiences/single-experience-booking-card";
import { ExperienceCard } from "@/components/ui/experience-card";
import { ProductBadgePill } from "@/components/ui/badge";
import { ExperienceLocationMap } from "@/components/experiences/experience-location-map";
import { ExperienceFaqAccordion } from "@/components/experiences/experience-faq-accordion";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { getBlogPostsBySlugs, getRelatedBlogPostsForCategory } from "@/lib/data/blog";
import { DEFAULT_GOOD_TO_KNOW_TIPS } from "@/lib/constants";

export async function generateStaticParams() {
  const { items } = await searchProducts({ pageSize: 100 });
  return items.map((p) => ({ slug: p.slug }));
}

type Params = { slug: string };
type SearchParams = { preview?: string };

// A logged-in staff member visiting `?preview=1` sees the page exactly
// as it will look once published (draft/paused/pending_review — any
// status), so "Preview" in the Admin Experience Editor works before an
// experience goes live. Anyone else always gets the normal status="live"
// filter inside getProductBySlug.
async function isStaffPreview(searchParams: Promise<SearchParams>): Promise<boolean> {
  const { preview } = await searchParams;
  if (preview !== "1") return false;
  const staff = await getStaffContext();
  return staff !== null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug, { anyStatus: await isStaffPreview(searchParams) });
  if (!product) return {};

  return {
    title: product.title,
    description: product.shortDescription,
    alternates: { canonical: `/experiences/${product.slug}` },
    openGraph: {
      title: `${product.title} | VACAY Florence`,
      description: product.shortDescription,
      url: `/experiences/${product.slug}`,
      images: product.images.map((img) => ({ url: img.src })),
    },
  };
}

// Icon + label for each badge value actually used in the database (see
// src/lib/db/seed.ts — badges is a loosely-typed jsonb column, so the real
// value set is wider than the ProductBadge type alone: "top-rated", "new",
// "popular", and "food-wine" all show up alongside the five named in that
// type). Keyed as a general string map, not ProductBadge, for exactly that
// reason. Used for both the hero's feature-pills row and the gallery's
// top-left overlay — every pill shown corresponds to a badge the product
// actually carries; nothing here is fabricated per-product. Labels match
// ProductBadgePill's formatting (src/components/ui/badge.tsx) so the same
// badge always reads the same way across the site. An unrecognized badge
// is skipped rather than guessed at.
const BADGE_META: Partial<Record<string, { label: string; icon: React.ReactNode; tone: "light" | "dark" }>> = {
  "skip-the-line": {
    label: "Skip the line",
    tone: "dark",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  "free-cancellation": {
    label: "Free cancellation",
    tone: "dark",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  "instant-confirmation": {
    label: "Instant confirmation",
    tone: "dark",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  "best-seller": {
    label: "Best seller",
    tone: "light",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  "small-group": {
    label: "Small group",
    tone: "dark",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  "top-rated": {
    label: "Top rated",
    tone: "light",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  popular: {
    label: "Popular",
    tone: "light",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
      </svg>
    ),
  },
  new: {
    label: "New",
    tone: "light",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5L5.7 21l2.3-7.2-6-4.6h7.6z" />
      </svg>
    ),
  },
  "food-wine": {
    label: "Food & Wine",
    tone: "light",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M8 22h8M12 15v7M8 3h8c0 4.418-2.686 8-6 8s-6-3.582-6-8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

// Decorative icons cycled across the "Highlights" cards, in order — the
// highlight TEXT is always real per-product copy from product.highlights;
// only the accompanying glyph is generic, since highlights are free text
// with no icon field of their own.
const HIGHLIGHT_ICONS: React.ReactNode[] = [
  <svg key="bolt" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>,
  <svg key="star" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>,
  <svg key="clock" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>,
  <svg key="shield" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
    <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" />
  </svg>,
];

function renderItineraryIcon(iconName?: string) {
  const icon = (iconName || "store").toLowerCase();
  switch (icon) {
    case "chef":
    case "kitchen":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6v-7.13z" />
          <line x1="6" y1="17" x2="18" y2="17" strokeLinecap="round" strokeWidth="2" />
        </svg>
      );
    case "utensils":
    case "dining":
    case "food":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2M15 11v11M5 2v8a3 3 0 0 0 3 3v9M8 2v6" />
        </svg>
      );
    case "wine":
    case "drinks":
    case "bar":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 22h8M12 15v7M5 3h14l-2 9a5 5 0 0 1-5 4 5 5 0 0 1-5-4L5 3z" />
        </svg>
      );
    case "ticket":
    case "entry":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 9a3 3 0 0 1 0 6v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 0 1 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4z" />
        </svg>
      );
    case "museum":
    case "gallery":
    case "art":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2 3 7h18l-9-5z" />
        </svg>
      );
    case "landmark":
    case "monument":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M6 21V10h12v11M12 3l6 7H6l6-7z" />
        </svg>
      );
    case "camera":
    case "view":
    case "photo":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case "bike":
    case "active":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L8 12l4-4 3 3h4M12 8V5H9" />
        </svg>
      );
    case "compass":
    case "tour":
    case "walk":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );
    case "bus":
    case "transport":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="15" rx="3" />
          <circle cx="7.5" cy="15.5" r="1.5" fill="currentColor" />
          <circle cx="16.5" cy="15.5" r="1.5" fill="currentColor" />
          <path strokeLinecap="round" d="M3 9h18M5 18v2M19 18v2" />
        </svg>
      );
    case "clock":
    case "time":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" strokeLinecap="round" />
        </svg>
      );
    case "store":
    case "market":
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l2-5h14l2 5M3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9M3 9h18M9 22V12h6v10" />
        </svg>
      );
  }
}

function parseSecretPoint(
  point: string | { title: string; description?: string; image?: string; imageUrl?: string; snippet?: string; fullStory?: string },
  index: number,
  productImages: { src: string; alt: string }[],
) {
  if (typeof point === "object" && point !== null) {
    const rawImage = point.imageUrl || point.image || "";
    return {
      title: point.title || `Secret ${index + 1}`,
      description: point.description || point.snippet || point.fullStory || "",
      image:
        rawImage && rawImage.trim()
          ? rawImage
          : productImages[index % productImages.length]?.src || "/images/florence-hero.jpg",
    };
  }

  const str = String(point || "").trim();
  let title = str;
  let description = "";

  if (str.includes(" — ")) {
    const parts = str.split(" — ");
    title = parts[0];
    description = parts.slice(1).join(" — ");
  } else if (str.includes(": ")) {
    const parts = str.split(": ");
    title = parts[0];
    description = parts.slice(1).join(": ");
  } else if (str.length > 70) {
    const match = str.match(/^([^,.]+[,.]?)\s*(.*)$/);
    if (match && match[1] && match[2]) {
      title = match[1];
      description = match[2];
    }
  }

  return {
    title,
    description,
    image: productImages[index % productImages.length]?.src || "/images/florence-hero.jpg",
  };
}

function renderTransportIcon(icon?: string, mode?: string) {
  const key = (icon || mode || "").toLowerCase();
  if (key.includes("bus")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="15" rx="3" />
        <circle cx="7.5" cy="15.5" r="1.5" fill="currentColor" />
        <circle cx="16.5" cy="15.5" r="1.5" fill="currentColor" />
        <path strokeLinecap="round" d="M3 9h18M5 18v2M19 18v2" />
      </svg>
    );
  }
  if (key.includes("taxi") || key.includes("car") || key.includes("drive")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.5L8 4h8l1.5 3H19a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2m8 0v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2" />
        <circle cx="7.5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="16.5" cy="12" r="1.5" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes("train") || key.includes("tram") || key.includes("metro")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
        <rect x="4" y="3" width="16" height="16" rx="3" />
        <path strokeLinecap="round" d="M4 11h16M12 3v8M8 19l-3 3M16 19l3 3" />
        <circle cx="8" cy="15" r="1.5" fill="currentColor" />
        <circle cx="16" cy="15" r="1.5" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes("bike") || key.includes("cycle")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L8 12l4-4 3 3h4M12 8V5H9" />
      </svg>
    );
  }
  if (key.includes("pickup") || key.includes("van") || key.includes("shuttle") || key.includes("coach")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M3 14V6a2 2 0 0 1 2-2h11l4 5v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <circle cx="7" cy="17" r="2" fill="currentColor" />
        <circle cx="17" cy="17" r="2" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes("pin") || key.includes("meet") || key.includes("place")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.35-7-10a7 7 0 1 1 14 0c0 5.65-7 10-7 10z" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    );
  }
  // Default: Walking / Foot
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
      <circle cx="12" cy="4.5" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l3-6 2 3 3 3M8 13l3-3 3 1 3-3M12 10v4" />
    </svg>
  );
}

function parseGettingThereOption(
  option: { mode: string; description?: string; image?: string; imageUrl?: string; tag?: string; icon?: string },
  index: number,
  productImages: { src: string; alt: string }[],
) {
  const modeLower = (option.mode || "").toLowerCase();
  let defaultImage = "/images/experiences/getting-there-foot.jpg";
  let defaultTag = "";

  if (modeLower.includes("bus")) {
    defaultImage = "/images/experiences/getting-there-bus.jpg";
    defaultTag = "Line 14 / 14 stops";
  } else if (modeLower.includes("taxi") || modeLower.includes("car")) {
    defaultImage = "/images/hero2-guided-tour.jpg";
    defaultTag = "5–10 minutes";
  } else if (modeLower.includes("pickup") || modeLower.includes("van") || modeLower.includes("coach") || modeLower.includes("tour")) {
    defaultImage = "/images/hero2-guided-tour.jpg";
    defaultTag = "Included pickup";
  } else if (modeLower.includes("bike")) {
    defaultImage = "/images/experiences/bike-tour-lungarno.jpg";
    defaultTag = "5–10 minutes";
  } else if (modeLower.includes("foot") || modeLower.includes("walk")) {
    defaultImage = "/images/experiences/getting-there-foot.jpg";
    defaultTag = "10–15 minutes";
  } else {
    defaultImage = productImages[index % productImages.length]?.src || "/images/florence-hero.jpg";
  }

  // Extract explicit or sensible tag
  let tag = option.tag?.trim() || "";
  if (!tag && option.description) {
    const minMatch = option.description.match(/(\d+[-–\s]*(?:to\s*\d+\s*)?(?:min|minute|minutes)[a-z\s]*)/i);
    if (minMatch) {
      tag = minMatch[1].trim();
    } else {
      const lineMatch = option.description.match(/(line\s*\w+|stops\s*close|route\s*\w+)/i);
      if (lineMatch) {
        tag = lineMatch[1].trim();
      }
    }
  }
  if (!tag) {
    tag = defaultTag;
  }

  const rawImage = option.imageUrl || option.image || "";

  return {
    mode: option.mode || "Getting There",
    description: option.description || "",
    image: rawImage && rawImage.trim() ? rawImage : defaultImage,
    tag,
    icon: option.icon || (modeLower.includes("bus") ? "bus" : modeLower.includes("taxi") ? "taxi" : modeLower.includes("pickup") || modeLower.includes("van") ? "pickup" : modeLower.includes("bike") ? "bike" : "foot"),
  };
}

function getMeetingDestinationName(meetingPoint: string | null, productTitle: string) {
  if (!meetingPoint || !meetingPoint.trim()) return productTitle;
  const firstChunk = meetingPoint.split(",")[0].trim();
  if (firstChunk.toLowerCase().includes("entrance")) {
    const cleaned = firstChunk.replace(/(main\s*entrance|entrance|at the)/gi, "").trim();
    return cleaned || firstChunk;
  }
  return firstChunk || productTitle;
}

function renderSeasonIcon(icon?: string, season?: string) {
  const key = (icon || season || "").toLowerCase();
  if (key.includes("sun") || key.includes("summer")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  }
  if (key.includes("leaf") || key.includes("autumn") || key.includes("fall")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    );
  }
  if (key.includes("snow") || key.includes("winter")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
      </svg>
    );
  }
  if (key.includes("clock") || key.includes("time") || key.includes("hour")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" strokeLinecap="round" />
      </svg>
    );
  }
  // Default: Flower / Spring
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3 3 0 0 0-3 3c0 2 3 4 3 4s3-2 3-4a3 3 0 0 0-3-3ZM12 22a3 3 0 0 0 3-3c0-2-3-4-3-4s-3 2-3 4a3 3 0 0 0 3 3ZM2 12a3 3 0 0 0 3 3c2 0 4-3 4-3s-2-3-4-3a3 3 0 0 0-3 3ZM22 12a3 3 0 0 0-3-3c-2 0-4 3-4 3s2 3 4 3a3 3 0 0 0 3-3Z" />
    </svg>
  );
}

function parseSeasonTip(
  rawTip: string | { season?: string; months?: string; title?: string; description: string; image?: string; icon?: string },
  index: number,
  productImages: { src: string; alt: string }[],
) {
  if (typeof rawTip === "object" && rawTip !== null) {
    const season = rawTip.season || (index === 0 ? "Spring" : index === 1 ? "Summer" : "Autumn & Winter");
    const months = rawTip.months || rawTip.title || (index === 0 ? "March – May" : index === 1 ? "June – August" : "September – February");
    let defaultImg = "/images/experiences/season-spring.jpg";
    if (index === 1 || season.toLowerCase().includes("summer")) defaultImg = "/images/experiences/season-summer.jpg";
    else if (index >= 2 || season.toLowerCase().includes("autumn") || season.toLowerCase().includes("winter")) defaultImg = "/images/experiences/season-autumn-winter.jpg";

    const rawImage = (rawTip as any).imageUrl || rawTip.image || "";
    return {
      season,
      months,
      description: rawTip.description || "",
      image: rawImage && rawImage.trim() ? rawImage : defaultImg,
      icon: rawTip.icon || (index === 0 ? "flower" : index === 1 ? "sun" : "leaf"),
    };
  }

  const str = String(rawTip || "").trim();
  let season = index === 0 ? "Spring" : index === 1 ? "Summer" : "Autumn & Winter";
  let months = index === 0 ? "March – May" : index === 1 ? "June – August" : "September – February";
  let description = str;
  let icon = index === 0 ? "flower" : index === 1 ? "sun" : "leaf";
  let defaultImg = index === 0 ? "/images/experiences/season-spring.jpg" : index === 1 ? "/images/experiences/season-summer.jpg" : "/images/experiences/season-autumn-winter.jpg";

  if (str.includes(" — ")) {
    const parts = str.split(" — ");
    months = parts[0];
    description = parts.slice(1).join(" — ");
  } else if (str.includes(": ")) {
    const parts = str.split(": ");
    months = parts[0];
    description = parts.slice(1).join(": ");
  }

  return {
    season,
    months,
    description,
    image: defaultImg,
    icon,
  };
}

function renderFeatureIcon(icon?: string) {
  const key = (icon || "").toLowerCase();
  if (key.includes("chef") || key.includes("cook")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6v-7.13Z" />
        <line x1="6" y1="17" x2="18" y2="17" strokeLinecap="round" />
      </svg>
    );
  }
  if (key.includes("book") || key.includes("recipe")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6M9 11h4" />
      </svg>
    );
  }
  if (key.includes("wine") || key.includes("drink")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 22h8M12 15v7M5 3h14l-2 8a5 5 0 0 1-10 0L5 3z" />
      </svg>
    );
  }
  if (key.includes("ticket") || key.includes("entry") || key.includes("skip")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
        <path strokeLinecap="round" strokeDasharray="2 2" d="M13 5v14" />
      </svg>
    );
  }
  if (key.includes("museum") || key.includes("art")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2 2 7h20L12 2z" />
      </svg>
    );
  }
  if (key.includes("crown") || key.includes("vip")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
        <circle cx="12" cy="19" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes("guide") || key.includes("tour")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.2" />
      </svg>
    );
  }
  if (key.includes("camera") || key.includes("view")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  }
  // Default: Star
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

function parseUltimatePoint(
  rawPoint: string | { title: string; description?: string; icon?: string },
  index: number,
) {
  if (typeof rawPoint === "object" && rawPoint !== null) {
    return {
      title: rawPoint.title || `Highlight ${index + 1}`,
      description: rawPoint.description || "",
      icon: rawPoint.icon || (index === 0 ? "chef" : index === 1 ? "book" : "wine"),
    };
  }

  const str = String(rawPoint || "").trim();
  let title = str;
  let description = "";

  if (str.includes(" — ")) {
    const parts = str.split(" — ");
    title = parts[0];
    description = parts.slice(1).join(" — ");
  } else if (str.includes(": ")) {
    const parts = str.split(": ");
    title = parts[0];
    description = parts.slice(1).join(": ");
  } else if (str.length > 60) {
    const match = str.match(/^([^,.]+[,.]?)\s*(.*)$/);
    if (match && match[1] && match[2]) {
      title = match[1];
      description = match[2];
    }
  }

  return {
    title,
    description,
    icon: index === 0 ? "chef" : index === 1 ? "book" : "wine",
  };
}

function getExperienceTagline(categorySlug?: string, title?: string, slug?: string): string {
  const cat = (categorySlug || "").toLowerCase();
  const t = (title || "").toLowerCase();
  const s = (slug || "").toLowerCase();

  if (
    cat.includes("food") ||
    cat.includes("wine") ||
    t.includes("cook") ||
    t.includes("food") ||
    t.includes("wine") ||
    s.includes("cook") ||
    s.includes("food") ||
    s.includes("wine")
  ) {
    return "Good food • Great moments";
  }
  if (
    cat.includes("museum") ||
    cat.includes("gallery") ||
    t.includes("uffizi") ||
    t.includes("accademia") ||
    t.includes("david") ||
    s.includes("uffizi") ||
    s.includes("accademia")
  ) {
    return "Timeless art • Renaissance masters";
  }
  if (t.includes("duomo") || t.includes("dome") || t.includes("brunelleschi") || s.includes("duomo")) {
    return "Historic heights • Panoramic views";
  }
  if (t.includes("pitti") || t.includes("boboli") || s.includes("boboli") || s.includes("pitti")) {
    return "Grand estates • Renaissance gardens";
  }
  if (
    cat.includes("day-trip") ||
    t.includes("chianti") ||
    t.includes("tuscany") ||
    t.includes("siena") ||
    t.includes("pisa") ||
    s.includes("tuscany")
  ) {
    return "Tuscan hills • Unforgettable journeys";
  }
  if (
    cat.includes("outdoor") ||
    cat.includes("active") ||
    t.includes("bike") ||
    s.includes("bike")
  ) {
    return "Scenic routes • Florence discoveries";
  }
  if (cat.includes("guided") || t.includes("walking") || t.includes("guide") || t.includes("tour")) {
    return "Historic paths • Florentine stories";
  }
  return "Authentic Florence • Memorable moments";
}

function getExperienceFooterBanner(categorySlug?: string, title?: string, slug?: string): string {
  const cat = (categorySlug || "").toLowerCase();
  const t = (title || "").toLowerCase();
  const s = (slug || "").toLowerCase();

  if (
    cat.includes("food") ||
    cat.includes("wine") ||
    t.includes("cook") ||
    t.includes("food") ||
    t.includes("wine") ||
    s.includes("cook") ||
    s.includes("food") ||
    s.includes("wine")
  ) {
    return "REAL INGREDIENTS / LOCAL FLAVORS / LASTING MEMORIES";
  }
  if (
    cat.includes("museum") ||
    cat.includes("gallery") ||
    t.includes("uffizi") ||
    t.includes("accademia") ||
    t.includes("david") ||
    s.includes("uffizi") ||
    s.includes("accademia")
  ) {
    return "MASTERPIECES / RENAISSANCE ART / TIMELESS BEAUTY";
  }
  if (t.includes("duomo") || t.includes("dome") || t.includes("brunelleschi") || s.includes("duomo")) {
    return "ICONIC ARCHITECTURE / PANORAMIC SKYLINE / HISTORIC DOME";
  }
  if (t.includes("pitti") || t.includes("boboli") || s.includes("boboli") || s.includes("pitti")) {
    return "MEDICI PALACES / ROYAL GARDENS / HISTORIC SPLENDOR";
  }
  if (
    cat.includes("day-trip") ||
    t.includes("chianti") ||
    t.includes("tuscany") ||
    t.includes("siena") ||
    t.includes("pisa") ||
    s.includes("tuscany")
  ) {
    return "SCENIC TUSCANY / ROLLING HILLS / AUTHENTIC COUNTRYSIDE";
  }
  if (
    cat.includes("outdoor") ||
    cat.includes("active") ||
    t.includes("bike") ||
    s.includes("bike")
  ) {
    return "SCENIC DISCOVERY / HISTORIC BRIDGES / ACTIVE ADVENTURE";
  }
  if (cat.includes("guided") || t.includes("walking") || t.includes("guide") || t.includes("tour")) {
    return "LOCAL INSIGHTS / COBBLED STREETS / LIVING HISTORY";
  }
  return "AUTHENTIC FLORENCE / LOCAL CHARM / LASTING MEMORIES";
}

function renderHighlightIcon(iconName?: string) {
  const key = (iconName || "star").toLowerCase();
  if (key.includes("chef") || key.includes("cook") || key.includes("kitchen")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6v-7.13z" />
        <line x1="6" y1="17" x2="18" y2="17" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }
  if (key.includes("market") || key.includes("basket") || key.includes("shopping") || key.includes("food") || key.includes("bag")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    );
  }
  if (key.includes("clock") || key.includes("time") || key.includes("recipe") || key.includes("book") || key.includes("menu")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" strokeLinecap="round" />
      </svg>
    );
  }
  if (key.includes("group") || key.includes("users") || key.includes("people") || key.includes("guide")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (key.includes("ticket") || key.includes("entry") || key.includes("fast") || key.includes("priority")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 9a3 3 0 0 1 0 6v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 0 1 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4z" />
      </svg>
    );
  }
  if (key.includes("art") || key.includes("museum") || key.includes("landmark") || key.includes("monument") || key.includes("palace") || key.includes("david")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2 3 7h18l-9-5z" />
      </svg>
    );
  }
  if (key.includes("bike") || key.includes("active")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L8 12l4-4 3 3h4M12 8V5H9" />
      </svg>
    );
  }
  // Default: Star
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

const HIGHLIGHT_CARD_THEMES = [
  {
    borderAccent: "border-l-[3.5px] border-l-[#4e8759]",
    iconBg: "bg-[#eaf4eb] text-[#2d5a36] border-[#d2e7d4]",
  },
  {
    borderAccent: "border-l-[3.5px] border-l-[#9e0ca0]",
    iconBg: "bg-[#fdf2fe] text-[#9e0ca0] border-[#e8d5ec]",
  },
  {
    borderAccent: "border-l-[3.5px] border-l-[#d4973b]",
    iconBg: "bg-[#fdf6e9] text-[#9c6a1e] border-[#fae7c4]",
  },
  {
    borderAccent: "border-l-[3.5px] border-l-[#5d7e63]",
    iconBg: "bg-[#edf3ee] text-[#3d5a42] border-[#d7e5d9]",
  },
];

function parseHighlightPoint(
  raw: string | { title: string; description?: string; icon?: string },
  index: number,
  categorySlug?: string,
  slug?: string,
) {
  if (typeof raw === "object" && raw !== null) {
    return {
      title: raw.title || `Highlight ${index + 1}`,
      description: raw.description || "",
      icon: raw.icon || (index === 0 ? "chef" : index === 1 ? "market" : index === 2 ? "clock" : "users"),
    };
  }

  const str = String(raw || "").trim();
  let title = str;
  let description = "";

  if (str.includes(" — ")) {
    const parts = str.split(" — ");
    if (parts.length >= 3) {
      title = parts.slice(0, parts.length - 1).join(" — ");
      description = parts[parts.length - 1];
    } else {
      title = parts[0];
      description = parts[1];
    }
  } else if (str.includes(": ")) {
    const parts = str.split(": ");
    title = parts[0];
    description = parts.slice(1).join(": ");
  }

  // Smart icon selection based on text & category
  const tLower = title.toLowerCase();
  let icon = "star";

  if (tLower.includes("class") || tLower.includes("cook") || tLower.includes("kitchen") || tLower.includes("hands-on")) {
    icon = "chef";
  } else if (tLower.includes("market") || tLower.includes("ingredient") || tLower.includes("food") || tLower.includes("wine") || tLower.includes("taste")) {
    icon = "market";
  } else if (tLower.includes("menu") || tLower.includes("recipe") || tLower.includes("hour") || tLower.includes("time") || tLower.includes("step")) {
    icon = "clock";
  } else if (tLower.includes("group") || tLower.includes("guide") || tLower.includes("people") || tLower.includes("sommelier")) {
    icon = "users";
  } else if (tLower.includes("entry") || tLower.includes("ticket") || tLower.includes("fast") || tLower.includes("priority") || tLower.includes("skip")) {
    icon = "ticket";
  } else if (tLower.includes("art") || tLower.includes("masterpiece") || tLower.includes("david") || tLower.includes("fresco") || tLower.includes("palace") || tLower.includes("museum")) {
    icon = "museum";
  } else if (tLower.includes("bike") || tLower.includes("ride") || tLower.includes("cycle")) {
    icon = "bike";
  } else {
    icon = index === 0 ? "chef" : index === 1 ? "market" : index === 2 ? "clock" : "users";
  }

  return {
    title,
    description,
    icon,
  };
}

function getWhyVisitSubtitle(categorySlug?: string, title?: string, slug?: string): string {
  const cat = (categorySlug || "").toLowerCase();
  const t = (title || "").toLowerCase();
  const s = (slug || "").toLowerCase();

  if (cat.includes("food") || cat.includes("wine") || t.includes("cook") || t.includes("food") || s.includes("cook")) {
    return "Hands-on. Local. Unforgettable.";
  }
  if (cat.includes("museum") || cat.includes("gallery") || t.includes("uffizi") || t.includes("accademia") || t.includes("david")) {
    return "Masterpieces. Timeless. Renaissance beauty.";
  }
  if (t.includes("duomo") || t.includes("dome") || t.includes("brunelleschi") || s.includes("duomo")) {
    return "Breathtaking. Iconic. Unmatched vistas.";
  }
  if (t.includes("pitti") || t.includes("boboli")) {
    return "Grandeur. Medici heritage. Royal serenity.";
  }
  if (cat.includes("day-trip") || t.includes("chianti") || t.includes("tuscany") || t.includes("siena") || t.includes("pisa")) {
    return "Rolling hills. Chianti cellars. Pure Tuscany.";
  }
  if (cat.includes("outdoor") || cat.includes("active") || t.includes("bike")) {
    return "Arno breeze. Golden hour. Active Florence.";
  }
  if (cat.includes("guided") || t.includes("walking") || t.includes("guide")) {
    return "Hidden alleys. Living history. Local tales.";
  }
  return "Authentic. Inspiring. Unforgettable.";
}

function getPostcardSticker(categorySlug?: string, title?: string, slug?: string): { lines: string[]; heart: string } {
  const cat = (categorySlug || "").toLowerCase();
  const t = (title || "").toLowerCase();
  const s = (slug || "").toLowerCase();

  if (cat.includes("food") || cat.includes("wine") || t.includes("cook") || t.includes("food") || s.includes("cook")) {
    return { lines: ["Real food", "Real people", "Real Tuscany"], heart: "♡" };
  }
  if (cat.includes("museum") || cat.includes("gallery") || t.includes("uffizi") || t.includes("accademia") || t.includes("david")) {
    return { lines: ["Pure art", "Timeless history", "Florence masters"], heart: "♡" };
  }
  if (t.includes("duomo") || t.includes("dome") || t.includes("brunelleschi") || s.includes("duomo")) {
    return { lines: ["463 steps", "Iconic dome", "Panoramic Florence"], heart: "♡" };
  }
  if (t.includes("pitti") || t.includes("boboli")) {
    return { lines: ["Medici splendor", "Royal gardens", "Secret pathways"], heart: "♡" };
  }
  if (cat.includes("day-trip") || t.includes("chianti") || t.includes("tuscany") || t.includes("siena") || t.includes("pisa")) {
    return { lines: ["Tuscan hills", "Vineyard vistas", "Golden sunshine"], heart: "♡" };
  }
  if (cat.includes("outdoor") || cat.includes("active") || t.includes("bike")) {
    return { lines: ["River breeze", "Historic bridges", "Active Florence"], heart: "♡" };
  }
  if (cat.includes("guided") || t.includes("walking") || t.includes("guide")) {
    return { lines: ["Local secrets", "Historic stones", "Florence legends"], heart: "♡" };
  }
  return { lines: ["Real Florence", "Local spirit", "Lasting memories"], heart: "♡" };
}

function parseWhyVisit(whyVisit: string | null, titleFallback: string) {
  if (!whyVisit || !whyVisit.trim()) {
    return {
      title: `Discover why ${titleFallback} is an unmissable Florentine experience.`,
      subtitle: "",
      description: "",
      collageImages: [] as string[],
    };
  }
  const str = whyVisit.trim();
  if (str.startsWith("{") && str.endsWith("}")) {
    try {
      const parsed = JSON.parse(str);
      return {
        title: parsed.title || parsed.description || str,
        subtitle: parsed.subtitle || "",
        description: parsed.description || "",
        collageImages: Array.isArray(parsed.collageImages) ? parsed.collageImages : [],
      };
    } catch {
      // ignore
    }
  }
  return {
    title: str,
    subtitle: "",
    description: "",
    collageImages: [] as string[],
  };
}

function getWhyVisitCollageImage(product: { slug?: string; categorySlug?: string; whyVisit?: string | null; images: { src: string; alt: string }[] }): string {
  const parsed = parseWhyVisit(product.whyVisit || null, product.slug || "");
  if (parsed.collageImages.length > 0 && parsed.collageImages[0]) {
    return parsed.collageImages[0];
  }
  const slug = (product.slug || "").toLowerCase();
  if (slug.includes("cooking") || slug.includes("food")) {
    return "/images/experiences/santambrogio-market-stall.jpg";
  }
  if (slug.includes("uffizi")) {
    return "/images/experiences/uffizi-corridor-grand.jpg";
  }
  if (slug.includes("accademia") || slug.includes("david")) {
    return "/images/experiences/accademia-david-tribune.jpg";
  }
  if (slug.includes("duomo")) {
    return "/images/experiences/duomo-facade.jpg";
  }
  if (slug.includes("chianti") || slug.includes("wine")) {
    return "/images/experiences/chianti-vineyards.jpg";
  }
  if (slug.includes("bike")) {
    return "/images/experiences/bike-tour-lungarno.jpg";
  }
  if (slug.includes("walking") || slug.includes("old-town")) {
    return "/images/experiences/walking-tour-piazza-signoria.jpg";
  }
  if (slug.includes("pitti") || slug.includes("boboli")) {
    return "/images/experiences/pitti-palace-grand-facade.jpg";
  }
  if (slug.includes("tuscany") || slug.includes("siena")) {
    return "/images/experiences/daytrip-siena-piazza-campo.jpg";
  }
  return product.images[1]?.src || product.images[0]?.src || "/images/florence-hero.jpg";
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug, { anyStatus: await isStaffPreview(searchParams) });
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categorySlug, 4);

  // Related Travel Guides & Blog Articles — an admin-curated list (in the
  // order picked) wins when set; otherwise real posts matched by this
  // experience's own category (see getRelatedBlogPostsForCategory). Never
  // padded with unrelated "filler" posts — an honest empty section (no
  // fabricated relevance) is fine and simply doesn't render.
  const relatedBlogPosts =
    product.relatedBlogSlugs.length > 0
      ? await getBlogPostsBySlugs(product.relatedBlogSlugs)
      : await getRelatedBlogPostsForCategory(product.categoryName, 3);

  // Comprehensive Ticket Comparison Table — built from the real pricing
  // tiers + their admin-set feature checklists (src/lib/data/admin
  // products.ts syncOptions). Only worth rendering once there's an
  // actual comparison to make (2+ tiers, or at least one tier with real
  // features set) — otherwise it would just repeat the booking card.
  const comparisonFeatures = Array.from(new Set(product.options.flatMap((option) => option.features)));
  const showTicketComparison = product.options.length > 0 && comparisonFeatures.length > 0;

  // SEO BreadcrumbList schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Experiences", item: "/experiences" },
      {
        "@type": "ListItem",
        position: 2,
        name: product.categoryName,
        item: `/experiences/category/${product.categorySlug}`,
      },
      { "@type": "ListItem", position: 3, name: product.title, item: `/experiences/${product.slug}` },
    ],
  };

  // Two-line display title — splits on a colon or em-dash if the product
  // title has one ("Accademia Gallery: Michelangelo's David Ticket" ->
  // "Accademia Gallery" / "Michelangelo's David Ticket"), otherwise
  // breaks after the first two words. Runs off product.title alone, so
  // it produces a sensible split for every product, not just one.
  let line1 = product.title;
  let line2 = "";

  if (product.title.includes(":")) {
    const [p1, ...rest] = product.title.split(":");
    line1 = p1.trim();
    line2 = rest.join(":").trim();
  } else if (product.title.includes("—")) {
    const [p1, ...rest] = product.title.split("—");
    line1 = p1.trim();
    line2 = rest.join("—").trim();
  } else {
    const words = product.title.split(" ");
    if (words.length > 2) {
      line1 = words.slice(0, 2).join(" ");
      line2 = words.slice(2).join(" ");
    }
  }

  const heroImage = product.images[0];
  const primaryBadge = product.badges[0];
  const descriptionParagraphs = product.description.split(/\n\s*\n/).filter(Boolean);

  // Adaptive gallery: the DB holds one photo per product today, but this
  // never assumes a fixed count — 1 image renders full-width, 2+ renders
  // the large-photo-plus-thumbnails layout with however many extra shots
  // actually exist (never more than 3 thumbnails, to match the design).
  const galleryMain = product.images[0];
  const galleryThumbs = product.images.slice(1, 4);

  // FAQPage structured data — only emitted when the experience actually
  // has real, admin-authored FAQs; never fabricated.
  const faqJsonLd =
    product.faqs.length > 0
      ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: product.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
      : null;

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900 selection:bg-[#9e0ca0] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* ================================================================= */}
      {/* 1. HERO SECTION                                                    */}
      {/* ================================================================= */}
      <section className="relative w-full overflow-hidden bg-neutral-900">
        {/* Full-bleed background photograph */}
        <div className="absolute inset-0">
          <Image
            src={heroImage?.src || "/images/florence-hero.jpg"}
            alt={heroImage?.alt || product.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center contrast-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/5 pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/28 to-transparent pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <Container className="relative z-10 pt-32 pb-14 lg:pt-36 lg:pb-16">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-14">
            {/* Left Hero Column: Breadcrumb, Titles, Ratings & Feature Pills */}
            <div className="max-w-2xl text-white">
              <div className="mb-6">
                <Link
                  href={`/experiences/category/${product.categorySlug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FAF6EE]/90 hover:bg-[#FAF6EE] text-neutral-800 px-4 py-1.5 text-xs font-semibold shadow-md transition-all hover:scale-105 border border-neutral-200/60"
                >
                  <span className="text-xs leading-none">&larr;</span>
                  <span>{product.categoryName}</span>
                </Link>
              </div>

              <h1 className="font-display tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
                <span className="block text-4xl sm:text-5xl lg:text-[54px] font-bold leading-[1.08]">
                  {line1}
                </span>
                {line2 && (
                  <span className="block text-3xl sm:text-4xl lg:text-[46px] font-normal italic leading-[1.18] text-[#F3E2C4] mt-1">
                    {line2}
                  </span>
                )}
              </h1>

              {/* Ratings and Location Meta Row — honest empty state, never fabricates a rating */}
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                {product.ratingAverage ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 text-sm sm:text-base leading-none">★</span>
                    <span className="font-bold text-white">{product.ratingAverage.toFixed(1)}</span>
                    <span className="text-neutral-200 font-normal">
                      ({product.reviewCount.toLocaleString()} reviews)
                    </span>
                  </div>
                ) : (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-300/40 px-2.5 py-1 text-[11px] font-bold text-emerald-100">
                    New experience
                  </span>
                )}

                <span className="text-neutral-300">|</span>

                <div className="flex items-center gap-1.5 text-neutral-100">
                  <svg className="h-4 w-4 text-[#E6A068] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>Florence, Italy</span>
                </div>

                <span className="text-neutral-300">|</span>

                <div className="flex items-center gap-1.5 text-neutral-100">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{product.durationLabel}</span>
                </div>
              </div>

              {/* Feature Pills Row — one per real badge on this product. Popularity
                  badges (top rated, best seller, popular, new) get the light
                  cream treatment; booking-assurance badges (free cancellation,
                  instant confirmation, skip the line, small group) get the
                  solid brand-green treatment. */}
              {product.badges.length > 0 && (
                <div className="mt-7 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {product.badges.map((badge) => {
                    const meta = BADGE_META[badge];
                    if (!meta) return null;
                    const isLight = meta.tone === "light";
                    return (
                      <div
                        key={badge}
                        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm ${isLight
                          ? "bg-[#FAF6EE]/95 text-neutral-800 border border-neutral-200/60"
                          : "bg-[#9e0ca0] text-white"
                          }`}
                      >
                        <span className={isLight ? "text-amber-500 shrink-0" : "text-white shrink-0"}>
                          {meta.icon}
                        </span>
                        <span>{meta.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Hero Column: Floating Booking Card */}
            <div id="book" className="w-full lg:w-auto flex justify-center lg:justify-end shrink-0 lg:pt-6 scroll-mt-24">
              <SingleExperienceBookingCard
                productSlug={product.slug}
                options={product.options}
                basePrice={product.priceFrom.amount}
                timeSlots={product.timeSlots}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================= */}
      {/* 2. ABOUT THIS EXPERIENCE & PHOTO GALLERY (50 / 50 SPLIT)          */}
      {/* ================================================================= */}
      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Description & Highlight Quote Block (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                About this experience
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-neutral-700 leading-relaxed font-normal">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Highlight Quote Block — the product's own tagline, not a fabricated review */}
              <div className="rounded-2xl bg-[#F2EDE4] p-5 sm:p-6 border border-[#E7E0D3] flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9e0ca0] text-amber-200">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
                    <path d="M4 4h16M4 20h16M6 4v16M18 4v16M10 4v16M14 4v16M2 20h20M2 4h20" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-serif italic text-sm sm:text-base text-neutral-800 leading-relaxed pt-0.5">
                  &ldquo;{product.shortDescription}&rdquo;
                </p>
              </div>
            </div>

            {/* Right Column: Adaptive Photo Gallery (6 cols) */}
            {galleryMain && (
              <div className="lg:col-span-6">
                <div className="grid grid-cols-12 gap-3 sm:gap-4 items-start">
                  {/* Large Photo — spans full width when it's the only shot */}
                  <div
                    className={`${galleryThumbs.length > 0 ? "col-span-7" : "col-span-12"} relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-100 shadow-sm group`}
                  >
                    <Image
                      src={galleryMain.src}
                      alt={galleryMain.alt || product.title}
                      fill
                      sizes="(min-width: 1024px) 30vw, 90vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {primaryBadge && (
                      <div className="absolute top-3 left-3 z-10">
                        <ProductBadgePill badge={primaryBadge} />
                      </div>
                    )}

                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Wishlist"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Share"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                      </button>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white">
                      <p className="truncate text-[11px] font-medium text-neutral-200">{product.shortDescription}</p>
                    </div>
                  </div>

                  {(galleryThumbs.length > 0 || product.videoUrl) && (
                    <div className="col-span-5 flex flex-col gap-3 sm:gap-4">
                      {galleryThumbs.map((img, index) => (
                        <div
                          key={index}
                          className="relative aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 shadow-2xs group"
                        >
                          <Image
                            src={img.src}
                            alt={img.alt || product.title}
                            fill
                            sizes="(min-width: 1024px) 20vw, 40vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ))}
                      {product.videoUrl && (
                        <div className="relative aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 shadow-2xs">
                          <video controls preload="none" poster={galleryMain?.src} className="h-full w-full object-cover">
                            <source src={product.videoUrl} type="video/mp4" />
                          </video>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ================================================================= */}
      {/* 3. WHY VISIT / HIGHLIGHTS                                          */}
      {/* ================================================================= */}
      {(product.whyVisit || product.highlights.length > 0) && (
        <section className="py-14 sm:py-20 bg-white border-t border-neutral-200/70 relative overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#fdf2fe]/70 via-transparent to-transparent pointer-events-none" />

          <Container>
            {/* Top Row: Hook Text on Left + Organic Collage Graphic on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Left Column: Eyebrow + Big Headline + Italic Subtitle */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center rounded-full bg-[#fdf2fe] border border-[#e8d5ec] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9e0ca0]">
                    WHY VISIT
                  </span>
                  <div className="flex items-center">
                    <span className="h-px w-10 bg-[#9e0ca0]/30" aria-hidden="true" />
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#9e0ca0]/40 ml-0.5" aria-hidden="true" />
                  </div>
                </div>

                {(() => {
                  const whyVisitData = parseWhyVisit(product.whyVisit, product.title);
                  return (
                    <>
                      <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-bold text-neutral-900 leading-[1.18] tracking-tight mb-4">
                        {whyVisitData.title}
                      </h2>

                      <p className="font-serif italic text-xl sm:text-2xl text-[#9e0ca0] tracking-wide select-none font-normal">
                        {whyVisitData.subtitle || getWhyVisitSubtitle(product.categorySlug, product.title, product.slug)}
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* Right Column: Organic Curved Collage Frame + Polaroid Note */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end relative pt-4 lg:pt-0">
                <div className="relative">
                  {/* Organic curved oval photo frame */}
                  <div className="relative aspect-[4/3] w-72 sm:w-84 lg:w-[360px] rounded-[52%_48%_55%_45%/46%_54%_46%_54%] overflow-hidden border-[3.5px] border-[#e8d5ec] shadow-[0_16px_40px_-8px_rgba(158,12,160,0.12)] bg-neutral-100 z-10">
                    <Image
                      src={getWhyVisitCollageImage(product)}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 288px, (max-width: 1024px) 336px, 360px"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Floating tilted polaroid / postcard sticker note */}
                  {(() => {
                    const sticker = getPostcardSticker(product.categorySlug, product.title, product.slug);
                    return (
                      <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-[#faf6ee] text-[#2c241d] px-4 py-3 sm:px-5 sm:py-3.5 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.18)] border border-[#e5dccd] rotate-[6deg] transform hover:rotate-0 transition-transform duration-300 select-none z-30">
                        {/* Tape strip at top */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-[#e8decb]/90 border border-[#d4c6af]/70 -rotate-2 rounded-2xs shadow-2xs" />
                        <div className="font-serif italic text-xs sm:text-[13px] leading-snug space-y-0.5 text-center pt-0.5">
                          {sticker.lines.map((line, idx) => (
                            <p key={idx} className="font-medium text-neutral-800 tracking-wide">
                              {line}
                            </p>
                          ))}
                          <p className="text-[#9e0ca0] text-sm sm:text-base font-bold pt-0.5 select-none">
                            {sticker.heart}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Bottom 4 Feature/Highlight Cards */}
            {product.highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-12 sm:mt-16 relative z-10">
                {product.highlights.slice(0, 4).map((rawHighlight, index) => {
                  const highlight = parseHighlightPoint(rawHighlight, index, product.categorySlug, product.slug);
                  const theme = HIGHLIGHT_CARD_THEMES[index % HIGHLIGHT_CARD_THEMES.length];
                  return (
                    <div
                      key={index}
                      className={`group flex items-start gap-3.5 sm:gap-4 rounded-[18px] bg-white p-4 sm:p-5 border border-neutral-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:border-neutral-300 hover:shadow-[0_8px_24px_rgba(158,12,160,0.08)] transition-all duration-300 relative overflow-hidden ${theme.borderAccent}`}
                    >
                      {/* Large Circular Icon Badge on the Left */}
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-2xs transition-transform duration-300 group-hover:scale-105 ${theme.iconBg}`}
                      >
                        {renderHighlightIcon(highlight.icon)}
                      </div>

                      {/* Content on the Right */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-xs sm:text-[13.5px] font-bold text-neutral-900 leading-snug group-hover:text-[#9e0ca0] transition-colors">
                            {highlight.title}
                          </h3>
                          <span
                            className="text-neutral-400 group-hover:text-[#9e0ca0] group-hover:translate-x-0.5 transition-all text-sm shrink-0 mt-0.5"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </div>

                        {highlight.description && (
                          <p className="mt-1.5 text-[11px] sm:text-xs text-neutral-600 leading-relaxed font-normal">
                            {highlight.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 3B. SECRETS, HISTORY & ARTISTIC SIGNIFICANCE                       */}
      {/* ================================================================= */}
      {product.secretHistoryPoints.length > 0 && (
        <section className="py-14 sm:py-20 bg-white border-t border-neutral-200/70 relative overflow-hidden">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Eyebrow + Title + Subtitle */}
              <div className="lg:col-span-4 flex flex-col justify-start">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9e0ca0]">
                    DID YOU KNOW?
                  </span>
                  <span className="h-px w-10 bg-[#9e0ca0]/30" aria-hidden="true" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight leading-tight mb-3">
                  Secrets, history &amp; artistic significance
                </h2>
                <p className="text-sm sm:text-base text-neutral-500 font-medium leading-relaxed">
                  From hidden facts to iconic moments, these stories make Florence truly extraordinary.
                </p>
              </div>

              {/* Right Column: Cards Grid */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                {/* Top Row: Cards 01 & 02 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {product.secretHistoryPoints.slice(0, 2).map((rawPoint, index) => {
                    const parsed = parseSecretPoint(rawPoint, index, product.images);
                    return (
                      <div
                        key={index}
                        className="group rounded-[22px] bg-gradient-to-br from-[#fdf2fe] via-white to-[#faf5fc] p-4 sm:p-5 border border-[#e8d5ec] shadow-[0_4px_20px_-4px_rgba(158,12,160,0.04)] hover:border-[#9e0ca0]/35 hover:shadow-[0_8px_30px_rgba(158,12,160,0.1)] transition-all duration-300 flex items-start justify-between gap-3.5"
                      >
                        <div className="flex-1 min-w-0">
                          {/* Badge + Line */}
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9e0ca0] text-white text-[11px] font-bold shadow-xs">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="h-px w-6 bg-[#9e0ca0]/25" aria-hidden="true" />
                          </div>
                          {/* Title */}
                          <h3 className="font-display text-base font-bold text-neutral-900 leading-snug mb-1.5 group-hover:text-[#9e0ca0] transition-colors">
                            {parsed.title}
                          </h3>
                          {/* Description */}
                          {parsed.description && (
                            <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                              {parsed.description}
                            </p>
                          )}
                        </div>

                        {/* Image Thumbnail */}
                        <div className="relative aspect-square w-22 sm:w-26 md:w-28 rounded-xl overflow-hidden bg-neutral-200 shrink-0 shadow-2xs border border-[#e8d5ec]/60">
                          <Image
                            src={parsed.image}
                            alt={parsed.title}
                            fill
                            sizes="120px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Row / Remaining Cards: Panoramic Banner Card for 03 */}
                {product.secretHistoryPoints.slice(2).map((rawPoint, index) => {
                  const globalIdx = index + 2;
                  const parsed = parseSecretPoint(rawPoint, globalIdx, product.images);
                  return (
                    <div
                      key={globalIdx}
                      className="group rounded-[22px] bg-gradient-to-br from-[#fdf2fe] via-white to-[#faf5fc] p-4 sm:p-5 border border-[#e8d5ec] shadow-[0_4px_20px_-4px_rgba(158,12,160,0.04)] hover:border-[#9e0ca0]/35 hover:shadow-[0_8px_30px_rgba(158,12,160,0.1)] transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                    >
                      <div className="flex-1 min-w-0">
                        {/* Badge + Line */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9e0ca0] text-white text-[11px] font-bold shadow-xs">
                            {String(globalIdx + 1).padStart(2, "0")}
                          </span>
                          <span className="h-px w-6 bg-[#9e0ca0]/25" aria-hidden="true" />
                        </div>
                        {/* Title */}
                        <h3 className="font-display text-base sm:text-lg font-bold text-neutral-900 leading-snug group-hover:text-[#9e0ca0] transition-colors">
                          {parsed.title}
                        </h3>
                        {/* Description */}
                        {parsed.description && (
                          <p className="mt-1 text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                            {parsed.description}
                          </p>
                        )}
                      </div>

                      {/* Wide Panoramic Image */}
                      <div className="relative aspect-[16/7] sm:aspect-[16/8] w-full sm:w-64 md:w-80 rounded-xl overflow-hidden bg-neutral-200 shrink-0 shadow-2xs border border-[#e8d5ec]/60">
                        <Image
                          src={parsed.image}
                          alt={parsed.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 320px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 3C. RECOMMENDED VISIT SCHEDULE / YOUR DAY AT A GLANCE               */}
      {/* ================================================================= */}
      {product.itinerary.length > 0 && (
        <section className="py-14 sm:py-20 bg-white border-t border-neutral-200/70 relative overflow-hidden">
          <Container>
            {/* Header / Eyebrow */}
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9e0ca0]">
                YOUR DAY AT A GLANCE
              </span>
              <span className="h-px w-10 bg-[#9e0ca0]/30" aria-hidden="true" />
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
                  Recommended visit schedule
                </h2>
                <p className="mt-1 text-sm sm:text-base text-neutral-500 font-medium">
                  A suggested pace for making the most of your visit.
                </p>
              </div>
              <div className="hidden md:flex flex-col items-end opacity-85">
                <span className="font-serif italic text-lg sm:text-xl text-[#9e0ca0] select-none tracking-wide">
                  {getExperienceTagline(product.categorySlug, product.title, product.slug)}
                </span>
              </div>
            </div>

            {/* Step Cards Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {product.itinerary.map((step, index) => {
                const stepImgSrc =
                  step.image && step.image.trim()
                    ? step.image
                    : product.images[index % product.images.length]?.src || "/images/florence-hero.jpg";
                const isLast = index === product.itinerary.length - 1;

                return (
                  <div key={index} className="relative flex flex-col">
                    {/* Card Body */}
                    <div className="group flex-1 flex flex-col rounded-[22px] bg-gradient-to-br from-[#fdf2fe] via-white to-[#faf5fc] p-3.5 sm:p-4 border border-[#e8d5ec] shadow-[0_4px_20px_-4px_rgba(158,12,160,0.04)] hover:border-[#9e0ca0]/35 hover:shadow-[0_8px_30px_rgba(158,12,160,0.1)] transition-all duration-300">
                      {/* Image with Step Pill */}
                      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full rounded-[16px] overflow-hidden bg-neutral-200 mb-3.5 border border-[#e8d5ec]/60">
                        <Image
                          src={stepImgSrc}
                          alt={step.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* 01, 02, 03, 04 Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#9e0ca0] text-white text-xs font-bold shadow-md ring-2 ring-white/90">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>

                      {/* Icon + Tag Pill */}
                      <div className="flex items-center gap-2 mb-2 text-[#9e0ca0]">
                        <div className="flex h-5 w-5 items-center justify-center shrink-0">
                          {renderItineraryIcon(step.icon)}
                        </div>
                        <span className="h-3 w-px bg-[#e8d5ec]" aria-hidden="true" />
                        <span className="inline-flex items-center rounded-md bg-[#fdf2fe] border border-[#e8d5ec] px-2 py-0.5 text-[11px] font-semibold text-[#9e0ca0] tracking-wide">
                          {step.tag || step.time || `Phase ${index + 1}`}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-base font-bold text-neutral-900 leading-snug group-hover:text-[#9e0ca0] transition-colors">
                        {step.title}
                      </h3>

                      {/* Description */}
                      {step.description && (
                        <p className="mt-1.5 text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                          {step.description}
                        </p>
                      )}
                    </div>

                    {/* Step connector arrow (desktop only) */}
                    {!isLast && (
                      <div
                        className="hidden lg:flex absolute -right-3 top-1/3 -translate-y-1/2 z-20 h-6 w-6 items-center justify-center rounded-full bg-white border border-neutral-200 shadow-2xs text-neutral-400"
                        aria-hidden="true"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Tagline & Florence Accent */}
            <div className="mt-12 sm:mt-14 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                {product.categoryName ? `${product.categoryName.toUpperCase()} EXPERIENCE` : "FLORENTINE EXPERIENCE"}
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-neutral-400">
                <span className="h-px w-8 bg-neutral-300" aria-hidden="true" />
                <span>{getExperienceFooterBanner(product.categorySlug, product.title, product.slug)}</span>
                <span className="h-px w-8 bg-neutral-300" aria-hidden="true" />
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 3D. KEY ENTRANCES & ACCESS POINTS                                  */}
      {/* ================================================================= */}
      {product.entrances.length > 0 && (
        <section className="py-10 sm:py-14 border-t border-neutral-200/60 bg-white">
          <Container>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-8">
              Key entrances &amp; access points
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {product.entrances.map((entrance, index) => (
                <div key={index} className="rounded-2xl bg-white p-5 border border-[#e8e2eb] shadow-2xs">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fdf2fe] text-[#9e0ca0]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                        <path d="M9 21V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12" />
                        <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                      </svg>
                    </div>
                    <h3 className="font-display text-sm font-bold text-neutral-900">{entrance.name}</h3>
                  </div>
                  {entrance.description && (
                    <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">{entrance.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 3E. THE ULTIMATE EXPERIENCE / PREMIUM HIGHLIGHTS                   */}
      {/* ================================================================= */}
      {(product.ultimateExperienceTitle || product.ultimateExperienceDescription || product.ultimateExperiencePoints.length > 0) && (
        <section className="py-14 sm:py-20 border-t border-neutral-200/70 bg-white relative overflow-hidden">
          <Container>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Left Block: Arched Photo + Headline + Subtitle */}
              <div className="xl:col-span-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-7">
                {/* Arched Photo on the left */}
                <div className="relative aspect-[3/4] w-40 sm:w-48 lg:w-52 rounded-tr-[52px] rounded-tl-[52px] rounded-br-[24px] rounded-bl-[24px] overflow-hidden bg-neutral-200 shadow-md border border-[#e8d5ec] shrink-0">
                  <Image
                    src={
                      product.ultimateExperienceImage ||
                      (product.slug.includes("cooking") || product.slug.includes("food")
                        ? "/images/experiences/ultimate-terrace-pasta.jpg"
                        : product.images[1]?.src || product.images[0]?.src || "/images/experiences/ultimate-terrace-pasta.jpg")
                    }
                    alt={product.ultimateExperienceTitle || product.title}
                    fill
                    sizes="(max-width: 640px) 160px, 220px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Text beside the image */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-2.5">
                    <span className="inline-flex items-center rounded-full bg-[#fdf2fe] border border-[#e8d5ec] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9e0ca0]">
                      PREMIUM EXPERIENCE
                    </span>
                    <span className="h-px w-8 bg-[#9e0ca0]/30" aria-hidden="true" />
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight leading-[1.18] text-neutral-900 mb-2.5">
                    {product.ultimateExperienceTitle || `Experience ${product.title} at Its Finest`}
                  </h2>

                  {product.ultimateExperienceDescription && (
                    <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                      {product.ultimateExperienceDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Block: Feature Highlight Cards */}
              <div className="xl:col-span-6 flex flex-col gap-3.5">
                {product.ultimateExperiencePoints.length > 0 && (
                  <>
                    {/* Top Row: Cards 0 & 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {product.ultimateExperiencePoints.slice(0, 2).map((rawPoint, index) => {
                        const point = parseUltimatePoint(rawPoint, index);
                        return (
                          <div
                            key={index}
                            className="group rounded-[22px] bg-gradient-to-br from-[#fdf2fe] via-white to-[#faf5fc] p-4 sm:p-5 border border-[#e8d5ec] shadow-[0_4px_20px_-4px_rgba(158,12,160,0.04)] hover:border-[#9e0ca0]/35 hover:shadow-[0_8px_30px_rgba(158,12,160,0.1)] transition-all duration-300 flex items-start gap-3.5"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fdf2fe] border border-[#e8d5ec] text-[#9e0ca0] shadow-xs">
                              {renderFeatureIcon(point.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-display text-sm sm:text-[15px] font-bold text-neutral-900 group-hover:text-[#9e0ca0] transition-colors leading-snug">
                                  {point.title}
                                </h3>
                                <svg
                                  className="h-4 w-4 text-[#9e0ca0] group-hover:translate-x-0.5 transition-transform shrink-0 mt-0.5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  aria-hidden="true"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                              </div>
                              {point.description && (
                                <p className="mt-1 text-xs sm:text-[12.5px] text-neutral-600 leading-relaxed">
                                  {point.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Row: Card 2 (Full Width) & any remaining */}
                    {product.ultimateExperiencePoints.slice(2).map((rawPoint, index) => {
                      const globalIdx = index + 2;
                      const point = parseUltimatePoint(rawPoint, globalIdx);
                      return (
                        <div
                          key={globalIdx}
                          className="group rounded-[22px] bg-gradient-to-br from-[#fdf2fe] via-white to-[#faf5fc] p-4 sm:p-5 border border-[#e8d5ec] shadow-[0_4px_20px_-4px_rgba(158,12,160,0.04)] hover:border-[#9e0ca0]/35 hover:shadow-[0_8px_30px_rgba(158,12,160,0.1)] transition-all duration-300 flex items-start gap-3.5"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fdf2fe] border border-[#e8d5ec] text-[#9e0ca0] shadow-xs">
                            {renderFeatureIcon(point.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-display text-sm sm:text-[15px] font-bold text-neutral-900 group-hover:text-[#9e0ca0] transition-colors leading-snug">
                                {point.title}
                              </h3>
                              <svg
                                className="h-4 w-4 text-[#9e0ca0] group-hover:translate-x-0.5 transition-transform shrink-0 mt-0.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                              </svg>
                            </div>
                            {point.description && (
                              <p className="mt-1 text-xs sm:text-[12.5px] text-neutral-600 leading-relaxed">
                                {point.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Script accent */}
                <div className="flex justify-end pt-1">
                  <span className="font-serif italic text-base sm:text-lg text-[#9e0ca0] select-none tracking-wide">
                    {getExperienceTagline(product.categorySlug, product.title, product.slug)}
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 4. WHAT'S INCLUDED / NOT INCLUDED / MEETING POINT                 */}
      {/* ================================================================= */}
      <section className="py-12 sm:py-16 border-t border-neutral-200/60 bg-neutral-50/80">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            {/* Card 1: What's included */}
            <div className="rounded-3xl bg-white p-6 sm:p-7 border border-neutral-200/80 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md">
              <div>
                <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-neutral-100">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight leading-tight">
                      What&apos;s included
                    </h2>
                    <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Included with your booking</p>
                  </div>
                </div>

                {product.inclusions.length > 0 ? (
                  <ul className="space-y-3">
                    {product.inclusions.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-xs sm:text-[13.5px] text-neutral-800 leading-snug">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] font-bold mt-0.5 shadow-2xs">
                          ✓
                        </span>
                        <span className="font-medium pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-neutral-500">See your confirmation email for full details.</p>
                )}
              </div>
            </div>

            {/* Card 2: Not included */}
            <div className="rounded-3xl bg-white p-6 sm:p-7 border border-neutral-200/80 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md">
              <div>
                <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-neutral-100">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight leading-tight">
                      Not included
                    </h2>
                    <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Extra options or expenses</p>
                  </div>
                </div>

                {product.exclusions.length > 0 ? (
                  <ul className="space-y-3">
                    {product.exclusions.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-xs sm:text-[13.5px] text-neutral-600 leading-snug">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 text-[11px] font-bold mt-0.5">
                          ✕
                        </span>
                        <span className="pt-0.5">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-neutral-500">Nothing else needed — this ticket covers your visit.</p>
                )}
              </div>
            </div>

            {/* Card 3: Meeting Point & Cancellation Policy */}
            <div className="rounded-3xl bg-white p-6 sm:p-7 border border-neutral-200/80 shadow-xs flex flex-col justify-between gap-5 transition-all duration-200 hover:shadow-md">
              {/* Meeting Point */}
              {product.meetingPoint ? (
                <div>
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fdf2fe] text-[#9e0ca0] border border-[#f5d0f8]">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                        <path d="M12 21s-8-6.5-8-12a8 8 0 1 1 16 0c0 5.5-8 12-8 12z" />
                        <circle cx="12" cy="9" r="3" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight leading-tight">
                        Meeting point
                      </h2>
                      <p className="text-[11px] text-neutral-500 font-medium mt-0.5">Arrival location</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-3.5 border border-neutral-200/80">
                    <p className="text-xs sm:text-[13px] font-medium text-neutral-800 leading-relaxed">
                      {product.meetingPoint}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Cancellation Policy */}
              <div className="pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#fdf2fe] text-[#9e0ca0]">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Cancellation policy
                  </h3>
                </div>
                <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                  {product.cancellationPolicy}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================= */}
      {/* 4B. OPENING HOURS & OPERATIONAL INFO                               */}
      {/* ================================================================= */}
      {product.openingHours.length > 0 && (
        <section className="py-10 sm:py-14 border-t border-neutral-200/60">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-4">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-2">
                  Opening hours
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                  Operational hours for this experience.
                </p>
              </div>
              <div className="lg:col-span-8">
                <div className="rounded-2xl border border-[#e8e2eb] bg-white overflow-hidden shadow-2xs">
                  {product.openingHours.map((row, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between gap-4 px-5 py-3.5 text-xs sm:text-sm ${index % 2 === 1 ? "bg-[#FAF8F5]/70" : ""
                        } ${index !== 0 ? "border-t border-neutral-100" : ""}`}
                    >
                      <span className="font-semibold text-neutral-900">{row.day}</span>
                      <span className="text-neutral-600 font-medium">{row.hours}</span>
                    </div>
                  ))}
                </div>
                {product.operationalInfo && (
                  <p className="mt-3 flex items-start gap-2 text-xs text-neutral-500 leading-relaxed">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 mt-0.5 fill-none stroke-current stroke-2 text-[#9e0ca0]">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>{product.operationalInfo}</span>
                  </p>
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 4C. LOCATION & HOW TO GET THERE                                    */}
      {/* ================================================================= */}
      {product.gettingThereOptions.length > 0 && (
        <section className="py-14 sm:py-20 bg-white border-t border-neutral-200/70 relative overflow-hidden">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Eyebrow + Title + Subtitle */}
              <div className="lg:col-span-4 flex flex-col justify-start">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9e0ca0]">
                    HOW TO GET THERE
                  </span>
                  <span className="h-px w-10 bg-[#9e0ca0]/30" aria-hidden="true" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight leading-tight mb-3">
                  Getting to {getMeetingDestinationName(product.meetingPoint, product.title)}
                </h2>
                <p className="text-sm sm:text-base text-neutral-500 font-medium leading-relaxed">
                  {getMeetingDestinationName(product.meetingPoint, product.title)} is easy to reach, with convenient transport options by foot, bus, or taxi.
                </p>
              </div>

              {/* Right Column: Cards Grid */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {product.gettingThereOptions.map((rawOption, index) => {
                  const option = parseGettingThereOption(rawOption, index, product.images);
                  return (
                    <div
                      key={index}
                      className="group rounded-[22px] bg-gradient-to-br from-[#fdf2fe] via-white to-[#faf5fc] p-4 sm:p-5 border border-[#e8d5ec] shadow-[0_4px_20px_-4px_rgba(158,12,160,0.04)] hover:border-[#9e0ca0]/35 hover:shadow-[0_8px_30px_rgba(158,12,160,0.1)] transition-all duration-300 flex flex-col sm:flex-row items-start gap-4"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[4/3] sm:aspect-square w-full sm:w-28 md:w-32 rounded-2xl overflow-hidden bg-neutral-200 shrink-0 shadow-2xs border border-[#e8d5ec]/60">
                        <Image
                          src={option.image}
                          alt={option.mode}
                          fill
                          sizes="(max-width: 640px) 100vw, 150px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                        <div>
                          {/* Icon Badge + Line */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fdf2fe] border border-[#e8d5ec] text-[#9e0ca0] shadow-xs">
                              {renderTransportIcon(option.icon, option.mode)}
                            </span>
                            <span className="h-px w-6 bg-[#9e0ca0]/25" aria-hidden="true" />
                          </div>

                          {/* Mode Title */}
                          <h3 className="font-display text-base sm:text-lg font-bold text-neutral-900 leading-snug group-hover:text-[#9e0ca0] transition-colors">
                            {option.mode}
                          </h3>

                          {/* Description */}
                          {option.description && (
                            <p className="mt-1 text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                              {option.description}
                            </p>
                          )}
                        </div>

                        {/* Tag / Duration Pill */}
                        {option.tag && (
                          <div className="mt-3 flex items-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf2fe] border border-[#e8d5ec] px-2.5 py-1 text-xs font-semibold text-[#9e0ca0]">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" strokeLinecap="round" />
                              </svg>
                              {option.tag}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 4D. BEST TIME TO VISIT / SEASONAL HIGHLIGHTS                       */}
      {/* ================================================================= */}
      {(product.bestTimeToVisit || product.bestTimeToVisitTips.length > 0) && (
        <section className="py-14 sm:py-20 bg-white border-t border-neutral-200/70 relative overflow-hidden">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Eyebrow + Title + Subtitle */}
              <div className="lg:col-span-4 flex flex-col justify-start">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9e0ca0]">
                    BEST TIME TO VISIT
                  </span>
                  <span className="h-px w-10 bg-[#9e0ca0]/30" aria-hidden="true" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight leading-tight mb-3">
                  When to Visit {getMeetingDestinationName(product.meetingPoint, product.title)}
                </h2>
                <p className="text-sm sm:text-base text-neutral-500 font-medium leading-relaxed">
                  {product.bestTimeToVisit ||
                    `The experience is enjoyable year-round, but genuinely varies with the seasons — from vibrant spring and autumn days to the lively summer atmosphere.`}
                </p>
              </div>

              {/* Right Column: 3 Seasonal Cards Grid */}
              <div className="lg:col-span-8">
                {product.bestTimeToVisitTips.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {product.bestTimeToVisitTips.map((rawTip, index) => {
                      const seasonCard = parseSeasonTip(rawTip, index, product.images);
                      return (
                        <div
                          key={index}
                          className="group rounded-[22px] bg-gradient-to-br from-[#fdf2fe] via-white to-[#faf5fc] border border-[#e8d5ec] shadow-[0_4px_20px_-4px_rgba(158,12,160,0.04)] hover:border-[#9e0ca0]/35 hover:shadow-[0_8px_30px_rgba(158,12,160,0.1)] transition-all duration-300 flex flex-col overflow-hidden"
                        >
                          {/* Image with Floating Icon */}
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-200">
                            <Image
                              src={seasonCard.image}
                              alt={seasonCard.season || seasonCard.months}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Circular floating icon badge */}
                            <div className="absolute -bottom-3.5 left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#e8d5ec] text-[#9e0ca0] shadow-md">
                              {renderSeasonIcon(seasonCard.icon, seasonCard.season)}
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-4 sm:p-5 pt-5 flex-1 flex flex-col justify-between">
                            <div>
                              {/* Season Badge */}
                              <div className="mb-2">
                                <span className="inline-flex items-center rounded-full bg-[#fdf2fe] border border-[#e8d5ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#9e0ca0] tracking-wide">
                                  {seasonCard.season}
                                </span>
                              </div>

                              {/* Months / Title */}
                              <h3 className="font-display text-base font-bold text-neutral-900 leading-snug group-hover:text-[#9e0ca0] transition-colors mb-1.5">
                                {seasonCard.months}
                              </h3>

                              {/* Description */}
                              {seasonCard.description && (
                                <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                                  {seasonCard.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 5. GOOD TO KNOW & LOCATION MAP CARD                               */}
      {/* ================================================================= */}
      <section className="py-10 sm:py-14">
        <Container>
          <div className="rounded-3xl bg-[#FAF8F5] border border-[#ECE7DF] p-3.5 sm:p-5 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
              {/* Left Column: Real, dynamic map — centered on this product's
                  actual meeting-point coordinates from the database. See
                  ExperienceLocationMap for the fallback when a product has
                  no coordinates yet. */}
              <ExperienceLocationMap
                title={product.title}
                meetingPoint={product.meetingPoint}
                meetingCity={product.meetingCity}
                meetingCountry={product.meetingCountry}
                location={product.meetingLocation}
                className="lg:col-span-5 aspect-[4/3] lg:aspect-auto lg:h-[260px]"
              />

              {/* Center Column: Good to know bullet points */}
              <div className="lg:col-span-4 px-2 sm:px-3 py-2 space-y-4">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  Good to know
                </h3>
                <ul className="space-y-3">
                  {(product.goodToKnow.length > 0 ? product.goodToKnow : DEFAULT_GOOD_TO_KNOW_TIPS).map((tip, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fdf2fe] text-[#9e0ca0]">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                      <span className="text-xs sm:text-[13px] font-medium text-neutral-700">{tip}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fdf2fe] text-[#9e0ca0]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-[13px] font-medium text-neutral-700">{product.cancellationPolicy}</span>
                  </li>
                </ul>
              </div>

              {/* Right Column: Decorative Illustration */}
              <div className="lg:col-span-3 relative aspect-[4/3] lg:aspect-auto lg:h-[260px] rounded-2xl overflow-hidden bg-[#FAF8F5]">
                <Image
                  src="/images/florence-art-lives-here.jpg"
                  alt="Florence skyline illustration"
                  fill
                  sizes="(min-width: 1024px) 25vw, 100vw"
                  className="object-contain object-right-bottom sm:object-center"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================= */}
      {/* 5B. COMPREHENSIVE TICKET COMPARISON TABLE                          */}
      {/* ================================================================= */}
      {showTicketComparison && (
        <section className="py-12 sm:py-16 border-t border-neutral-200/60 bg-[#FAF8F5]/80">
          <Container>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-2">
              Compare your options
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mb-8">
              What&apos;s included with each ticket type.
            </p>

            <div className="overflow-x-auto rounded-3xl border border-[#e8e2eb] bg-white shadow-[0_4px_24px_rgba(43,9,52,0.04)]">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-white p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-neutral-500 w-[38%]">
                      Included
                    </th>
                    {product.options.map((option) => (
                      <th key={option.id} className="p-4 sm:p-5 text-center border-l border-neutral-100">
                        <div className="font-display text-sm sm:text-base font-bold text-neutral-900">{option.name}</div>
                        <div className="mt-1 text-xs sm:text-sm font-semibold text-neutral-600">
                          &euro;{option.priceAmount.toFixed(0)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, rowIndex) => (
                    <tr key={feature} className={rowIndex % 2 === 1 ? "bg-[#FAF8F5]/60" : ""}>
                      <td className="sticky left-0 bg-inherit p-4 sm:p-5 text-xs sm:text-sm font-medium text-neutral-800 border-t border-neutral-100">
                        {feature}
                      </td>
                      {product.options.map((option) => (
                        <td
                          key={option.id}
                          className="p-4 sm:p-5 text-center border-t border-l border-neutral-100"
                        >
                          {option.features.includes(feature) ? (
                            <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.5]">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          ) : (
                            <span className="mx-auto flex h-6 w-6 items-center justify-center text-neutral-300">
                              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current stroke-2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 6. YOU MIGHT ALSO LIKE — real related products, same category     */}
      {/* ================================================================= */}
      {related.length > 0 && (
        <section className="py-12 sm:py-16 border-t border-neutral-200/60">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                You might also like
              </h2>
              <Link
                href="/experiences"
                className="text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1 group"
              >
                <span>View all experiences</span>
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item) => (
                <ExperienceCard key={item.id} product={item} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 6B. RELATED TRAVEL GUIDES & BLOG ARTICLES                          */}
      {/* ================================================================= */}
      {relatedBlogPosts.length > 0 && (
        <section className="py-12 sm:py-16 border-t border-neutral-200/60 bg-[#FAF8F5]/80">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                  Related travel guides
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 font-medium">
                  More from our Florence editorial team.
                </p>
              </div>
              <Link
                href="/blog"
                className="hidden sm:flex text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-950 items-center gap-1 group shrink-0"
              >
                <span>Visit the blog</span>
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 6C. FREQUENTLY ASKED QUESTIONS                                     */}
      {/* ================================================================= */}
      {product.faqs.length > 0 && (
        <section className="py-12 sm:py-16 border-t border-neutral-200/60">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-8 text-center">
                Frequently asked questions
              </h2>
              <ExperienceFaqAccordion faqs={product.faqs} />
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 7. READY TO EXPLORE FLORENCE? CTA BANNER                          */}
      {/* ================================================================= */}
      <section className="pb-16 sm:pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-white p-8 sm:p-12 text-neutral-900 border border-[#e5dfd4] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                  {product.ctaHeadline || "Ready to explore Florence?"}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 font-normal max-w-xl">
                  {product.ctaSubtext || "Skip the lines, discover iconic art, and make your trip unforgettable."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <a
                  href="#book"
                  className="inline-flex items-center gap-2 rounded-full bg-[#9e0ca0] hover:bg-[#850b9e] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white transition-all hover:scale-105 shadow-md cursor-pointer"
                >
                  <span>Book This Experience</span>
                  <span>&rarr;</span>
                </a>
                <Link
                  href="/experiences"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 hover:text-[#9e0ca0] px-6 py-3.5 text-xs sm:text-sm font-semibold text-neutral-800 transition-all hover:scale-105 shadow-xs cursor-pointer"
                >
                  <span>View All Experiences</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
