import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

// A small, editorial "landmark spotlight" — not itself admin-managed
// catalog data, so it stays a short hardcoded list rather than a table
// nobody would ever need to paginate. Each tile still links to a real
// product or category page in the actual catalog, never a dead route.
const ATTRACTIONS = [
  {
    id: "duomo",
    name: "Duomo Cathedral",
    subtitle: "Iconic & breathtaking",
    href: "/experiences/duomo-and-brunelleschis-dome-climb",
    image: "/images/duomo-tour.jpg",
  },
  {
    id: "uffizi",
    name: "Uffizi Gallery",
    subtitle: "World-class art",
    href: "/experiences/uffizi-gallery-skip-the-line-ticket",
    image: "/images/uffizi-corridor.jpg",
  },
  {
    id: "ponte-vecchio",
    name: "Ponte Vecchio",
    subtitle: "Historic bridge",
    href: "/experiences/florence-old-town-walking-tour-with-local-guide",
    image: "/images/ponte-vecchio.jpg",
  },
  {
    id: "pitti-palace",
    name: "Pitti Palace",
    subtitle: "Royal history",
    href: "/experiences/boboli-gardens-and-pitti-palace-entry",
    image: "/images/pitti-palace.jpg",
  },
];

export function PopularAttractions() {
  return (
    <section className="bg-[#f8f7f4] py-14 sm:py-18 border-t border-neutral-200/70">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-neutral-900 tracking-tight">
              Top Attractions in Florence
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600">
              Must-see places, all in one place.
            </p>
          </div>
          <Link
            href="/experiences/category/skip-the-line-attractions"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-900 hover:text-terracotta transition-colors group"
          >
            <span>View All Attractions</span>
            <span className="transition-transform duration-150 group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>

        {/* 4 Wide Visual Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ATTRACTIONS.map((att) => (
            <Link
              key={att.id}
              href={att.href}
              className="group relative aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Background Image */}
              <Image
                src={att.image}
                alt={att.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:from-black/85" />

              {/* Card Bottom Content */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                    {att.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                    {att.subtitle}
                  </p>
                </div>

                {/* Circular Arrow Button */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-all duration-200 group-hover:bg-white group-hover:text-neutral-900 group-hover:scale-110">
                  <span className="text-xs font-bold">&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
