"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/ui/container";
import { VacayLogo } from "@/components/ui/vacay-logo";
import { StickyHeader } from "@/components/layout/sticky-header";
import { CART_UPDATED_EVENT } from "@/lib/cart-events";
import { useAuthModal } from "@/components/auth/auth-modal-context";

export function SiteHeader() {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);
  const userFirstName = session?.user?.name
    ? session.user.name.trim().split(" ")[0]
    : session?.user?.email
      ? session.user.email.split("@")[0]
      : "Profile";
  const { openAuthModal } = useAuthModal();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState<number | null>(null);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  useEffect(() => {
    if (isAuthPage) return;
    let cancelled = false;
    function refreshCartCount() {
      fetch("/api/cart/count")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data) setCartCount(data.count);
        })
        .catch(() => {
          /* cart badge is a convenience, never worth surfacing an error for */
        });
    }
    refreshCartCount();
    // A same-page "Add to Cart" server action doesn't change the pathname,
    // so we also listen for an explicit signal from cart mutations.
    window.addEventListener(CART_UPDATED_EVENT, refreshCartCount);
    return () => {
      cancelled = true;
      window.removeEventListener(CART_UPDATED_EVENT, refreshCartCount);
    };
  }, [pathname, isAuthPage]);

  if (isAuthPage) {
    return null;
  }

  return (
    <StickyHeader
      renderContent={(scrolled, isHome) => {
        const isExperienceDetail =
          pathname.startsWith("/experiences/") && !pathname.startsWith("/experiences/category");
        const isLight = (isHome || isExperienceDetail) && !scrolled;

        const navLinks = [
          { name: "Home", href: "/", active: pathname === "/" },
          {
            name: "Experiences",
            href: "/experiences",
            active:
              pathname === "/experiences" ||
              (pathname.startsWith("/experiences/") && !pathname.startsWith("/experiences/category")),
          },
          {
            name: "Categories",
            href: "/categories",
            active:
              pathname === "/categories" ||
              pathname.startsWith("/categories/") ||
              pathname.startsWith("/experiences/category"),
          },
          {
            name: "Blog",
            href: "/blog",
            active: pathname.startsWith("/blog"),
          },
          {
            name: "About Us",
            href: "/about",
            active: pathname === "/about",
          },
          {
            name: "Contact",
            href: "/contact",
            active: pathname === "/contact",
          },
        ];

        return (
          <Container className="flex h-20 items-center justify-between gap-4 transition-all duration-300">
            {/* Brand Logo (Switches light/dark based on state) */}
            <div className="flex items-center">
              <VacayLogo variant={isLight ? "light" : "dark"} />
            </div>

            {/* Navigation Links */}
            <nav aria-label="Primary" className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[14px] transition-colors py-1 ${link.active
                      ? isLight
                        ? "relative font-semibold text-white drop-shadow-sm"
                        : "relative font-semibold text-neutral-900"
                      : isLight
                        ? "font-normal text-white/90 hover:text-white drop-shadow-sm"
                        : "font-normal text-neutral-600 hover:text-neutral-950"
                    }`}
                >
                  {link.name}
                  {link.active && (
                    <span
                      className={`absolute -bottom-1 left-0 right-0 h-[2px] rounded-full transition-colors ${isLight ? "bg-white shadow-sm" : "bg-[#183528]"
                        }`}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Header Action Icons */}
            <div className="flex items-center gap-3">
              {/* Quick Search Icon */}
              <Link
                href="/experiences"
                aria-label="Search experiences"
                className={`p-1.5 rounded-full transition-colors ${isLight
                    ? "text-white hover:text-cream-deep drop-shadow-sm"
                    : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100"
                  }`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.85]">
                  <circle cx="11" cy="11" r="7.5" />
                  <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" strokeLinecap="round" />
                </svg>
              </Link>

              {/* User Profile Account Icon: Shows user name and icon when logged in, or opens Auth Modal if guest */}
              {isAuthenticated ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Bookings Shortcut */}
                  <Link
                    href="/account/bookings"
                    aria-label="My bookings"
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      isLight
                        ? "text-white/90 hover:text-white hover:bg-white/10 drop-shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.85]">
                      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
                      <path d="M16 2v4M8 2v4M4 10h16" strokeLinecap="round" />
                    </svg>
                    <span className="hidden md:inline">Bookings</span>
                  </Link>

                  {/* Profile Link with Name */}
                  <Link
                    href="/account"
                    aria-label={`Account (${userFirstName})`}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isLight
                        ? "text-white hover:bg-white/15 drop-shadow-sm border border-white/20"
                        : "text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 border border-neutral-200"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2] shrink-0">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M5.5 20.5C6.5 16.8 9 15 12 15C15 15 17.5 16.8 18.5 20.5" strokeLinecap="round" />
                    </svg>
                    <span className="max-w-[100px] truncate">{userFirstName}</span>
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal({ view: "email" })}
                  aria-label="Sign in or register"
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${isLight
                      ? "text-white hover:text-cream-deep drop-shadow-sm"
                      : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100"
                    }`}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.85]">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5.5 20.5C6.5 16.8 9 15 12 15C15 15 17.5 16.8 18.5 20.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}

              {/* Shopping Cart Icon with Badge */}
              <Link
                href="/cart"
                aria-label={`Shopping cart (${cartCount ?? 0} item${cartCount === 1 ? "" : "s"})`}
                className={`relative p-1.5 rounded-full transition-colors ${isLight
                    ? "text-white hover:text-cream-deep drop-shadow-sm"
                    : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100"
                  }`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.85]">
                  <path d="M5 6L7 20H19L21 6H5Z" strokeLinejoin="round" />
                  <path d="M9 6V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V6" />
                </svg>
                {cartCount ? (
                  <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#183528] text-[9px] font-bold text-white shadow-sm ring-1 ring-white/50">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                ) : null}
              </Link>

              {/* Mobile Menu Toggle */}
              <input type="checkbox" id="mobile-nav-toggle" className="peer sr-only" />
              <label
                htmlFor="mobile-nav-toggle"
                className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full lg:hidden transition-colors ${isLight ? "text-white hover:bg-white/10" : "text-neutral-800 hover:bg-neutral-100"
                  }`}
              >
                <span className="sr-only">Open menu</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              </label>

              {/* Mobile Drawer */}
              <div className="pointer-events-none absolute inset-x-0 top-full z-40 hidden origin-top border-b border-neutral-200 bg-white/98 backdrop-blur-xl px-6 py-6 opacity-0 shadow-2xl transition-all peer-checked:pointer-events-auto peer-checked:block peer-checked:opacity-100 lg:hidden text-neutral-800">
                <nav aria-label="Mobile" className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${link.active
                          ? "font-semibold text-neutral-900 bg-neutral-100"
                          : "font-medium text-neutral-700 hover:bg-neutral-50"
                        }`}
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="pt-3 mt-2 border-t border-neutral-200">
                    {isAuthenticated ? (
                      <div className="space-y-1">
                        <div className="px-4 py-1 text-xs font-medium text-neutral-500">
                          Signed in as <strong className="text-neutral-900">{userFirstName}</strong>
                        </div>
                        <Link
                          href="/account"
                          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-900 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M5.5 20.5C6.5 16.8 9 15 12 15C15 15 17.5 16.8 18.5 20.5" strokeLinecap="round" />
                          </svg>
                          <span>My Account</span>
                        </Link>
                        <Link
                          href="/account/bookings"
                          className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                            <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
                            <path d="M16 2v4M8 2v4M4 10h16" strokeLinecap="round" />
                          </svg>
                          <span>My Bookings</span>
                        </Link>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openAuthModal({ view: "email" })}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#183528] text-white px-4 py-3 text-sm font-semibold hover:bg-[#12281e] transition-colors cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M5.5 20.5C6.5 16.8 9 15 12 15C15 15 17.5 16.8 18.5 20.5" strokeLinecap="round" />
                        </svg>
                        <span>Log in or sign up</span>
                      </button>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          </Container>
        );
      }}
    />
  );
}
