"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import Link from "next/link";

const SAMPLE_PASSES = [
  {
    id: "uffizi",
    title: "Galleria degli Uffizi",
    type: "Priority Skip-The-Line Pass",
    time: "10:30 AM Entry",
    date: "Today &bull; Confirmed",
    gate: "Fast-Track Door #3",
    code: "UFF-8492-VIP",
    color: "from-[#2b0934] to-[#3d0d4a]",
    slug: "uffizi-gallery-skip-the-line-ticket",
    price: "€29",
  },
  {
    id: "duomo",
    title: "Duomo Dome Climb",
    type: "Brunelleschi Cupola Pass",
    time: "09:00 AM Entry",
    date: "Tomorrow &bull; Confirmed",
    gate: "Porta dei Canonici",
    code: "DUO-5719-VIP",
    color: "from-[#8b321a] to-[#5a1c0d]",
    slug: "duomo-and-brunelleschis-dome-climb",
    price: "€45",
  },
  {
    id: "accademia",
    title: "Accademia (David)",
    type: "Timed Fast-Track Ticket",
    time: "02:00 PM Entry",
    date: "Confirmed Slot",
    gate: "Priority Gate B",
    code: "ACC-3194-VIP",
    color: "from-[#1f2937] to-[#111827]",
    slug: "accademia-gallery-michelangelos-david-ticket",
    price: "€24",
  },
];

export function MobileTicketShowcase() {
  const [selectedPass, setSelectedPass] = useState(SAMPLE_PASSES[0]);

  return (
    <section className="bg-cream text-ink py-18 sm:py-24 overflow-hidden relative border-b border-stone">
      {/* Glow Backdrops */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-cypress-light/60 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[350px] w-[350px] rounded-full bg-gold-light/60 blur-[100px] pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-cypress-light px-3.5 py-1 text-xs font-semibold text-cypress mb-4 self-start">
              <span className="h-1.5 w-1.5 rounded-full bg-cypress animate-ping" />
              <span>INSTANT DIGITAL WALLET VOUCHERS</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ink leading-[1.12]">
              No Printing. No Lines.<br />
              <span className="text-gold italic font-light">Scan &amp; Walk Right In.</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-ink-soft leading-relaxed max-w-lg">
              Every booking instantly generates an official digital fast-pass for your Apple Wallet or Google Wallet. Simply hold your phone to the scanner at the monument gate and bypass hundreds waiting in line.
            </p>

            {/* Interactive Pass Selector Buttons */}
            <div className="mt-8 flex flex-wrap gap-2.5">
              {SAMPLE_PASSES.map((pass) => {
                const isSelected = selectedPass.id === pass.id;
                return (
                  <button
                    key={pass.id}
                    type="button"
                    onClick={() => setSelectedPass(pass)}
                    className={`rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-cypress text-white shadow-lg scale-105 ring-2 ring-cypress ring-offset-2 ring-offset-cream"
                        : "bg-stone text-ink-soft hover:bg-stone-dark hover:text-ink"
                    }`}
                  >
                    {pass.title}
                  </button>
                );
              })}
            </div>

            {/* 3 Step Micro-Guide */}
            <div className="mt-10 grid grid-cols-3 gap-4 pt-6 border-t border-stone text-xs">
              <div>
                <div className="text-cypress font-bold mb-1">01. Book Online</div>
                <div className="text-ink-faint text-[11px] leading-normal">
                  Reserve your timeslot in 30 seconds.
                </div>
              </div>
              <div>
                <div className="text-cypress font-bold mb-1">02. Instant Pass</div>
                <div className="text-ink-faint text-[11px] leading-normal">
                  Barcode sent to email &amp; Apple Wallet.
                </div>
              </div>
              <div>
                <div className="text-cypress font-bold mb-1">03. Fast Entry</div>
                <div className="text-ink-faint text-[11px] leading-normal">
                  Scan at priority door &amp; enter directly.
                </div>
              </div>
            </div>
          </div>

          {/* Right Mobile Phone Pass Visualizer */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm rounded-[40px] bg-neutral-950 p-4 shadow-2xl border-[6px] border-neutral-800 ring-1 ring-black/10">
              {/* Phone Speaker Notch */}
              <div className="mx-auto h-4 w-28 rounded-full bg-neutral-900 mb-4 flex items-center justify-center">
                <div className="h-1.5 w-10 rounded-full bg-neutral-800" />
              </div>

              {/* Digital Pass Card */}
              <div
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${selectedPass.color} p-6 text-white shadow-xl transition-all duration-500`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                      VACAY OFFICIAL PASS
                    </span>
                    <h3 className="text-lg font-bold font-display text-white mt-0.5">
                      {selectedPass.title}
                    </h3>
                  </div>
                  <div className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-bold">
                    {selectedPass.price}
                  </div>
                </div>

                {/* Body Details */}
                <div className="my-5 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-white/60 block text-[10px] uppercase">Access Type</span>
                    <span className="font-bold text-emerald-300">{selectedPass.type}</span>
                  </div>
                  <div>
                    <span className="text-white/60 block text-[10px] uppercase">Entry Door</span>
                    <span className="font-bold text-white">{selectedPass.gate}</span>
                  </div>
                  <div>
                    <span className="text-white/60 block text-[10px] uppercase">Timeslot</span>
                    <span className="font-bold text-white">{selectedPass.time}</span>
                  </div>
                  <div>
                    <span className="text-white/60 block text-[10px] uppercase">Status</span>
                    <span className="font-bold text-emerald-400">✓ Verified &amp; Active</span>
                  </div>
                </div>

                {/* Perforated Divider */}
                <div className="relative my-4 flex items-center justify-between -mx-6">
                  <div className="h-4 w-4 rounded-r-full bg-neutral-950" />
                  <div className="flex-1 border-t-2 border-dashed border-white/20 mx-2" />
                  <div className="h-4 w-4 rounded-l-full bg-neutral-950" />
                </div>

                {/* Simulated Barcode / QR */}
                <div className="flex flex-col items-center pt-2">
                  <div className="flex h-16 w-full items-center justify-center gap-1 rounded-xl bg-white p-2">
                    {/* Visual Barcode Lines */}
                    {[4, 2, 6, 3, 1, 5, 2, 4, 3, 6, 2, 5, 1, 4, 3, 5, 2, 6, 4, 2, 5, 3, 2, 4, 6].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="bg-black"
                          style={{
                            width: `${(i % 3) + 2}px`,
                            height: "100%",
                          }}
                        />
                      )
                    )}
                  </div>
                  <span className="mt-2 text-[11px] font-mono tracking-widest text-white/80">
                    {selectedPass.code}
                  </span>
                </div>

                {/* Action Link */}
                <div className="mt-4 pt-3 border-t border-white/10 text-center">
                  <Link
                    href={`/experiences/${selectedPass.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-emerald-300 transition-colors"
                  >
                    <span>Reserve this ticket now</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
