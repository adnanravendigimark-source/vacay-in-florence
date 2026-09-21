export function ProductBadgePill({ badge }: { badge: string }) {
  const formatLabel = (b: string) => {
    switch (b) {
      case "skip-the-line":
        return "Skip the line";
      case "top-rated":
        return "Top rated";
      case "free-cancellation":
        return "Free cancellation";
      case "small-group":
        return "Small group";
      case "best-seller":
        return "Best seller";
      case "popular":
        return "Popular";
      case "new":
        return "New";
      case "food-wine":
        return "Food & Wine";
      default:
        return b.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  return (
    <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-neutral-800 shadow-sm backdrop-blur-md border border-white/40">
      {formatLabel(badge)}
    </span>
  );
}
