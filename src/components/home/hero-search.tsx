"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarPicker } from "@/components/home/calendar-picker";

const DESTINATIONS = [
  { id: "florence-all", name: "Florence, Italy", sub: "All city attractions & tours" },
  { id: "duomo-area", name: "Duomo & Historic Center", sub: "Cathedral & Baptistery" },
  { id: "uffizi-area", name: "Uffizi & Ponte Vecchio", sub: "Galleries & River Arno" },
  { id: "oltrarno", name: "Oltrarno & Pitti Palace", sub: "Boboli Gardens & Artisans" },
  { id: "tuscany", name: "Tuscany & Chianti", sub: "Wine tasting & day trips" },
];

const SUGGESTIONS = [
  "Florence Duomo & Dome Climb",
  "Uffizi Gallery Priority Entry",
  "Accademia Gallery & Michelangelo's David",
  "Chianti Wine Tasting & Tuscan Lunch",
  "Pitti Palace & Boboli Gardens",
  "Sunset Arno River Cruise",
];

export function HeroSearch() {
  const router = useRouter();

  const [destination, setDestination] = useState("Florence, Italy");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateDisplay, setDateDisplay] = useState("Select date");
  const [query, setQuery] = useState("");

  const [openDropdown, setOpenDropdown] = useState<"destination" | "date" | "search" | null>(null);
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
    if (query) params.set("q", query);
    if (destination && destination !== "Florence, Italy") params.set("dest", destination);
    if (selectedDate) {
      params.set("date", selectedDate.toISOString().split("T")[0]);
    }
    router.push(`/experiences?${params.toString()}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto">
      {/* Luxury Translucent Glassmorphic Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col md:flex-row items-stretch md:items-center bg-white/92 backdrop-blur-xl rounded-3xl md:rounded-full p-2 sm:p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.32)] border border-white/80 text-neutral-900 ring-1 ring-black/5"
      >
        {/* Destination Field */}
        <div className="relative flex-1 group">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "destination" ? null : "destination")}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-left rounded-2xl md:rounded-full hover:bg-black/5 transition-all"
          >
            {/* Soft Icon Badge */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-950/5 text-[#142d22] transition-colors group-hover:bg-[#142d22] group-hover:text-white">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.85]">
                <path d="M12 21c-4-4.5-7-8.5-7-12a7 7 0 1 1 14 0c0 3.5-3 7.5-7 12z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Destination
              </span>
              <span className="text-[13.5px] font-semibold text-neutral-900 truncate mt-0.5">
                {destination}
              </span>
            </div>
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-150 ${
                openDropdown === "destination" ? "rotate-180 text-neutral-700" : ""
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
            <div className="absolute left-0 top-full z-50 mt-2.5 w-76 rounded-2xl border border-neutral-200/90 bg-white/98 backdrop-blur-xl p-2.5 shadow-[0_24px_50px_rgba(0,0,0,0.25)] ring-1 ring-black/5 animate-in fade-in duration-100 text-neutral-900">
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
                    className={`flex w-full flex-col rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-neutral-100 ${
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
        <div className="hidden md:block h-8 w-[1px] bg-neutral-300/60 my-auto" />

        {/* Date Field */}
        <div className="relative flex-1 group">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-left rounded-2xl md:rounded-full hover:bg-black/5 transition-all"
          >
            {/* Soft Icon Badge */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-950/5 text-[#142d22] transition-colors group-hover:bg-[#142d22] group-hover:text-white">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.85]">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Date
              </span>
              <span className={`text-[13.5px] truncate mt-0.5 ${dateDisplay === "Select date" ? "font-normal text-neutral-600" : "font-semibold text-neutral-900"}`}>
                {dateDisplay}
              </span>
            </div>
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-150 ${
                openDropdown === "date" ? "rotate-180 text-neutral-700" : ""
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

          {/* Calendar Picker Dropdown */}
          {openDropdown === "date" && (
            <div className="absolute left-0 md:left-auto md:right-0 lg:left-0 top-full z-50 mt-2.5">
              <CalendarPicker
                selectedDate={selectedDate}
                onSelectDate={(d, label) => {
                  setSelectedDate(d);
                  setDateDisplay(label);
                }}
                onClose={() => setOpenDropdown(null)}
              />
            </div>
          )}
        </div>

        {/* Hairline Divider */}
        <div className="hidden md:block h-8 w-[1px] bg-neutral-300/60 my-auto" />

        {/* What are you looking for Field */}
        <div className="relative flex-[1.4] group">
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl md:rounded-full hover:bg-black/5 transition-all">
            {/* Soft Icon Badge */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-950/5 text-[#142d22] transition-colors group-hover:bg-[#142d22] group-hover:text-white">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.85]">
                <circle cx="11" cy="11" r="7.5" />
                <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <label htmlFor="search-input" className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 cursor-pointer">
                What are you looking for?
              </label>
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setOpenDropdown("search")}
                placeholder="Tours, tickets, experiences..."
                className="w-full bg-transparent text-[13.5px] font-medium text-neutral-900 placeholder:text-neutral-400 border-none outline-none focus:outline-none focus:ring-0 focus:border-none ring-0 shadow-none truncate mt-0.5"
              />
            </div>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "search" ? null : "search")}
              aria-label="Toggle suggestions"
              className="p-1 text-neutral-400 hover:text-neutral-600"
            >
              <svg
                viewBox="0 0 20 20"
                className={`h-4 w-4 shrink-0 transition-transform duration-150 ${
                  openDropdown === "search" ? "rotate-180 text-neutral-700" : ""
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
          </div>

          {/* Search Suggestions Dropdown */}
          {openDropdown === "search" && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2.5 rounded-2xl border border-neutral-200/90 bg-white/98 backdrop-blur-xl p-2.5 shadow-[0_24px_50px_rgba(0,0,0,0.25)] ring-1 ring-black/5 animate-in fade-in duration-100 text-neutral-900">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Popular in Florence
              </div>
              <div className="mt-1 space-y-0.5">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      setOpenDropdown(null);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs text-neutral-800 hover:bg-neutral-100 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#142d22] shrink-0 fill-none stroke-current stroke-2">
                      <circle cx="11" cy="11" r="7.5" />
                      <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" strokeLinecap="round" />
                    </svg>
                    <span className="truncate font-semibold text-neutral-900">{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Submit Action Button */}
        <div className="p-1 md:p-0 md:pr-1">
          <button
            type="submit"
            className="group flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl md:rounded-full bg-[#142d22] px-7 py-3 text-[13.5px] font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#0e2118] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Search</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1 font-normal text-amber-300">&rarr;</span>
          </button>
        </div>
      </form>
    </div>
  );
}
