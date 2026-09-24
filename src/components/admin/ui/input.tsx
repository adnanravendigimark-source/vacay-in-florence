import type { InputHTMLAttributes } from "react";

const BASE_CLASSES =
  "w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand disabled:bg-neutral-50 disabled:text-neutral-400";

export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${BASE_CLASSES} ${className}`} {...rest} />;
}
