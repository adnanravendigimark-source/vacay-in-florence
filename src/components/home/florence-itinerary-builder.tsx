"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

type ItineraryStep = {
  time: string;
  title: string;
  description: string;
  tag: string;
  href?: string;
  actionText?: string;
  image: string;
};

type ItineraryPlan = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  steps: ItineraryStep[];
};

const PLANS: ItineraryPlan[] = [
  {
    id: "1-day",
    title: "24 Hours: The Florence Express",
    subtitle: "See the absolute iconic highlights without wasting hours in lines.",
    badge: "⚡ Most Popular for Short Stays",
    steps: [
      {
        time: "08:30 AM",
        title: "Duomo & Brunelleschi's Dome Climb",
        description: "Beat the midday heat by climbing 463 steps to the cupola before the crowds arrive.",
        tag: "Priority Entry",
        href: "/experiences/duomo-and-brunelleschis-dome-climb",
        actionText: "Book Dome Ticket (€45)",
        image: "/images/duomo-tour.jpg",
      },
      {
        time: "12:00 PM",
        title: "Florentine Food Market & Fresh Pasta",
        description: "Head to San Lorenzo Market for authentic panino al lampredotto or fresh handmade pasta with Chianti.",
        tag: "Culinary Stop",
        href: "/experiences/florentine-cooking-class-with-market-visit",
        actionText: "Explore Cooking Class (€69)",
        image: "/images/italian-cooking.jpg",
      },
      {
        time: "02:30 PM",
        title: "Uffizi Gallery Fast-Track Tour",
        description: "Marvel at Botticelli's Birth of Venus and Renaissance masterpieces with zero queue time.",
        tag: "Skip The Line",
        href: "/experiences/uffizi-gallery-skip-the-line-ticket",
        actionText: "Book Uffizi Ticket (€29)",
        image: "/images/uffizi-corridor.jpg",
      },
      {
        time: "06:30 PM",
        title: "Sunset over Ponte Vecchio & Piazzale Michelangelo",
        description: "Watch the golden sun reflect over the Arno river with a glass of prosecco and artisan gelato.",
        tag: "Scenic Sunset",
        href: "/experiences/arno-river-sunset-bike-tour",
        actionText: "Sunset Bike Tour (€35)",
        image: "/images/ponte-vecchio.jpg",
      },
    ],
  },
  {
    id: "2-days",
    title: "48 Hours: The Classic Renaissance",
    subtitle: "The definitive Florence trip balancing art, food, palaces, and scenic views.",
    badge: "⭐ Recommended by Locals",
    steps: [
      {
        time: "Day 1 - Morning",
        title: "Accademia Gallery & Michelangelo's David",
        description: "Stand under the grand skylight in front of the world's most famous statue of David.",
        tag: "Must See",
        href: "/experiences/accademia-gallery-michelangelos-david-ticket",
        actionText: "David Ticket (€24)",
        image: "/images/uffizi-corridor.jpg",
      },
      {
        time: "Day 1 - Afternoon",
        title: "Old Town Walking Tour & Hidden Alleys",
        description: "Discover Piazza della Signoria, Dante's Quarter, and Medici secrets with a native Florentine.",
        tag: "Local Guide",
        href: "/experiences/florence-old-town-walking-tour-with-local-guide",
        actionText: "Walking Tour (€32)",
        image: "/images/ponte-vecchio.jpg",
      },
      {
        time: "Day 2 - Morning",
        title: "Pitti Palace & Boboli Gardens Stroll",
        description: "Cross the Ponte Santa Trinita into Oltrarno to explore the monumental royal Medici gardens.",
        tag: "Royal Gardens",
        href: "/experiences/boboli-gardens-and-pitti-palace-entry",
        actionText: "Palace Ticket (€22)",
        image: "/images/pitti-palace.jpg",
      },
      {
        time: "Day 2 - Afternoon",
        title: "Afternoon Tuscan Wine Tasting & Dinner",
        description: "Indulge in a 3-course Tuscan tasting menu paired with Chianti Classico DOCG wines.",
        tag: "Wine & Dine",
        href: "/experiences/chianti-countryside-and-wine-tasting-day-trip",
        actionText: "Wine Tour (€89)",
        image: "/images/chianti-hills.jpg",
      },
    ],
  },
  {
    id: "3-days",
    title: "72 Hours: Florence & Tuscan Hills",
    subtitle: "Immersion in Florence's deep history followed by a day trip to medieval Tuscan hill towns.",
    badge: "🍷 The Ultimate Tuscan Escape",
    steps: [
      {
        time: "Days 1 & 2",
        title: "Complete Florence Art & Heritage Pass",
        description: "Cover the Duomo Dome, Uffizi Gallery, Accademia, and Oltrarno at a relaxed, luxurious pace.",
        tag: "City Highlights",
        href: "/experiences",
        actionText: "View City Passes",
        image: "/images/duomo-tour.jpg",
      },
      {
        time: "Day 3 - Full Day",
        title: "Tuscany Full-Day: San Gimignano, Siena & Pisa",
        description: "Ride through cypress-lined hills, explore medieval towers in San Gimignano, and visit the Leaning Tower of Pisa.",
        tag: "Full Day Trip",
        href: "/experiences/tuscany-full-day-tour-san-gimignano-siena-pisa",
        actionText: "Book Tuscany Tour (€79)",
        image: "/images/chianti-hills.jpg",
      },
    ],
  },
];

export function FlorenceItineraryBuilder() {
  const [selectedPlanId, setSelectedPlanId] = useState("1-day");
  const currentPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[0];

  return (
    <section className="bg-white py-18 sm:py-24 border-b border-neutral-200/80">
      <Container>
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#183528]/10 px-3.5 py-1 text-xs font-semibold text-[#183528] mb-3">
            <span>INTERACTIVE FLORENCE TRIP PLANNER</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-neutral-900 leading-[1.15]">
            Plan Your Florence Days in Minutes
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
            Select your stay duration to see curated schedules with fast-track entry timeslots perfectly timed to avoid peak lines.
          </p>

          {/* Plan Duration Switcher */}
          <div className="inline-flex p-1.5 rounded-full bg-neutral-100 border border-neutral-200 mt-8 shadow-inner">
            {PLANS.map((plan) => {
              const active = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${active
                      ? "bg-[#183528] text-white shadow-md scale-100"
                      : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/60"
                    }`}
                >
                  {plan.id === "1-day" ? "1 Day (Express)" : plan.id === "2-days" ? "2 Days (Classic)" : "3 Days (Tuscany Hills)"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plan Header Card */}
        <div className="rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              {currentPlan.badge}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display">{currentPlan.title}</h3>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">{currentPlan.subtitle}</p>
          </div>
          <Link
            href="/experiences"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-neutral-900 shadow-md hover:bg-neutral-100 transition-transform active:scale-95 shrink-0"
          >
            <span>Explore All Included Tickets</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentPlan.steps.map((step, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col rounded-3xl bg-[#faf9f7] border border-neutral-200/90 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:bg-white hover:-translate-y-1"
            >
              {/* Step Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-200">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-3 left-3 rounded-full bg-neutral-900/85 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-bold text-white">
                  {step.time}
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-bold text-[#183528]">
                  {step.tag}
                </span>
              </div>

              {/* Step Content */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h4 className="text-base font-bold text-neutral-900 leading-snug group-hover:text-[#183528] transition-colors">
                    {step.title}
                  </h4>
                  <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {step.href && step.actionText && (
                  <div className="mt-4 pt-3 border-t border-neutral-200/70">
                    <Link
                      href={step.href}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#183528] py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#0e241a]"
                    >
                      <span>{step.actionText}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
