import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

interface CategoryCard {
  id: string;
  title: string;
  count: string;
  image: string;
  href: string;
  tag: string;
  icon: string;
}

const CATEGORIES_DATA: CategoryCard[] = [
  {
    id: "skip-the-line",
    title: "Skip-the-Line Tickets",
    count: "12 Experiences",
    image: "/images/hero2-duomo-vertical.jpg",
    href: "/experiences/category/skip-the-line-attractions",
    tag: "PRIORITY ACCESS",
    icon: "⚡",
  },
  {
    id: "museums",
    title: "Museums & Galleries",
    count: "18 Experiences",
    image: "/images/hero2-uffizi-corridor.jpg",
    href: "/experiences/category/museums-galleries",
    tag: "RENAISSANCE ART",
    icon: "🏛️",
  },
  {
    id: "wine-food",
    title: "Chianti Wine & Food",
    count: "15 Experiences",
    image: "/images/hero2-chianti-wine.jpg",
    href: "/experiences/category/food-wine-experiences",
    tag: "CULINARY & CELLARS",
    icon: "🍷",
  },
  {
    id: "guided-tours",
    title: "Guided Walking Tours",
    count: "14 Experiences",
    image: "/images/hero2-guided-tour.jpg",
    href: "/experiences/category/guided-tours",
    tag: "LOCAL EXPERTS",
    icon: "🧭",
  },
  {
    id: "day-trips",
    title: "Tuscany Day Trips",
    count: "10 Experiences",
    image: "/images/pisa-tower.jpg",
    href: "/experiences/category/day-trips-from-florence",
    tag: "BEYOND FLORENCE",
    icon: "🌄",
  },
  {
    id: "cooking-classes",
    title: "Cooking Masterclasses",
    count: "8 Experiences",
    image: "/images/italian-cooking.jpg",
    href: "/experiences/florentine-cooking-class-with-market-visit",
    tag: "HANDS-ON CHEF",
    icon: "🍝",
  },
];

export function QuickCategoriesV3() {
  return (
    <section className="bg-[#faf9f6] py-16 sm:py-20 border-b border-[#eae5d9]/80">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#c85a32] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32]" />
              <span>EXPLORE BY CATEGORY</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900">
              Popular Ways to Discover Florence
            </h2>
          </div>

          <Link
            href="/experiences#categories"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 hover:text-[#c85a32] transition-colors group"
          >
            <span>View All Categories</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {CATEGORIES_DATA.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative flex flex-col justify-between h-[230px] sm:h-[260px] rounded-3xl overflow-hidden p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.12)] border border-[#e5e0d8] transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Image Background */}
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

              {/* Top Tag & Icon */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-sm shadow-sm">
                  {cat.icon}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300">
                  {cat.tag}
                </span>
              </div>

              {/* Bottom Info */}
              <div className="relative z-10">
                <h3 className="font-display text-sm sm:text-base font-semibold text-white leading-snug group-hover:text-amber-200 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-white/70 font-medium mt-0.5">
                  {cat.count}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
