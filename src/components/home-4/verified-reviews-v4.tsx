import { Container } from "@/components/ui/container";

const REVIEWS = [
  {
    id: "1",
    author: "Sophie Dupont",
    location: "Paris, France",
    experience: "Duomo Dome Climb & Secret Terraces",
    rating: 5,
    text: "Skipping the cathedral queue was the best choice of our trip. Scanning the mobile voucher took 10 seconds. The view from the cupola at 9 AM is breathtaking.",
  },
  {
    id: "2",
    author: "Oliver Davies",
    location: "London, UK",
    experience: "Chianti Hills Sunset Wine & Castle Dinner",
    rating: 5,
    text: "The wine cellar visits and the sunset dinner on the castle terrace felt like a movie. Intimate group, knowledgeable sommelier, and delicious Tuscan food.",
  },
  {
    id: "3",
    author: "Emily & Jason Reed",
    location: "Chicago, USA",
    experience: "Uffizi Gallery Priority Access & Da Vinci",
    rating: 5,
    text: "Zero lines, immediate entry. We spent 3 uninterrupted hours admiring Botticelli and Caravaggio. Seamless booking with instant email passes.",
  },
];

export function VerifiedReviewsV4() {
  return (
    <section className="bg-white py-16 sm:py-24 border-b border-[#eae5d9]/60">
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-[#183528]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#183528]">
                TRAVELER STORIES
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Loved by 28,000+ Travelers
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 max-w-xl">
              Real reviews from verified visitors who booked direct priority passes and tours.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#faf9f6] border border-[#eae5d9]">
            <span className="text-amber-500 font-bold text-base">★★★★★</span>
            <span className="text-xs font-bold text-neutral-900">4.95 / 5.0 Average</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-[#faf9f6] border border-[#eae5d9] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-amber-500 text-sm">★★★★★</span>
                  <span className="text-[10px] font-bold uppercase text-[#183528] bg-[#eaf1ec] px-2 py-0.5 rounded-full">
                    ✓ Verified Ticket
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#eae5d9]">
                <h4 className="font-display text-sm font-bold text-neutral-900">
                  {rev.author}
                </h4>
                <p className="text-[11px] text-neutral-500">{rev.location}</p>
                <p className="text-[11px] text-neutral-600 mt-1 truncate">
                  Booked: <span className="font-semibold">{rev.experience}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
