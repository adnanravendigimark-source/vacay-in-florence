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
        className="rounded-xl px-3 py-1.5 text-xs font-semibold text-[#850b9e] transition hover:bg-[#f7ecfb] hover:text-[#2b0934] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        {status === "pending" ? "Signing out…" : "Sign out"}
      </button>
      {status === "error" ? (
        <p role="alert" className="px-3.5 pb-1 text-xs text-rose-600">
          Couldn&apos;t sign out — check your connection and try again.
        </p>
      ) : null}
    </div>
  );
}
