"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAdminSidebar } from "./admin-shell";

interface AdminSidebarProps {
  staff?: {
    name?: string | null;
    email?: string | null;
    roleName?: string | null;
  };
  permissionKeys?: string[];
}

interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  anyOf: string[];
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface PublicPageItem {
  href: string;
  label: string;
  anyOf: string[];
  comingSoon?: boolean;
}

// ---------------------------------------------------------------------------
// Clean, Unified SVG Icons (20x20 with 1.75px stroke)
// ---------------------------------------------------------------------------

function IconDashboard({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function IconExperiences({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <circle cx="12" cy="12" r="9" />
      <polygon points="15 8.5 13.5 13.5 8.5 15 10 10 15 8.5" />
    </svg>
  );
}

function IconAttractions({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <path d="M3 21h18" />
      <path d="M5 21V10l7-6 7 6v11" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function IconApprovals({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function IconBookings({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconCustomers({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconSuppliers({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconAffiliates({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function IconBlog({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function IconSettings({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function IconSEO({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconRoles({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconAuditLog({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${active ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const PUBLIC_PAGES: PublicPageItem[] = [
  { href: "/admin/content/homepage", label: "Homepage", anyOf: ["content.view", "content.manage"] },
  { href: "/admin/content/about", label: "About Us", anyOf: ["content.view", "content.manage"] },
  { href: "/admin/content/contact", label: "Contact", anyOf: ["content.view", "content.manage"] },
  { href: "/admin/content/privacy", label: "Privacy Policy", anyOf: ["content.view", "content.manage"] },
  { href: "/admin/content/terms", label: "Terms of Service", anyOf: ["content.view", "content.manage"] },
  { href: "/admin/content/cancellation-policy", label: "Cancellation Policy", anyOf: ["content.view", "content.manage"] },
  { href: "/admin/content/become-a-supplier", label: "Supplier Landing", anyOf: ["content.view", "content.manage"] },
  { href: "/admin/content/affiliates", label: "Affiliate Landing", anyOf: ["content.view", "content.manage"] },
];

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Catalog & Bookings",
    items: [
      {
        href: "/admin/experiences",
        label: "Experiences",
        anyOf: ["catalog.view", "catalog.manage"],
        icon: (active) => <IconExperiences active={active} />,
      },
      {
        href: "/admin/attractions",
        label: "Attractions",
        anyOf: ["catalog.view", "catalog.manage"],
        icon: (active) => <IconAttractions active={active} />,
      },
      {
        href: "/admin/experiences/approvals",
        label: "Approvals",
        anyOf: ["catalog.manage"],
        icon: (active) => <IconApprovals active={active} />,
      },
      {
        href: "/admin/bookings",
        label: "Bookings",
        anyOf: ["bookings.view", "bookings.manage"],
        icon: (active) => <IconBookings active={active} />,
      },
      {
        href: "/admin/customers",
        label: "Customers",
        anyOf: ["customers.view", "customers.manage"],
        icon: (active) => <IconCustomers active={active} />,
      },
    ],
  },
  {
    label: "Partners",
    items: [
      {
        href: "/admin/suppliers",
        label: "Suppliers",
        anyOf: ["suppliers.view", "suppliers.manage"],
        icon: (active) => <IconSuppliers active={active} />,
      },
      {
        href: "/admin/affiliates",
        label: "Affiliates",
        anyOf: ["affiliates.view", "affiliates.manage"],
        icon: (active) => <IconAffiliates active={active} />,
      },
    ],
  },
  {
    label: "Content & CMS",
    items: [
      {
        href: "/admin/blog",
        label: "Blog & Guides",
        anyOf: ["content.view", "content.manage"],
        icon: (active) => <IconBlog active={active} />,
      },
      {
        href: "/admin/seo",
        label: "SEO Settings",
        anyOf: ["seo.view", "seo.manage"],
        icon: (active) => <IconSEO active={active} />,
      },
      {
        href: "/admin/settings",
        label: "Platform Settings",
        anyOf: ["content.view", "content.manage"],
        icon: (active) => <IconSettings active={active} />,
      },
    ],
  },
  {
    label: "Governance",
    items: [
      {
        href: "/admin/roles",
        label: "Roles & Staff",
        anyOf: ["roles.view", "roles.manage"],
        icon: (active) => <IconRoles active={active} />,
      },
      {
        href: "/admin/audit-log",
        label: "Audit Logs",
        anyOf: ["auditlog.view"],
        icon: (active) => <IconAuditLog active={active} />,
      },
    ],
  },
];

function isPathActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({
  staff,
  permissionKeys,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  staff?: AdminSidebarProps["staff"];
  permissionKeys?: string[];
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const hasPerm = (anyOf: string[]) => !permissionKeys || anyOf.some((k) => permissionKeys.includes(k));
  const visiblePublicPages = PUBLIC_PAGES.filter((p) => hasPerm(p.anyOf));
  const visibleNavGroups = NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => hasPerm(i.anyOf)) })).filter(
    (g) => g.items.length > 0,
  );
  const [publicPagesOpen, setPublicPagesOpen] = useState(() => pathname.startsWith("/admin/content/"));

  const isDashboardActive = isPathActive(pathname, "/admin");
  const isPageEditorActive = pathname.startsWith("/admin/content/");

  // Compute initials for staff avatar
  const staffInitials = staff?.name
    ? staff.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <div className="flex flex-col justify-between h-full bg-white select-none">
      {/* Top Header & Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Clean Brand Header */}
        <div className={`p-4 ${collapsed ? "px-3" : "p-4.5"} border-b border-neutral-100`}>
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/admin"
              onClick={onClose}
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} group min-w-0`}
            >
              {/* Cupola Duomo Brand Emblem */}
              <div className="w-8.5 h-8.5 rounded-xl bg-[#1b3b36] flex items-center justify-center shrink-0 text-white shadow-xs group-hover:bg-[#132c28] transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 text-white">
                  <path d="M12 2v3M12 2L8 6v14h8V6L12 2z" />
                  <path d="M5 14h3v6H5zM16 14h3v6h-3z" />
                </svg>
              </div>

              {!collapsed && (
                <div className="min-w-0 leading-tight">
                  <span className="block text-[9px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
                    VACAY IN
                  </span>
                  <span className="block font-serif text-[17px] font-bold tracking-tight text-[#1b3b36]">
                    Florence
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse toggle button */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label="Toggle sidebar collapse"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            {/* Mobile close button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition shrink-0"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {!collapsed && (
            <Link
              href="/"
              target="_blank"
              className="mt-3 flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-neutral-500 hover:text-[#1b3b36] hover:bg-[#f4f7f6] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Live Public Site</span>
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-neutral-400">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-4" aria-label="Admin Navigation">
          {/* Main Dashboard Link */}
          {hasPerm(["dashboard.view"]) && (
            <Link
              href="/admin"
              onClick={onClose}
              title={collapsed ? "Dashboard" : undefined}
              className={`group flex items-center ${
                collapsed ? "justify-center px-2.5" : "gap-3 px-3"
              } py-2 rounded-xl text-xs font-medium transition-all ${
                isDashboardActive
                  ? "bg-[#1b3b36] text-white font-semibold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
              }`}
            >
              <IconDashboard active={isDashboardActive} />
              {!collapsed && <span>Dashboard</span>}
            </Link>
          )}

          {/* Navigation Groups */}
          {visibleNavGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {group.label}
                </p>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isPathActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center ${
                        collapsed ? "justify-center px-2.5" : "justify-between px-3"
                      } py-2 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? "bg-[#1b3b36] text-white font-semibold shadow-xs"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon(active)}
                        {!collapsed && <span>{item.label}</span>}
                      </div>
                      {!collapsed && item.badge && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Page Editors Accordion */}
          {visiblePublicPages.length > 0 && (
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Site Pages
                </p>
              )}

              <button
                type="button"
                onClick={() => setPublicPagesOpen((prev) => !prev)}
                title={collapsed ? "Page Editors" : undefined}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-2.5" : "justify-between px-3"
                } py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer group ${
                  isPageEditorActive && !publicPagesOpen
                    ? "bg-[#1b3b36] text-white font-semibold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`w-4.5 h-4.5 shrink-0 ${isPageEditorActive && !publicPagesOpen ? "text-emerald-300" : "text-neutral-400 group-hover:text-neutral-700"}`}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {!collapsed && <span>Page Editors</span>}
                </div>
                {!collapsed && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                      publicPagesOpen ? "rotate-180 text-neutral-700" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>

              {publicPagesOpen && !collapsed && (
                <div className="mt-1 ml-4 pl-2 border-l border-neutral-200 space-y-0.5 animate-in fade-in duration-150">
                  {visiblePublicPages.map((page) => {
                    const isActive = isPathActive(pathname, page.href);
                    return (
                      <Link
                        key={page.href}
                        href={page.href}
                        onClick={onClose}
                        className={`block px-2.5 py-1.5 rounded-lg text-[11.5px] transition-colors ${
                          isActive
                            ? "font-semibold text-[#1b3b36] bg-[#f4f7f6]"
                            : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                        }`}
                      >
                        {page.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Bottom: Staff Identity & Logout */}
      <div className={`p-3 ${collapsed ? "px-2" : "p-3.5"} border-t border-neutral-100 bg-[#faf8f5]/60`}>
        {staff?.name && !collapsed ? (
          <div className="flex items-center gap-3 p-1.5 mb-1.5 rounded-xl">
            {/* Avatar with Initials */}
            <div className="w-8 h-8 rounded-full bg-[#1b3b36] text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs">
              {staffInitials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-900 truncate leading-tight">
                {staff.name}
              </p>
              <p className="text-[10.5px] text-neutral-500 truncate mt-0.5">
                {staff.roleName || "Staff Admin"}
              </p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center ${
            collapsed ? "justify-center px-2" : "gap-2.5 px-2.5"
          } py-2 rounded-xl text-xs font-medium text-neutral-600 hover:text-rose-600 hover:bg-rose-50/70 transition-colors cursor-pointer text-left`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-rose-600">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({ staff, permissionKeys }: AdminSidebarProps) {
  const { sidebarOpen, toggleSidebar, closeSidebar, isCollapsed, toggleCollapse } = useAdminSidebar();

  return (
    <>
      {/* Mobile-only floating menu trigger */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-white text-neutral-700 hover:text-neutral-900 border border-neutral-200 shadow-sm transition cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-currentColor stroke-2">
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Desktop Sticky Sidebar (Full w-60 or Collapsed w-18) */}
      <aside
        className={`hidden lg:flex ${
          isCollapsed ? "w-18" : "w-60"
        } shrink-0 bg-white text-neutral-900 flex-col justify-between min-h-screen sticky top-0 h-screen overflow-hidden border-r border-neutral-200/80 select-none z-30 shadow-[1px_0_3px_rgba(0,0,0,0.02)] transition-[width] duration-200`}
      >
        <SidebarContent
          staff={staff}
          permissionKeys={permissionKeys}
          collapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </aside>

      {/* Mobile Drawer Backdrop & Slide-Over */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={closeSidebar}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 w-68 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <SidebarContent staff={staff} permissionKeys={permissionKeys} onClose={closeSidebar} />
          </div>
        </div>
      )}
    </>
  );
}
