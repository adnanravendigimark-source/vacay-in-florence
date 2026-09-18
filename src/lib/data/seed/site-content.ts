import type { HomepageContent } from "@/lib/types";

/**
 * Placeholder for the `cms_blocks` row keyed "homepage" that the Master
 * Admin will edit directly (hero copy, trust-section blurbs, CTA text).
 * Swapped for `prisma.cmsBlock.findUnique({ where: { key: "homepage" } })`
 * once Neon is connected — see src/lib/data/site-content.ts.
 */
export const homepageContent: HomepageContent = {
  hero: {
    eyebrow: "Florence, Italy",
    headline: "Florence, without the guesswork.",
    subheadline:
      "Skip-the-line tickets, small-group tours, and day trips — booked in minutes, confirmed instantly, and backed by free cancellation.",
    primaryCta: { label: "Browse experiences", href: "/experiences" },
    secondaryCta: { label: "How booking works", href: "/how-it-works" },
    stats: [
      { label: "Travelers booked", value: "250,000+" },
      { label: "Average rating", value: "4.8 / 5" },
      { label: "Free cancellation", value: "Up to 24h before" },
    ],
  },
  trust: {
    heading: "Why book with VACAY Florence",
    subheading:
      "We vet every listing and every supplier, so what you see here is what you get in Florence.",
    highlights: [
      {
        id: "trust_reviews",
        title: "Verified reviews only",
        description: "Every review comes from a completed, confirmed booking — no exceptions.",
        icon: "star",
      },
      {
        id: "trust_confirmation",
        title: "Instant confirmation",
        description: "Most tickets and tours confirm immediately, so you can plan the rest of your day.",
        icon: "clock",
      },
      {
        id: "trust_curation",
        title: "Handpicked experiences",
        description: "Every listing is vetted for quality before it goes live — not just anyone can list.",
        icon: "shield",
      },
      {
        id: "trust_support",
        title: "Local support, always on",
        description: "Real help in English and Italian if a booking needs to change.",
        icon: "support",
      },
      {
        id: "trust_cancellation",
        title: "Free cancellation",
        description: "Most experiences can be cancelled up to 24 hours ahead, no questions asked.",
        icon: "confirmation",
      },
    ],
  },
  cta: {
    heading: "Ready to see Florence properly?",
    subheading:
      "Browse skip-the-line tickets and guided experiences curated for first-time visitors and locals alike.",
    primaryCta: { label: "Explore all experiences", href: "/experiences" },
  },
};

import type { AboutPageContent, LegalPageContent } from "@/lib/types";

export const aboutPageContent: AboutPageContent = {
  hero: {
    eyebrow: "About VACAY Florence",
    headline: "Built by people who actually live here.",
    subheadline:
      "We got tired of booking tours abroad and discovering, on arrival, that the queue was still two hours long or the guide barely spoke the language advertised. So we built the site we wished existed.",
  },
  story: {
    heading: "Why we started VACAY Florence",
    paragraphs: [
      "VACAY Florence started as a spreadsheet — a shared list of the tours, tickets, and guides our own friends and family actually trusted when they visited, next to a much longer list of the ones to avoid. Florence is a small city with an enormous amount of half-honest tourism marketing pointed at it, and untangling the two took real, local legwork.",
      "We turned that spreadsheet into a marketplace with one rule that hasn't changed since: nothing goes live until someone on our team has actually taken the tour, used the ticket, or sat down with the supplier in person. That's slower than just listing whatever affiliate feed comes through, and it's why our catalog is smaller than the big aggregators' — on purpose.",
      "We're a small, Florence-based team. When a listing needs updating because a museum changed its hours, or a guide retires, or a supplier stops being reliable, we're a short walk away, not a support ticket into a call center on another continent.",
    ],
  },
  values: [
    {
      id: "curation",
      title: "Curation over volume",
      description:
        "Every experience on this site was vetted in person before it went live. We'd rather list 120 things we'd send our own family to than 1,200 we've only read about.",
    },
    {
      id: "honest-availability",
      title: "Honest availability",
      description:
        "If a date is nearly sold out, we show that instead of a vague \"limited spots\" banner. What you see at checkout is what the supplier actually has open.",
    },
    {
      id: "local-partnerships",
      title: "Real local partnerships",
      description:
        "We work directly with independent Florence guides, family-run tour operators, and museum access partners — not a resale layer on top of someone else's inventory.",
    },
    {
      id: "support",
      title: "Support from people, not scripts",
      description:
        "If a booking needs to change, you reach a small local team that knows the city, in English or Italian.",
    },
  ],
  stats: [
    { label: "Experiences curated", value: "120+" },
    { label: "Local suppliers partnered", value: "40+" },
    { label: "Team based in", value: "Florence, Italy" },
    { label: "Average rating", value: "4.8 / 5" },
  ],
};

const legalIntro =
  "VACAY Florence (\"we\", \"us\") operates vacayinflorence.com, a marketplace for skip-the-line tickets, guided tours, and day trips in and around Florence, Italy.";

export const privacyPolicyContent: LegalPageContent = {
  title: "Privacy Policy",
  effectiveDate: "September 1, 2026",
  intro: `${legalIntro} This policy explains what information we collect when you use the site, why we collect it, and the choices you have.`,
  sections: [
    {
      heading: "Information we collect",
      body: [
        "Account information: your name, email address, and password (stored as a salted hash, never in plain text) when you register for an account.",
        "Booking information: the experiences, dates, and participant counts you book, plus the contact details you provide at checkout (name, email, phone number).",
        "Contact and application details: anything you submit through our contact form, supplier application, or affiliate application forms — name, email, and the message or business details you choose to share.",
        "Technical information: standard server logs (IP address, browser type, pages visited) collected automatically to keep the site secure and working.",
      ],
    },
    {
      heading: "How we use your information",
      body: [
        "To create and manage your account, and to process and manage your bookings with our supplier partners.",
        "To communicate with you about a booking, an application you've submitted, or a support request.",
        "To keep the platform secure, prevent abuse, and meet our legal obligations.",
        "We do not sell your personal information to third parties.",
      ],
    },
    {
      heading: "Who we share it with",
      body: [
        "The specific supplier for an experience you book, limited to what they need to honor the booking (name, participant count, date).",
        "Service providers who help us run the platform (hosting and database providers), bound to only use your data to provide that service.",
        "Authorities, only where required by law.",
      ],
    },
    {
      heading: "Your choices",
      body: [
        "You can review and update your name and email at any time from your account's Profile page, and change your password from Security.",
        "You can ask us to delete your account and associated personal data by contacting us through the Contact page; we'll retain records of past bookings only as long as legally required.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "Questions about this policy or your data can be sent through our Contact page.",
      ],
    },
  ],
};

export const termsContent: LegalPageContent = {
  title: "Terms & Conditions",
  effectiveDate: "September 1, 2026",
  intro: `${legalIntro} By creating an account or making a booking on our site, you agree to these terms.`,
  sections: [
    {
      heading: "What we are",
      body: [
        "VACAY Florence is a booking marketplace: we connect travelers with independent, vetted local suppliers (tour operators, ticket providers, and guides). The experience itself is delivered by the supplier, not by us directly.",
      ],
    },
    {
      heading: "Bookings and payment",
      body: [
        "When you complete checkout, we create a booking and re-confirm availability with the supplier's inventory in real time.",
        "Payment processing is not yet connected on this site. Orders are created in a \"pending payment\" state and are not confirmed bookings until payment is taken and the order is marked confirmed — this is stated clearly at checkout and on your booking confirmation page.",
        "Prices are shown in EUR and include any fees disclosed at checkout; they do not include items explicitly marked as excluded on the experience's listing (for example, gratuities or hotel transfers unless stated).",
      ],
    },
    {
      heading: "Cancellations and changes",
      body: [
        "Cancellation terms vary by experience and are shown on each listing before you book — see also our Cancellation & Refund Policy.",
        "We reserve the right to cancel a booking and issue a full refund if a supplier is unable to honor it (for example, an unexpected closure).",
      ],
    },
    {
      heading: "Your responsibilities",
      body: [
        "Provide accurate information at booking (names, contact details, participant counts) — suppliers may deny entry if it doesn't match what was booked.",
        "Arrive on time and follow the meeting point and requirements listed on your experience — most tours cannot wait for late arrivals.",
      ],
    },
    {
      heading: "Liability",
      body: [
        "Experiences are delivered by independent third-party suppliers. VACAY Florence facilitates the booking but is not the operator of the experience, and our liability is limited to the amount paid for the affected booking, to the extent permitted by law.",
      ],
    },
    {
      heading: "Changes to these terms",
      body: [
        "We may update these terms from time to time; the effective date above reflects the latest version. Continued use of the site after a change constitutes acceptance of the updated terms.",
      ],
    },
  ],
};

export const cancellationPolicyContent: LegalPageContent = {
  title: "Cancellation & Refund Policy",
  effectiveDate: "September 1, 2026",
  intro:
    "Cancellation windows vary by experience — always check the specific policy shown on the listing you're booking, which takes precedence over the general guidance below.",
  sections: [
    {
      heading: "General policy",
      body: [
        "Most experiences on VACAY Florence offer free cancellation up to 24 hours before the scheduled start time, for a full refund.",
        "Some time-sensitive or small-group experiences (for example, private guided tours or experiences with strict museum entry slots) may carry a shorter or non-refundable window — this is always stated on the experience page and in your booking confirmation before you complete checkout.",
      ],
    },
    {
      heading: "How to cancel",
      body: [
        "Cancellation requests are handled by contacting us through the Contact page with your booking reference, or from your account's Bookings page once cancellation self-service is available there.",
        "Refunds are issued to the original payment method once payment processing is connected on this site (see our Terms & Conditions for the current status of payment on the platform).",
      ],
    },
    {
      heading: "Late arrivals and no-shows",
      body: [
        "Most experiences cannot wait for a late arrival due to fixed entry slots or group schedules. Arriving after the stated meeting time is generally treated as a no-show and is not eligible for a refund, except where the listing states otherwise.",
      ],
    },
    {
      heading: "Weather and supplier cancellations",
      body: [
        "If a supplier cancels an experience (for example, due to weather on an outdoor tour), you'll be offered a full refund or the option to reschedule, at no additional cost.",
      ],
    },
  ],
};
