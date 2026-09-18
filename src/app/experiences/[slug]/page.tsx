import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, searchProducts } from "@/lib/data/products";
import { Container } from "@/components/ui/container";
import { RatingStars } from "@/components/ui/rating-stars";
import { ProductBadgePill } from "@/components/ui/badge";
import { ExperienceCard } from "@/components/ui/experience-card";
import { BookingWidget } from "@/components/experiences/booking-widget";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.title,
    description: product.shortDescription,
    alternates: { canonical: `/experiences/${product.slug}` },
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      url: `/experiences/${product.slug}`,
      images: product.images.map((img) => ({ url: img.src })),
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categorySlug, 4);

  // BreadcrumbList only — Product/AggregateRating/Review schema is
  // deliberately withheld. ratingAverage/reviewCount here are catalog
  // seed data, not backed by real, individually stored review records,
  // so asserting them as AggregateRating schema would be exactly the
  // "misleading schema" the project brief rules out.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Experiences", item: "/experiences" },
      { "@type": "ListItem", position: 2, name: product.categoryName, item: `/experiences/category/${product.categorySlug}` },
      { "@type": "ListItem", position: 3, name: product.title, item: `/experiences/${product.slug}` },
    ],
  };

  return (
    <Container className="py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink-faint">
        <Link href="/experiences" className="hover:text-ink">
          Experiences
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/experiences/category/${product.categorySlug}`} className="hover:text-ink">
          {product.categoryName}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {product.badges.map((badge) => (
              <ProductBadgePill key={badge} badge={badge} />
            ))}
          </div>
          <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">{product.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {product.ratingAverage ? (
              <RatingStars rating={product.ratingAverage} reviewCount={product.reviewCount} />
            ) : null}
            <span className="text-sm text-ink-faint">{product.supplierName}</span>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
            <div className="relative col-span-4 aspect-[16/9] sm:col-span-3 sm:row-span-2">
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt}
                fill
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            </div>
            {product.images.slice(1, 3).map((img, i) => (
              <div key={i} className="relative col-span-2 hidden aspect-square sm:block">
                <Image src={img.src} alt={img.alt} fill sizes="20vw" className="object-cover" />
              </div>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="font-display text-xl font-medium text-ink">About this experience</h2>
            <div className="mt-3 space-y-4 text-ink-soft">
              {product.description.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {product.highlights.length > 0 ? (
            <section className="mt-8">
              <h2 className="font-display text-xl font-medium text-ink">Highlights</h2>
              <ul className="mt-3 space-y-2">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-ink-soft">
                    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 fill-cypress">
                      <path d="M8.5 13.5l-3-3 1.06-1.06L8.5 11.38l5.44-5.44L15 7l-6.5 6.5z" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {product.inclusions.length > 0 ? (
              <section>
                <h2 className="font-display text-lg font-medium text-ink">What&apos;s included</h2>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                  {product.inclusions.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span aria-hidden="true" className="text-cypress">
                        +
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {product.exclusions.length > 0 ? (
              <section>
                <h2 className="font-display text-lg font-medium text-ink">Not included</h2>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                  {product.exclusions.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span aria-hidden="true" className="text-ink-faint">
                        −
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          {product.meetingPoint ? (
            <section className="mt-8">
              <h2 className="font-display text-lg font-medium text-ink">Meeting point</h2>
              <p className="mt-2 text-sm text-ink-soft">{product.meetingPoint}</p>
            </section>
          ) : null}

          <section className="mt-8">
            <h2 className="font-display text-lg font-medium text-ink">Cancellation policy</h2>
            <p className="mt-2 text-sm text-ink-soft">{product.cancellationPolicy}</p>
          </section>
        </div>

        <div>
          <BookingWidget productSlug={product.slug} options={product.options} />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-stone pt-10">
          <h2 className="font-display text-2xl font-medium text-ink">You might also like</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ExperienceCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
