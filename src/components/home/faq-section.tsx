"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import Link from "next/link";

const FAQS = [
  {
    question: "How do skip-the-line tickets work in Florence?",
    answer:
      "When you book with VACAY Florence, you receive a confirmed timed-entry slot. On the day of your visit, head directly to the designated Fast-Track / Priority Entry door at the monument (e.g. Door #3 at the Uffizi or the Porta dei Canonici at the Duomo) and show the QR barcode on your phone for instant gate scanning.",
  },
  {
    question: "When and how do I receive my tickets?",
    answer:
      "Your official vouchers and mobile barcodes are sent instantly to your email upon checkout confirmation. You can also access them anytime from your VACAY Account page or save them directly to your Apple Wallet / Google Wallet.",
  },
  {
    question: "What is your cancellation and refund policy?",
    answer:
      "Every single experience and ticket on VACAY Florence includes 100% Free Cancellation up to 24 hours prior to your booked start time. If your travel plans change, you can cancel with one click from your account for a full immediate refund.",
  },
  {
    question: "Is there a dress code for Florence churches (Duomo, Santa Croce)?",
    answer:
      "Yes. Active places of worship in Florence require knees and shoulders to be covered for both men and women. Shorts and skirts must reach below the knee, and sleeveless tops are not permitted. Light scarves or shawls can be draped over shoulders.",
  },
  {
    question: "Can I book for today or tomorrow?",
    answer:
      "Yes! Same-day and next-day availability is updated in real time. We recommend booking early for high-demand sights like Brunelleschi's Dome Climb and Michelangelo's David, which frequently sell out days in advance during peak season.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="bg-white py-18 sm:py-24 border-b border-neutral-200/80">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Heading & Support Card */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#183528]/10 px-3 py-1 text-xs font-semibold text-[#183528] mb-3">
              <span>TRAVELER SUPPORT &amp; HELP</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-neutral-900 leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              Everything you need to know about booking official entrance tickets, entry procedures, and local Florence travel guidelines.
            </p>

            {/* Need More Help Card */}
            <div className="mt-8 rounded-3xl bg-[#faf9f7] border border-neutral-200 p-6">
              <h3 className="text-base font-bold text-neutral-900">Have a specific question?</h3>
              <p className="mt-1 text-xs text-neutral-600">
                Our local Florence support team is available 7 days a week to help with your booking.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#183528] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0e241a] transition-all"
                >
                  <span>Contact Support</span>
                  <span>&rarr;</span>
                </Link>
                <Link
                  href="/experiences"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-all"
                >
                  <span>Search Catalog</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: FAQ Accordion */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? "border-[#183528] bg-emerald-50/20 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="flex w-full items-center justify-between p-5 text-left font-semibold text-neutral-900 cursor-pointer text-sm sm:text-base gap-4"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 text-sm font-bold transition-transform duration-200 ${
                        isOpen ? "rotate-45 bg-[#183528] text-white" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100/80 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
