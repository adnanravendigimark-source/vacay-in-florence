import { Container } from "@/components/ui/container";
import { HeroSearch } from "@/components/home/hero-search";

export function Hero() {
  return (
    <section className="relative z-20 min-h-[580px] h-[100dvh] max-h-[960px] w-full flex flex-col justify-between bg-stone-900 text-white pt-20 sm:pt-22 pb-2 sm:pb-3">
      {/* Background Video: High-Definition Panoramic Video of Florence */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
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
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 via-black/15 to-transparent pointer-events-none" />

        {/* Soft bottom gradient for trust badges legibility */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content & Stretched Centered Search Bar */}
      <Container className="relative z-20 my-auto py-2 sm:py-4 flex flex-col justify-center">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-2">
          {/* Text Block */}
          <div className="max-w-3xl">
            {/* Eyebrow Tagline */}
            <div className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3 py-0.5 text-[10px] sm:text-[10.5px] font-semibold tracking-[0.16em] text-amber-300 uppercase mb-2 border border-amber-400/25 shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>OFFICIAL FLORENCE TICKETS &amp; TOURS</span>
            </div>

            {/* Main Headline with Luxury Editorial Font */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[46px] font-normal leading-[1.12] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              Unforgettable Experiences in{" "}
              <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#ffe4a0] via-[#faeedd] to-[#e5b869] drop-shadow-2xl inline-block">
                Florence
              </span>
            </h1>

            {/* Subheading with Key Highlights */}
            <p className="mt-2 max-w-lg text-xs sm:text-[13px] md:text-[13.5px] font-normal leading-relaxed text-neutral-100/95 drop-shadow-md">
              Skip the 2-hour queues at the Duomo and Uffizi. Guaranteed entrance timeslots, expert local guides, and <span className="text-amber-200 font-medium">100% free 24-hour cancellation</span>.
            </p>
          </div>
        </div>

        {/* Stretched Centered Search Bar Widget */}
        <div className="relative z-30 w-full mt-4 sm:mt-6 mb-2 sm:mb-4">
          <HeroSearch />
        </div>
      </Container>

      {/* Bottom Value Props & Scroll Indicator Bar */}
      <div className="relative z-10 w-full pb-2.5 sm:pb-3 pt-2 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* 4 Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 flex-1 max-w-3xl">
              {/* Badge 1: Secure Booking */}
              <div className="flex items-center gap-2">
                <div className="text-white shrink-0 drop-shadow-md">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.85]">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="leading-tight drop-shadow-md">
                  <div className="text-[11px] sm:text-xs font-semibold text-white">
                    Secure Booking
                  </div>
                  <div className="text-[9.5px] sm:text-[10px] text-white/80">
                    Your data is safe with us
                  </div>
                </div>
              </div>

              {/* Badge 2: Top Rated Experiences */}
              <div className="flex items-center gap-2">
                <div className="text-white shrink-0 drop-shadow-md">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.85]">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="leading-tight drop-shadow-md">
                  <div className="text-[11px] sm:text-xs font-semibold text-white">
                    Top Rated Experiences
                  </div>
                  <div className="text-[9.5px] sm:text-[10px] text-white/80">
                    Handpicked by locals
                  </div>
                </div>
              </div>

              {/* Badge 3: 24/7 Support */}
              <div className="flex items-center gap-2">
                <div className="text-white shrink-0 drop-shadow-md">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.85]">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </svg>
                </div>
                <div className="leading-tight drop-shadow-md">
                  <div className="text-[11px] sm:text-xs font-semibold text-white">
                    24/7 Support
                  </div>
                  <div className="text-[9.5px] sm:text-[10px] text-white/80">
                    We&apos;re here to help
                  </div>
                </div>
              </div>

              {/* Badge 4: Sustainable Travel */}
              <div className="flex items-center gap-2">
                <div className="text-white shrink-0 drop-shadow-md">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.85]">
                    <path d="M11 20A7 7 0 0 1 4 13C4 8.5 7.5 4 13 3c5.5 0 7 2.5 7 7 0 6.5-5 10-9 10z" />
                    <path d="M11 20v-8a4 4 0 0 1 4-4" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="leading-tight drop-shadow-md">
                  <div className="text-[11px] sm:text-xs font-semibold text-white">
                    Sustainable Travel
                  </div>
                  <div className="text-[9.5px] sm:text-[10px] text-white/80">
                    A better tomorrow
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll to Explore (Bottom Right) */}
            <div className="hidden lg:flex items-center gap-2 text-white drop-shadow-md select-none">
              <div className="flex flex-col items-center">
                <div className="relative flex h-5 w-3 items-start justify-center rounded-full border border-white p-0.5">
                  <div className="h-1 w-0.5 rounded-full bg-white animate-pulse" />
                </div>
                <div className="h-2.5 w-[1px] bg-white/70 mt-0.5" />
              </div>
              <span className="text-[10.5px] font-medium tracking-wide text-white">
                Scroll to explore
              </span>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
