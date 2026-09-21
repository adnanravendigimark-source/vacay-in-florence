import { Container } from "@/components/ui/container";

const PILLARS = [
  {
    icon: "⚡",
    title: "Zero Queue Guarantee",
    desc: "Direct-to-turnstile timed admission tickets for the Duomo, Uffizi & Accademia. Bypass 3-hour queues entirely.",
  },
  {
    icon: "📱",
    title: "Instant Mobile QR Passes",
    desc: "Receive your verified electronic vouchers instantly via email and Apple Wallet. No printing required.",
  },
  {
    icon: "🔄",
    title: "100% Free Cancellation",
    desc: "Plans change. Cancel any experience up to 24 hours in advance for a complete, hassle-free refund.",
  },
  {
    icon: "💬",
    title: "24/7 Florence Concierge",
    desc: "Local Florentine travel specialists ready to assist via WhatsApp and phone throughout your stay in Italy.",
  },
];

export function TrustFeaturesV3() {
  return (
    <section className="bg-white py-16 sm:py-24 border-b border-[#eae5d9]/80">
      <Container>
        <div className="rounded-3xl bg-[#faf9f6] border border-[#e5e0d8] p-8 sm:p-12 lg:p-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e5e0d8] px-3.5 py-1 text-xs font-semibold text-[#c85a32] mb-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32]" />
              <span>THE VACAY FLORENCE DIFFERENCE</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900 leading-[1.12]">
              Why Travelers Trust VACAY Florence
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              We eliminate the friction of booking Florence travel so you can focus entirely on Renaissance wonders and Tuscan wine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#eae5d9] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#faf9f6] border border-[#e5e0d8] flex items-center justify-center text-2xl mb-4">
                    {pillar.icon}
                  </div>
                  <h3 className="font-display text-base font-semibold text-neutral-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
