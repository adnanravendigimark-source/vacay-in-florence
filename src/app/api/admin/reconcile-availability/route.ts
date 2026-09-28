import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { availability, orderItems } from "@/lib/db/schema";
import { getStaffContext } from "@/lib/require-user";

/**
 * ONE-OFF ADMIN UTILITY — delete this file once it's been run.
 *
 * availability.capacityBooked is supposed to be a live count, incremented
 * for real inside the checkout transaction (see src/app/(public)/checkout/
 * actions.ts) every time someone actually books. But every row currently
 * in the database was seeded with a fabricated placeholder value (see
 * src/lib/db/seed.ts's `i % 7 === 0 ? 18 : i % 5 === 0 ? 10 : 2` pattern) —
 * demo data left over from when the project was first set up, unrelated to
 * any real booking.
 *
 * There's no flag distinguishing "seeded" rows from "real" ones, so instead
 * of guessing which rows are fake, this recomputes the TRUE booked count
 * for every (product, date) directly from the real order_items table —
 * the actual source of truth checkout writes to — and overwrites
 * capacityBooked with that real number. A date with no real orders becomes
 * 0 (honest — nothing has actually been booked); a date with real orders
 * gets the real sum of participants booked, whatever the old stored number
 * said. Nothing here is guessed or pattern-matched — it's a straight
 * recount from real order rows.
 *
 * Visit this URL once while signed in as a staff/admin user, confirm the
 * JSON summary looks right, then delete this route.
 */
export async function GET() {
  const staff = await getStaffContext();
  if (!staff) {
    return NextResponse.json({ error: "You must be signed in as an admin to run this." }, { status: 401 });
  }

  // Real ground truth: every order line item ever created, regardless of
  // order status — checkout never decrements capacityBooked on
  // cancellation today, so this matches the same accounting the live
  // checkout code already uses.
  const items = await db
    .select({
      productId: orderItems.productId,
      date: orderItems.date,
      participants: orderItems.participants,
    })
    .from(orderItems);

  const realBooked = new Map<string, number>();
  for (const item of items) {
    const key = `${item.productId}|${item.date}`;
    const qty = (item.participants ?? []).reduce((sum, p) => sum + (p.quantity ?? 0), 0);
    realBooked.set(key, (realBooked.get(key) ?? 0) + qty);
  }

  const rows = await db
    .select({
      id: availability.id,
      productId: availability.productId,
      date: availability.date,
      capacityTotal: availability.capacityTotal,
      capacityBooked: availability.capacityBooked,
    })
    .from(availability);

  let corrected = 0;
  let capacityRaised = 0;
  const changes: { productId: string; date: string; from: number; to: number }[] = [];

  for (const row of rows) {
    const key = `${row.productId}|${row.date}`;
    const real = realBooked.get(key) ?? 0;
    if (real !== row.capacityBooked) {
      corrected += 1;
      changes.push({ productId: row.productId, date: row.date, from: row.capacityBooked, to: real });
      const newCapacityTotal = Math.max(row.capacityTotal, real);
      if (newCapacityTotal !== row.capacityTotal) capacityRaised += 1;
      await db
        .update(availability)
        .set({ capacityBooked: real, capacityTotal: newCapacityTotal, updatedAt: new Date() })
        .where(and(eq(availability.id, row.id)));
    }
  }

  return NextResponse.json({
    totalRows: rows.length,
    rowsCorrected: corrected,
    capacityRaisedToStayAboveRealBooked: capacityRaised,
    // First 50 changes only, so the response doesn't get enormous.
    sampleChanges: changes.slice(0, 50),
  });
}
