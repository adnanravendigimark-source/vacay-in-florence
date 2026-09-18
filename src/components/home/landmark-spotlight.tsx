import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

const LANDMARKS = [
  {
    id: "duomo",
    name: "Santa Maria del Fiore (The Duomo)",
    tag: "Most Visited Monument",
    queueWithout: "3+ hours wait in sun",
    queueWithUs: "⚡ Instant Priority Entry",
    description: "Brunelleschi's red-tiled dome dominates the Florence skyline. Climb 463 steps to the lantern for 360° panoramic views.",
    href: "/experiences/duomo-and-brunelleschis-dome-climb",
    image: "/images/duomo-tour.jpg",
    price: "From €45",
    rating: "4.9",
    reviews: "6,340",
  },
  {
    id: "uffizi",
    name: "Galleria degli Uffizi",
    tag: "World's Greatest Renaissance Art",
    queueWithout: "2.5 hours physical queue",
    queueWithUs: "⚡ Skip-The-Line Access",
    description: "Home to Botticelli's 'Birth of Venus', Leonardo's 'Annunciation', Caravaggio, Raphael, and the Medici art collection.",
    href: "/experiences/uffizi-gallery-skip-the-line-ticket",
    image: "/images/uffizi-corridor.jpg",
    price: "From €29",
    rating: "4.7",
    reviews: "12,480",
  },
  {
    id: "accademia",
    name: "Galleria dell'Accademia (David)",
    tag: "Michelangelo's Masterpiece",
    queueWithout: "2 hours line at door",
    queueWithUs: "⚡ Timed Fast-Track Entry",
    description: "Gaze up at the 17-foot original marble statue of David, carved by 26-year-old Michelangelo from a single marble block.",
    href: "/experiences/accademia-gallery-michelangelos-david-ticket",
    image: "/images/uffizi-corridor.jpg",
    price: "From €24",
    rating: "4.8",
    reviews: "9,210",
  },
  {
    id: "pitti",
    name: "Pitti Palace & Boboli Gardens",
    tag: "Grand Medici Residence",
    queueWithout: "1.5 hours wait at gate",
    queueWithUs: "⚡ Direct Mobile Entry",
    description: "Stroll the lush Renaissance gardens, Grotta Grande, and grand royal apartments across the Arno River.",
    href: "/experiences/boboli-gardens-and-pitti-palace-entry",
    image: "/images/pitti-palace.jpg",
    price: "From €22",
    rating: "4.5",
    reviews: "1,980",
  },
];

export function LandmarkSpotlight() {
  return (
    <section className="bg-[#fbfaf8] py-18 sm:py-24 border-b border-neutral-200/80">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta mb-3">
              <span>ICONIC FLORENCE MONUMENTS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-neutral-900 leading-[1.15]">
              Guaranteed Entry to Florence&apos;s Crown Jewels
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              Don&apos;t waste your vacation standing in 2-hour queues under the Tuscan sun. Book official skip-the-line vouchers before tickets sell out.
            </p>
          </div>

          <Link
            href="/experiences/category/skip-the-line-attractions"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#183528] hover:text-[#0e241a] transition-colors group self-start lg:self-end"
          >
            <span>View All Skip-The-Line Attractions</span>
            <span className="transition-transform duration-150 group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>

        {/* 4 Landmark Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {LANDMARKS.map((landmark) => (
            <div
              key={landmark.id}
              className="group flex flex-col sm:flex-row overflow-hidden rounded-3xl bg-white border border-neutral-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-neutral-300"
            >
              {/* Image Side */}
              <div className="relative aspect-[4/3] sm:aspect-auto sm:w-2/5 overflow-hidden shrink-0">
                <Image
                  src={landmark.image}
                  alt={landmark.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden" />
                <span className="absolute top-3 left-3 rounded-full bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-semibold text-white shadow-sm">
                  {landmark.tag}
                </span>
              </div>

              {/* Details Side */}
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                    <span className="text-amber-500 font-bold">★ {landmark.rating}</span>
                    <span className="text-neutral-500 font-normal">({landmark.reviews} verified reviews)</span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-2 text-lg sm:text-xl font-bold text-neutral-900 leading-snug group-hover:text-[#183528] transition-colors">
                    {landmark.name}
                  </h3>

                  {/* Short Description */}
                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                    {landmark.description}
                  </p>

                  {/* Fast Pass Advantage Box */}
                  <div className="mt-4 rounded-xl bg-emerald-50/80 border border-emerald-200/70 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 line-through">{landmark.queueWithout}</span>
                      <span className="font-bold text-[#183528] flex items-center gap-1">
                        {landmark.queueWithUs}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Direct Book Button */}
                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10.5px] font-medium text-neutral-400 uppercase tracking-wider block">
                      Guaranteed Ticket
                    </span>
                    <span className="text-lg font-bold text-neutral-900">{landmark.price}</span>
                  </div>

                  <Link
                    href={landmark.href}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#183528] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0e241a] hover:scale-105 active:scale-95"
                  >
                    <span>Reserve Slot</span>
                    <span className="text-xs">&rarr;</span>
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
