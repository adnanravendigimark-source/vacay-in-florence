"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface ExperienceLocationMapProps {
  title: string;
  meetingPoint: string | null;
  meetingCity: string | null;
  meetingCountry: string | null;
  location: { lat: number; lng: number } | null;
  className?: string;
}

type Status = "loading" | "ready" | "error" | "empty";

// A real, interactive map (Mapbox GL JS) centered on the product's actual
// meeting-point coordinates — product.meetingLocation, sourced from the
// products table (src/lib/db/schema.ts's meeting_lat / meeting_lng, filled
// in directly or via server-side geocoding, see src/lib/geocoding.ts and
// getProductBySlug). Nothing here is hardcoded per-product or per-city:
// change the coordinates in the database and this renders a different
// place automatically, and it's draggable/zoomable like any real map —
// not a static screenshot.
//
// Uses the client-exposed NEXT_PUBLIC_MAPBOX_TOKEN (a Mapbox *public*
// token — meant to be used in the browser, unlike the secret
// MAPBOX_SERVER_TOKEN that src/lib/geocoding.ts uses server-side only).
// See .env.example for both.
export function ExperienceLocationMap({
  title,
  meetingPoint,
  meetingCity,
  meetingCountry,
  location,
  className = "",
}: ExperienceLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    // No coordinates, or no token configured — nothing to synchronize with
    // an external system in either case, so both are handled at render
    // time via effectiveStatus below rather than by setting state here.
    if (!location) return;
    if (!token) {
      console.warn(
        "[ExperienceLocationMap] NEXT_PUBLIC_MAPBOX_TOKEN is not set — see .env.example."
      );
      return;
    }

    if (!containerRef.current) return;

    setStatus("loading");
    mapboxgl.accessToken = token;

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [location.lng, location.lat],
        zoom: 14.5,
        scrollZoom: false, // don't trap page scroll on a small embedded map
        attributionControl: false,
      });
    } catch (err) {
      console.error("[ExperienceLocationMap] Failed to initialize map:", err);
      // A synchronous constructor failure (e.g. WebGL unsupported) can only
      // be known by attempting the call — there's no render-time-derivable
      // condition to check beforehand, unlike the 'no location'/'no token'
      // cases above.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      return;
    }

    mapRef.current = map;

    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    // Custom brand-colored marker + name label, built as a single DOM
    // element so it pans and zooms with the map like a real marker
    // (rather than an absolutely-positioned overlay tracking a static
    // image). Styling matches the rest of the site's pin treatment.
    const markerEl = document.createElement("div");
    markerEl.className = "vf-map-marker";
    markerEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;">
        <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:#2b0934;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,0.25);flex-shrink:0;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
          </svg>
        </div>
        <div style="border-radius:9999px;background:rgba(255,255,255,0.97);padding:4px 12px;font-size:12px;font-weight:700;color:#171717;box-shadow:0 2px 8px rgba(0,0,0,0.18);border:1px solid rgba(0,0,0,0.06);white-space:nowrap;max-width:220px;overflow:hidden;text-overflow:ellipsis;">
          ${escapeHtml(title)}
        </div>
      </div>
    `;

    const marker = new mapboxgl.Marker({ element: markerEl, anchor: "left" })
      .setLngLat([location.lng, location.lat])
      .addTo(map);

    map.on("load", () => setStatus("ready"));
    map.on("error", (e) => {
      console.error("[ExperienceLocationMap] Mapbox error:", e?.error ?? e);
      setStatus("error");
    });

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
    };
    // Intentionally depend on the primitive lat/lng (and title), not the
    // 'location' object itself — a new object identity on every parent
    // render would otherwise tear down and reinitialize the map constantly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lng, title]);

  // Derived, not stored: render-time override rather than a setState call
  // inside the effect for the synchronously-knowable 'no coordinates' and
  // 'no token configured' cases.
  const effectiveStatus: Status = !location ? "empty" : !token ? "error" : status;

  const locationLabel = [meetingPoint, meetingCity, meetingCountry].filter(Boolean).join(", ");

  // Honest empty state: no coordinates and nothing to geocode either —
  // never show a pin at a fake/guessed position.
  if (effectiveStatus === "empty") {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-[#E5E0D5] bg-[#EDE8E0] p-4 ${className}`}
      >
        <div className="rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-neutral-600 shadow-md border border-neutral-200/80 text-center">
          {meetingPoint ? "Exact location shared after booking" : "Location details coming soon"}
        </div>
      </div>
    );
  }

  // Map failed to initialize/load, or isn't configured (no token). Still
  // honest — shows the real address as text rather than a broken map.
  if (effectiveStatus === "error") {
    return (
      <div
        className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[#E5E0D5] bg-[#EDE8E0] p-5 text-center ${className}`}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-neutral-400 fill-none stroke-current stroke-2">
          <path d="M12 21s-8-6.5-8-12a8 8 0 1 1 16 0c0 5.5-8 12-8 12z" />
          <circle cx="12" cy="9" r="3" />
        </svg>
        <p className="text-xs font-semibold text-neutral-600">Map temporarily unavailable</p>
        {locationLabel && <p className="text-[11px] text-neutral-500 max-w-[85%]">{locationLabel}</p>}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#E5E0D5] bg-[#EDE8E0] ${className}`}>
      {/* mapbox-gl.css forces position: relative + no explicit height onto
          whatever element becomes the map container (it adds its own
          .mapboxgl-map class), which collides with an 'absolute inset-0'
          utility placed directly on that same element and collapses it to
          zero height. Keeping the truly-absolute, full-bleed wrapper
          SEPARATE from the ref'd element (which just fills it via
          w-full h-full, agnostic to whichever position mapbox-gl sets)
          avoids that collision. */}
      <div className="absolute inset-0">
        <div
          ref={containerRef}
          className="h-full w-full"
          aria-label={`Map showing the meeting point for ${title}`}
        />
      </div>
      {effectiveStatus === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#EDE8E0] animate-pulse">
          <span className="text-xs font-medium text-neutral-500">Loading map…</span>
        </div>
      )}
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
