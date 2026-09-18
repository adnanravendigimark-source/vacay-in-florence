"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-terracotta-dark transition hover:bg-terracotta-light"
    >
      Sign out
    </button>
  );
}
