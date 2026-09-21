import { Container } from "@/components/ui/container";

const REVIEWS = [
  {
    id: "rev-1",
    author: "Elena Rostova",
    location: "London, UK",
    experience: "Duomo Dome Climb & Secret Terraces",
    rating: 5,
    date: "September 2026",
    comment:
      "Skipping the 2.5-hour line at the Duomo was the smartest decision we made in Italy. Our mobile vouchers scanned instantly at the north entrance. The 360° views from Brunelleschi's dome at 9 AM were unforgettable!",
    verified: true,
  },
  {
    id: "rev-2",
    author: "Marcus & Clara Lindqvist",
    location: "Stockholm, Sweden",
    experience: "Chianti Hills Sunset Wine & Castle Dinner",
    rating: 5,
    date: "August 2026",
    comment:
      "The private Tuscan vineyard tour exceeded all expectations. Tasting 6 reserve Chianti Classico wines followed by a candlelit castle terrace dinner was the highlight of our two-week honeymoon.",
    verified: true,
  },
  {
    id: "rev-3",
    author: "David Chen",
    location: "San Francisco, USA",
    experience: "Uffizi Gallery Priority Access & Da Vinci",
    rating: 5,
    date: "September 2026",
    comment:
      "No waiting, no confusion. Direct entrance at 10:15 AM slot. Being able to stand right in front of Botticelli's Birth of Venus without standing in the summer sun for 3 hours was worth every single penny.",
    verified: true,
  },
];

export function TravelerReviewsV3() {
  return (
    <section className="bg-[#faf9f6] py-16 sm:py-24 border-b border-[#eae5d9]/80">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e5e0d8] px-3.5 py-1 text-xs font-semibold text-[#c85a32] mb-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32]" />
              <span>VERIFIED REVIEWS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Loved by 28,000+ Florence Travelers
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              Read authentic feedback from travelers who explored Florence with VACAY priority tickets and curated tours.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#e5e0d8] shadow-sm">
            <div className="flex text-amber-400 text-lg">★★★★★</div>
            <div className="text-xs">
              <span className="font-bold text-neutral-900">4.95 / 5.0</span>
              <span className="text-neutral-500 ml-1">Overall Rating</span>
            </div>
          </div>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-[#e5e0d8] shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div>
                {/* Rating & Verified Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400 text-sm">★★★★★</div>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[#c85a32] bg-[#fbf0eb] px-2.5 py-0.5 rounded-full">
                      <span>✓</span> Verified Ticket
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#eae5d9]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-sm font-semibold text-neutral-900">
                      {rev.author}
                    </h4>
                    <p className="text-[11px] text-neutral-500">{rev.location}</p>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">{rev.date}</span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-neutral-500 truncate">
                  Booked: <span className="text-neutral-900">{rev.experience}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
