import Link from "next/link";
import { Container } from "@/components/ui/container";

const STYLES = [
  {
    title: "The First-Time Explorer",
    subtitle: "Essential Florence without the wait",
    description: "Ideal if you have 2 to 3 days in Florence. Prioritize direct queue-free entry to the Duomo and Accademia Gallery.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
        <path d="M12 3v18M8 21h8M5 17h14M7 13h10M9 9h6M11 5h2" />
        <path d="M6 21l6-18 6 18" />
      </svg>
    ),
    recommendedCategory: "Skip-the-Line Attractions",
    recommendedSlug: "skip-the-line-attractions",
    badge: "Must Do",
    highlights: ["Brunelleschi's Dome", "Accademia David", "Giotto's Tower"],
  },
  {
    title: "The Renaissance Enthusiast",
    subtitle: "Art historians & Medici secrets",
    description: "Immerse yourself in centuries of art, scandalous Medici lore, and hidden architectural passageways with licensed historians.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
        <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3L3 10h18L12 3z" />
      </svg>
    ),
    recommendedCategory: "Museums & Galleries",
    recommendedSlug: "museums-galleries",
    badge: "Top Rated",
    highlights: ["Uffizi Gallery", "Pitti Palace", "Vasari Secrets"],
  },
  {
    title: "The Epicurean Gourmet",
    subtitle: "Chianti cellars & handmade pasta",
    description: "Taste your way through Tuscany with local sommeliers, olive oil pressings, and authentic market-to-table cooking classes.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
        <path d="M8 22h8M12 15v7M12 15a5 5 0 0 0 5-5V3H7v7a5 5 0 0 0 5 5z" />
        <line x1="7" y1="8" x2="17" y2="8" />
      </svg>
    ),
    recommendedCategory: "Food & Wine Experiences",
    recommendedSlug: "food-wine-experiences",
    badge: "Authentic",
    highlights: ["Chianti Classico", "Pasta Masterclass", "San Lorenzo Market"],
  },
  {
    title: "The Countryside Wanderer",
    subtitle: "Medieval towns & cypress hills",
    description: "Escape the city crowds and venture into picture-perfect Tuscan villages, vineyards, and UNESCO-listed hillsides.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    recommendedCategory: "Day Trips from Florence",
    recommendedSlug: "day-trips-from-florence",
    badge: "Scenic",
    highlights: ["Siena & San Gimignano", "Pisa Leaning Tower", "Val d'Orcia"],
  },
];

export function TravelStyleGuide() {
  return (
    <section className="bg-[#FAF8F5] py-16 sm:py-20 border-t border-[#ece6dc]/80">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-[#556358] uppercase mb-2">
            <span>TAILORED RECOMMENDATIONS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-[#142d22]">
            Which Style Matches Your Visit?
          </h2>
          <p className="mt-3 text-sm text-[#59655d] leading-relaxed">
            Not sure where to begin? Choose your preferred travel pace and let us guide you to the perfect experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STYLES.map((style, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-3xl bg-white p-6 border border-[#e5e0d8] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#142d22]/5 text-[#142d22]">
                    {style.icon}
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200/60">
                    {style.badge}
                  </span>
                </div>

                <h3 className="font-display text-lg font-semibold text-neutral-900 leading-snug">
                  {style.title}
                </h3>
                <p className="text-xs font-medium text-[#738276] mt-0.5">
                  {style.subtitle}
                </p>

                <p className="mt-3 text-xs text-neutral-600 leading-relaxed">
                  {style.description}
                </p>

                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Recommended Highlights
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {style.highlights.map((h, hIdx) => (
                      <span
                        key={hIdx}
                        className="rounded-lg bg-neutral-100 px-2 py-0.5 text-[10.5px] font-medium text-neutral-700"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100">
                <Link
                  href={`/experiences/category/${style.recommendedSlug}`}
                  className="group flex items-center justify-between text-xs font-bold text-[#142d22] hover:text-[#0b1b14] transition-colors"
                >
                  <span>Explore {style.recommendedCategory}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1 font-bold">
                    &rarr;
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
