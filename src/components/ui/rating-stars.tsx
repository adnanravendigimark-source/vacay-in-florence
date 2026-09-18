export function RatingStars({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Rated ${rating.toFixed(1)} out of 5 from ${reviewCount.toLocaleString()} reviews`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-gold">
        <path d="M10 1.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.8L10 14.7l-5.3 2.8 1.1-5.8L1.5 7.6l5.9-.7L10 1.5z" />
      </svg>
      <span className="text-sm font-semibold text-ink">{rating.toFixed(1)}</span>
      <span className="text-sm text-ink-faint">({reviewCount.toLocaleString()})</span>
    </div>
  );
}
