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

const CATEGORY_OPTIONS = [
  { id: "all", label: "All Experiences", icon: "✨" },
  { id: "skip-the-line-attractions", label: "Skip-the-Line Tickets", icon: "⚡" },
  { id: "museums-galleries", label: "Museums & Art", icon: "🏛️" },
  { id: "food-wine-experiences", label: "Wine & Food Tastings", icon: "🍷" },
  { id: "guided-tours", label: "Guided Walking Tours", icon: "🧭" },
  { id: "day-trips-from-florence", label: "Tuscany Day Trips", icon: "🌄" },
];

const HERO_FEATURED_CARDS = [
  {
    id: "duomo-climb",
    title: "Duomo Dome Climb & Secret Terraces",
    badge: "⚡ SKIP-THE-LINE",
    badgeColor: "bg-[#c85a32] text-white",
    price: 49,
    rating: 4.98,
    reviews: 3420,
    image: "/images/hero2-duomo-vertical.jpg",
    href: "/experiences/duomo-and-brunelleschis-dome-climb",
    duration: "2.5 Hours",
  },
  {
    id: "uffizi-fast",
    title: "Uffizi Gallery Priority Access & Da Vinci",
    badge: "🏛️ FAST-TRACK PASS",
    badgeColor: "bg-[#18181b] text-white",
    price: 39,
    rating: 4.95,
    reviews: 2890,
    image: "/images/hero2-uffizi-corridor.jpg",
    href: "/experiences/uffizi-gallery-skip-the-line-ticket",
    duration: "2 Hours",
  },
  {
    id: "chianti-sunset",
    title: "Chianti Hills Sunset Wine & Castle Dinner",
    badge: "🍷 BESTSELLER TOUR",
    badgeColor: "bg-[#9a3412] text-white",
    price: 85,
    rating: 4.98,
    reviews: 1640,
    image: "/images/hero2-chianti-wine.jpg",
    href: "/experiences/chianti-countryside-and-wine-tasting-day-trip",
    duration: "5 Hours",
  },
];

export function HeroV3() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateDisplay, setDateDisplay] = useState("Any date");
  const [openDropdown, setOpenDropdown] = useState<"search" | "date" | "category" | null>(null);

  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Autocomplete state
  const [productResults, setProductResults] = useState<SuggestionRow[]>([]);
  const [categoryResults, setCategoryResults] = useState<SuggestionRow[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto rotate featured card every 5s if user hasn't clicked
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % HERO_FEATURED_CARDS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  // Click outside listener
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
      setDateDisplay("Any date");
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
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedDate) {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      params.set("date", `${yyyy}-${mm}-${dd}`);
    }
    const target = params.toString() ? `/experiences?${params.toString()}` : "/experiences";
    router.push(target);
  };

  return (
    <section className="relative overflow-hidden bg-[#faf9f6] pt-28 sm:pt-32 pb-16 lg:pb-24 border-b border-[#eae5d9]/80">
      {/* Subtle Warm Atmospheric Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#f3efe6] to-[#fbf0eb] blur-3xl" />
        <div className="absolute top-10 right-10 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#fef3c7]/60 to-[#fbf0eb]/50 blur-3xl" />
      </div>

      <Container className="relative z-10">
        {/* Top Eyebrow */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#e5e0d8] shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#c85a32] animate-pulse" />
            <span>DIRECT TICKET RESERVATIONS &amp; TOURS</span>
            <span className="text-neutral-300">|</span>
            <span className="text-[#c85a32] font-bold">VACAY FLORENCE</span>
          </div>

          {/* Main Editorial Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-normal leading-[1.08] tracking-tight text-[#18181b] text-balance">
            Unforgettable Florence Experiences,{" "}
            <span className="font-serif italic font-normal text-[#c85a32] block sm:inline">
              Skip The Line.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-[19px] text-[#52525b] max-w-2xl font-normal leading-relaxed text-balance">
            Book guaranteed timeslots for Brunelleschi&apos;s Duomo, the Uffizi Gallery, Chianti wine day trips, and authentic Tuscan cooking classes with instant confirmation.
          </p>
        </div>

        {/* ================================================================= */}
        {/* GETYOURGUIDE / TIQETS STYLE OFF-WHITE SEARCH CAPSULE */}
        {/* ================================================================= */}
        <div ref={containerRef} className="mt-8 sm:mt-10 max-w-5xl mx-auto relative z-30">
          <form
            onSubmit={handleExecuteSearch}
            className="p-2 sm:p-2.5 rounded-3xl sm:rounded-full bg-white border border-[#e5e0d8] shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            {/* 1. Destination / Experience Search Input */}
            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "search" ? null : "search")}
                className="w-full h-14 sm:h-16 px-5 flex items-center gap-3.5 text-left rounded-2xl sm:rounded-full hover:bg-[#faf9f6] transition-colors focus-visible:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-[#f3efe6] flex items-center justify-center text-neutral-700 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    What are you looking for?
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (openDropdown !== "search") setOpenDropdown("search");
                    }}
                    placeholder="Duomo, Uffizi, Wine tasting..."
                    className="w-full bg-transparent text-sm sm:text-base font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none truncate"
                  />
                </div>
              </button>

              {/* Autocomplete Dropdown */}
              {openDropdown === "search" && (
                <div className="absolute top-full left-0 right-0 mt-3 p-3 bg-white rounded-3xl border border-[#e5e0d8] shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-50 max-h-96 overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                    <span>{query.trim() ? "Search Suggestions" : "Trending in Florence"}</span>
                    {searchLoading && <span className="text-[10px] lowercase text-[#c85a32]">searching...</span>}
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
                              <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-[#c85a32] transition-colors">
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

            {/* 2. Date Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
                className="w-full sm:w-44 h-14 sm:h-16 px-4 flex items-center gap-3 text-left rounded-2xl sm:rounded-full hover:bg-[#faf9f6] transition-colors focus-visible:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-[#f3efe6] flex items-center justify-center text-neutral-700 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    When
                  </span>
                  <span className="block text-sm font-semibold text-neutral-900 truncate">
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

            {/* 3. Category Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "category" ? null : "category")}
                className="w-full sm:w-48 h-14 sm:h-16 px-4 flex items-center gap-3 text-left rounded-2xl sm:rounded-full hover:bg-[#faf9f6] transition-colors focus-visible:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-[#f3efe6] flex items-center justify-center text-neutral-700 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Category
                  </span>
                  <span className="block text-sm font-semibold text-neutral-900 truncate">
                    {CATEGORY_OPTIONS.find((c) => c.id === selectedCategory)?.label ?? "All Experiences"}
                  </span>
                </div>
              </button>

              {/* Category Dropdown */}
              {openDropdown === "category" && (
                <div className="absolute top-full right-0 mt-3 p-2 bg-white rounded-3xl border border-[#e5e0d8] shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-50 w-64">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left text-xs font-semibold transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-[#18181b] text-white"
                          : "text-neutral-700 hover:bg-[#faf9f6]"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Submit CTA Button */}
            <button
              type="submit"
              className="h-14 sm:h-16 px-8 rounded-2xl sm:rounded-full bg-[#18181b] hover:bg-[#27272a] text-white text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shrink-0"
            >
              <span>Explore</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

          {/* Quick Trending Links */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[10.5px]">
              Trending:
            </span>
            {[
              { label: "⚡ Duomo Dome Climb", href: "/experiences/duomo-and-brunelleschis-dome-climb" },
              { label: "🏛️ Uffizi Skip-the-Line", href: "/experiences/uffizi-gallery-skip-the-line-ticket" },
              { label: "🎨 Michelangelo's David", href: "/experiences/accademia-gallery-michelangelos-david-ticket" },
              { label: "🍷 Chianti Wine & Castle", href: "/experiences/chianti-countryside-and-wine-tasting-day-trip" },
              { label: "🍝 Tuscan Cooking Class", href: "/experiences/florentine-cooking-class-with-market-visit" },
            ].map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className="px-3 py-1 rounded-full bg-white hover:bg-[#f3efe6] border border-[#e5e0d8] text-neutral-700 text-[11.5px] font-medium transition-all shadow-sm"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ================================================================= */}
        {/* DYNAMIC ASYMMETRIC BENTO SHOWCASE (Off-White Editorial Design) */}
        {/* ================================================================= */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual Centerpiece (8 Cols) */}
          <div className="lg:col-span-8 relative h-[380px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-[#e5e0d8] group bg-stone-900">
            <Image
              src="/images/florence-hero.jpg"
              alt="Panoramic Florence Duomo skyline at golden hour"
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

            {/* Top Left Badge */}
            <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10.5px] font-bold tracking-wider uppercase text-neutral-900 shadow-sm">
                ⚜ FLORENCE BESTSELLER
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white">
                <span className="text-amber-400">★</span> 4.98 (3,400+ reviews)
              </span>
            </div>

            {/* Bottom Caption & Fast CTA */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-md text-white">
                <span className="text-xs font-bold uppercase tracking-widest text-[#f59e0b] block mb-1">
                  BRUNELLESCHI&apos;S MASTERPIECE
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-medium text-white leading-snug drop-shadow-md">
                  Duomo Cathedral &amp; Panoramic Terraces
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-white/80 font-light line-clamp-2">
                  Climb 463 steps to the cupola for the finest 360° views across Florence and the Tuscan hills.
                </p>
              </div>

              <Link
                href="/experiences/duomo-and-brunelleschis-dome-climb"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#fbf0eb] text-neutral-900 text-xs font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95 shrink-0"
              >
                <span>Book From €49</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Right Featured Cards Deck (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            {HERO_FEATURED_CARDS.map((card, idx) => {
              const isSelected = activeCardIndex === idx;
              return (
                <Link
                  key={card.id}
                  href={card.href}
                  onMouseEnter={() => setActiveCardIndex(idx)}
                  className={`relative p-3.5 sm:p-4 rounded-3xl border transition-all duration-300 flex items-center gap-4 ${
                    isSelected
                      ? "bg-white border-[#c85a32] shadow-[0_12px_30px_rgba(200,90,50,0.12)] scale-[1.02]"
                      : "bg-white/70 hover:bg-white border-[#e5e0d8] shadow-sm"
                  }`}
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    </div>

                    <h4 className="font-display text-sm font-semibold text-neutral-900 leading-snug line-clamp-2">
                      {card.title}
                    </h4>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-amber-500 font-bold">★</span>
                        <span className="font-bold text-neutral-900">{card.rating}</span>
                        <span className="text-neutral-400 text-[10px]">({card.reviews})</span>
                      </div>
                      <span className="text-sm font-bold text-[#c85a32]">
                        €{card.price}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* TRUST VALUE BAR (Zero Queue, Instant Mobile Tickets, Free Cancellation) */}
        {/* ================================================================= */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-[#eae5d9] grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#e5e0d8] flex items-center justify-center text-lg shadow-sm shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900">Zero Queue Guarantee</h4>
              <p className="text-[11px] sm:text-xs text-neutral-500">Official priority timeslots</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#e5e0d8] flex items-center justify-center text-lg shadow-sm shrink-0">
              📱
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900">Instant Mobile Pass</h4>
              <p className="text-[11px] sm:text-xs text-neutral-500">Scan phone barcode at gate</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#e5e0d8] flex items-center justify-center text-lg shadow-sm shrink-0">
              🔄
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900">100% Free Cancellation</h4>
              <p className="text-[11px] sm:text-xs text-neutral-500">Full refund up to 24h before</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#e5e0d8] flex items-center justify-center text-lg shadow-sm shrink-0">
              🛡️
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900">Verified Local Guides</h4>
              <p className="text-[11px] sm:text-xs text-neutral-500">Licensed Florentine experts</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
