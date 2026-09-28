"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AdminCustomerListItem } from "@/lib/data/admin/customers";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export function CustomersTable({ items }: { items: AdminCustomerListItem[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((c) => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term));
  }, [items, search]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-12 text-center">
        <p className="text-sm font-medium text-neutral-700">No customers yet</p>
        <p className="mt-1 text-xs text-neutral-500">Accounts created through Register will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full max-w-md rounded-xl border border-[#EAE6DF] bg-white px-3.5 py-2 text-xs shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#2b0934]/20"
      />

      <div className="overflow-x-auto rounded-2xl border border-[#EAE6DF] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#F0ECE6] text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total spent</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-[#F5F3EF] last:border-0 hover:bg-[#FAF8F5]">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">{c.name}</p>
                  <p className="text-[11px] text-neutral-500">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-neutral-500">{dateFormatter.format(c.createdAt)}</td>
                <td className="px-4 py-3 text-neutral-700">{c.orderCount}</td>
                <td className="px-4 py-3 font-medium text-neutral-900">{formatPrice(c.totalSpent)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/customers/${c.id}`} className="text-[11px] font-semibold text-[#2b0934] hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  No customers match your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
