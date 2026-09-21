import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

const DAY_TRIPS = [
  {
    id: "chianti-wine",
    title: "Chianti Hills Sunset Wine & Castle Dinner",
    destination: "Chianti Classico, Tuscany",
    desc: "Tour historic wine cellars, sample reserve vintages with pecorino, and enjoy a traditional sunset vineyard dinner.",
    duration: "5 Hours",
    price: "From €85",
    rating: "4.98",
    image: "/images/hero2-chianti-wine.jpg",
    href: "/experiences/chianti-countryside-and-wine-tasting-day-trip",
  },
  {
    id: "pisa-lucca",
    title: "Pisa Leaning Tower & Lucca Medieval Walls",
    destination: "Pisa & Lucca, Tuscany",
    desc: "Marvel at Piazza dei Miracoli and cycle atop Lucca's 16th-century fortress ramparts on this full-day small group trip.",
    duration: "8 Hours",
    price: "From €95",
    rating: "4.92",
    image: "/images/pisa-tower.jpg",
    href: "/experiences/pisa-and-lucca-day-trip-with-wine-tasting",
  },
  {
    id: "cooking-class",
    title: "Tuscan Farmhouse Pasta & Tiramisù Class",
    destination: "Central Market & Country Kitchen",
    desc: "Shop fresh ingredients with a local Florentine chef, roll authentic fresh pasta, and craft artisanal tiramisù.",
    duration: "4 Hours",
    price: "From €79",
    rating: "4.97",
    image: "/images/italian-cooking.jpg",
    href: "/experiences/florentine-cooking-class-with-market-visit",
  },
];

export function TuscanEscapesV4() {
  return (
    <section className="bg-white py-16 sm:py-24 border-b border-[#eae5d9]/60">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-[#183528]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#183528]">
                BEYOND FLORENCE
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Tuscan Day Trips &amp; Country Escapes
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 max-w-xl">
              Immerse yourself in cypress-lined hills, world-renowned wine estates, and medieval hilltop villages.
            </p>
          </div>

          <Link
            href="/experiences/category/day-trips-from-florence"
            className="inline-flex items-center gap-2 self-start lg:self-end rounded-full bg-[#183528] px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#0e241a] transition-all"
          >
            <span>All Day Trips &rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DAY_TRIPS.map((trip) => (
            <div
              key={trip.id}
              className="group flex flex-col justify-between rounded-3xl bg-white border border-[#eae5d9] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
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

                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10.5px] font-bold text-white shadow-sm">
                    <span className="text-amber-400">★</span> {trip.rating}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 text-white">
                  <span className="text-[11px] font-medium text-white/90">
                    📍 {trip.destination}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <div className="text-[11px] text-neutral-500 font-medium mb-1">
                    ⏱ {trip.duration} · Small Group
                  </div>
                  <h3 className="font-display text-base font-semibold text-neutral-900 leading-snug group-hover:text-[#183528] transition-colors">
                    {trip.title}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-600 line-clamp-2 font-normal leading-relaxed">
                    {trip.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#eae5d9] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                      From
                    </span>
                    <span className="text-base font-bold text-neutral-900">
                      {trip.price}
                    </span>
                  </div>

                  <Link
                    href={trip.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#183528] hover:underline"
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
