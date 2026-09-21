import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

const LANDMARKS = [
  {
    id: "duomo",
    title: "Brunelleschi's Duomo & Dome Climb",
    subtitle: "Cathedral of Santa Maria del Fiore",
    description: "463 stone steps leading to the pinnacle of Renaissance engineering with panoramic 360° views across Florence.",
    image: "/images/hero2-duomo-vertical.jpg",
    price: "From €49",
    rating: "4.98",
    reviews: "3,400+",
    href: "/experiences/duomo-and-brunelleschis-dome-climb",
    tag: "MOST POPULAR",
    badgeColor: "bg-[#c85a32]",
    generalWaitTime: "2.5 - 3 Hours in Queue",
    vacayWaitTime: "Guaranteed 5-Min Direct Entry",
  },
  {
    id: "uffizi",
    title: "Uffizi Gallery Priority Access",
    subtitle: "Birth of Venus, Da Vinci & Caravaggio",
    description: "The world's foremost collection of Renaissance masterpieces. Skip the legendary queues and enter directly at your designated timeslot.",
    image: "/images/hero2-uffizi-corridor.jpg",
    price: "From €39",
    rating: "4.95",
    reviews: "2,890+",
    href: "/experiences/uffizi-gallery-skip-the-line-ticket",
    tag: "FAST-TRACK PASS",
    badgeColor: "bg-[#18181b]",
    generalWaitTime: "2 - 3.5 Hours in Queue",
    vacayWaitTime: "Direct Gate Entry with QR Pass",
  },
  {
    id: "accademia",
    title: "Accademia Gallery & Michelangelo's David",
    subtitle: "The Original 17-Foot Marble Masterpiece",
    description: "Stand face-to-face with the crowning sculpture of the Western world alongside Michelangelo's unfinished Slaves.",
    image: "/images/accademia-david.jpg",
    price: "From €35",
    rating: "4.96",
    reviews: "2,450+",
    href: "/experiences/accademia-gallery-michelangelos-david-ticket",
    tag: "OFFICIAL TICKET",
    badgeColor: "bg-[#9a3412]",
    generalWaitTime: "1.5 - 2 Hours in Queue",
    vacayWaitTime: "Timed Priority Entrance Slot",
  },
];

export function LandmarkSpotlightV3() {
  return (
    <section className="bg-[#faf9f6] py-16 sm:py-24 border-b border-[#eae5d9]/80">
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e5e0d8] px-4 py-1.5 text-xs font-semibold text-[#c85a32] mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32]" />
            <span>FLORENCE ESSENTIALS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900">
            The Big Three Renaissance Monuments
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl mx-auto">
            These three landmarks define Florence. Standard lines average 2–3 hours. VACAY Florence guarantees direct timed entry.
          </p>
        </div>

        {/* 3 Large Spotlight Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {LANDMARKS.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-3xl bg-white border border-[#e5e0d8] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.09)] transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Image Section */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-white shadow-md ${item.badgeColor}`}>
                    {item.tag}
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white shadow-sm">
                    <span className="text-amber-400">★</span> {item.rating}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#f59e0b] block mb-0.5">
                    {item.subtitle}
                  </span>
                  <h3 className="font-display text-xl font-medium text-white leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Body & Queue Comparison */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {item.description}
                </p>

                {/* Queue Comparison Banner */}
                <div className="my-5 p-3.5 rounded-2xl bg-[#faf9f6] border border-[#eae5d9] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-500 line-through">
                    <span className="flex items-center gap-1.5">
                      <span className="text-rose-500 font-bold">✕</span> Standard Queue:
                    </span>
                    <span>{item.generalWaitTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-900 font-bold pt-1 border-t border-neutral-200/60">
                    <span className="flex items-center gap-1.5 text-[#c85a32]">
                      <span>✓</span> VACAY Priority:
                    </span>
                    <span className="text-[#c85a32]">{item.vacayWaitTime}</span>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                      Direct Price
                    </span>
                    <span className="text-xl font-bold text-neutral-900">
                      {item.price}
                    </span>
                  </div>

                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    <span>Reserve Ticket</span>
                    <span>→</span>
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
