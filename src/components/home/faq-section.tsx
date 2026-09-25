"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import Link from "next/link";

interface FaqSectionProps {
  content?: {
    faqBadge?: string;
    faqTitle?: string;
    faqSubtitle?: string;
    faqItems?: { question: string; answer: string }[] | null;
  };
}

const DEFAULT_FAQS = [
  {
    question: "How do I receive my tickets after booking?",
    answer:
      "Your official barcode vouchers are emailed instantly and accessible in your digital wallet or VACAY account dashboard. Simply show your phone screen at the priority entry line.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "You can cancel any standard experience up to 24 hours before the scheduled start time for a 100% full refund with zero processing fees.",
  },
  {
    question: "Is there a dress code for Florentine churches like the Duomo?",
    answer:
      "Yes, shoulders and knees must be covered when entering the Santa Maria del Fiore Cathedral and crypts. Shawls and scarves are recommended.",
  },
  {
    question: "Are audio headsets provided on guided tours?",
    answer:
      "Yes, all small-group tours include sanitized personal wireless headsets so you can hear your expert guide clearly without crowding.",
  },
];

export function FaqSection({ content }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const badge = content?.faqBadge || "HELPFUL INFORMATION";
  const title = content?.faqTitle || "Frequently Asked Questions";
  const subtitle =
    content?.faqSubtitle ||
    "Everything you need to know about tickets, meeting points, dress codes, and cancellations.";
  const faqs = content?.faqItems && content.faqItems.length > 0 ? content.faqItems : DEFAULT_FAQS;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="bg-white py-18 sm:py-24 border-b border-neutral-200/80">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Heading & Support Card */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2b0934]/10 px-3 py-1 text-xs font-semibold text-[#2b0934] mb-3">
              <span>{badge}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-medium tracking-tight text-neutral-900 leading-tight">
              {title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              {subtitle}
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2b0934] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3d0d4a] transition-all"
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
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? "border-[#2b0934] bg-purple-50/20 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"
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
                        isOpen ? "rotate-45 bg-[#2b0934] text-white" : ""
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
