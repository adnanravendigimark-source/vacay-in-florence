"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

interface ItineraryStep {
  time: string;
  title: string;
  desc: string;
  icon: string;
  badge: string;
  productSlug?: string;
  price?: string;
}

interface TravelPersona {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  totalTime: string;
  estCost: string;
  summary: string;
  steps: ItineraryStep[];
}

const PERSONAS: TravelPersona[] = [
  {
    id: "express-1day",
    label: "1-Day Must-See Express",
    subtitle: "Duomo, Uffizi & Sunset View",
    icon: "⚡",
    totalTime: "1 Full Day (8 Hours)",
    estCost: "From €88 / person",
    summary: "For travelers with limited time who want zero queue waiting and guaranteed entry to Florence's 2 crown jewels.",
    steps: [
      {
        time: "09:00 AM",
        title: "Brunelleschi's Dome Climb & Terraces",
        desc: "Beat the midday heat with early morning 463-step cupola climb and secret terraces.",
        icon: "🏛️",
        badge: "Guaranteed Timeslot",
        productSlug: "duomo-and-brunelleschis-dome-climb",
        price: "€49",
      },
      {
        time: "12:30 PM",
        title: "Tuscan Panini & Espresso in Piazza della Signoria",
        desc: "Relax at a historic café before your afternoon museum entrance.",
        icon: "☕",
        badge: "Insider Tip",
      },
      {
        time: "02:30 PM",
        title: "Uffizi Gallery Priority Access",
        desc: "Direct barcode entry to view Botticelli's Birth of Venus, Da Vinci, and Raphael.",
        icon: "🎨",
        badge: "Fast-Track Pass",
        productSlug: "uffizi-gallery-skip-the-line-ticket",
        price: "€39",
      },
      {
        time: "06:30 PM",
        title: "Piazzale Michelangelo Sunset Aperitivo",
        desc: "Take in the iconic golden-hour skyline overlooking the River Arno and Duomo.",
        icon: "🌅",
        badge: "Free Panorama",
      },
    ],
  },
  {
    id: "food-wine",
    label: "Wine & Culinary Lover",
    subtitle: "Chianti Hills & Cooking Class",
    icon: "🍷",
    totalTime: "Full Day Experience",
    estCost: "From €164 / person",
    summary: "Immerse your senses in Tuscan culinary heritage, hands-on pasta making, and sunlit vineyard cellars.",
    steps: [
      {
        time: "09:30 AM",
        title: "San Lorenzo Market Food Walk & Pasta Class",
        desc: "Browse fresh ingredients with a local Florentine chef, hand-roll fresh pasta and tiramisù.",
        icon: "🍝",
        badge: "Chef Masterclass",
        productSlug: "florentine-cooking-class-with-market-visit",
        price: "€79",
      },
      {
        time: "02:00 PM",
        title: "Scenic Ride to Chianti Classico Hills",
        desc: "Air-conditioned panoramic van through rolling vineyards and cypress alleys.",
        icon: "🚐",
        badge: "Included Transport",
      },
      {
        time: "04:30 PM",
        title: "Cellar Tasting & Tuscan Castle Dinner",
        desc: "Sample 6 reserve wines with pecorino, salami, and a multi-course dinner at sunset.",
        icon: "🏰",
        badge: "Wine Tasting & Dinner",
        productSlug: "chianti-countryside-and-wine-tasting-day-trip",
        price: "€85",
      },
    ],
  },
  {
    id: "deep-dive-3day",
    label: "3-Day Renaissance Deep Dive",
    subtitle: "Complete Art & Hidden Palaces",
    icon: "🎨",
    totalTime: "3 Full Days",
    estCost: "From €123 / person",
    summary: "The ultimate curated culture pass covering the Duomo complex, Accademia David, and Uffizi Gallery.",
    steps: [
      {
        time: "Day 1",
        title: "Duomo Complex, Baptistery & Crypt",
        desc: "Comprehensive cathedral experience including Giotto's Bell Tower and museum.",
        icon: "⛪",
        badge: "Skip The Line",
        productSlug: "duomo-and-brunelleschis-dome-climb",
        price: "€49",
      },
      {
        time: "Day 2",
        title: "Michelangelo's David at the Accademia",
        desc: "Direct morning entry to marvel at the original marble masterpiece and Slaves.",
        icon: "🗿",
        badge: "Priority Entry",
        productSlug: "accademia-gallery-michelangelos-david-ticket",
        price: "€35",
      },
      {
        time: "Day 3",
        title: "Uffizi Gallery & Oltrarno Artisan Walk",
        desc: "World-class Renaissance galleries followed by artisan leather workshops across Ponte Vecchio.",
        icon: "🖌️",
        badge: "Fast-Track Pass",
        productSlug: "uffizi-gallery-skip-the-line-ticket",
        price: "€39",
      },
    ],
  },
];

export function ItineraryBuilderV3() {
  const [selectedPersona, setSelectedPersona] = useState<string>("express-1day");

  const currentPersona = PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];

  return (
    <section className="bg-[#faf9f6] py-16 sm:py-24 border-b border-[#eae5d9]/80">
      <Container>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e5e0d8] px-3.5 py-1 text-xs font-semibold text-[#c85a32] mb-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32]" />
              <span>INTERACTIVE FLORENCE TRIP PLANNER</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Curate Your Perfect Florence Day
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              Select your travel style to preview an optimized hour-by-hour route with direct ticket booking links.
            </p>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {PERSONAS.map((persona) => {
            const isSelected = persona.id === selectedPersona;
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelectedPersona(persona.id)}
                className={`p-5 rounded-3xl text-left border transition-all duration-300 flex items-start gap-4 cursor-pointer ${
                  isSelected
                    ? "bg-white border-[#c85a32] shadow-[0_10px_30px_rgba(200,90,50,0.1)] ring-1 ring-[#c85a32]"
                    : "bg-white/60 hover:bg-white border-[#e5e0d8] shadow-sm"
                }`}
              >
                <span className="text-3xl p-2 rounded-2xl bg-[#faf9f6] border border-[#e5e0d8] shrink-0">
                  {persona.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-neutral-900 leading-snug">
                    {persona.label}
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    {persona.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Itinerary Schedule Card */}
        <div className="rounded-3xl bg-white border border-[#e5e0d8] p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#eae5d9] gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c85a32]">
                RECOMMENDED SCHEDULE
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-normal text-neutral-900 mt-1">
                {currentPersona.label}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                {currentPersona.summary}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="px-4 py-2 rounded-2xl bg-[#faf9f6] border border-[#e5e0d8] text-right">
                <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                  Duration
                </span>
                <span className="text-xs font-bold text-neutral-900">
                  {currentPersona.totalTime}
                </span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-[#faf9f6] border border-[#e5e0d8] text-right">
                <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                  Estimate
                </span>
                <span className="text-xs font-bold text-[#c85a32]">
                  {currentPersona.estCost}
                </span>
              </div>
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="space-y-6">
            {currentPersona.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#faf9f6] border border-[#eae5d9] hover:border-[#c85a32]/50 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e0d8] flex items-center justify-center text-xl shrink-0 shadow-sm">
                    {step.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-neutral-900">
                        {step.time}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-[#e5e0d8] text-neutral-700">
                        {step.badge}
                      </span>
                    </div>
                    <h4 className="font-display text-base font-semibold text-neutral-900">
                      {step.title}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {step.productSlug && (
                  <div className="flex items-center gap-3 sm:self-center shrink-0">
                    {step.price && (
                      <span className="text-sm font-bold text-neutral-900">
                        {step.price}
                      </span>
                    )}
                    <Link
                      href={`/experiences/${step.productSlug}`}
                      className="px-4 py-2 rounded-full bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
                    >
                      Book Ticket
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
