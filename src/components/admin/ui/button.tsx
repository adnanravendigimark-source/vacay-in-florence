import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-cypress text-white hover:bg-cypress/90 disabled:opacity-50",
  secondary:
    "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
  ghost: "text-ink-soft hover:bg-cream-deep disabled:opacity-50",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:shadow-none";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

// Admin-only button primitive — visually distinct from the public site's
// pill-shaped marketing CTAs (see auth-modal.tsx), using the denser
// rounded-xl treatment that matches account/layout.tsx's nav/card style.
// Renders a <Link> when `href` is given, otherwise a real <button>.
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  href,
  ...rest
}: CommonProps & (({ href: string } & { type?: never }) | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>))) {
  const classes = `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
