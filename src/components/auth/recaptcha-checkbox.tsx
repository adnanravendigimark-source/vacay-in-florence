"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Google reCAPTCHA v2 ("I'm not a robot" checkbox) widget, loaded via the
 * vanilla https://www.google.com/recaptcha/api.js script rather than an
 * extra npm dependency — same approach this project already uses for
 * Mapbox GL JS (a direct script/SDK, no React wrapper package).
 *
 * Rendered with `render=explicit` so more than one widget can exist on a
 * page (the auth modal shows both a login and register view) without
 * fighting over an implicit auto-render target, and so we can `reset()`
 * a widget after a failed submit — a v2 token is single-use and Google
 * requires a fresh checkbox tick before it can be sent again.
 */

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
    __onRecaptchaApiLoad?: () => void;
  }
}

let recaptchaScriptPromise: Promise<void> | null = null;

function loadRecaptchaScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha) return Promise.resolve();
  if (recaptchaScriptPromise) return recaptchaScriptPromise;

  recaptchaScriptPromise = new Promise((resolve) => {
    window.__onRecaptchaApiLoad = () => resolve();
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?onload=__onRecaptchaApiLoad&render=explicit";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });

  return recaptchaScriptPromise;
}

export interface RecaptchaCheckboxHandle {
  /** Clears the current tick/token — call after a failed submit so the
   * visitor has to check the box again before retrying (tokens are
   * single-use on Google's side regardless). */
  reset: () => void;
}

export const RecaptchaCheckbox = forwardRef<RecaptchaCheckboxHandle, { onChange: (token: string | null) => void }>(
  function RecaptchaCheckbox({ onChange }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetId = useRef<number | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    useImperativeHandle(ref, () => ({
      reset() {
        if (widgetId.current !== null && window.grecaptcha) {
          window.grecaptcha.reset(widgetId.current);
        }
        onChangeRef.current(null);
      },
    }));

    useEffect(() => {
      if (!siteKey) return;
      let cancelled = false;

      loadRecaptchaScript().then(() => {
        if (cancelled || !containerRef.current || !window.grecaptcha || widgetId.current !== null) return;
        widgetId.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onChangeRef.current(token),
          "expired-callback": () => onChangeRef.current(null),
          "error-callback": () => onChangeRef.current(null),
        });
      });

      return () => {
        cancelled = true;
      };
    }, [siteKey]);

    if (!siteKey) {
      // Visible-in-dev, honest placeholder rather than silently skipping
      // verification — mirrors this project's "no fake success state"
      // convention (see the Google button before real OAuth keys existed).
      return (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          reCAPTCHA isn&apos;t configured yet (missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY).
        </p>
      );
    }

    return <div ref={containerRef} className="[&>div]:mx-auto" />;
  }
);
