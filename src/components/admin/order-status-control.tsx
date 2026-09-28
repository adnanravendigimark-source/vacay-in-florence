"use client";

import { useTransition } from "react";
import { setOrderStatusAction } from "@/app/admin/(protected)/bookings/actions";
import type { OrderStatus } from "@/lib/data/admin/bookings";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/data/admin/booking-status";
import { useToast } from "@/components/admin/ui";

const STATUS_STYLE: Record<OrderStatus, { bg: string; text: string }> = {
  pending_payment: { bg: "#FEF7E6", text: "#B47818" },
  confirmed: { bg: "#EAF6EE", text: "#1F7A3F" },
  cancelled: { bg: "#F0ECE6", text: "#6B6B6B" },
  failed: { bg: "#FDF0ED", text: "#D94F3D" },
};

export function OrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const s = STATUS_STYLE[status];

  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold"
        style={{ backgroundColor: s.bg, color: s.text }}
      >
        {ORDER_STATUS_LABEL[status]}
      </span>
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value as OrderStatus;
          startTransition(async () => {
            const result = await setOrderStatusAction(orderId, next);
            if (!result.success) showToast(result.error ?? "Could not update status.", "error");
            else showToast(`Booking marked ${ORDER_STATUS_LABEL[next].toLowerCase()}.`, "success");
          });
        }}
        className="rounded-xl border border-[#EAE6DF] bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm disabled:opacity-50"
      >
        {ORDER_STATUSES.map((st) => (
          <option key={st} value={st}>
            Set to: {ORDER_STATUS_LABEL[st]}
          </option>
        ))}
      </select>
    </div>
  );
}
