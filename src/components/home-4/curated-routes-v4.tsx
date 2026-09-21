"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

interface RouteStep {
  time: string;
  title: string;
  description: string;
  badge: string;
  productSlug?: string;
}

const ITINERARIES = [
  {
    id: "express",
    title: "1-Day Express Highlights",
    subtitle: "Duomo Cupola & Uffizi Priority",
    duration: "Full Day (8 Hours)",
    steps: [
      {
        time: "09:00 AM",
        title: "Brunelleschi's Dome Climb & Terraces",
        description: "Beat the midday heat with early morning 463-step cupola climb and secret cathedral terraces.",
        badge: "Guaranteed Timeslot",
        productSlug: "duomo-and-brunelleschis-dome-climb",
      },
      {
        time: "01:00 PM",
        title: "Artisan Panini & Espresso in Piazza della Signoria",
        description: "Stroll by the Loggia dei Lanzi and relax before your afternoon gallery entrance.",
        badge: "Local Secret",
      },
      {
        time: "02:30 PM",
        title: "Uffizi Gallery Priority Access",
        description: "Direct barcode access to view Botticelli's Birth of Venus, Da Vinci, and Raphael.",
        badge: "Fast-Track Pass",
        productSlug: "uffizi-gallery-skip-the-line-ticket",
      },
      {
        time: "06:30 PM",
        title: "Piazzale Michelangelo Sunset Aperitivo",
        description: "Panoramic golden-hour views over the River Arno, Ponte Vecchio, and Duomo.",
        badge: "Scenic Highlight",
      },
    ],
  },
  {
    id: "food-wine",
    title: "Food & Wine Enthusiast",
    subtitle: "Market Walk, Pasta & Chianti Sunset",
    duration: "Full Day Experience",
    steps: [
      {
        time: "09:30 AM",
        title: "San Lorenzo Market Food Walk & Pasta Class",
        description: "Select market ingredients with a local Florentine chef, roll fresh tagliatelle & tiramisù.",
        badge: "Chef Masterclass",
        productSlug: "florentine-cooking-class-with-market-visit",
      },
      {
        time: "03:30 PM",
        title: "Scenic Chianti Hills & Vineyard Cellar Tour",
        description: "Sample reserve Sangiovese wines with artisanal pecorino and local olive oil.",
        badge: "Tuscan Cellars",
        productSlug: "chianti-countryside-and-wine-tasting-day-trip",
      },
      {
        time: "07:30 PM",
        title: "Traditional Sunset Castle Dinner",
        description: "Multi-course regional dinner among the rolling Tuscan vineyard hills.",
        badge: "Romantic Dinner",
      },
    ],
  },
  {
    id: "renaissance",
    title: "3-Day Renaissance Culture Pass",
    subtitle: "Duomo, David & Hidden Palaces",
    duration: "3-Day Explorer",
    steps: [
      {
        time: "Day 1",
        title: "Complete Duomo Complex & Crypt",
        description: "Cathedral, Baptistery of San Giovanni, Giotto's Campanile, and Opera del Duomo Museum.",
        badge: "Comprehensive Pass",
        productSlug: "duomo-and-brunelleschis-dome-climb",
      },
      {
        time: "Day 2",
        title: "Michelangelo's David at Accademia",
        description: "Morning priority entry to view the 17-foot original marble statue and unfinished Slaves.",
        badge: "Official Entry",
        productSlug: "accademia-gallery-michelangelos-david-ticket",
      },
      {
        time: "Day 3",
        title: "Uffizi Gallery & Oltrarno Artisan Walk",
        description: "World-class Renaissance masterworks followed by traditional leather ateliers across the Arno.",
        badge: "Fast-Track Pass",
        productSlug: "uffizi-gallery-skip-the-line-ticket",
      },
    ],
  },
];

export function CuratedRoutesV4() {
  const [activeTab, setActiveTab] = useState("express");

  const currentItinerary = ITINERARIES.find((i) => i.id === activeTab) || ITINERARIES[0];

  return (
    <section className="bg-[#fbfbfa] py-16 sm:py-24 border-b border-[#eae5d9]/60">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-[#183528]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#183528]">
                SMART TRIP PLANNER
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Curated Florence Itineraries
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 max-w-xl">
              Hour-by-hour routes crafted by local Florentines to maximize your time in the city.
            </p>
          </div>
        </div>

        {/* Itinerary Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          {ITINERARIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`p-4 rounded-2xl border text-left transition-all shrink-0 w-64 ${
                activeTab === item.id
                  ? "bg-white border-[#183528] shadow-sm ring-1 ring-[#183528]"
                  : "bg-white/60 hover:bg-white border-[#eae5d9]"
              }`}
            >
              <h4 className="font-display text-sm font-bold text-neutral-900">
                {item.title}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {item.subtitle}
              </p>
            </button>
          ))}
        </div>

        {/* Schedule Display */}
        <div className="mt-6 rounded-3xl bg-white border border-[#eae5d9] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#eae5d9] mb-6">
            <div>
              <h3 className="font-display text-xl font-semibold text-neutral-900">
                {currentItinerary.title}
              </h3>
              <span className="text-xs text-neutral-500 font-medium">
                {currentItinerary.duration}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {currentItinerary.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#faf9f6] border border-[#eae5d9]"
              >
                <div className="flex items-start gap-3.5">
                  <span className="px-2.5 py-1 rounded-full bg-white border border-[#d5d1c8] text-xs font-bold text-[#183528] shrink-0">
                    {step.time}
                  </span>
                  <div>
                    <h4 className="font-display text-sm font-semibold text-neutral-900">
                      {step.title}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>

                {step.productSlug && (
                  <Link
                    href={`/experiences/${step.productSlug}`}
                    className="px-4 py-2 rounded-full bg-[#183528] hover:bg-[#0e241a] text-white text-xs font-semibold uppercase tracking-wider shrink-0 transition-all self-start sm:self-center"
                  >
                    Book Slot &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
