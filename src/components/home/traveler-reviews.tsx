import { Container } from "@/components/ui/container";
import Link from "next/link";

const REVIEWS = [
  {
    id: "rev-1",
    author: "Elena Rostova",
    country: "United Kingdom",
    experience: "Duomo & Brunelleschi's Dome Climb",
    experienceHref: "/experiences/duomo-and-brunelleschis-dome-climb",
    rating: 5,
    date: "September 2026",
    quote:
      "Skipping the 2-hour queue at the Duomo was the smartest decision we made in Florence. The barcode worked instantly on my phone, and the views from Brunelleschi's dome were completely breathtaking!",
    verified: true,
  },
  {
    id: "rev-2",
    author: "Marcus Vance",
    country: "United States",
    experience: "Florentine Cooking Class & Market Visit",
    experienceHref: "/experiences/florentine-cooking-class-with-market-visit",
    rating: 5,
    date: "September 2026",
    quote:
      "Chef Marco was hilarious and knowledgeable! We shopped fresh herbs at San Lorenzo market, made handmade tagliatelle and tiramisu from scratch, and drank exceptional Chianti wine. 10/10!",
    verified: true,
  },
  {
    id: "rev-3",
    author: "Sophie Dubois",
    country: "France",
    experience: "Uffizi Gallery Priority Entry Ticket",
    experienceHref: "/experiences/uffizi-gallery-skip-the-line-ticket",
    rating: 5,
    date: "August 2026",
    quote:
      "Seamless process from booking to entry. We walked right past hundreds of people waiting outside in 32°C heat. Seeing Botticelli's Birth of Venus in person was unforgettable.",
    verified: true,
  },
  {
    id: "rev-4",
    author: "David & Rachel Miller",
    country: "Canada",
    experience: "Tuscany Full-Day Tour: San Gimignano & Siena",
    experienceHref: "/experiences/tuscany-full-day-tour-san-gimignano-siena-pisa",
    rating: 5,
    date: "August 2026",
    quote:
      "Comfortable Mercedes minivan, stunning views of cypress hills, wine tasting in a historic castle cellar, and plenty of free time in San Gimignano. Perfect day trip from Florence!",
    verified: true,
  },
];

export function TravelerReviews() {
  return (
    <section className="bg-[#fcfbf9] py-18 sm:py-24 border-b border-neutral-200/80">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-900 mb-3">
              <span>★ 4.9 OUT OF 5.0 RATING</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-neutral-900 leading-[1.15]">
              Loved by Over 98,000+ Florence Travelers
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              Read verified reviews from travelers who booked skip-the-line tickets and authentic tours with VACAY Florence.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-end bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex text-amber-500 text-lg">★★★★★</div>
            <div className="text-xs font-bold text-neutral-900">
              4.9 / 5.0 <span className="text-neutral-500 font-normal">(14,200+ Reviews)</span>
            </div>
          </div>
        </div>

        {/* 4 Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between rounded-3xl bg-white border border-neutral-200/90 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-neutral-300 hover:-translate-y-1"
            >
              <div>
                {/* Rating Stars & Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500 text-sm">★★★★★</div>
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
