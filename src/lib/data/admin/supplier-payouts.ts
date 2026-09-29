import "server-only";
import { db } from "@/lib/db";
import { supplierPayouts, supplierPayoutItems } from "@/lib/db/schema";
import { getSupplierFinancials } from "@/lib/data/supplier/financials";

export interface MutationResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Admin's "Record payout" action — pays out every currently-pending
 * (confirmed, not-yet-paid) order item for this supplier in one batch.
 * Transactional: the new supplierPayouts row and every supplierPayoutItems
 * link are written together, so a payout is never left half-recorded. The
 * unique index on supplier_payout_items.order_item_id (schema.ts) is what
 * actually prevents any order item from ever being paid out twice, even
 * under concurrent admin actions — this function's own "what's pending"
 * check is just the UX-level guard, not the enforcement boundary.
 */
export async function recordSupplierPayout(
  supplierId: string,
  amount: number,
  notes: string | null,
): Promise<MutationResult> {
  try {
    const { pendingItems } = await getSupplierFinancials(supplierId);
    if (pendingItems.length === 0) {
      return { success: false, error: "This supplier has no pending bookings to pay out." };
    }

    const payoutId = await db.transaction(async (tx) => {
      const [payout] = await tx
        .insert(supplierPayouts)
        .values({
          supplierId,
          amount,
          currency: "EUR",
          status: "paid",
          paidAt: new Date(),
          notes,
        })
        .returning({ id: supplierPayouts.id });

      await tx.insert(supplierPayoutItems).values(
        pendingItems.map((item) => ({
          payoutId: payout.id,
          orderItemId: item.orderItemId,
        })),
      );

      return payout.id;
    });

    return { success: true, id: payoutId };
  } catch (err) {
    console.error("[admin/supplier-payouts] recordSupplierPayout failed:", err);
    return { success: false, error: "Could not record this payout. Please try again." };
  }
}
