import Link from "next/link";
import { Container } from "@/components/ui/container";
import { VacayLogo } from "@/components/ui/vacay-logo";

export function Home4Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white text-neutral-700 pt-16 pb-8 border-t border-[#eae5d9]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#eae5d9]">
          <div className="lg:col-span-4">
            <VacayLogo variant="dark" />
            <p className="mt-4 text-xs sm:text-sm text-neutral-600 max-w-xs leading-relaxed">
              Curated travel experiences, skip-the-line museum passes, and authentic Tuscan adventures.
            </p>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-600">
              <li>
                <Link href="/experiences" className="hover:text-neutral-950 transition-colors">
                  All Experiences
                </Link>
              </li>
              <li>
                <Link href="/experiences/category/skip-the-line-attractions" className="hover:text-neutral-950 transition-colors">
                  Skip-The-Line
                </Link>
              </li>
              <li>
                <Link href="/experiences/category/museums-galleries" className="hover:text-neutral-950 transition-colors">
                  Museums &amp; Art
                </Link>
              </li>
              <li>
                <Link href="/experiences/category/food-wine-experiences" className="hover:text-neutral-950 transition-colors">
                  Food &amp; Wine
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-600">
              <li>
                <Link href="/about" className="hover:text-neutral-950 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-neutral-950 transition-colors">
                  Blog &amp; Guides
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-neutral-950 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-neutral-950 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Connect With Us
            </h4>
            <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
              Have questions about your Florence booking? Our local concierge team is here to help.
            </p>
            <div className="text-xs text-neutral-800 font-semibold">
              Email: support@vacayinflorence.com
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>&copy; {year} VACAY in Florence. All rights reserved.</p>
          <p>Florence, Italy &nbsp;&middot;&nbsp; EN &nbsp;&middot;&nbsp; EUR &euro;</p>
        </div>
      </Container>
    </footer>
  );
}
