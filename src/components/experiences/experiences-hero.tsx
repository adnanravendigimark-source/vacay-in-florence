"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CalendarPicker } from "@/components/home/calendar-picker";
import { useSearchAutocomplete } from "@/hooks/use-search-autocomplete";

const DESTINATIONS = [
  { id: "florence-all", name: "Florence, Italy", sub: "All city attractions & tours" },
  { id: "duomo-area", name: "Duomo & Historic Center", sub: "Cathedral & Baptistery" },
  { id: "uffizi-area", name: "Uffizi & Ponte Vecchio", sub: "Galleries & River Arno" },
  { id: "oltrarno", name: "Oltrarno & Pitti Palace", sub: "Boboli Gardens & Artisans" },
  { id: "tuscany", name: "Tuscany & Chianti", sub: "Wine tasting & day trips" },
];

export function ExperiencesHero() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [destination, setDestination] = useState(searchParams.get("dest") || "Florence, Italy");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : null
  );
  const [dateDisplay, setDateDisplay] = useState(
    searchParams.get("date")
      ? new Date(searchParams.get("date")!).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Select date"
  );
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const [openDropdown, setOpenDropdown] = useState<"destination" | "date" | "search" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smart search: DB-driven autocomplete (see /api/search and
  // src/lib/data/search.ts), shared with the homepage's HeroSearch via
  // useSearchAutocomplete (src/hooks/use-search-autocomplete.ts) so both
  // search bars get live product + category suggestions, fuzzy matching,
  // and a "Popular in Florence" panel from the same, single-source logic.
  const {
    searchState,
    productResults,
    categoryResults,
    isPopular,
    activeIndex,
    setActiveIndex,
    flatResults,
    goToSuggestion,
    handleSearchKeyDown,
    runSearch,
  } = useSearchAutocomplete({
    query,
    active: openDropdown === "search",
    onNavigate: (href) => {
      setOpenDropdown(null);
      router.push(href);
    },
    onEscape: () => setOpenDropdown(null),
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (destination && destination !== "Florence, Italy") params.set("dest", destination);
    if (selectedDate) {
      // Build the date string from local Y/M/D components (not toISOString,
      // which converts to UTC and can shift the date back a day in
      // timezones behind UTC).
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      params.set("date", `${year}-${month}-${day}`);
    }
    router.push(`/experiences?${params.toString()}`);
  };

  const filteredDestinations = DESTINATIONS.filter((dest) => {
    const term = destinationFilter.trim().toLowerCase();
    if (!term) return true;
    return dest.name.toLowerCase().includes(term) || dest.sub.toLowerCase().includes(term);
  });

  return (
    <section className="relative w-full bg-white pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-14 lg:pb-16 border-b border-[#ece6dc]/80">
      {/* SVG Clip Path Definition for the Curved Arc Mask */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="experience-curve-clip" clipPathUnits="objectBoundingBox">
            {/* Elegant organic curve matching the reference design */}
            <path d="M 0.20 0 C 0.06 0.22, -0.01 0.50, 0.07 1 L 1 1 L 1 0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Right-Side Curved Panoramic Vista of Florence */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[58%] xl:w-[61%] h-full z-0 pointer-events-none select-none">
        <div
          className="absolute inset-0 h-full w-full overflow-hidden"
          style={{
            clipPath: "url(#experience-curve-clip)",
            WebkitClipPath: "url(#experience-curve-clip)",
          }}
        >
          <img
            src="/images/hero-florence-duomo.jpg"
            alt="Florence Cathedral Santa Maria del Fiore Duomo and historic cityscape"
            className="h-full w-full object-cover object-[center_36%]"
          />
          {/* Subtle warm atmospheric vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-stone-900/5" />
        </div>

        {/* Soft Highlight Rim along the Curve */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full pointer-events-none z-10"
        >
          <path
            d="M 20 0 C 6 22, -1 50, 7 100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="1.2"
          />
        </svg>

        {/* Cursive Handwriting: "Real Experiences Last Forever" */}
        <div className="absolute top-20 xl:top-24 right-16 xl:right-24 z-20 text-center select-none pointer-events-none -rotate-6">
          <p className="font-['Caveat',cursive] text-2xl xl:text-3xl font-bold text-[#1f3a2c] tracking-wide leading-tight drop-shadow-sm">
            Real Experiences
            <span className="block text-xl xl:text-2xl font-semibold text-[#1f3a2c]/90 mt-0.5">
              Last Forever
            </span>
          </p>
          {/* Hand-drawn underline arc */}
          <svg
            viewBox="0 0 110 14"
            className="w-24 xl:w-28 mx-auto mt-1 text-[#2d503b] overflow-visible"
            fill="none"
          >
            <path
              d="M 4 9 C 32 13, 72 12, 106 4"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

      </div>

      {/*
        Floating polaroid category cards, in their own stacking context at
        z-40 — deliberately NOT nested inside the z-0 backdrop div above.
        The Main Content Container below (which wraps the floating search
        bar) is a sibling with its own z-10 stacking context; descendant
        z-index values never escape a stacking context, so cards placed
        inside the z-0 backdrop would render (and receive clicks) BEHIND
        the search bar wherever the two visually overlap — which is
        exactly why these were unclickable. Keeping the same outer
        w-[58%]/xl:w-[61%] box means every card's left/top percentage
        still resolves to the same on-screen position as before; only the
        stacking order (and therefore click-ability) changes.
      */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[58%] xl:w-[61%] h-full z-40 pointer-events-none select-none">
        {/* Floating Polaroid Card 1: Michelangelo's David (Museums & Galleries) */}
        <Link
          href="/experiences/category/museums-galleries"
          className="group absolute left-[15%] xl:left-[18%] top-[22%] xl:top-[24%] pointer-events-auto transition-transform duration-300 -rotate-6 hover:-rotate-1 hover:scale-105 cursor-pointer"
          aria-label="Explore Museums & Galleries in Florence"
        >
          <div className="relative w-[130px] xl:w-[155px] aspect-[3/4] rounded-2xl bg-white p-1.5 shadow-[0_18px_35px_rgba(0,0,0,0.18)] border border-neutral-100/90 transition-shadow group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.25)]">
            <img
              src="/images/hero-david.jpg"
              alt="Michelangelo's David at Accademia Gallery"
              className="h-full w-full object-cover rounded-xl"
            />
            {/* Centered Pill Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/98 backdrop-blur-md px-3 py-1 shadow-md border border-neutral-200/80 text-[11px] font-semibold text-neutral-800 tracking-tight whitespace-nowrap">
              Museums &amp; Galleries
            </div>
          </div>
        </Link>

        {/* Floating Polaroid Card 2: Food & Wine Dining Table */}
        <Link
          href="/experiences/category/food-wine-experiences"
          className="group absolute left-[38%] xl:left-[41%] top-[43%] xl:top-[45%] pointer-events-auto transition-transform duration-300 rotate-3 hover:rotate-0 hover:scale-105 cursor-pointer"
          aria-label="Explore Food & Wine experiences in Florence"
        >
          <div className="relative w-[150px] xl:w-[175px] aspect-[4/3] rounded-2xl bg-white p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.22)] border border-neutral-100/90 transition-shadow group-hover:shadow-[0_26px_55px_rgba(0,0,0,0.28)]">
            <img
              src="/images/hero-food-wine.jpg"
              alt="Authentic Florentine trattoria dining with Chianti wine"
              className="h-full w-full object-cover rounded-xl"
            />
            {/* Centered Pill Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/98 backdrop-blur-md px-3.5 py-1 shadow-md border border-neutral-200/80 text-[11px] font-semibold text-neutral-800 tracking-tight whitespace-nowrap">
              Food &amp; Wine
            </div>
          </div>
        </Link>

        {/* Floating Polaroid Card 3: Tuscan Countryside & Cypress Trees (Day Trips) */}
        <Link
          href="/experiences/category/day-trips-from-florence"
          className="group absolute left-[60%] xl:left-[63%] top-[53%] xl:top-[55%] pointer-events-auto transition-transform duration-300 -rotate-3 hover:rotate-0 hover:scale-105 cursor-pointer"
          aria-label="Explore Tuscan Day Trips from Florence"
        >
          <div className="relative w-[135px] xl:w-[155px] aspect-[4/3] rounded-2xl bg-white p-1.5 shadow-[0_18px_35px_rgba(0,0,0,0.18)] border border-neutral-100/90 transition-shadow group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.25)]">
            <img
              src="/images/hero-day-trips.jpg"
              alt="Rolling hills of Tuscany with cypress trees and stone villa"
              className="h-full w-full object-cover rounded-xl"
            />
            {/* Centered Pill Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/98 backdrop-blur-md px-3.5 py-1 shadow-md border border-neutral-200/80 text-[11px] font-semibold text-neutral-800 tracking-tight whitespace-nowrap">
              Day Trips
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Container */}
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Eyebrow, Main Headline & Subheadline */}
          <div className="lg:col-span-6 xl:col-span-5 max-w-xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-bold tracking-[0.22em] text-[#556358] uppercase mb-3 sm:mb-4">
              <span>CURATED EXPERIENCES</span>
              <span className="text-amber-600 font-bold">•</span>
              <span>AUTHENTIC FLORENCE</span>
            </div>

            {/* Editorial Luxury Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-[54px] lg:text-[58px] xl:text-[64px] font-normal leading-[1.08] tracking-tight text-[#2b0934]">
              Unforgettable<br />
              Experiences in<br />
              <span className="italic font-normal font-display text-[#2b0934]">Florence</span>
            </h1>

            {/* Descriptive Subheading */}
            <p className="mt-4 sm:mt-5 text-[13.5px] sm:text-[14.5px] font-normal leading-relaxed text-[#59655d] max-w-md lg:max-w-lg">
              Skip the lines, explore iconic landmarks, and immerse yourself in the art, culture and beauty of Florence. Your perfect experience is just a few clicks away.
            </p>
          </div>

          {/* Right Spacer on Desktop (Visual imagery occupies background) */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 h-[340px] pointer-events-none" />
        </div>

        {/* Mobile / Tablet Showcase of the 3 Categories */}
        <div className="lg:hidden mt-8 mb-4">
          <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#e5e0d8] bg-white p-3">
            <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3">
              <img
                src="/images/hero-florence-duomo.jpg"
                alt="Florence Cathedral Duomo"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 right-3 text-right">
                <span className="font-['Caveat',cursive] text-lg font-bold text-white drop-shadow-md">
                  Real Experiences Last Forever
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/experiences/category/museums-galleries"
                className="group flex flex-col items-center text-center p-1"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200 shadow-sm mb-1.5">
                  <img
                    src="/images/hero-david.jpg"
                    alt="David"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-[11px] font-bold text-neutral-800 leading-tight">
                  Museums &amp; Galleries
                </span>
              </Link>
              <Link
                href="/experiences/category/food-wine-experiences"
                className="group flex flex-col items-center text-center p-1"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200 shadow-sm mb-1.5">
                  <img
                    src="/images/hero-food-wine.jpg"
                    alt="Food & Wine"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-[11px] font-bold text-neutral-800 leading-tight">
                  Food &amp; Wine
                </span>
              </Link>
              <Link
                href="/experiences/category/day-trips-from-florence"
                className="group flex flex-col items-center text-center p-1"
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200 shadow-sm mb-1.5">
                  <img
                    src="/images/hero-day-trips.jpg"
                    alt="Day Trips"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-[11px] font-bold text-neutral-800 leading-tight">
                  Day Trips
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating White Pill Search Bar Widget */}
        <div ref={containerRef} className="relative z-30 mt-8 sm:mt-10 lg:mt-12 w-full max-w-5xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex flex-col md:flex-row items-stretch md:items-center bg-white rounded-3xl md:rounded-full p-2 sm:p-2.5 shadow-[0_12px_45px_rgba(0,0,0,0.08)] border border-[#e2ddd5] text-neutral-900"
          >
            {/* Destination Field */}
            <div className="relative flex-1 group">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "destination" ? null : "destination")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-2xl md:rounded-full hover:bg-[#faf9f6] transition-all cursor-pointer"
              >
                {/* Standalone Location Pin Icon */}
                <div className="shrink-0 text-neutral-800">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2]">
                    <path d="M12 21c-4-4.5-7-8.5-7-12a7 7 0 1 1 14 0c0 3.5-3 7.5-7 12z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Destination
                  </span>
                  <span className="text-[13.5px] font-semibold text-neutral-900 truncate mt-0.5">
                    {destination}
                  </span>
                </div>
                <svg
                  viewBox="0 0 20 20"
                  className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-150 ${
                    openDropdown === "destination" ? "rotate-180 text-neutral-900" : ""
                  }`}
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Destination Dropdown */}
              {openDropdown === "destination" && (
                <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white p-2.5 shadow-2xl animate-in fade-in duration-100">
                  <div className="px-1 pb-2">
                    <input
                      type="text"
                      value={destinationFilter}
                      onChange={(e) => setDestinationFilter(e.target.value)}
                      placeholder="Search destinations..."
                      autoFocus
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-900 outline-none focus:border-[#a813c9] focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Popular in Florence
                  </div>
                  <div className="space-y-1 mt-1 max-h-60 overflow-y-auto">
                    {filteredDestinations.map((dest) => (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => {
                          setDestination(dest.name);
                          setDestinationFilter("");
                          setOpenDropdown(null);
                        }}
                        className={`flex w-full flex-col rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-neutral-100 cursor-pointer ${
                          destination === dest.name ? "bg-neutral-100 font-semibold" : ""
                        }`}
                      >
                        <span className="font-semibold text-neutral-900 text-[13px]">{dest.name}</span>
                        <span className="text-[11px] text-neutral-500">{dest.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hairline Divider */}
            <div className="hidden md:block h-8 w-[1px] bg-[#e5e0d8] my-auto" />

            {/* Date Field */}
            <div className="relative flex-1 group">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-2xl md:rounded-full hover:bg-[#faf9f6] transition-all cursor-pointer"
              >
                {/* Standalone Calendar Icon */}
                <div className="shrink-0 text-neutral-800">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2]">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Date
                  </span>
                  <span
                    className={`text-[13.5px] truncate mt-0.5 ${
                      dateDisplay === "Select date" ? "font-normal text-neutral-400" : "font-semibold text-neutral-900"
                    }`}
                  >
                    {dateDisplay}
                  </span>
                </div>
                <svg
                  viewBox="0 0 20 20"
                  className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-150 ${
                    openDropdown === "date" ? "rotate-180 text-neutral-900" : ""
                  }`}
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Date Calendar Picker Dropdown */}
              {openDropdown === "date" && (
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-full z-50 mt-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <CalendarPicker
                    selectedDate={selectedDate}
                    onClose={() => setOpenDropdown(null)}
                    onSelectDate={(d, label) => {
                      setSelectedDate(d);
                      setDateDisplay(label);
                      setOpenDropdown(null);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Hairline Divider */}
            <div className="hidden md:block h-8 w-[1px] bg-[#e5e0d8] my-auto" />

            {/* Search Input Query Field */}
            <div className="relative flex-[1.4] group">
              <div className="flex items-center px-4 py-2.5">
                {/* Standalone Search Icon */}
                <div className="shrink-0 text-neutral-800 mr-3">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2]">
                    <circle cx="11" cy="11" r="7.5" />
                    <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex flex-col flex-1 min-w-0 leading-tight">
                  <label htmlFor="search-experience-query" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 cursor-pointer">
                    What are you looking for?
                  </label>
                  <input
                    id="search-experience-query"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setOpenDropdown("search")}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Tours, tickets, experiences..."
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={openDropdown === "search"}
                    aria-controls="search-experience-suggestions"
                    aria-autocomplete="list"
                    className="w-full bg-transparent text-[13.5px] font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none mt-0.5 border-0 p-0"
                  />
                </div>
              </div>

              {/* Search Suggestions Dropdown */}
              {openDropdown === "search" && (
                <div
                  id="search-experience-suggestions"
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-neutral-200 bg-white p-2.5 shadow-2xl animate-in fade-in duration-100"
                >
                  {searchState === "loading" && (
                    <div className="flex items-center gap-2 px-3 py-4 text-xs text-neutral-500">
                      <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-neutral-300 border-t-[#a813c9]" />
                      Searching&hellip;
                    </div>
                  )}

                  {searchState === "error" && (
                    <div className="px-3 py-4 text-xs text-neutral-600">
                      <p className="font-semibold text-terracotta-dark">Search is temporarily unavailable.</p>
                      <button
                        type="button"
                        onClick={() => void runSearch(query)}
                        className="mt-1.5 font-semibold text-[#a813c9] underline decoration-dotted"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {searchState === "empty" && (
                    <div className="px-3 py-4 text-xs text-neutral-600">
                      <p className="font-semibold text-neutral-800">No matches for &ldquo;{query}&rdquo;.</p>
                      <p className="mt-1 text-neutral-500">Try a broader term, or browse all experiences.</p>
                    </div>
                  )}

                  {(searchState === "success" || (searchState === "idle" && flatResults.length > 0)) && (
                    <>
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {isPopular ? "Popular in Florence" : "Suggestions"}
                      </div>
                      {productResults.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {productResults.map((row) => {
                            const index = flatResults.indexOf(row);
                            return (
                              <button
                                key={row.id}
                                type="button"
                                role="option"
                                aria-selected={activeIndex === index}
                                onClick={() => goToSuggestion(row)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                                  activeIndex === index ? "bg-neutral-100" : "hover:bg-neutral-100"
                                }`}
                              >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#2b0934] shrink-0 fill-none stroke-current stroke-2">
                                  <circle cx="11" cy="11" r="7.5" />
                                  <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" strokeLinecap="round" />
                                </svg>
                                <span className="min-w-0 flex-1 truncate">
                                  <span className="font-semibold text-neutral-900">{row.title}</span>
                                  <span className="block text-[10.5px] font-normal text-neutral-500">{row.meta}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {categoryResults.length > 0 && (
                        <div className="mt-1.5 space-y-0.5 border-t border-neutral-100 pt-1.5">
                          {categoryResults.map((row) => {
                            const index = flatResults.indexOf(row);
                            return (
                              <button
                                key={row.id}
                                type="button"
                                role="option"
                                aria-selected={activeIndex === index}
                                onClick={() => goToSuggestion(row)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                                  activeIndex === index ? "bg-neutral-100" : "hover:bg-neutral-100"
                                }`}
                              >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#2b0934] shrink-0 fill-none stroke-current stroke-2">
                                  <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
                                </svg>
                                <span className="min-w-0 flex-1 truncate">
                                  <span className="font-semibold text-neutral-900">{row.title}</span>
                                  <span className="block text-[10.5px] font-normal text-neutral-500">{row.meta}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="p-1 md:p-0 md:pr-1">
              <button
                type="submit"
                className="group flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl md:rounded-full bg-[#2b0934] hover:bg-[#3d0d4a] px-7 py-3 text-[13.5px] font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Search</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1 font-bold text-white">&rarr;</span>
              </button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
