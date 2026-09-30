"use client";

import { useState } from "react";

// Single-column FAQ accordion for the public experience detail page.
// Deliberately its own small client component (rather than inline in the
// server-rendered page) since it's the one part of the FAQ section that
// needs interactivity — mirrors the homepage's FaqSection accordion
// styling (src/components/home/faq-section.tsx) for a consistent look,
// without that component's two-column "contact support" layout, which
// doesn't belong on a single experience's page.
export function ExperienceFaqAccordion({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen ? "border-[#9e0ca0] bg-[#fdf2fe]/50 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm sm:text-base font-semibold text-neutral-900 cursor-pointer"
            >
              <span>{faq.question}</span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-700 transition-transform duration-200 ${
                  isOpen ? "rotate-45 bg-[#9e0ca0] text-white" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-neutral-100/80 px-5 pb-5 pt-3 text-xs sm:text-sm leading-relaxed text-neutral-600">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
