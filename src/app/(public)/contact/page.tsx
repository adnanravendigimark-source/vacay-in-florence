import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the VACAY Florence team — booking questions, changes, or anything else.",
  alternates: { canonical: "/contact" },
};

const CONTACT_EMAIL = "livetravelpartner@gmail.com";

const INFO_CARDS = [
  {
    title: "Booking Help",
    description:
      "Not sure whether to book the Uffizi skip-the-line ticket, a Chianti wine day trip, or a guided walking tour? Ask us before you book.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
        <path
          d="M4 13a8 8 0 0 1 16 0M4 13v4a2 2 0 0 0 2 2h1v-6H5a1 1 0 0 0-1 1Zm16 0v4a2 2 0 0 1-2 2h-1v-6h1a1 1 0 0 1 1 1Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Partnerships & Affiliates",
    description:
      "Tour operators, local guides, and affiliate partners — reach out about listing your experiences or collaboration opportunities.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
        <rect x="3" y="7" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "General Inquiries",
    description: "Site feedback, content corrections, or travel tips regarding Florence experiences.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
        <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="bg-cream-deep/40 py-14 sm:py-20">
      <Container className="max-w-3xl">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center rounded-full border border-terracotta/30 bg-terracotta-light px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-terracotta">
            Contact
          </span>
          <h1 className="mt-4 font-display text-3xl font-medium text-ink sm:text-4xl">Get in Touch</h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-ink-soft">
            Questions about a Florence tour or ticket — or a partnership inquiry? Reach out directly by email.
          </p>
        </div>

        {/* Email card */}
        <div className="mt-10 rounded-3xl bg-gradient-to-br from-cream-deep to-white p-8 text-center shadow-[var(--shadow-card)] ring-1 ring-stone/60 sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2b0934] shadow-md">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-white stroke-[1.8]">
              <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">Email us directly</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-1 inline-block text-xl font-bold text-terracotta transition-colors hover:text-terracotta-dark sm:text-2xl"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mt-3 text-sm text-ink-soft">We typically reply within 1–2 business days.</p>
        </div>

        {/* Info cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {INFO_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-stone/60"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta-light text-terracotta">
                {card.icon}
              </div>
              <h3 className="mt-3 text-sm font-bold text-ink">{card.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Existing booking note */}
        <div className="mt-10 border-t border-stone pt-8 text-center">
          <p className="text-sm text-ink-soft">
            Already have a booking? Contact your tour operator directly via your confirmation email — they handle
            modifications and cancellations directly.
          </p>
        </div>

        {/* Not booked yet CTA */}
        <div className="relative mt-8 overflow-hidden rounded-3xl bg-[#2b0934] p-8 text-center shadow-xl sm:p-10">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-56 w-56 rounded-full bg-[#a813c9]/25 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-white">Not booked yet?</p>
            <Link
              href="/experiences"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-terracotta to-[#2b0934] px-6 py-3.5 text-xs font-semibold text-white shadow-md transition-all hover:scale-105 sm:text-sm"
            >
              <span>Compare Florence Tours &amp; Tickets</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
