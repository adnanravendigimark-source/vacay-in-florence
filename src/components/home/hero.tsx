import { Container } from "@/components/ui/container";
import { HeroSearch } from "@/components/home/hero-search";

export function Hero() {
  return (
    <section className="relative min-h-[700px] lg:min-h-[760px] w-full flex flex-col justify-between overflow-visible bg-stone-900 text-white pt-24 sm:pt-28 pb-6">
      {/* Background Video: High-Definition Panoramic Video of Florence */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        {/* <Image
          src="/images/florence-hero.jpg"
          alt="Panoramic golden sunset view of Florence Cathedral Duomo and Arno river"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-[center_right] sm:object-center"
        /> */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/images/florence-hero.jpg"
          className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        >
          <source src="/video/hero-florence.mp4" type="video/mp4" />
          <source src="/vedio/genrate_a_longer_vedio_min.mp4" type="video/mp4" />
        </video>

        {/* Horizontal Gradient on the Left side */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 via-45% to-transparent pointer-events-none" />

        {/* Soft top gradient for header legibility */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 via-black/15 to-transparent pointer-events-none" />

        {/* Soft bottom gradient for trust badges legibility */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content & Stretched Centered Search Bar */}
      <Container className="relative z-20 my-auto py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-4">
          {/* Text Block */}
          <div className="max-w-3xl">
            {/* Eyebrow Tagline */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold tracking-wider text-white uppercase mb-3 sm:mb-4 border border-white/20 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>OFFICIAL FLORENCE TICKETS &amp; TOURS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-medium leading-[1.12] tracking-tight text-white drop-shadow-2xl">
              Unforgettable Experiences in{" "}
              <span className="font-display italic font-light text-[#faeedd] drop-shadow-2xl">
                Florence
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-3.5 max-w-xl text-xs sm:text-sm md:text-base font-normal leading-relaxed text-white/95 drop-shadow-md">
              Skip the lines at iconic museums, climb the Duomo, and explore Tuscany with verified local guides. Instant mobile vouchers with 100% free cancellation.
            </p>
          </div>

          {/* Live Floating Guarantee Pill */}
          <div className="hidden lg:flex flex-col items-end gap-2 text-right shrink-0">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-black/40 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white border border-white/20 shadow-lg">
              <span className="text-amber-400 text-sm">★★★★★</span>
              <span>4.9 / 5.0 (14k+ Reviews)</span>
            </div>
            <div className="text-[11px] text-white/80 font-medium">
              ⚡ Over 98% sold out at the gate &bull; Reserve ahead
            </div>
          </div>
        </div>

        {/* Stretched Centered Search Bar Widget */}
        <div className="relative z-30 w-full mt-4 sm:mt-6 mb-3 sm:mb-4">
          <HeroSearch />
        </div>

        {/* Trending Quick Searches */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 text-xs pt-1 pb-1">
          <span className="text-white/80 font-medium text-[11px] uppercase tracking-wider">Trending:</span>
          {[
            { label: "⚡ Duomo Dome Climb", href: "/experiences/duomo-and-brunelleschis-dome-climb" },
            { label: "🏛️ Uffizi Skip-The-Line", href: "/experiences/uffizi-gallery-skip-the-line-ticket" },
            { label: "🎨 Michelangelo's David", href: "/experiences/accademia-gallery-michelangelos-david-ticket" },
            { label: "🍷 Chianti Wine Tour", href: "/experiences/chianti-countryside-and-wine-tasting-day-trip" },
            { label: "🍝 Tuscan Cooking Class", href: "/experiences/florentine-cooking-class-with-market-visit" },
          ].map((tag) => (
            <a
              key={tag.label}
              href={tag.href}
              className="rounded-full bg-black/35 backdrop-blur-md px-3.5 py-1 text-white/90 text-xs font-medium hover:bg-white hover:text-neutral-900 transition-all duration-150 border border-white/20 shadow-sm"
            >
              {tag.label}
            </a>
          ))}
        </div>
      </Container>

      {/* Bottom Value Props & Scroll Indicator Bar */}
      <div className="relative z-10 w-full pb-5 pt-2">
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            {/* 4 Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 flex-1 max-w-3xl">
              {/* Badge 1: Secure Booking */}
              <div className="flex items-center gap-2.5">
                <div className="text-white shrink-0 drop-shadow-md">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.85]">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="leading-tight drop-shadow-md">
                  <div className="text-xs font-semibold text-white">
                    Secure Booking
                  </div>
                  <div className="text-[10.5px] text-white/80">
                    Your data is safe with us
                  </div>
                </div>
              </div>

              {/* Badge 2: Top Rated Experiences */}
              <div className="flex items-center gap-2.5">
                <div className="text-white shrink-0 drop-shadow-md">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.85]">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="leading-tight drop-shadow-md">
                  <div className="text-xs font-semibold text-white">
                    Top Rated Experiences
                  </div>
                  <div className="text-[10.5px] text-white/80">
                    Handpicked by locals
                  </div>
                </div>
              </div>

              {/* Badge 3: 24/7 Support */}
              <div className="flex items-center gap-2.5">
                <div className="text-white shrink-0 drop-shadow-md">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.85]">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <div className="leading-tight drop-shadow-md">
                  <div className="text-xs font-semibold text-white">
                    24/7 Support
                  </div>
                  <div className="text-[10.5px] text-white/80">
                    We&apos;re here to help
                  </div>
                </div>
              </div>

              {/* Badge 4: Sustainable Travel */}
              <div className="flex items-center gap-2.5">
                <div className="text-white shrink-0 drop-shadow-md">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.85]">
                    <path d="M11 20A7 7 0 0 1 4 13C4 8.5 7.5 4 13 3c5.5 0 7 2.5 7 7 0 6.5-5 10-9 10z" />
                    <path d="M11 20v-8a4 4 0 0 1 4-4" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="leading-tight drop-shadow-md">
                  <div className="text-xs font-semibold text-white">
                    Sustainable Travel
                  </div>
                  <div className="text-[10.5px] text-white/80">
                    A better tomorrow
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll to Explore (Bottom Right) */}
            <div className="hidden lg:flex items-center gap-2.5 text-white drop-shadow-md select-none">
              <div className="flex flex-col items-center">
                <div className="relative flex h-6 w-3.5 items-start justify-center rounded-full border border-white p-0.5">
                  <div className="h-1 w-0.5 rounded-full bg-white animate-pulse" />
                </div>
                <div className="h-3 w-[1px] bg-white/70 mt-1" />
              </div>
              <span className="text-[11px] font-medium tracking-wide text-white">
                Scroll to explore
              </span>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
