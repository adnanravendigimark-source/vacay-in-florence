import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, searchProducts } from "@/lib/data/products";
import { Container } from "@/components/ui/container";
import { SingleExperienceBookingCard } from "@/components/experiences/single-experience-booking-card";
import { ExperienceCard } from "@/components/ui/experience-card";
import { ProductBadgePill } from "@/components/ui/badge";

export async function generateStaticParams() {
  const { items } = await searchProducts({ pageSize: 100 });
  return items.map((p) => ({ slug: p.slug }));
}

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.title} | VACAY Florence`,
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
const BADGE_META: Partial<Record<string, { label: string; icon: React.ReactNode }>> = {
  "skip-the-line": {
    label: "Skip the line",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  "free-cancellation": {
    label: "Free cancellation",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
  },
  "instant-confirmation": {
    label: "Instant confirmation",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  "best-seller": {
    label: "Best seller",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  "small-group": {
    label: "Small group",
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
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  popular: {
    label: "Popular",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
      </svg>
    ),
  },
  new: {
    label: "New",
    icon: (
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5L5.7 21l2.3-7.2-6-4.6h7.6z" />
      </svg>
    ),
  },
  "food-wine": {
    label: "Food & Wine",
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

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categorySlug, 4);

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

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] text-neutral-900 selection:bg-[#183528] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            className="object-cover object-center brightness-[0.92] contrast-[1.02]"
          />
          {/* Left-to-right scrim so the title/badges stay legible over any photo */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-black/10 pointer-events-none" />
          {/* Top scrim under the site header */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />
          {/* Bottom scrim for depth where the hero meets the page */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <Container className="relative z-10 pt-28 pb-16 lg:py-20">
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

              {/* Feature Pills Row — one per real badge on this product */}
              {product.badges.length > 0 && (
                <div className="mt-7 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {product.badges.map((badge) => {
                    const meta = BADGE_META[badge];
                    if (!meta) return null;
                    return (
                      <div
                        key={badge}
                        className="inline-flex items-center gap-2.5 rounded-full bg-[#524436]/65 hover:bg-[#524436]/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-neutral-100 border border-[#8C7A68]/35 shadow-xs"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8E7966]/80 text-white shrink-0">
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
            <div className="w-full lg:w-auto flex justify-center lg:justify-end shrink-0">
              <SingleExperienceBookingCard
                productSlug={product.slug}
                options={product.options}
                basePrice={product.priceFrom.amount}
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#183528] text-amber-200">
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

                  {galleryThumbs.length > 0 && (
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
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ================================================================= */}
      {/* 3. HIGHLIGHTS                                                      */}
      {/* ================================================================= */}
      {product.highlights.length > 0 && (
        <section className="py-8 sm:py-12 border-t border-neutral-200/60">
          <Container>
            <h2 className="font-display text-2xl font-bold text-neutral-900 tracking-tight mb-8">
              Highlights
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {product.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white p-5 border border-neutral-200/80 shadow-2xs flex items-start gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-800">
                    {HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length]}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">{highlight}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ================================================================= */}
      {/* 4. WHAT'S INCLUDED / NOT INCLUDED / MEETING POINT                 */}
      {/* ================================================================= */}
      <section className="py-12 sm:py-16 border-t border-neutral-200/60">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Column 1: What's included */}
            <div className="md:col-span-4 space-y-4">
              <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
                What&apos;s included
              </h2>
              {product.inclusions.length > 0 ? (
                <ul className="space-y-3">
                  {product.inclusions.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700">
                      <span className="text-emerald-600 font-bold text-base leading-none">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-neutral-500">See your confirmation email for full details.</p>
              )}
            </div>

            {/* Column 2: Not included */}
            <div className="md:col-span-4 space-y-4">
              <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
                Not included
              </h2>
              {product.exclusions.length > 0 ? (
                <ul className="space-y-3">
                  {product.exclusions.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-600">
                      <span className="text-neutral-400 font-bold text-sm leading-none">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-neutral-500">Nothing else needed — this ticket covers your visit.</p>
              )}
            </div>

            {/* Column 3: Meeting point & Cancellation Policy */}
            <div className="md:col-span-4 space-y-6">
              {product.meetingPoint && (
                <div className="space-y-2">
                  <h2 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
                    Meeting point
                  </h2>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2 text-[#183528] mt-0.5">
                      <path d="M12 21s-8-6.5-8-12a8 8 0 1 1 16 0c0 5.5-8 12-8 12z" />
                      <circle cx="12" cy="9" r="3" />
                    </svg>
                    <p className="leading-relaxed">{product.meetingPoint}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-neutral-200/60">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Cancellation policy
                </h3>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-600">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2 text-[#183528] mt-0.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p className="leading-relaxed">{product.cancellationPolicy}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================= */}
      {/* 5. GOOD TO KNOW & LOCATION MAP CARD                               */}
      {/* ================================================================= */}
      <section className="py-10 sm:py-14">
        <Container>
          <div className="rounded-3xl bg-[#FAF8F5] border border-[#ECE7DF] p-3.5 sm:p-5 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
              {/* Left Column: Stylized City Map Preview */}
              <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto lg:h-[260px] rounded-2xl overflow-hidden border border-[#E5E0D5] bg-[#EDE8E0]">
                <Image
                  src="/images/florence-street-map.jpg"
                  alt={`Street map of central Florence near ${product.title}`}
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover object-center"
                />
                <div className="absolute top-[40%] left-[58%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 max-w-[85%]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#142A20] text-white shadow-lg">
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                    </svg>
                  </div>
                  <div className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-neutral-900 shadow-md border border-neutral-200/80 tracking-tight truncate">
                    {product.title}
                  </div>
                </div>
              </div>

              {/* Center Column: Good to know bullet points */}
              <div className="lg:col-span-4 px-2 sm:px-3 py-2 space-y-4">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#142A20] tracking-tight">
                  Good to know
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5ECE7] text-[#183528]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <line x1="7" y1="8" x2="17" y2="8" />
                        <line x1="7" y1="12" x2="13" y2="12" />
                        <circle cx="17" cy="14" r="1.5" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-[13px] font-medium text-neutral-700">
                      Show your voucher (mobile or printed) at the entrance
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5ECE7] text-[#183528]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-[13px] font-medium text-neutral-700">
                      Arrive 10–15 minutes early
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5ECE7] text-[#183528]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-[13px] font-medium text-neutral-700">{product.cancellationPolicy}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5ECE7] text-[#183528]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="6" width="20" height="14" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-[13px] font-medium text-neutral-700">
                      Bring a valid photo ID matching your booking name
                    </span>
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
      {/* 7. READY TO EXPLORE FLORENCE? CTA BANNER                          */}
      {/* ================================================================= */}
      <section className="pb-16 sm:pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-[#183528] p-8 sm:p-12 text-white shadow-xl">
            <div className="absolute -left-6 -bottom-6 w-48 h-48 opacity-15 pointer-events-none select-none">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                <path d="M10,80 Q30,60 50,50 Q70,40 90,30 Q60,60 40,75 Z" />
                <circle cx="35" cy="55" r="5" />
                <circle cx="55" cy="45" r="5" />
                <circle cx="75" cy="35" r="5" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Ready to explore Florence?
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-neutral-300 font-light max-w-xl">
                  Skip the lines, discover iconic art, and make your trip unforgettable.
                </p>
              </div>

              <Link
                href="/experiences"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 hover:bg-white hover:text-[#183528] px-6 py-3.5 text-xs sm:text-sm font-semibold text-white transition-all hover:scale-105 shadow-md cursor-pointer shrink-0"
              >
                <span>View All Experiences</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
