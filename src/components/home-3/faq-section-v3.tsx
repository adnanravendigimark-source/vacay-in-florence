"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";

const FAQS = [
  {
    question: "How do VACAY Florence skip-the-line tickets work?",
    answer:
      "When you book with VACAY Florence, you choose an exact designated entry timeslot. We issue an official direct-to-turnstile mobile pass. Simply present the QR code on your smartphone at the priority entrance (Door 3 at Uffizi, North Door for the Duomo Dome) to walk straight past the 2–3 hour general queue.",
  },
  {
    question: "What is your cancellation and refund policy?",
    answer:
      "All standard experiences and museum tickets on VACAY Florence include 100% free cancellation up to 24 hours prior to the scheduled start time. Cancellations are processed automatically with instant full refunds to your original payment method.",
  },
  {
    question: "What is the dress code for Brunelleschi's Duomo and Florence churches?",
    answer:
      "As active places of worship, the Duomo Cathedral, Baptistery, and Santa Croce strictly require covered shoulders and knees for all visitors. Sleeveless tops, short skirts, and tank tops are not permitted. We recommend bringing a light scarf or shawl in your daypack during summer visits.",
  },
  {
    question: "Do I need to print my tickets or vouchers?",
    answer:
      "No paper printing is necessary. All VACAY Florence vouchers and barcode tickets are 100% digital and mobile-compatible. You can scan them directly from your phone screen or add them to Apple Wallet / Google Wallet.",
  },
  {
    question: "Are child tickets or student discounts available?",
    answer:
      "Yes, discounted rates are available for children and infants on all our tours and museum entries. Select the appropriate age bracket during checkout. Please bring valid government photo ID or student ID for age verification at museum security gates.",
  },
  {
    question: "How far in advance should I book the Duomo Dome climb?",
    answer:
      "Brunelleschi's Dome has strict capacity limits of just 45 visitors per 30-minute window for structural preservation. Slots routinely sell out 2 to 4 weeks in advance during spring, summer, and autumn. We strongly recommend reserving your timeslots as soon as your travel dates are set.",
  },
];

export function FaqSectionV3() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#faf9f6] py-16 sm:py-24 border-b border-[#eae5d9]/80">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e5e0d8] px-3.5 py-1 text-xs font-semibold text-[#c85a32] mb-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32]" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Planning Your Florence Visit
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              Everything you need to know about skip-the-line access, entry rules, and mobile tickets.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-[#e5e0d8] overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-display text-base sm:text-lg font-semibold text-neutral-900 focus-visible:outline-none"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`w-7 h-7 rounded-full bg-[#faf9f6] border border-[#e5e0d8] flex items-center justify-center text-xs text-neutral-700 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-[#18181b] text-white" : ""
                      }`}
                    >
                      ↓
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-[#f3efe6]">
                      <p>{faq.answer}</p>
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
