import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

const MONUMENTS = [
  {
    id: "duomo",
    title: "Duomo & Brunelleschi's Cupola",
    tagline: "The Architectural Miracle of Florence",
    image: "/images/hero2-duomo-vertical.jpg",
    rating: "4.98",
    price: "From €49",
    href: "/experiences/duomo-and-brunelleschis-dome-climb",
    desc: "Climb 463 steps to the cupola and explore the secret cathedral terraces with sweeping 360° Tuscan views.",
  },
  {
    id: "uffizi",
    title: "Uffizi Gallery Priority Access",
    tagline: "Botticelli, Da Vinci & Caravaggio",
    image: "/images/hero2-uffizi-corridor.jpg",
    rating: "4.95",
    price: "From €39",
    href: "/experiences/uffizi-gallery-skip-the-line-ticket",
    desc: "Direct barcode access to the world's greatest Renaissance collection without standing in 3-hour queues.",
  },
  {
    id: "accademia",
    title: "Accademia & Michelangelo's David",
    tagline: "The Original 17-Foot Marble Masterpiece",
    image: "/images/accademia-david.jpg",
    rating: "4.96",
    price: "From €35",
    href: "/experiences/accademia-gallery-michelangelos-david-ticket",
    desc: "Stand face-to-face with the pinnacle of Renaissance sculpture and Michelangelo's unfinished Slaves.",
  },
];

export function LandmarkShowcaseV4() {
  return (
    <section className="bg-[#fbfbfa] py-16 sm:py-24 border-b border-[#eae5d9]/60">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-[#183528]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#183528]">
                ICONIC LANDMARKS
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Must-See Florence Monuments
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 max-w-xl">
              Direct timed entrances and priority tickets for the city&apos;s most sought-after cultural sites.
            </p>
          </div>

          <Link
            href="/experiences/category/skip-the-line-attractions"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#183528] hover:underline"
          >
            <span>Explore All Skip-the-Line Tickets &rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MONUMENTS.map((mon) => (
            <div
              key={mon.id}
              className="group flex flex-col justify-between rounded-3xl bg-white border border-[#eae5d9] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={mon.image}
                  alt={mon.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white">
                    <span className="text-amber-400">★</span> {mon.rating}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block mb-0.5">
                    {mon.tagline}
                  </span>
                  <h3 className="font-display text-xl font-medium text-white leading-tight">
                    {mon.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1">
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {mon.desc}
                </p>

                <div className="mt-5 pt-3.5 border-t border-[#eae5d9] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase block">
                      Direct Price
                    </span>
                    <span className="text-base font-bold text-neutral-900">
                      {mon.price}
                    </span>
                  </div>

                  <Link
                    href={mon.href}
                    className="px-5 py-2 rounded-full bg-[#183528] hover:bg-[#0e241a] text-white text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    Reserve
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
