"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/admin/ui";
import { markNotificationReadAction, markAllNotificationsReadAction } from "./actions";
import type { SupplierNotificationItem } from "@/lib/data/supplier/notifications";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

function linkFor(item: SupplierNotificationItem): string | null {
  if (item.entityType === "product" && item.entityId) return `/supplier/experiences/${item.entityId}`;
  if (item.entityType === "order") return "/supplier/bookings";
  return null;
}

export function NotificationList({ items: initialItems }: { items: SupplierNotificationItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [, startTransition] = useTransition();
  const unreadCount = items.filter((i) => !i.isRead).length;

  function markRead(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)));
    startTransition(() => {
      markNotificationReadAction(id);
    });
  }

  function markAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    startTransition(() => {
      markAllNotificationsReadAction();
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#EAE6DF] bg-white p-10 text-center">
        <p className="text-sm text-neutral-500">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 ? (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        </div>
      ) : null}
      <ul className="divide-y divide-[#F0ECE6] overflow-hidden rounded-2xl border border-[#EAE6DF] bg-white">
        {items.map((item) => {
          const href = linkFor(item);
          const content = (
            <div className={`flex items-start gap-3 px-5 py-4 ${!item.isRead ? "bg-[#FAF5FC]" : ""}`}>
              {!item.isRead ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cypress" /> : <span className="mt-1.5 h-2 w-2 shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                {item.body ? <p className="mt-0.5 text-sm text-neutral-600">{item.body}</p> : null}
                <p className="mt-1 text-xs text-neutral-400">{dateFormatter.format(item.createdAt)}</p>
              </div>
              {!item.isRead ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    markRead(item.id);
                  }}
                  className="shrink-0 text-xs font-medium text-cypress hover:underline"
                >
                  Mark read
                </button>
              ) : null}
            </div>
          );
          return (
            <li key={item.id}>
              {href ? (
                <Link href={href} onClick={() => markRead(item.id)} className="block hover:bg-neutral-50">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
