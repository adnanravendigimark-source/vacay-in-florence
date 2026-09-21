"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

  async function handleSignOut() {
    setStatus("pending");
    try {
      await signOut({ callbackUrl: "/" });
    } catch {
      // next-auth's signOut() has no built-in retry or error surface — a
      // dropped connection (e.g. a dev-server hiccup) otherwise fails
      // silently and leaves the visitor stuck looking signed in with no
      // feedback. Let them know and allow trying again.
      setStatus("error");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={status === "pending"}
        className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-terracotta-dark transition hover:bg-terracotta-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "pending" ? "Signing out…" : "Sign out"}
      </button>
      {status === "error" ? (
        <p role="alert" className="px-3.5 pb-1 text-xs text-terracotta-dark">
          Couldn&apos;t sign out — check your connection and try again.
        </p>
      ) : null}
    </div>
  );
}
