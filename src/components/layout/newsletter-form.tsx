"use client";

import { useActionState } from "react";
import { subscribeNewsletterAction, type NewsletterState } from "@/lib/actions/newsletter";

const initialState: NewsletterState = { status: "idle" };

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribeNewsletterAction, initialState);

  return (
    <div className="mb-6">
      <form action={formAction} className="relative flex items-center">
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          disabled={isPending}
          className="w-full rounded-full bg-white/10 border border-white/20 px-4 py-2.5 pr-12 text-xs text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none focus:bg-white/15 transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending}
          aria-label="Subscribe to newsletter"
          className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0e241a] transition-transform hover:scale-105 disabled:opacity-60"
        >
          <span className="text-xs font-bold">&rarr;</span>
        </button>
      </form>
      {state.status !== "idle" ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`mt-2 text-xs ${state.status === "error" ? "text-terracotta-light" : "text-white/80"}`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
