"use client";

import Image from "next/image";
import { useAdminSidebar } from "./admin-shell";

interface AdminTopbarProps {
  staff?: {
    name?: string | null;
    email?: string | null;
    roleName?: string | null;
  };
}

export function AdminTopbar({ staff }: AdminTopbarProps) {
  const { toggleSidebar } = useAdminSidebar();
  const displayName = staff?.name || "Adnan Khan";
  const displayRole = staff?.roleName || "Super Admin";

  return (
    <header className="h-16 sm:h-18 bg-white border-b border-[#EAE6DF] px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Toggle & Search Input */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-1 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5] border border-transparent hover:border-[#EAE6DF] transition cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-currentColor stroke-2">
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        </button>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs sm:w-80 lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-currentColor stroke-2">
              <circle cx="11" cy="11" r="7.5" />
              <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-xs sm:text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#2b0934] focus:ring-1 focus:ring-[#2b0934] focus:bg-white transition shadow-2xs"
          />
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-currentColor stroke-[1.8]">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D94F3D] text-[10px] font-bold text-white shadow-xs">
            3
          </span>
        </button>

        {/* User Pill / Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 border-l border-[#F0ECE6]">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-[#FAF5FC] bg-[#FAF5FC] shrink-0 border border-[#2b0934]/15">
            <Image
              src="/images/user-avatar.jpg"
              alt={displayName}
              fill
              className="object-cover"
              sizes="36px"
              priority
            />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs sm:text-[13px] font-semibold text-neutral-900 leading-tight">
              {displayName}
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5 leading-none">
              {displayRole}
            </p>
          </div>
          <svg viewBox="0 0 20 20" className="hidden sm:block w-4 h-4 fill-currentColor text-neutral-400 ml-0.5">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </header>
  );
}
