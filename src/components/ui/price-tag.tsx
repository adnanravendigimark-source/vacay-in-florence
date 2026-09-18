import type { Money } from "@/lib/types";

const formatters: Partial<Record<Money["currency"], Intl.NumberFormat>> = {};

function formatMoney(price: Money) {
  const formatter =
    formatters[price.currency] ??
    (formatters[price.currency] = new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: price.currency,
      maximumFractionDigits: 0,
    }));
  return formatter.format(price.amount);
}

export function PriceTag({ price }: { price: Money }) {
  return (
    <p className="text-sm text-ink-soft">
      From <span className="font-display text-lg font-medium text-ink">{formatMoney(price)}</span> per
      person
    </p>
  );
}
