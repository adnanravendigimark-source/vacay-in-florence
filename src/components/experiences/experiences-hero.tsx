"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { CalendarPicker } from "@/components/home/calendar-picker";

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : null
  );
  const [dateDisplay, setDateDisplay] = useState(
    searchParams.get("date")
      ? new Date(searchParams.get("date")!).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Select date"
  );
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const [openDropdown, setOpenDropdown] = useState<"destination" | "date" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      params.set("date", selectedDate.toISOString().split("T")[0]);
    }
    router.push(`/experiences?${params.toString()}`);
  };

  return (
    <div className="relative w-full overflow-hidden bg-stone-900 pb-12 sm:pb-16">
      {/* Background Hero Image with Soft Warm Golden Tint */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        <Image
          src="/images/florence-hero.jpg"
          alt="Panoramic golden sunset view of Florence Duomo and Tuscan hills"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-[center_right] sm:object-center"
        />
        {/* Left Side Shadow for pristine text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 via-50% to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      </div>

      {/* Main Text Content */}
      <Container className="relative z-10 pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="max-w-2xl text-white">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-neutral-200/90 uppercase mb-3 drop-shadow">
            <span>CURATED EXPERIENCES</span>
            <span className="text-amber-400 font-bold">•</span>
            <span>AUTHENTIC FLORENCE</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-normal leading-[1.12] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            Unforgettable <br className="hidden sm:inline" />
            Experiences in{" "}
            <span className="italic font-light text-amber-200/95 font-display drop-shadow-lg">
              Florence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-xl text-sm sm:text-[15px] font-normal leading-relaxed text-neutral-100/90 drop-shadow-md">
            Skip the lines, explore iconic landmarks, and immerse yourself in the art, culture and beauty of Florence. Your perfect experience is just a few clicks away.
          </p>
        </div>
      </Container>

      {/* Floating White Pill Search Bar Widget */}
      <Container className="relative z-20 -mb-6 sm:-mb-8">
        <div ref={containerRef} className="w-full max-w-5xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex flex-col md:flex-row items-stretch md:items-center bg-white rounded-3xl md:rounded-full p-2 sm:p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-neutral-100 text-neutral-900"
          >
            {/* Destination Field */}
            <div className="relative flex-1 group">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "destination" ? null : "destination")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-2xl md:rounded-full hover:bg-neutral-50 transition-all cursor-pointer"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[2]">
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
                <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl animate-in fade-in duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Popular in Florence
                  </div>
                  <div className="space-y-1 mt-1">
                    {DESTINATIONS.map((dest) => (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => {
                          setDestination(dest.name);
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
            <div className="hidden md:block h-8 w-[1px] bg-neutral-200 my-auto" />

            {/* Date Field */}
            <div className="relative flex-1 group">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-2xl md:rounded-full hover:bg-neutral-50 transition-all cursor-pointer"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[2]">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Date
                  </span>
                  <span
                    className={`text-[13.5px] truncate mt-0.5 ${
                      dateDisplay === "Select date" ? "font-normal text-neutral-500" : "font-semibold text-neutral-900"
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
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-full z-50 mt-2 w-80 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl">
                  <CalendarPicker
                    selectedDate={selectedDate}
                    onClose={() => setOpenDropdown(null)}
                    onSelectDate={(d) => {
                      setSelectedDate(d);
                      if (d) {
                        setDateDisplay(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
                      } else {
                        setDateDisplay("Select date");
                      }
                      setOpenDropdown(null);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Hairline Divider */}
            <div className="hidden md:block h-8 w-[1px] bg-neutral-200 my-auto" />

            {/* Search Input Query Field */}
            <div className="relative flex-[1.4] flex items-center px-4 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 mr-3">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[2.2]">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <label htmlFor="search-experience-query" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  What are you looking for?
                </label>
                <input
                  id="search-experience-query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tours, tickets, experiences..."
                  className="w-full bg-transparent text-[13.5px] font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none mt-0.5 border-0 p-0"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-1 sm:p-0">
              <button
                type="submit"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl md:rounded-full bg-[#132319] hover:bg-[#1a3023] px-7 py-3.5 text-xs sm:text-sm font-semibold text-white transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Search</span>
                <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
                  <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
