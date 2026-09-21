"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";

const FAQS = [
  {
    q: "How do VACAY Florence skip-the-line tickets work?",
    a: "You select a guaranteed entrance timeslot. We generate your official digital voucher with a direct-to-turnstile barcode. Present it on your phone at the priority security lane to walk straight in without waiting in general admission lines.",
  },
  {
    q: "What is the cancellation policy for tickets and tours?",
    a: "All standard experiences on VACAY Florence include 100% free cancellation up to 24 hours before your activity starts for a full, automatic refund.",
  },
  {
    q: "Is there a dress code for entering the Duomo and Florentine churches?",
    a: "Yes, covered shoulders and knees are strictly enforced at Brunelleschi's Duomo, the Baptistery, and Santa Croce. Sleeveless shirts and short skirts are not allowed.",
  },
  {
    q: "Do I need to print my tickets?",
    a: "No printing needed! All passes and booking vouchers are 100% electronic and can be scanned directly from your mobile screen or Apple/Google Wallet.",
  },
];

export function FlorenceFaqV4() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#fbfbfa] py-16 sm:py-24 border-b border-[#eae5d9]/60">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-[#183528]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#183528]">
                NEED TO KNOW
              </span>
              <span className="w-5 h-[1.5px] bg-[#183528]" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Frequently Asked Questions
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-neutral-600">
              Essential tips on skip-the-line passes, cathedral dress codes, and cancellations.
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-[#eae5d9] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-display text-sm sm:text-base font-semibold text-neutral-900"
                  >
                    <span>{faq.q}</span>
                    <span className="w-6 h-6 rounded-full bg-[#f4f3ef] flex items-center justify-center text-xs text-neutral-700 shrink-0">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-[#f4f3ef]">
                      {faq.a}
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
