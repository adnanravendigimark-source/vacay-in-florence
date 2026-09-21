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
          className="w-full rounded-full bg-white border border-stone px-4 py-2.5 pr-12 text-xs text-ink placeholder:text-ink-faint focus:border-cypress focus:outline-none transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending}
          aria-label="Subscribe to newsletter"
          className="absolute right-1 flex h-8 w-8 items-center justify-center rounded-full bg-cypress text-white transition-transform hover:scale-105 disabled:opacity-60"
        >
          <span className="text-xs font-bold">&rarr;</span>
        </button>
      </form>
      {state.status !== "idle" ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`mt-2 text-xs ${state.status === "error" ? "text-terracotta" : "text-ink-soft"}`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
