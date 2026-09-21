import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

const DAY_TRIPS = [
  {
    id: "chianti-wine",
    title: "Chianti Hills Sunset Wine & Castle Dinner",
    destination: "Chianti Classico, Tuscany",
    description: "Visit 2 historic cellars, taste 6 reserve wines, and enjoy a traditional multi-course sunset dinner among the rolling Tuscan vines.",
    duration: "5 Hours",
    price: "From €85",
    rating: "4.98",
    image: "/images/hero2-chianti-wine.jpg",
    href: "/experiences/chianti-countryside-and-wine-tasting-day-trip",
    tag: "WINE & SUNSET",
  },
  {
    id: "pisa-lucca",
    title: "Pisa Leaning Tower & Lucca Renaissance Walls",
    destination: "Pisa & Lucca, Tuscany",
    description: "Marvel at the Piazza dei Miracoli and cycle atop Lucca's intact 16th-century fortress ramparts on this full-day small-group escape.",
    duration: "8 Hours",
    price: "From €95",
    rating: "4.92",
    image: "/images/pisa-tower.jpg",
    href: "/experiences/pisa-and-lucca-day-trip-with-wine-tasting",
    tag: "FULL-DAY ESCAPE",
  },
  {
    id: "tuscan-cooking",
    title: "Tuscan Farmhouse Pasta & Tiramisù Masterclass",
    destination: "San Lorenzo Market & Country Kitchen",
    description: "Select market-fresh ingredients with a master Florentine chef, roll handmade tagliatelle, and craft authentic creamy tiramisù.",
    duration: "4 Hours",
    price: "From €79",
    rating: "4.97",
    image: "/images/italian-cooking.jpg",
    href: "/experiences/florentine-cooking-class-with-market-visit",
    tag: "CULINARY MASTERCLASS",
  },
];

export function DayTripsV3() {
  return (
    <section className="bg-white py-16 sm:py-24 border-b border-[#eae5d9]/80">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fbf0eb] px-3.5 py-1 text-xs font-semibold text-[#c85a32] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32]" />
              <span>BEYOND THE CITY WALLS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Tuscan Hills &amp; Countryside Escapes
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              Step into medieval hilltowns, world-class vineyard cellars, and sun-drenched cypress alleys just a short ride from central Florence.
            </p>
          </div>

          <Link
            href="/experiences/category/day-trips-from-florence"
            className="inline-flex items-center gap-2 self-start lg:self-end rounded-full bg-[#18181b] px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#27272a] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>All Tuscan Day Trips</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* 3 Day Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DAY_TRIPS.map((trip) => (
            <div
              key={trip.id}
              className="group flex flex-col justify-between rounded-3xl bg-[#faf9f6] border border-[#e5e0d8] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={trip.image}
                  alt={trip.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm">
                    {trip.tag}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white">
                    <span className="text-amber-400">★</span> {trip.rating}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 text-white">
                  <span className="text-[11px] font-medium text-white/90 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {trip.destination}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-medium mb-1.5">
                    <span>⏱ {trip.duration}</span>
                    <span className="text-[#c85a32] font-semibold">Small Group / Private</span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-neutral-900 leading-snug group-hover:text-[#c85a32] transition-colors">
                    {trip.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 line-clamp-2 font-normal leading-relaxed">
                    {trip.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#e5e0d8] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      From
                    </span>
                    <span className="text-lg font-bold text-neutral-900">
                      {trip.price}
                    </span>
                  </div>

                  <Link
                    href={trip.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#c85a32] group-hover:translate-x-1 transition-transform"
                  >
                    <span>View Itinerary</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
