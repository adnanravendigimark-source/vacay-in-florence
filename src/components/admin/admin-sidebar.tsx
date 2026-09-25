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
}

interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface PublicPageItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** true = this page's admin content editor hasn't been built yet. Shown
   * as a disabled row with a "Soon" badge instead of a clickable link — this
   * dropdown only ever holds admin editors, never live-site redirects. */
  comingSoon?: boolean;
}

// ---------------------------------------------------------------------------
// Self-contained Icon Components (guaranteed visible rendering with clean strokes)
// ---------------------------------------------------------------------------

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconExperiences({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function IconCategories({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </svg>
  );
}

function IconBookings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconCustomers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconSuppliers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconAffiliates({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function IconBlog({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function IconSEO({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconRoles({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconAuditLog({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const PUBLIC_PAGES: PublicPageItem[] = [
  {
    href: "/admin/content/homepage",
    label: "Homepage Editor",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-[#2b0934]">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    href: "/admin/content/about",
    label: "About Us",
    comingSoon: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-[#2b0934]">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  {
    href: "/admin/content/contact",
    label: "Contact Us",
    comingSoon: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-[#2b0934]">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: "/admin/content/legal/privacy-policy",
    label: "Privacy Policy",
    comingSoon: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-[#2b0934]">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    href: "/admin/content/legal/terms-conditions",
    label: "Terms & Conditions",
    comingSoon: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-[#2b0934]">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/admin/content/legal/cancellation-policy",
    label: "Cancellation & Refunds",
    comingSoon: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-[#2b0934]">
        <polyline points="1 4 1 10 7 10" />
        <polyline points="23 20 23 14 17 14" />
        <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
      </svg>
    ),
  },
  {
    href: "/admin/content/become-a-supplier",
    label: "Become a Supplier",
    comingSoon: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-[#2b0934]">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    href: "/admin/content/affiliates",
    label: "Become an Affiliate",
    comingSoon: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-[#2b0934]">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
];

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Catalog",
    items: [
      {
        href: "/admin/experiences",
        label: "Experiences",
        icon: (active) => <IconExperiences className={`w-4 h-4 shrink-0 ${active ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />,
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: (active) => <IconCategories className={`w-4 h-4 shrink-0 ${active ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />,
      },
    ],
  },
  {
    label: "Bookings",
    items: [
      {
        href: "/admin/bookings",
        label: "Bookings",
        icon: (active) => <IconBookings className={`w-4 h-4 shrink-0 ${active ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />,
      },
      {
        href: "/admin/customers",
        label: "Customers",
        icon: (active) => <IconCustomers className={`w-4 h-4 shrink-0 ${active ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />,
      },
    ],
  },
  {
    label: "Partners",
    items: [
      {
        href: "/admin/suppliers",
        label: "Suppliers",
        icon: (active) => <IconSuppliers className={`w-4 h-4 shrink-0 ${active ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />,
      },
      {
        href: "/admin/affiliates",
        label: "Affiliates",
        icon: (active) => <IconAffiliates className={`w-4 h-4 shrink-0 ${active ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        href: "/admin/blog",
        label: "Blog & Articles",
        icon: (active) => <IconBlog className={`w-4 h-4 shrink-0 ${active ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />,
      },
      {
        href: "/admin/settings",
        label: "Website Settings",
        icon: (active) => <IconSettings className={`w-4 h-4 shrink-0 ${active ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />,
      },
      {
        href: "/admin/seo",
        label: "SEO Management",
        icon: (active) => <IconSEO className={`w-4 h-4 shrink-0 ${active ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        href: "/admin/roles",
        label: "Users & Roles",
        icon: (active) => <IconRoles className={`w-4 h-4 shrink-0 ${active ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />,
      },
      {
        href: "/admin/audit-log",
        label: "Audit Log",
        icon: (active) => <IconAuditLog className={`w-4 h-4 shrink-0 ${active ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />,
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
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  staff?: AdminSidebarProps["staff"];
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const [publicPagesOpen, setPublicPagesOpen] = useState(() => pathname.startsWith("/admin/content/homepage"));

  const isDashboardActive = isPathActive(pathname, "/admin");

  return (
    <div className="flex flex-col justify-between h-full bg-white select-none">
      <div className="overflow-y-auto">
        {/* Brand Header with Hamburger Icon */}
        <div className={`p-4 ${collapsed ? "px-2" : "p-5"} pb-3 border-b border-[#F0ECE6]`}>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <Link
              href="/admin"
              onClick={onClose}
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-1 py-1 group min-w-0`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#FAF5FC] flex items-center justify-center shrink-0 border border-[#2b0934]/20 text-[#2b0934] shadow-2xs group-hover:border-[#2b0934]/50 transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#2b0934]">
                  <path d="M12 2v4M12 2L8 6v14h8V6L12 2z" />
                  <path d="M4 14h4v6H4zM16 14h4v6h-4z" />
                </svg>
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <span className="block text-[9px] font-bold tracking-[0.2em] text-neutral-400 uppercase leading-none">
                    VACAY IN
                  </span>
                  <span className="block font-display text-[18px] font-medium tracking-tight text-neutral-900 mt-0.5 leading-none truncate">
                    Florence
                  </span>
                </div>
              ) : null}
            </Link>

            {/* Hamburger Toggle Button in Sidebar Header */}
            {onToggleCollapse ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5] border border-[#EAE6DF] transition cursor-pointer shrink-0"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label="Toggle sidebar collapse"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-neutral-700">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            ) : null}

            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5] border border-[#EAE6DF] transition shrink-0"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-neutral-700">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ) : null}
          </div>

          {!collapsed ? (
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-1.5 rounded-xl text-[11.5px] font-medium text-neutral-500 hover:text-neutral-900 hover:bg-[#FAF8F5] transition-colors border border-transparent hover:border-[#EAE6DF]"
            >
              <span>View Public Site</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-neutral-400">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
          ) : null}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 sm:p-4 space-y-4" aria-label="Admin Navigation">
          {/* Dashboard Link */}
          <Link
            href="/admin"
            onClick={onClose}
            title={collapsed ? "Dashboard" : undefined}
            className={`group flex items-center ${
              collapsed ? "justify-center px-2" : "gap-3 px-3.5"
            } py-2 rounded-xl text-[13px] font-medium transition-all ${
              isDashboardActive
                ? "bg-[#2b0934] text-white font-semibold shadow-[0_2px_8px_rgba(43,9,52,0.18)]"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
            }`}
          >
            <IconDashboard className={`w-4 h-4 shrink-0 ${isDashboardActive ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} />
            {!collapsed ? <span>Dashboard</span> : null}
          </Link>

          {/* Public Pages Dropdown with Individual Icons */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setPublicPagesOpen((prev) => !prev)}
              title={collapsed ? "Page Editors" : undefined}
              className={`w-full flex items-center ${
                collapsed ? "justify-center px-2" : "justify-between px-3.5"
              } py-2 rounded-xl text-[13px] font-medium text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5] transition-colors cursor-pointer group`}
            >
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-500 group-hover:text-[#2b0934]">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                {!collapsed ? <span>Page Editors</span> : null}
              </div>
              {!collapsed ? (
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
              ) : null}
            </button>

            {publicPagesOpen && !collapsed ? (
              <div className="mt-1 ml-3 pl-2.5 border-l border-[#EAE6DF] space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {PUBLIC_PAGES.map((page) => {
                  if (page.comingSoon) {
                    return (
                      <div
                        key={page.href}
                        title="Editor coming soon"
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 opacity-70 cursor-default select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {page.icon}
                          <span className="truncate">{page.label}</span>
                        </div>
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      </div>
                    );
                  }
                  const isActive = isPathActive(pathname, page.href);
                  return (
                    <Link
                      key={page.href}
                      href={page.href}
                      onClick={onClose}
                      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors group ${
                        isActive
                          ? "bg-[#2b0934] text-white font-semibold"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {page.icon}
                        <span className="truncate">{page.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed ? (
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {group.label}
                </p>
              ) : null}
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
                        collapsed ? "justify-center px-2" : "gap-3 px-3.5"
                      } py-2 rounded-xl text-[13px] font-medium transition-all ${
                        active
                          ? "bg-[#2b0934] text-white font-semibold shadow-[0_2px_8px_rgba(43,9,52,0.18)]"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
                      }`}
                    >
                      {item.icon(active)}
                      {!collapsed ? <span>{item.label}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom: Staff Identity & Logout */}
      <div className={`p-4 ${collapsed ? "px-2" : "p-4"} border-t border-[#F0ECE6]`}>
        {staff?.name && !collapsed ? (
          <div className="px-2 pb-2.5 mb-1">
            <p className="text-[12px] font-semibold text-neutral-900 truncate">{staff.name}</p>
            {staff.roleName ? (
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FAF5FC] text-[#2b0934] border border-[#2b0934]/15 truncate">
                {staff.roleName}
              </span>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center ${
            collapsed ? "justify-center px-2" : "gap-2.5 px-3"
          } py-2 rounded-xl text-[12.5px] font-medium text-neutral-600 hover:text-rose-600 hover:bg-rose-50/70 transition-colors cursor-pointer text-left`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-500 hover:text-rose-600">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed ? <span>Logout</span> : null}
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({ staff }: AdminSidebarProps) {
  const { sidebarOpen, closeSidebar, isCollapsed, toggleCollapse } = useAdminSidebar();

  return (
    <>
      {/* Desktop Sticky Sidebar (Full w-64 or Collapsed w-20) */}
      <aside
        className={`hidden lg:flex ${
          isCollapsed ? "w-20" : "w-64"
        } shrink-0 bg-white text-neutral-900 flex-col justify-between min-h-screen sticky top-0 h-screen overflow-y-auto border-r border-[#EAE6DF] select-none z-30 shadow-[1px_0_4px_rgba(0,0,0,0.015)] transition-[width] duration-200`}
      >
        <SidebarContent
          staff={staff}
          collapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </aside>

      {/* Mobile Drawer Backdrop & Slide-Over */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={closeSidebar}
            aria-hidden="true"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <SidebarContent staff={staff} onClose={closeSidebar} />
          </div>
        </div>
      ) : null}
    </>
  );
}
