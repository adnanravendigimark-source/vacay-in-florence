"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface AccountSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const NAV_ITEMS = [
  {
    href: "/account",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.8]">
        <path d="M3 9.5L12 3l9 6.5M19 8.5V20a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 00-1-1h-2a1 1 0 00-1 1v4a1 1 0 01-1 1H6a1 1 0 01-1-1V8.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/account/bookings",
    label: "My Bookings",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.8]">
        <rect x="3" y="4" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/account/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.8]">
        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 21a6.5 6.5 0 0113 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/account/security",
    label: "Security",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-[1.8]">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="11" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function getInitials(name: string | null | undefined): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();
  const displayName = user.name || "Your account";
  const displayEmail = user.email || "";

  return (
    <aside className="w-full">
      <div className="rounded-[28px] bg-white border border-stone shadow-[0_4px_30px_rgba(43,9,52,0.04)] p-6 flex flex-col justify-between min-h-[640px] relative overflow-hidden">
        {/* Top User Info Section */}
        <div>
          <div className="flex items-center gap-3.5 pb-6 border-b border-stone">
            <img
              src={user.image || "/images/user-avatar.jpg"}
              alt={displayName}
              className="shrink-0 w-12 h-12 rounded-full object-cover ring-2 ring-brand-light shadow-xs bg-brand-light"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-display font-medium text-[15px] text-ink truncate leading-snug">
                {displayName}
              </h2>
              <p className="text-[11.5px] text-ink-faint truncate mt-0.5">
                {displayEmail}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-brand-light text-brand tracking-wide">
                  Traveler
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex flex-col gap-1.5" aria-label="Account navigation">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/account"
                  ? pathname === "/account"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13.5px] transition-all duration-200 ${
                    isActive
                      ? "bg-[#2b0934] text-white font-semibold shadow-[0_4px_16px_rgba(43,9,52,0.18)]"
                      : "text-ink-soft hover:text-ink hover:bg-stone/30 font-medium"
                  }`}
                >
                  <span className={`transition-colors shrink-0 ${isActive ? "text-amber-300" : "text-ink-faint"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section with Artistic Duomo Sketch */}
        <div className="relative pt-6 mt-6">
          <div className="relative w-full h-36 flex items-end justify-center pointer-events-none select-none">
            <Image
              src="/images/florence-sketch.png"
              alt="Florence Cathedral line art sketch"
              fill
              className="object-contain object-bottom opacity-90"
              sizes="240px"
            />
          </div>

          {/* Sign Out Action */}
          <div className="mt-3 pt-3 border-t border-stone flex items-center justify-between">
            <span className="text-[11px] text-ink-faint">Account session</span>
            <SignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
