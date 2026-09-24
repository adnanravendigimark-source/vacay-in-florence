import type { Metadata } from "next";
import { requireUser } from "@/lib/require-user";
import { getOrdersForUser } from "@/lib/data/orders";
import { BookingsManager, type BookingItem } from "@/components/account/bookings-manager";

export const metadata: Metadata = {
  title: "My Bookings | VACAY Florence",
  robots: { index: false },
};

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

const STATUS_STYLE: Record<string, { label: string; tone: "green" | "amber" | "red" }> = {
  confirmed: { label: "Confirmed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
  failed: { label: "Failed", tone: "red" },
  pending_payment: { label: "Pending", tone: "amber" },
};

export default async function AccountBookingsPage() {
  const user = await requireUser("/account/bookings");
  const orders = await getOrdersForUser(user.id);

  const bookings: BookingItem[] = orders.map((order) => {
    const firstItem = order.items[0];

    // Real participant breakdown, aggregated by option name (e.g. Adult /
    // Child) across every item in the order — never a fabricated guest count.
    const guestCounts = new Map<string, number>();
    for (const item of order.items) {
      for (const p of item.participants) {
        guestCounts.set(p.optionName, (guestCounts.get(p.optionName) ?? 0) + p.quantity);
      }
    }
    const guests = Array.from(guestCounts.entries())
      .map(([name, qty]) => `${qty} ${name}${qty > 1 ? "s" : ""}`)
      .join(", ");

    const status = STATUS_STYLE[order.status] ?? { label: order.status, tone: "amber" as const };

    return {
      id: order.id,
      title: firstItem
        ? `${firstItem.productTitle}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}`
        : "Booking",
      image: firstItem?.image ?? { src: "/images/florence-hero.jpg", alt: "Florence, Italy" },
      date: dateFormatter.format(order.createdAt),
      time: timeFormatter.format(order.createdAt),
      location: firstItem?.location ?? "Florence, Italy",
      guests: guests || "—",
      statusLabel: status.label,
      statusTone: status.tone,
      price: priceFormatter.format(order.totalAmount),
      href: `/account/bookings/${order.id}`,
    };
  });

  return <BookingsManager bookings={bookings} />;
}
