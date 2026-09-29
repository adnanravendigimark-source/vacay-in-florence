"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSupplierSidebar } from "./supplier-shell";

interface SupplierSidebarProps {
  supplier?: {
    name?: string | null;
    email?: string | null;
    supplierName?: string | null;
  };
  unreadNotifications?: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

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

function IconFinancials({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function IconProfile({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconNotifications({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { href: "/supplier/dashboard", label: "Dashboard", icon: (a) => <IconDashboard className={`w-4 h-4 shrink-0 ${a ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} /> },
  { href: "/supplier/experiences", label: "My Experiences", icon: (a) => <IconExperiences className={`w-4 h-4 shrink-0 ${a ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} /> },
  { href: "/supplier/bookings", label: "Bookings", icon: (a) => <IconBookings className={`w-4 h-4 shrink-0 ${a ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} /> },
  { href: "/supplier/financials", label: "Financials", icon: (a) => <IconFinancials className={`w-4 h-4 shrink-0 ${a ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} /> },
  { href: "/supplier/notifications", label: "Notifications", icon: (a) => <IconNotifications className={`w-4 h-4 shrink-0 ${a ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} /> },
  { href: "/supplier/profile", label: "Profile", icon: (a) => <IconProfile className={`w-4 h-4 shrink-0 ${a ? "text-[#F5D59A]" : "text-neutral-500 group-hover:text-[#2b0934]"}`} /> },
];

function isPathActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({
  supplier,
  onClose,
  unreadNotifications = 0,
}: {
  supplier?: SupplierSidebarProps["supplier"];
  onClose?: () => void;
  unreadNotifications?: number;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col justify-between h-full bg-white select-none">
      <div className="overflow-y-auto">
        <div className="p-4 sm:p-5 pb-3 border-b border-[#F0ECE6]">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <Link href="/supplier/dashboard" onClick={onClose} className="flex items-center gap-3 px-1 py-1 group min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FAF5FC] flex items-center justify-center shrink-0 border border-[#2b0934]/20 text-[#2b0934] shadow-2xs group-hover:border-[#2b0934]/50 transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#2b0934]">
                  <path d="M12 2v4M12 2L8 6v14h8V6L12 2z" />
                  <path d="M4 14h4v6H4zM16 14h4v6h-4z" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-bold tracking-[0.2em] text-neutral-400 uppercase leading-none">
                  VACAY IN
                </span>
                <span className="block font-display text-[18px] font-medium tracking-tight text-neutral-900 mt-0.5 leading-none truncate">
                  Supplier
                </span>
              </div>
            </Link>

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
        </div>

        <nav className="p-3 sm:p-4 space-y-0.5" aria-label="Supplier Navigation">
          {NAV_ITEMS.map((item) => {
            const active = isPathActive(pathname, item.href);
            const badgeCount = item.href === "/supplier/notifications" ? unreadNotifications : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  active
                    ? "bg-[#2b0934] text-white font-semibold shadow-[0_2px_8px_rgba(43,9,52,0.18)]"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
                }`}
              >
                {item.icon(active)}
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 ? (
                  <span
                    className={`ml-auto flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                      active ? "bg-white text-[#2b0934]" : "bg-[#D94F3D] text-white"
                    }`}
                  >
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#F0ECE6]">
        {supplier?.supplierName ? (
          <div className="px-2 pb-2.5 mb-1">
            <p className="text-[12px] font-semibold text-neutral-900 truncate">{supplier.supplierName}</p>
            {supplier.email ? <p className="text-[11px] text-neutral-500 truncate">{supplier.email}</p> : null}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/supplier/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-medium text-neutral-600 hover:text-rose-600 hover:bg-rose-50/70 transition-colors cursor-pointer text-left"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 text-neutral-500 hover:text-rose-600">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export function SupplierSidebar({ supplier, unreadNotifications = 0 }: SupplierSidebarProps) {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useSupplierSidebar();

  return (
    <>
      {!sidebarOpen ? (
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-white text-neutral-600 hover:text-neutral-900 border border-[#EAE6DF] shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-currentColor stroke-2">
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}

      <aside className="hidden lg:flex w-64 shrink-0 bg-white text-neutral-900 flex-col justify-between min-h-screen sticky top-0 h-screen overflow-y-auto border-r border-[#EAE6DF] select-none z-30 shadow-[1px_0_4px_rgba(0,0,0,0.015)]">
        <SidebarContent supplier={supplier} unreadNotifications={unreadNotifications} />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200" onClick={closeSidebar} aria-hidden="true" />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <SidebarContent supplier={supplier} onClose={closeSidebar} unreadNotifications={unreadNotifications} />
          </div>
        </div>
      ) : null}
    </>
  );
}
