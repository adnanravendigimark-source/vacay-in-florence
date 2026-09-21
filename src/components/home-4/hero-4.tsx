"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { CalendarPicker } from "@/components/home/calendar-picker";

interface SuggestionRow {
  kind: "product" | "category";
  id: string;
  href: string;
  title: string;
  meta: string;
}

interface ApiProductSuggestion {
  id: string;
  slug: string;
  title: string;
  categoryName: string;
  priceFrom: { amount: number; currency: string };
}

interface ApiCategorySuggestion {
  id: string;
  slug: string;
  name: string;
  productCount: number;
}

interface ApiSearchResponse {
  query: string;
  products: ApiProductSuggestion[];
  categories: ApiCategorySuggestion[];
  popular: { products: ApiProductSuggestion[]; categories: ApiCategorySuggestion[] };
}

const POPULAR_EXPERIENCES = [
  {
    id: "museums",
    title: "Museums & Galleries",
    subtitle: "Iconic art & history",
    image: "/images/accademia-david.jpg",
    icon: "🏛️",
    href: "/experiences/category/museums-galleries",
  },
  {
    id: "food-wine",
    title: "Food & Wine",
    subtitle: "Local flavors & tastings",
    image: "/images/hero2-chianti-wine.jpg",
    icon: "🍷",
    href: "/experiences/category/food-wine-experiences",
  },
  {
    id: "guided-tours",
    title: "Guided Tours",
    subtitle: "Expert-led adventures",
    image: "/images/hero2-guided-tour.jpg",
    icon: "🧭",
    href: "/experiences/category/guided-tours",
  },
  {
    id: "outdoor-adventure",
    title: "Outdoor & Day Trips",
    subtitle: "Nature & scenic trips",
    image: "/images/pisa-tower.jpg",
    icon: "🌄",
    href: "/experiences/category/day-trips-from-florence",
  },
  {
    id: "cultural",
    title: "Cultural & Masterclasses",
    subtitle: "Local life & traditions",
    image: "/images/italian-cooking.jpg",
    icon: "🍝",
    href: "/experiences/florentine-cooking-class-with-market-visit",
  },
];

export function Hero4() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateDisplay, setDateDisplay] = useState("Select date");
  const [destination, setDestination] = useState("Florence, Italy");
  const [openDropdown, setOpenDropdown] = useState<"search" | "date" | "destination" | null>(null);

  // Video Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Autocomplete state
  const [productResults, setProductResults] = useState<SuggestionRow[]>([]);
  const [categoryResults, setCategoryResults] = useState<SuggestionRow[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSearchLoading(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
      if (!res.ok) throw new Error("Failed");
      const data: ApiSearchResponse = await res.json();
      const usingPopular = q.trim().length < 2;
      const products = usingPopular ? data.popular.products : data.products;
      const categories = usingPopular ? data.popular.categories : data.categories;

      setProductResults(
        products.map((p) => ({
          kind: "product",
          id: p.id,
          href: `/experiences/${p.slug}`,
          title: p.title,
          meta: `${p.categoryName} · from €${Math.round(p.priceFrom.amount)}`,
        }))
      );
      setCategoryResults(
        categories.map((c) => ({
          kind: "category",
          id: c.id,
          href: `/experiences/category/${c.slug}`,
          title: c.name,
          meta: `${c.productCount} experience${c.productCount === 1 ? "" : "s"}`,
        }))
      );
      setSearchLoading(false);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setSearchLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (openDropdown !== "search") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, openDropdown, runSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectDate = (date: Date | null) => {
    setSelectedDate(date);
    if (!date) {
      setDateDisplay("Select date");
    } else {
      setDateDisplay(
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      );
    }
    setOpenDropdown(null);
  };

  const handleExecuteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedDate) {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      params.set("date", `${yyyy}-${mm}-${dd}`);
    }
    const target = params.toString() ? `/experiences?${params.toString()}` : "/experiences";
    router.push(target);
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="bg-white text-[#18181b] pt-28 sm:pt-32 pb-16 lg:pb-24 border-b border-[#eae5d9]/60">
      <Container>
        {/* ================================================================= */}
        {/* ROW 1: EDITORIAL HEADER + BENTO CARDS + SIDEBAR WIDGET */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Col 1 (4 Cols): Headline, Subhead & Action Buttons */}
          <div className="lg:col-span-4 flex flex-col justify-between pt-2">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-[1.5px] bg-[#52525b]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#52525b]">
                  CURATED FOR CURIOUS TRAVELERS
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-normal leading-[1.08] tracking-tight text-[#18181b]">
                Florence, <br />
                <span className="font-serif italic font-normal">Curated</span> Your Way
              </h1>

              <p className="mt-5 text-sm sm:text-base text-[#52525b] leading-relaxed max-w-sm">
                Discover iconic landmarks, authentic local experiences, and unforgettable tours — all in one place.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/experiences"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#183528] hover:bg-[#0e241a] text-white text-xs font-semibold tracking-wider transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <span>Explore Experiences</span>
                <span>&rarr;</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-[#faf9f6] border border-[#d5d1c8] text-[#18181b] text-xs font-semibold tracking-wider transition-all hover:scale-105 active:scale-95"
              >
                <span className="w-5 h-5 rounded-full border border-neutral-400 flex items-center justify-center text-[10px]">
                  ▶
                </span>
                <span>Watch Video</span>
              </button>
            </div>
          </div>

          {/* Col 2 (6 Cols): Center 4-Card Bento Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Large Duomo Florence Card */}
            <Link
              href="/experiences/duomo-and-brunelleschis-dome-climb"
              className="group relative h-[320px] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between p-4"
            >
              <Image
                src="/images/hero2-duomo-vertical.jpg"
                alt="Duomo Florence Brunelleschi Dome"
                fill
                sizes="(max-width: 640px) 100vw, 30vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="relative z-10 flex justify-start">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm">
                  <span className="text-amber-500">★</span> Top Rated
                </span>
              </div>

              <div className="relative z-10 flex items-end justify-between text-white">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white leading-tight">
                    Duomo Florence
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5 font-light">
                    Dome Climb &amp; Cathedral Tickets
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:translate-x-1 group-hover:bg-white group-hover:text-neutral-900 transition-all">
                  &rarr;
                </div>
              </div>
            </Link>

            {/* 2. Interactive Styled Map Route of Florence */}
            <div className="relative h-[320px] rounded-3xl overflow-hidden bg-[#eaf1ec] border border-[#d2e2d8] p-4 flex flex-col justify-between shadow-sm">
              {/* Stylized Florence Map Background Graphic */}
              <div className="absolute inset-0 opacity-85">
                <svg viewBox="0 0 300 320" className="w-full h-full" preserveAspectRatio="none">
                  {/* City Grid Lines */}
                  <line x1="30" y1="40" x2="270" y2="40" stroke="#d5e2d9" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="20" y1="90" x2="280" y2="90" stroke="#d5e2d9" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="40" y1="150" x2="260" y2="150" stroke="#d5e2d9" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="10" y1="210" x2="290" y2="210" stroke="#d5e2d9" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="80" y1="20" x2="80" y2="300" stroke="#d5e2d9" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="160" y1="20" x2="160" y2="300" stroke="#d5e2d9" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="230" y1="20" x2="230" y2="300" stroke="#d5e2d9" strokeWidth="2" strokeDasharray="3 3" />

                  {/* River Arno Curved Path */}
                  <path
                    d="M-20 270 C80 250, 160 230, 320 200 L320 240 C160 270, 80 290, -20 310 Z"
                    fill="#b9d7ea"
                    opacity="0.8"
                  />
                  <text x="190" y="235" fill="#467e9b" fontSize="10" fontStyle="italic" fontWeight="600">
                    Arno River
                  </text>

                  {/* Curated Walking Route Dashed Path */}
                  <path
                    d="M185 65 Q 195 125 190 145 T 180 220 T 160 255"
                    fill="none"
                    stroke="#2d3748"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Map Title Header */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="font-serif italic text-2xl font-bold text-[#142d22]">
                  Florence
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#142d22] bg-white/80 backdrop-blur px-2.5 py-1 rounded-full border border-[#142d22]/15">
                  Route Guide
                </span>
              </div>

              {/* Plotted Pinpoints Container */}
              <div className="relative z-10 space-y-3 py-2">
                {/* Accademia */}
                <Link
                  href="/experiences/accademia-gallery-michelangelos-david-ticket"
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-800 bg-white/90 backdrop-blur-sm p-1.5 px-3 rounded-full shadow-sm hover:bg-white transition-all w-fit ml-auto mr-2 group"
                >
                  <span className="w-5 h-5 rounded-full bg-[#183528] text-white flex items-center justify-center text-[10px]">
                    🏛️
                  </span>
                  <span>Accademia Gallery</span>
                </Link>

                {/* Duomo */}
                <Link
                  href="/experiences/duomo-and-brunelleschis-dome-climb"
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-800 bg-white/90 backdrop-blur-sm p-1.5 px-3 rounded-full shadow-sm hover:bg-white transition-all w-fit mx-auto group"
                >
                  <span className="w-5 h-5 rounded-full bg-[#183528] text-white flex items-center justify-center text-[10px]">
                    ⛪
                  </span>
                  <span>Duomo</span>
                </Link>

                {/* Uffizi */}
                <Link
                  href="/experiences/uffizi-gallery-skip-the-line-ticket"
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-800 bg-white/90 backdrop-blur-sm p-1.5 px-3 rounded-full shadow-sm hover:bg-white transition-all w-fit ml-4 group"
                >
                  <span className="w-5 h-5 rounded-full bg-[#183528] text-white flex items-center justify-center text-[10px]">
                    🎨
                  </span>
                  <span>Uffizi Gallery</span>
                </Link>

                {/* Ponte Vecchio */}
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 bg-white/90 backdrop-blur-sm p-1.5 px-3 rounded-full shadow-sm w-fit ml-2">
                  <span className="w-5 h-5 rounded-full bg-[#183528] text-white flex items-center justify-center text-[10px]">
                    🌉
                  </span>
                  <span>Ponte Vecchio</span>
                </div>
              </div>

              <div className="relative z-10 text-[10px] font-medium text-neutral-600 bg-white/80 backdrop-blur px-3 py-1 rounded-xl text-center">
                Interactive city center discovery walk
              </div>
            </div>

            {/* 3. Stacked Sub-card 1: Food & Wine */}
            <Link
              href="/experiences/category/food-wine-experiences"
              className="group relative h-[152px] rounded-3xl overflow-hidden bg-neutral-100 border border-[#eae5d9] p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <Image
                src="/images/hero2-chianti-wine.jpg"
                alt="Tuscan Food & Wine Tasting"
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

              <div className="relative z-10 flex justify-end">
                <span className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white text-xs group-hover:bg-white group-hover:text-neutral-900 transition-all">
                  &rarr;
                </span>
              </div>

              <div className="relative z-10 text-white">
                <h4 className="font-display text-base font-semibold leading-tight">
                  Food &amp; Wine
                </h4>
                <p className="text-[11px] text-white/80 font-light mt-0.5">
                  Tuscan Wine Tasting Tours
                </p>
              </div>
            </Link>

            {/* 4. Stacked Sub-card 2: Day Trips */}
            <Link
              href="/experiences/category/day-trips-from-florence"
              className="group relative h-[152px] rounded-3xl overflow-hidden bg-neutral-100 border border-[#eae5d9] p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <Image
                src="/images/chianti-hills.jpg"
                alt="Chianti & Tuscany Day Trips"
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

              <div className="relative z-10 flex justify-end">
                <span className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white text-xs group-hover:bg-white group-hover:text-neutral-900 transition-all">
                  &rarr;
                </span>
              </div>

              <div className="relative z-10 text-white">
                <h4 className="font-display text-base font-semibold leading-tight">
                  Day Trips
                </h4>
                <p className="text-[11px] text-white/80 font-light mt-0.5">
                  Chianti &amp; Tuscany Tours
                </p>
              </div>
            </Link>
          </div>

          {/* Col 3 (2 Cols): "Today in Florence" Live Widget Panel */}
          <div className="lg:col-span-2 rounded-3xl bg-[#faf9f6] border border-[#e5e0d8] p-4 flex flex-col justify-between shadow-sm space-y-4">
            <div>
              {/* Today In Florence Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-[#eae5d9]">
                <span className="text-xl">🌅</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Today in Florence
                  </h4>
                  <span className="text-[10.5px] text-neutral-500 font-medium">
                    {todayFormatted}
                  </span>
                </div>
              </div>

              {/* Monument Timings Schedule */}
              <div className="mt-3.5 space-y-3">
                <div className="flex items-start gap-2.5 text-xs">
                  <span className="text-base shrink-0">🏛️</span>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-[11.5px]">Uffizi Gallery</h5>
                    <p className="text-[10.5px] text-neutral-500">9:00 AM – 7:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs">
                  <span className="text-base shrink-0">⛪</span>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-[11.5px]">Duomo</h5>
                    <p className="text-[10.5px] text-neutral-500">8:15 AM – 6:45 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs">
                  <span className="text-base shrink-0">🌉</span>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-[11.5px]">Ponte Vecchio</h5>
                    <p className="text-[10.5px] text-neutral-500">Open 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seasonal Tip Card */}
            <div className="p-3 rounded-2xl bg-[#eaf1ec] border border-[#d2e2d8] text-xs">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#142d22] mb-1">
                <span>🌿</span>
                <span>Season in Florence</span>
              </div>
              <p className="text-[10.5px] text-neutral-700 leading-tight">
                Perfect weather, fewer crowds, unforgettable magic.
              </p>
              <Link
                href="/experiences"
                className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold text-[#183528] hover:underline"
              >
                <span>Discover</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

        </div>

        {/* ================================================================= */}
        {/* ROW 2: STRETCHED MULTI-SEGMENT FLOATING SEARCH CAPSULE */}
        {/* ================================================================= */}
        <div ref={containerRef} className="mt-10 sm:mt-12 relative z-30">
          <form
            onSubmit={handleExecuteSearch}
            className="p-2 sm:p-3 rounded-3xl sm:rounded-full bg-white border border-[#e5e0d8] shadow-[0_12px_36px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            {/* Segment 1: What do you want to experience? */}
            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "search" ? null : "search")}
                className="w-full h-14 sm:h-16 px-5 flex items-center gap-3.5 text-left rounded-2xl sm:rounded-full hover:bg-[#faf9f6] transition-colors focus-visible:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-[#f4f3ef] flex items-center justify-center text-neutral-700 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    What do you want to experience?
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (openDropdown !== "search") setOpenDropdown("search");
                    }}
                    placeholder="e.g. Uffizi Gallery, wine tasting, walking tour..."
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none truncate"
                  />
                </div>
              </button>

              {/* Autocomplete Dropdown */}
              {openDropdown === "search" && (
                <div className="absolute top-full left-0 right-0 mt-3 p-3 bg-white rounded-3xl border border-[#e5e0d8] shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-50 max-h-96 overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                    <span>{query.trim() ? "Search Suggestions" : "Popular Searches"}</span>
                    {searchLoading && <span className="text-[10px] lowercase text-[#183528]">searching...</span>}
                  </div>

                  {productResults.length > 0 && (
                    <div className="mb-2">
                      {productResults.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#faf9f6] transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-base shrink-0">⚡</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-[#183528] transition-colors">
                                {item.title}
                              </p>
                              <span className="text-xs text-neutral-500">{item.meta}</span>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all">
                            →
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {categoryResults.length > 0 && (
                    <div className="pt-2 border-t border-neutral-100">
                      <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                        Categories
                      </span>
                      {categoryResults.map((cat) => (
                        <Link
                          key={cat.id}
                          href={cat.href}
                          onClick={() => setOpenDropdown(null)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#faf9f6] text-xs font-medium text-neutral-700"
                        >
                          <span>{cat.title}</span>
                          <span className="text-neutral-400">{cat.meta}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden sm:block w-[1px] h-10 bg-[#e5e0d8] self-center" />

            {/* Segment 2: When? */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
                className="w-full sm:w-44 h-14 sm:h-16 px-4 flex items-center gap-3 text-left rounded-2xl sm:rounded-full hover:bg-[#faf9f6] transition-colors focus-visible:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-[#f4f3ef] flex items-center justify-center text-neutral-700 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    When?
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                    {dateDisplay}
                  </span>
                </div>
              </button>

              {/* Date Picker Popover */}
              {openDropdown === "date" && (
                <div className="absolute top-full left-0 sm:left-1/2 sm:-translate-x-1/2 mt-3 p-4 bg-white rounded-3xl border border-[#e5e0d8] shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-50 min-w-[320px]">
                  <CalendarPicker
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                    onClose={() => setOpenDropdown(null)}
                  />
                </div>
              )}
            </div>

            <div className="hidden sm:block w-[1px] h-10 bg-[#e5e0d8] self-center" />

            {/* Segment 3: Where? */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "destination" ? null : "destination")}
                className="w-full sm:w-48 h-14 sm:h-16 px-4 flex items-center gap-3 text-left rounded-2xl sm:rounded-full hover:bg-[#faf9f6] transition-colors focus-visible:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-[#f4f3ef] flex items-center justify-center text-neutral-700 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Where?
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                    {destination} ▾
                  </span>
                </div>
              </button>

              {/* Destination Dropdown */}
              {openDropdown === "destination" && (
                <div className="absolute top-full right-0 mt-3 p-2 bg-white rounded-3xl border border-[#e5e0d8] shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-50 w-60">
                  {["Florence, Italy", "Duomo & Historic Center", "Oltrarno & Pitti", "Chianti & Tuscany"].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setDestination(loc);
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold text-neutral-800 hover:bg-[#faf9f6] transition-colors"
                    >
                      📍 {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Explore Button */}
            <button
              type="submit"
              className="h-14 sm:h-16 px-8 rounded-2xl sm:rounded-full bg-[#183528] hover:bg-[#0e241a] text-white text-xs sm:text-sm font-semibold tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm shrink-0"
            >
              <span>Explore</span>
              <span>&rarr;</span>
            </button>
          </form>
        </div>

        {/* ================================================================= */}
        {/* ROW 3: 3-STEP PROCESS TIMELINE + POPULAR EXPERIENCES + QUOTE CARD */}
        {/* ================================================================= */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: 3-Step Vertical Timeline (2 Cols) */}
          <div className="lg:col-span-2 relative pl-2">
            <div className="absolute left-[22px] top-6 bottom-6 w-[1.5px] bg-[#d5d1c8]" />
            
            <div className="space-y-8">
              {/* Step 01 */}
              <div className="relative flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#183528] text-[#183528] font-bold text-xs flex items-center justify-center shrink-0 z-10">
                  01
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Discover
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    Explore top attractions, unique experiences and hidden gems.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#d5d1c8] text-neutral-600 font-bold text-xs flex items-center justify-center shrink-0 z-10">
                  02
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Choose
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    Compare options, read real reviews, and find your perfect experience.
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="relative flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-[#d5d1c8] text-neutral-600 font-bold text-xs flex items-center justify-center shrink-0 z-10">
                  03
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Experience
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    Book instantly and get ready for an unforgettable journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Popular Experiences Horizontal Carousel Cards (8 Cols) */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-2xl font-normal text-neutral-900">
                  Popular Experiences
                </h3>
                <span className="hidden sm:block w-12 h-[1px] bg-[#d5d1c8]" />
              </div>

              <Link
                href="/experiences"
                className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1 group"
              >
                <span>View All Experiences</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>

            {/* 5 Cards Row in Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {POPULAR_EXPERIENCES.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group rounded-2xl bg-white border border-[#eae5d9] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-28 w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="180px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-2.5 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-xs mb-0.5">{item.icon}</div>
                      <h4 className="font-display text-[11px] font-bold text-neutral-900 leading-tight truncate">
                        {item.title}
                      </h4>
                      <p className="text-[9.5px] text-neutral-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    <span className="w-5 h-5 rounded-full bg-[#f4f3ef] flex items-center justify-center text-[10px] text-neutral-600 group-hover:bg-[#183528] group-hover:text-white transition-colors shrink-0 ml-1">
                      &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Botanical Editorial Quote Card (2 Cols) */}
          <div className="lg:col-span-2 rounded-3xl bg-[#faf9f6] border border-[#e5e0d8] p-5 flex flex-col justify-between h-full min-h-[220px] relative overflow-hidden">
            {/* Subtle Florence Skyline Silhouette & Olive Branch */}
            <div className="absolute top-2 right-2 text-2xl opacity-40 select-none">
              🌿
            </div>

            <div>
              <p className="font-serif italic text-sm text-neutral-800 leading-relaxed pt-2">
                &ldquo;Not just a trip, a collection of unforgettable moments.&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-[#eae5d9]/80 flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                VACAY IN FLORENCE
              </span>
              <span className="text-xs">⚜</span>
            </div>
          </div>

        </div>
      </Container>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center font-bold text-sm transition-all"
            >
              ✕
            </button>
            <video autoPlay controls loop playsInline className="w-full aspect-video object-cover">
              <source src="/video/hero-florence.mp4" type="video/mp4" />
              <source src="/vedio/genrate_a_longer_vedio_min.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </section>
  );
}
