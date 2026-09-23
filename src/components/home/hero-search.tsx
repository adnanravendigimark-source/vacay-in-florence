"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarPicker } from "@/components/home/calendar-picker";
import { useSearchAutocomplete } from "@/hooks/use-search-autocomplete";

const DESTINATIONS = [
  { id: "florence-all", name: "Florence, Italy", sub: "All city attractions & tours" },
  { id: "duomo-area", name: "Duomo & Historic Center", sub: "Cathedral & Baptistery" },
  { id: "uffizi-area", name: "Uffizi & Ponte Vecchio", sub: "Galleries & River Arno" },
  { id: "oltrarno", name: "Oltrarno & Pitti Palace", sub: "Boboli Gardens & Artisans" },
  { id: "tuscany", name: "Tuscany & Chianti", sub: "Wine tasting & day trips" },
];

export function HeroSearch() {
  const router = useRouter();

  const [destination, setDestination] = useState("Florence, Italy");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateDisplay, setDateDisplay] = useState("Select date");
  const [query, setQuery] = useState("");

  const [openDropdown, setOpenDropdown] = useState<"destination" | "date" | "search" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smart search: DB-driven autocomplete (see /api/search and
  // src/lib/data/search.ts), shared with the /experiences hero via
  // useSearchAutocomplete (src/hooks/use-search-autocomplete.ts).
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
    if (query) params.set("q", query);
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
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto">
      {/* Luxury Transparent Glassmorphic Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col md:flex-row items-stretch md:items-center bg-white rounded-3xl md:rounded-full p-2 sm:p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-[#e5e0d8]"
      >
        {/* Destination Field */}
        <div className="relative flex-1 group">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "destination" ? null : "destination")}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-left rounded-2xl md:rounded-full hover:bg-[#faf9f6] transition-all cursor-pointer"
          >
            {/* Soft Icon Badge */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f3ef] text-neutral-700 transition-colors group-hover:bg-[#2b0934] group-hover:text-white">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.85]">
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
              className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-150 ${openDropdown === "destination" ? "rotate-180 text-neutral-900" : ""
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
            <div className="absolute left-0 top-full z-50 mt-3 w-80 rounded-2xl border border-neutral-200/90 bg-white/98 backdrop-blur-2xl p-2.5 shadow-[0_24px_50px_rgba(0,0,0,0.35)] ring-1 ring-black/5 animate-in fade-in duration-100 text-neutral-900">
              <div className="px-1 pb-2">
                <input
                  type="text"
                  value={destinationFilter}
                  onChange={(e) => setDestinationFilter(e.target.value)}
                  placeholder="Search destinations..."
                  autoFocus
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none focus:border-[#a813c9] focus:bg-white transition-colors"
                />
              </div>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {destinationFilter ? "Matching destinations" : "Popular in Florence"}
              </div>
              <div className="space-y-1 mt-1 max-h-64 overflow-y-auto">
                {filteredDestinations.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-neutral-500">No destinations match &ldquo;{destinationFilter}&rdquo;.</p>
                ) : (
                  filteredDestinations.map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => {
                        setDestination(dest.name);
                        setDestinationFilter("");
                        setOpenDropdown(null);
                      }}
                      className={`flex w-full flex-col rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-neutral-100 cursor-pointer ${destination === dest.name ? "bg-neutral-100 font-semibold" : ""
                        }`}
                    >
                      <span className="font-semibold text-neutral-900 text-[13px]">{dest.name}</span>
                      <span className="text-[11px] text-neutral-500">{dest.sub}</span>
                    </button>
                  ))
                )}
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
            className="w-full flex items-center gap-3 px-3.5 py-2 text-left rounded-2xl md:rounded-full hover:bg-[#faf9f6] transition-all cursor-pointer"
          >
            {/* Soft Icon Badge */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f3ef] text-neutral-700 transition-colors group-hover:bg-[#2b0934] group-hover:text-white">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.85]">
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
              <span className={`text-[13.5px] truncate mt-0.5 ${dateDisplay === "Select date" ? "font-normal text-neutral-400" : "font-semibold text-neutral-900"}`}>
                {dateDisplay}
              </span>
            </div>
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-150 ${openDropdown === "date" ? "rotate-180 text-neutral-900" : ""
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
            <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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
        <div className="hidden md:block h-8 w-[1px] bg-[#e5e0d8] my-auto" />

        {/* What are you looking for Field */}
        <div className="relative flex-[1.4] group">
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl md:rounded-full hover:bg-[#faf9f6] transition-all">
            {/* Soft Icon Badge */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f3ef] text-neutral-700 transition-colors group-hover:bg-[#2b0934] group-hover:text-white">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.85]">
                <circle cx="11" cy="11" r="7.5" />
                <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <label htmlFor="search-input" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 cursor-pointer">
                What are you looking for?
              </label>
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setOpenDropdown("search")}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tours, tickets, experiences..."
                autoComplete="off"
                role="combobox"
                aria-expanded={openDropdown === "search"}
                aria-controls="search-suggestions"
                aria-autocomplete="list"
                className="w-full bg-transparent text-[13.5px] font-medium text-neutral-900 placeholder:text-neutral-400 border-none outline-none focus:outline-none focus:ring-0 focus:border-none ring-0 shadow-none truncate mt-0.5"
              />
            </div>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "search" ? null : "search")}
              aria-label="Toggle suggestions"
              className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer"
            >
              <svg
                viewBox="0 0 20 20"
                className={`h-4 w-4 shrink-0 transition-transform duration-150 ${openDropdown === "search" ? "rotate-180 text-neutral-900" : ""
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
            <div
              id="search-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-50 mt-3 rounded-2xl border border-neutral-200/90 bg-white/98 backdrop-blur-2xl p-2.5 shadow-[0_24px_50px_rgba(0,0,0,0.35)] ring-1 ring-black/5 animate-in fade-in duration-100 text-neutral-900"
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
                            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${activeIndex === index ? "bg-neutral-100" : "hover:bg-neutral-100"
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
                            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${activeIndex === index ? "bg-neutral-100" : "hover:bg-neutral-100"
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

        {/* Search Submit Action Button */}
        <div className="p-1 md:p-0 md:pr-1">
          <button
            type="submit"
            className="group flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl md:rounded-full bg-[#2b0934] px-7 py-3 text-[13.5px] font-bold text-white shadow-lg transition-all duration-200 hover:bg-[#3d0d4a] hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            <span>Search</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1 font-bold text-white">&rarr;</span>
          </button>
        </div>
      </form>
    </div>
  );
}
