import { Container } from "@/components/ui/container";
import { HeroSearch } from "@/components/home/hero-search";

interface HeroProps {
  content?: {
    heroBadge?: string;
    heroHeading?: string;
    heroSubheading?: string;
    heroBackgroundImage?: string;
    heroImageAlt?: string;
    heroVideoUrl?: string | null;
    heroTrendingTags?: { label: string; href: string }[] | null;
  };
}

const DEFAULT_TRENDING_TAGS = [
  { label: "⚡ Duomo Dome Climb", href: "/experiences/duomo-and-brunelleschis-dome-climb" },
  { label: "🏛️ Uffizi Skip-The-Line", href: "/experiences/uffizi-gallery-skip-the-line-ticket" },
  { label: "🎨 Michelangelo's David", href: "/experiences/accademia-gallery-michelangelos-david-ticket" },
  { label: "🍷 Chianti Wine Tour", href: "/experiences/chianti-countryside-and-wine-tasting-day-trip" },
  { label: "🍝 Tuscan Cooking Class", href: "/experiences/florentine-cooking-class-with-market-visit" },
];

export function Hero({ content }: HeroProps) {
  const badge = content?.heroBadge || "OFFICIAL FLORENCE TICKETS & TOURS";
  const heading = content?.heroHeading || "Unforgettable Experiences in Florence";
  const subheading =
    content?.heroSubheading ||
    "Skip the 2-hour queues at the Duomo and Uffizi. Guaranteed entrance timeslots, expert local guides, and 100% free 24-hour cancellation.";
  const bgImage = content?.heroBackgroundImage || "/images/florence-hero.jpg";
  const imageAlt = content?.heroImageAlt || "Florence cathedral panorama";
  const videoUrl = content?.heroVideoUrl || "/video/hero-florence.mp4";
  const tags = content?.heroTrendingTags && content.heroTrendingTags.length > 0 ? content.heroTrendingTags : DEFAULT_TRENDING_TAGS;

  return (
    <section className="relative z-20 min-h-[560px] h-[100dvh] max-h-[960px] w-full flex flex-col justify-center text-white pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* Background Video: High-Definition Panoramic Video of Florence */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={bgImage}
          aria-label={imageAlt}
          className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        >
          {videoUrl ? <source src={videoUrl} type="video/mp4" /> : null}
          <source src="/video/hero-florence.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Hero Content & Stretched Centered Search Bar */}
      <Container className="relative z-20 my-auto py-2 sm:py-4 flex flex-col justify-center">
        {/* Text Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl">
            {/* Eyebrow Tagline */}
            <div className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3 py-0.5 text-[10px] sm:text-[10.5px] font-semibold tracking-[0.16em] text-amber-300 uppercase mb-2.5 border border-amber-400/25 shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{badge}</span>
            </div>

            {/* Main Headline with Luxury Editorial Font */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[46px] font-normal leading-[1.12] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              {heading.includes("Florence") ? (
                <>
                  {heading.replace(/Florence/i, "")}
                  <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#ffe4a0] via-[#faeedd] to-[#e5b869] drop-shadow-2xl inline-block">
                    Florence
                  </span>
                </>
              ) : (
                heading
              )}
            </h1>

            {/* Subheading with Key Highlights */}
            <p className="mt-2.5 max-w-lg text-xs sm:text-[13px] md:text-[13.5px] font-normal leading-relaxed text-neutral-100/95 drop-shadow-md">
              {subheading}
            </p>

          </div>
        </div>

        {/* Stretched Centered Search Bar Widget */}
        <div className="relative z-30 w-full mt-10 sm:mt-12 md:mt-14 mb-3 sm:mb-4">
          <HeroSearch />
        </div>

        {/* Trending Quick Searches */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 text-xs pt-1 pb-1">
          <span className="text-white/80 font-semibold text-[10.5px] uppercase tracking-wider">Trending:</span>
          {tags.map((tag) => (
            <a
              key={tag.label}
              href={tag.href}
              className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-white/95 text-[11px] sm:text-xs font-medium hover:bg-white hover:text-neutral-900 transition-all duration-150 border border-white/25 shadow-sm"
            >
              {tag.label}
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
