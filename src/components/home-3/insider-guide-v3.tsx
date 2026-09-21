import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

const ARTICLES = [
  {
    id: "guide-1",
    title: "How to Skip 3-Hour Queues at the Uffizi & Duomo in 2026",
    category: "INSIDER TIPS",
    readTime: "4 min read",
    image: "/images/hero2-uffizi-corridor.jpg",
    href: "/blog/skip-the-line-florence-guide",
    snippet: "Everything you need to know about time-slot reservations, secret terrace entrances, and peak-hour queue dynamics in Florence.",
  },
  {
    id: "guide-2",
    title: "The 7 Best Rooftop Terraces with Unobstructed Cathedral Views",
    category: "FLORENCE PANORAMAS",
    readTime: "6 min read",
    image: "/images/hero2-duomo-terrace.jpg",
    href: "/blog/florence-best-rooftop-views",
    snippet: "From hidden hotel lounges to historic bell towers, discover the most spectacular sunset viewpoints across the Renaissance capital.",
  },
  {
    id: "guide-3",
    title: "A Wine Lover's Guide to Chianti Classico & Bolgheri Super Tuscans",
    category: "WINE & DINE",
    readTime: "5 min read",
    image: "/images/hero2-chianti-wine.jpg",
    href: "/blog/chianti-wine-tasting-secrets",
    snippet: "How to pair regional Sangiovese, understand the Black Rooster seal, and choose the most authentic Tuscan vineyard estates.",
  },
];

export function InsiderGuideV3() {
  return (
    <section className="bg-white py-16 sm:py-24 border-b border-[#eae5d9]/80">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fbf0eb] px-3.5 py-1 text-xs font-semibold text-[#c85a32] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32]" />
              <span>FLORENCE TRAVEL JOURNAL</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Insider Florence Guides &amp; Tips
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              Curated travel guides, local secrets, and cultural advice written by Florentine residents and art historians.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 self-start lg:self-end rounded-full bg-[#18181b] px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#27272a] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Read All Articles</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ARTICLES.map((art) => (
            <article
              key={art.id}
              className="group flex flex-col justify-between rounded-3xl bg-[#faf9f6] border border-[#e5e0d8] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={art.image}
                  alt={art.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm">
                    {art.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10.5px] font-medium text-white">
                    ⏱ {art.readTime}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-display text-lg font-semibold text-neutral-900 leading-snug group-hover:text-[#c85a32] transition-colors">
                    <Link href={art.href}>
                      <span className="absolute inset-0" />
                      {art.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 line-clamp-2 font-normal leading-relaxed">
                    {art.snippet}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#e5e0d8] flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c85a32] group-hover:translate-x-1 transition-transform">
                    Read Guide &rarr;
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
