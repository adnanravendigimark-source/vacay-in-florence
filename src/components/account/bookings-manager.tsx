"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

export interface BookingItem {
  id: string;
  title: string;
  image: { src: string; alt: string };
  date: string;
  time: string;
  location: string;
  guests: string;
  statusLabel: string;
  statusTone: "green" | "amber" | "red";
  price: string;
  href: string;
  category?: "upcoming" | "past" | "cancelled";
}

interface BookingsManagerProps {
  bookings: BookingItem[];
}

export function BookingsManager({ bookings }: BookingsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter bookings based on search query
  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return bookings;

    return bookings.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.date.toLowerCase().includes(query),
    );
  }, [bookings, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink tracking-tight">
            My Bookings
          </h2>
          <p className="text-xs sm:text-[13px] text-ink-faint mt-1">
            {bookings.length > 0
              ? `${bookings.length} booking${bookings.length === 1 ? "" : "s"} total`
              : "All your reservations in one place"}
          </p>
        </div>

        {/* Search Bar */}
        {bookings.length > 0 ? (
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                <circle cx="11" cy="11" r="7.5" />
                <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" strokeLinecap="round" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-stone text-xs sm:text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-[#2b0934] focus:ring-1 focus:ring-[#2b0934] shadow-2xs transition"
            />
          </div>
        ) : null}
      </div>

      {/* Bookings List (Individual Spacious Floating Cards) */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-3xl bg-white border border-stone shadow-[0_4px_25px_rgba(43,9,52,0.03)] p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand mb-3.5">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-medium text-ink">
            {searchQuery ? "No bookings match your search" : "No bookings yet"}
          </h3>
          <p className="text-xs sm:text-[13px] text-ink-soft mt-1 max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? `We couldn't find any bookings matching "${searchQuery}". Try a different keyword.`
              : "Once you book an experience, it'll show up here."}
          </p>
          <div className="mt-5">
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 bg-[#2b0934] hover:bg-[#3d0d4a] text-white text-xs sm:text-[13px] font-semibold px-5 py-2.5 rounded-full transition shadow-sm hover:shadow"
            >
              <span>Explore Experiences</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {filteredBookings.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white border border-stone p-5 sm:p-6 shadow-[0_4px_25px_rgba(43,9,52,0.03)] hover:border-brand/40 hover:shadow-md transition-all duration-200 group flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left Side: Thumbnail & Rich Metadata */}
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                <div className="relative w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-stone/40 shadow-2xs">
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 96px, 128px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-medium text-base sm:text-[17px] text-ink truncate group-hover:text-brand transition-colors">
                    {item.title}
                  </h3>

                  {/* Date, Time, Location, Guests */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-[12.5px] text-ink-faint">
                    <span className="inline-flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2 text-ink-faint/80">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{item.date}</span>
                      <span className="text-stone-dark">&bull;</span>
                      <span>{item.time}</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2 text-ink-faint/80">
                        <path d="M12 21c-4-4.5-7-8.5-7-12a7 7 0 1 1 14 0c0 3.5-3 7.5-7 12z" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                      <span>{item.location}</span>
                    </span>

                    {item.guests !== "—" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2 text-ink-faint/80">
                          <circle cx="12" cy="7" r="4" />
                          <path d="M5.5 21a6.5 6.5 0 0113 0" />
                        </svg>
                        <span>{item.guests}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Right Side: Status Badge, Three-Dots Menu, Price & Action */}
              <div className="flex items-center justify-between md:justify-end gap-5 sm:gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-0 border-stone/60">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                      item.statusTone === "green"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : item.statusTone === "amber"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {item.statusLabel}
                  </span>
                  <button
                    type="button"
                    aria-label="Options"
                    className="p-1 text-ink-faint hover:text-ink transition rounded-lg hover:bg-stone/40 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <circle cx="5" cy="12" r="1.75" />
                      <circle cx="12" cy="12" r="1.75" />
                      <circle cx="19" cy="12" r="1.75" />
                    </svg>
                  </button>
                </div>

                <p className="font-display font-medium text-base sm:text-lg text-ink leading-tight">
                  {item.price}
                </p>

                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 bg-[#2b0934] hover:bg-[#3d0d4a] text-white text-xs sm:text-[13px] font-semibold px-5 py-2.5 rounded-full transition-all duration-150 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>View Details</span>
                  <span className="text-sm">&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
