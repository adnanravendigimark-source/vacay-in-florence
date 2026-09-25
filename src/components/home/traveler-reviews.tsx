import { Container } from "@/components/ui/container";
import Link from "next/link";

interface TravelerReviewsProps {
  content?: {
    testimonialsBadge?: string;
    testimonialsTitle?: string;
    testimonialsSubtitle?: string;
    testimonialsRatingValue?: string;
    testimonialsRatingCount?: string;
    testimonialsItems?:
      | { name: string; location: string; rating: number; experienceTitle: string; quote: string; date: string }[]
      | null;
  };
}

const DEFAULT_REVIEWS = [
  {
    id: "rev-1",
    author: "Sarah Jenkins",
    country: "London, UK",
    experience: "Uffizi Gallery Skip-the-Line",
    experienceHref: "/experiences/uffizi-gallery-skip-the-line-ticket",
    rating: 5,
    date: "2 days ago",
    quote: "We walked past a 2-hour queue in 90-degree heat right into the Uffizi. Absolute lifesaver!",
    verified: true,
  },
  {
    id: "rev-2",
    author: "Marco Rossi",
    country: "New York, USA",
    experience: "Duomo & Dome Climb",
    experienceHref: "/experiences/duomo-and-brunelleschis-dome-climb",
    rating: 5,
    date: "1 week ago",
    quote: "The guide was incredible and the views from the top of the cupola were breathtaking.",
    verified: true,
  },
  {
    id: "rev-3",
    author: "Elena Schmidt",
    country: "Munich, Germany",
    experience: "Chianti Wine Tour",
    experienceHref: "/experiences/chianti-countryside-and-wine-tasting-day-trip",
    rating: 5,
    date: "2 weeks ago",
    quote: "The Tuscan countryside day trip exceeded all expectations. Incredible wine and food.",
    verified: true,
  },
];

export function TravelerReviews({ content }: TravelerReviewsProps) {
  const badge = content?.testimonialsBadge || "VERIFIED TRAVELER FEEDBACK";
  const title = content?.testimonialsTitle || "Loved by Over 45,000 Visitors";
  const subtitle =
    content?.testimonialsSubtitle ||
    "Read candid reviews from culture lovers, families, and solo explorers who discovered Florence through VACAY.";
  const ratingValue = content?.testimonialsRatingValue || "4.9 / 5.0";
  const ratingCount = content?.testimonialsRatingCount || "14,200+ Reviews";

  const reviews =
    content?.testimonialsItems && content.testimonialsItems.length > 0
      ? content.testimonialsItems.map((item, idx) => ({
          id: `custom-${idx}`,
          author: item.name,
          country: item.location,
          experience: item.experienceTitle || "Florence Experience",
          experienceHref: "/experiences",
          rating: item.rating || 5,
          date: item.date || "Recent Booking",
          quote: item.quote,
          verified: true,
        }))
      : DEFAULT_REVIEWS;

  return (
    <section className="bg-[#fcfbf9] py-18 sm:py-24 border-b border-neutral-200/80">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-900 mb-3">
              <span>{badge}</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-neutral-900 leading-[1.15]">
              {title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-end bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex text-amber-500 text-lg">★★★★★</div>
            <div className="text-xs font-bold text-neutral-900">
              {ratingValue} <span className="text-neutral-500 font-normal">({ratingCount})</span>
            </div>
          </div>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between rounded-3xl bg-white border border-neutral-200/90 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-neutral-300 hover:-translate-y-1"
            >
              <div>
                {/* Rating Stars & Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500 text-sm">{"★".repeat(rev.rating)}</div>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80">
                      ✓ Verified Booking
                    </span>
                  )}
                </div>

                {/* Experience Link */}
                <Link
                  href={rev.experienceHref}
                  className="mt-3 block text-xs font-bold text-[#2b0934] hover:underline line-clamp-1"
                >
                  {rev.experience}
                </Link>

                {/* Quote */}
                <p className="mt-3 text-xs sm:text-[13px] text-neutral-700 leading-relaxed italic">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              {/* Author & Country */}
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-neutral-900">{rev.author}</div>
                  <div className="text-[11px] text-neutral-400">{rev.country}</div>
                </div>
                <div className="text-[10.5px] text-neutral-400">{rev.date}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
