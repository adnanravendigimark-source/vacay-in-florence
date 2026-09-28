// Client-safe order-status constants — deliberately split out of
// bookings.ts (which has `import "server-only"` and pulls in the `db`
// client) so client components (bookings-table.tsx, order-status-control.tsx)
// can import these real values without dragging node-postgres into the
// browser bundle. bookings.ts re-exports from here as the source of truth
// for server-side code.
export type OrderStatus = "pending_payment" | "confirmed" | "cancelled" | "failed";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  failed: "Failed",
};

export const ORDER_STATUSES: OrderStatus[] = ["pending_payment", "confirmed", "cancelled", "failed"];
