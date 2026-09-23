import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { CategorySummary, CategoryIcon } from "@/lib/types";

interface CategoryCardShowcaseProps {
  categories: CategorySummary[];
}

const CATEGORY_META: Record<
  string,
  {
    tag: string;
    image: string;
    bestFor: string;
    highlights: string[];
    duration: string;
  }
> = {
  "skip-the-line-attractions": {
    tag: "Essential Sightseeing",
    image: "/images/hero-florence-duomo.jpg",
    bestFor: "First-time visitors & time-conscious travelers",
    highlights: [
      "Brunelleschi Dome Climb & Terrace Access",
      "Giotto's Bell Tower & Panoramic City Views",
      "Baptistery of San Giovanni & Gates of Paradise",
    ],
    duration: "1.5 – 3 hours",
  },
  "museums-galleries": {
    tag: "Renaissance Masterpieces",
    image: "/images/hero-david.jpg",
    bestFor: "Art connoisseurs & Renaissance history enthusiasts",
    highlights: [
      "Michelangelo's Original David at the Accademia",
      "Botticelli's Birth of Venus at the Uffizi",
      "Pitti Palace Royal Apartments & Boboli Gardens",
    ],
    duration: "2 – 3.5 hours",
  },
  "guided-tours": {
    tag: "Insider Local Knowledge",
    image: "/images/hero2-guided-tour.jpg",
    bestFor: "Curious travelers seeking authentic stories & hidden routes",
    highlights: [
      "Historic Center & Ponte Vecchio Walking Tour",
      "Medici Dynasty Secrets & Vasari Corridor Lore",
      "Florence by Twilight Small-Group Walk",
    ],
    duration: "2 – 3 hours",
  },
  "food-wine-experiences": {
    tag: "Florentine Gastronomy",
    image: "/images/hero-food-wine.jpg",
    bestFor: "Foodies, couples & Italian culinary enthusiasts",
    highlights: [
      "Chianti Classico Winery & Historic Cellar Tastings",
      "Handmade Pasta & Creamy Gelato Masterclasses",
      "San Lorenzo Central Market Gourmet Tasting Tour",
    ],
    duration: "2.5 – 5 hours",
  },
  "day-trips-from-florence": {
    tag: "Tuscan Countryside Escapes",
    image: "/images/hero-day-trips.jpg",
    bestFor: "Countryside explorers & scenic landscape photographers",
    highlights: [
      "Siena Medieval Piazza & San Gimignano Towers",
      "Pisa Miracle Square & Leaning Tower Excursion",
      "Val d'Orcia Rolling Hills & Cypress Country Roads",
    ],
    duration: "Full Day (8 – 11 hours)",
  },
  "outdoor-active": {
    tag: "Panoramic Adventures",
    image: "/images/adventure-banner.jpg",
    bestFor: "Active explorers & nature lovers wanting fresh air",
    highlights: [
      "Traditional Wooden Boat Cruise on River Arno",
      "Tuscan Hills & Fiesole Panoramic E-Bike Tour",
      "Vintage Vespa Countryside Drive through Chianti",
    ],
    duration: "2 – 4 hours",
  },
};

const ICONS: Record<CategoryIcon, React.ReactNode> = {
  landmark: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <path d="M12 3v18M8 21h8M5 17h14M7 13h10M9 9h6M11 5h2" />
      <path d="M6 21l6-18 6 18" />
    </svg>
  ),
  museum: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3L3 10h18L12 3z" />
    </svg>
  ),
  "tour-guide": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <path d="M12 21c-4-4.5-7-8.5-7-12a7 7 0 1 1 14 0c0 3.5-3 7.5-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  "food-wine": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <path d="M8 22h8M12 15v7M12 15a5 5 0 0 0 5-5V3H7v7a5 5 0 0 0 5 5z" />
      <line x1="7" y1="8" x2="17" y2="8" />
    </svg>
  ),
  "day-trip": (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  outdoor: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-[1.8]">
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17l4-9h4M10 17h8l-3-6-2.5 2" />
    </svg>
  ),
};

function resolveMeta(category: CategorySummary) {
  return (
    CATEGORY_META[category.slug] || {
      tag: "Curated Experience",
      image: category.image.src || "/images/hero-florence-duomo.jpg",
      bestFor: "All travelers to Florence",
      highlights: [
        "Reserved Priority Access",
        "Licensed Local Florentine Guides",
        "100% Free Cancellation",
      ],
      duration: "2 – 4 hours",
    }
  );
}

type Variant = "featured" | "spotlight" | "compact";

function ShowcaseCard({
  category,
  index,
  variant,
}: {
  category: CategorySummary;
  index: number;
  variant: Variant;
}) {
  const meta = resolveMeta(category);
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const highlightCount = isFeatured ? 3 : 2;

  return (
    <article
      id={category.slug}
      className={`group scroll-mt-28 flex h-full flex-col overflow-hidden rounded-3xl border border-[#ece6dc] bg-[#faf9f6]/70 shadow-xs hover:shadow-md transition-shadow duration-300 ${
        isFeatured ? "sm:col-span-2" : ""
      }`}
    >
      {/* Visual Image */}
      <div
        className={`relative w-full overflow-hidden bg-neutral-200 ${
          isFeatured
            ? "aspect-[16/9] sm:aspect-[2/1]"
            : variant === "spotlight"
              ? "flex-1 min-h-[220px] sm:min-h-[260px]"
              : "aspect-[4/3]"
        }`}
      >
        <img
          src={meta.image}
          alt={`${category.name} in Florence`}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

        {/* Floating Category Tag Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3 py-1.5 shadow-md border border-neutral-200/80 text-[11px] sm:text-xs font-bold text-neutral-900">
          <span className="text-[#2b0934]">{ICONS[category.icon]}</span>
          <span>{meta.tag}</span>
        </div>

        {/* Floating Experience Count Badge */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 rounded-full bg-[#2b0934]/90 backdrop-blur-md px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-white shadow-md">
          {category.productCount} Experience{category.productCount === 1 ? "" : "s"} Available
        </div>
      </div>

      {/* Content */}
      <div
        className={`flex flex-col ${isFeatured ? "p-5 sm:p-7" : "p-4 sm:p-5"} ${
          variant === "spotlight" ? "" : "flex-1"
        }`}
      >
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#738276] mb-1.5">
          <span>Collection 0{index + 1}</span>
          <span>•</span>
          <span>Florence, Italy</span>
        </div>

        <h2
          className={`font-display font-normal leading-tight text-[#2b0934] ${
            isFeatured ? "text-2xl sm:text-3xl" : isCompact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
          }`}
        >
          <Link
            href={`/experiences/category/${category.slug}`}
            className="hover:underline decoration-[#2b0934]/40 underline-offset-4"
          >
            {category.name}
          </Link>
        </h2>

        <p
          className={`mt-2 text-[#59655d] leading-relaxed ${
            isFeatured ? "text-sm sm:text-[15px]" : "text-xs sm:text-sm line-clamp-2"
          }`}
        >
          {category.shortDescription}
        </p>

        {/* Highlights */}
        <div className="mt-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            Popular Highlights
          </p>
          <div className="flex flex-wrap gap-1.5">
            {meta.highlights.slice(0, highlightCount).map((highlight, hIdx) => (
              <span
                key={hIdx}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[10.5px] sm:text-[11px] font-medium text-neutral-700 border border-[#e5e0d8]"
              >
                <svg viewBox="0 0 20 20" className="h-3 w-3 shrink-0 text-amber-600 fill-current">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{highlight}</span>
              </span>
            ))}
            {meta.highlights.length > highlightCount && (
              <span className="inline-flex items-center rounded-lg bg-neutral-100 px-2 py-1 text-[10.5px] sm:text-[11px] font-semibold text-neutral-500">
                +{meta.highlights.length - highlightCount} more
              </span>
            )}
          </div>
        </div>

        {/* Travel Meta Info */}
        {isFeatured ? (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-white p-3.5 border border-[#e5e0d8] text-xs">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Best For
              </span>
              <span className="font-semibold text-neutral-800 mt-0.5 block leading-snug">{meta.bestFor}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Typical Duration
              </span>
              <span className="font-semibold text-neutral-800 mt-0.5 block">{meta.duration}</span>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-[11px] text-neutral-500 leading-relaxed">
            <span className="font-semibold text-neutral-700">Best for:</span> {meta.bestFor}
            <span className="mx-1.5 text-neutral-300">·</span>
            <span className="font-semibold text-neutral-700">Duration:</span> {meta.duration}
          </p>
        )}

        {/* CTA Actions */}
        <div className="mt-auto pt-4 flex flex-wrap items-center gap-2.5">
          <Link
            href={`/experiences/category/${category.slug}`}
            className={`group/cta inline-flex items-center justify-center gap-1.5 rounded-full bg-[#2b0934] hover:bg-[#3d0d4a] font-bold text-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
              isFeatured ? "px-6 py-3 text-xs sm:text-sm" : "px-4 py-2.5 text-[11px] sm:text-xs w-full sm:w-auto"
            }`}
          >
            <span>Browse {category.name}</span>
            <span className="transition-transform duration-200 group-hover/cta:translate-x-1 font-bold">&rarr;</span>
          </Link>

          {isFeatured && (
            <Link
              href="/experiences?dest=Florence%2C+Italy"
              className="inline-flex items-center justify-center rounded-full bg-white hover:bg-neutral-100 px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-700 border border-[#dcd7ce] transition-colors"
            >
              View All Activities
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function CategoryCardShowcase({ categories }: CategoryCardShowcaseProps) {
  if (categories.length === 0) return null;

  const [first, second, ...rest] = categories;

  return (
    <section className="bg-white py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          <ShowcaseCard category={first} index={0} variant="featured" />
          {second && <ShowcaseCard category={second} index={1} variant="spotlight" />}
          {rest.map((category, idx) => (
            <ShowcaseCard key={category.id} category={category} index={idx + 2} variant="compact" />
          ))}
        </div>
      </Container>
    </section>
  );
}
