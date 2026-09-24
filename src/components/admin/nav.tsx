"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  // Visible if the staff member has ANY of these permission keys.
  anyOf: string[];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", anyOf: ["dashboard.view"] },
  { href: "/admin/experiences", label: "Experiences", anyOf: ["catalog.view", "catalog.manage"] },
  { href: "/admin/categories", label: "Categories", anyOf: ["catalog.view", "catalog.manage"] },
  { href: "/admin/bookings", label: "Bookings", anyOf: ["bookings.view", "bookings.manage"] },
  { href: "/admin/customers", label: "Customers", anyOf: ["customers.view", "customers.manage"] },
  { href: "/admin/suppliers", label: "Suppliers", anyOf: ["suppliers.view", "suppliers.manage"] },
  { href: "/admin/affiliates", label: "Affiliates", anyOf: ["affiliates.view", "affiliates.manage"] },
  { href: "/admin/blog", label: "Blog", anyOf: ["content.view", "content.manage"] },
  { href: "/admin/content", label: "Content & SEO", anyOf: ["content.view", "content.manage", "seo.view", "seo.manage"] },
  { href: "/admin/roles", label: "Roles & Permissions", anyOf: ["roles.view", "roles.manage"] },
  { href: "/admin/audit-log", label: "Audit Log", anyOf: ["auditlog.view"] },
];

// Client-side nav so active-route highlighting (usePathname) works
// without a server round trip. Filtering is a UI convenience only —
// every route this links to re-runs requireAdmin/requirePermission
// server-side on its own, so hiding a link here is never what actually
// keeps a staff member out of a module they lack permission for.
export function AdminNav({ permissionKeys }: { permissionKeys: string[] }) {
  const pathname = usePathname();
  const has = new Set(permissionKeys);
  const visibleItems = NAV_ITEMS.filter((item) => item.anyOf.some((key) => has.has(key)));

  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {visibleItems.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              isActive ? "bg-cypress text-white" : "text-ink-soft hover:bg-cream-deep"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
