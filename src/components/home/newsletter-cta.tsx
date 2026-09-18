import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export function NewsletterCta() {
  return (
    <section className="relative overflow-hidden bg-neutral-900 py-16 sm:py-20 text-white">
      {/* Background Panoramic Florence Sunset */}
      <div className="absolute inset-0 z-0 select-none">
        <Image
          src="/images/adventure-banner.jpg"
          alt="Florence skyline sunset banner"
          fill
          quality={90}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/40" />
      </div>

      <Container className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Left Text */}
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#fbe5c8] mb-2 drop-shadow-sm">
              READY TO EXPLORE?
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white drop-shadow-md">
              Your Florence Adventure Awaits
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/90 drop-shadow-sm">
              Book now and create memories that last a lifetime.
            </p>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0">
            <Link
              href="/experiences"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-xs sm:text-sm font-bold text-neutral-900 shadow-xl transition-all duration-200 hover:bg-cream hover:scale-105 hover:shadow-2xl"
            >
              <span>Browse All Experiences</span>
              <span className="transition-transform duration-150 group-hover:translate-x-1 font-normal">&rarr;</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
