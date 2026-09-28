"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createProductAction,
  deleteProductAction,
  generateAvailabilityAction,
  updateAvailabilityCapacityAction,
  deleteAvailabilityDateAction,
  updateProductAction,
  type AvailabilityRow,
} from "@/app/admin/(protected)/experiences/actions";
import type { ProductFormData } from "@/lib/validation/products";
import { Field, Input, Select, Textarea, Button, Tabs, ImageField, Modal, useToast } from "@/components/admin/ui";
import { HomepageMediaField } from "@/components/admin/homepage-media-field";
import { PRODUCT_BADGE_OPTIONS, CURRENCY_OPTIONS } from "@/lib/constants";

// Labels match the wording already used on the admin experiences list
// (src/components/admin/experience-table.tsx STATUS_STYLE) so "live"
// reads the same everywhere in the admin panel: "Published".
const STATUS_LABEL: Record<ProductFormData["status"], string> = {
  draft: "Draft",
  pending_review: "Pending review",
  live: "Published",
  paused: "Paused",
};

function linesToText(lines: string[]): string {
  return lines.join("\n");
}
function textToLines(text: string): string[] {
  return text.split("\n");
}
function cleanLines(lines: string[]): string[] {
  return lines.map((s) => s.trim()).filter(Boolean);
}
function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(y, (m ?? 1) - 1, d ?? 1),
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current stroke-2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 fill-none stroke-current stroke-2 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export interface ExperienceEditorProps {
  mode: "create" | "edit";
  productId?: string;
  initialValues: ProductFormData;
  initialAvailability?: AvailabilityRow[];
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}

export function ExperienceEditor({
  mode,
  productId,
  initialValues,
  initialAvailability,
  categories,
  suppliers,
}: ExperienceEditorProps) {
  const [form, setForm] = useState<ProductFormData>(initialValues);
  const [availability, setAvailability] = useState<AvailabilityRow[]>(initialAvailability ?? []);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [expandedGalleryIndex, setExpandedGalleryIndex] = useState<number | null>(null);
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState("");
  const [isPending, startTransition] = useTransition();
  const lastSavedSlug = useRef(initialValues.slug);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }
  }, [menuOpen]);

  function update<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const mainImage = form.images[0];
  const galleryImages = useMemo(() => form.images.slice(1), [form.images]);

  function updateMainImage(patch: Partial<{ url: string; alt: string }>) {
    if (form.images.length === 0) {
      update("images", [{ url: patch.url ?? "", alt: patch.alt ?? "" }]);
      return;
    }
    update(
      "images",
      form.images.map((img, i) => (i === 0 ? { ...img, ...patch } : img)),
    );
  }
  function updateGalleryImage(index: number, patch: Partial<{ url: string; alt: string }>) {
    const realIndex = index + 1;
    update(
      "images",
      form.images.map((img, i) => (i === realIndex ? { ...img, ...patch } : img)),
    );
  }
  function removeGalleryImage(index: number) {
    const realIndex = index + 1;
    update(
      "images",
      form.images.filter((_, i) => i !== realIndex),
    );
    setExpandedGalleryIndex(null);
  }

  function addTimeSlot() {
    const value = newSlot.trim();
    if (!value || form.timeSlots.includes(value)) {
      setNewSlot("");
      return;
    }
    update("timeSlots", [...form.timeSlots, value]);
    setNewSlot("");
  }
  function removeTimeSlot(slot: string) {
    update(
      "timeSlots",
      form.timeSlots.filter((s) => s !== slot),
    );
  }

  const availabilityRange = useMemo(() => {
    if (availability.length === 0) return null;
    const dates = availability.map((a) => a.date).sort();
    return { from: dates[0], to: dates[dates.length - 1] };
  }, [availability]);

  function buildSubmission(): ProductFormData {
    return {
      ...form,
      highlights: cleanLines(form.highlights),
      inclusions: cleanLines(form.inclusions),
      exclusions: cleanLines(form.exclusions),
      badges: cleanLines(form.badges),
      timeSlots: form.timeSlots.map((s) => s.trim()).filter(Boolean),
      goodToKnow: cleanLines(form.goodToKnow),
      images: form.images.filter((img) => img.url.trim() && img.alt.trim()),
      options: form.options.filter((o) => o.name.trim()),
    };
  }

  function handleSave(statusOverride?: ProductFormData["status"]) {
    // buildSubmission() silently drops any image row that has a URL but
    // no alt text (both are required for a row to be saved) — that used to
    // mean a 4th, 5th, ... gallery image (or even the main image) could
    // vanish on save with zero explanation the moment its alt text was left
    // blank. Catch it here instead, before it's ever silently discarded.
    const missingAltIndex = form.images.findIndex((img) => img.url.trim() && !img.alt.trim());
    if (missingAltIndex !== -1) {
      showToast(
        missingAltIndex === 0
          ? "Add alt text for the main image before saving."
          : `Add alt text for gallery image ${missingAltIndex} before saving.`,
        "error",
      );
      if (missingAltIndex > 0) setExpandedGalleryIndex(missingAltIndex - 1);
      return;
    }
    const submission = { ...buildSubmission(), ...(statusOverride ? { status: statusOverride } : {}) };
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(submission)
          : await updateProductAction(productId as string, submission, lastSavedSlug.current);

      if (!result.success) {
        showToast(result.error ?? "Something went wrong. Please try again.", "error");
        return;
      }
      lastSavedSlug.current = submission.slug;
      if (mode === "create" && result.id) {
        showToast(statusOverride === "live" ? "Experience created and published." : "Experience created.", "success");
        router.push(`/admin/experiences/${result.id}`);
        return;
      }
      setForm(submission);
      showToast(statusOverride === "live" ? "Published." : "Changes saved.", "success");
    });
  }

  function handleDelete() {
    if (!productId) return;
    startTransition(async () => {
      const result = await deleteProductAction(productId, form.slug);
      if (!result.success) {
        showToast(result.error ?? "Could not delete this experience.", "error");
        setDeleteOpen(false);
        return;
      }
      showToast("Experience deleted.", "success");
      router.push("/admin/experiences");
    });
  }

  return (
    <div className="pb-16 space-y-6">
      {/* ================================================================= */}
      {/* HEADER */}
      {/* ================================================================= */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-stone bg-cream/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <p className="text-[11px] font-medium text-ink-faint">
          <Link href="/admin/experiences" className="hover:text-cypress">
            Experiences
          </Link>{" "}
          / {mode === "create" ? "New Experience" : "Edit Experience"}
        </p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">
              {mode === "create" ? "New Experience" : "Edit Experience"}
            </h1>
            <p className="mt-1 text-xs text-ink-faint sm:text-[13px]">
              {mode === "create"
                ? "Fill in the details to create a new experience."
                : "Update the details of this experience. Changes will be live on the public website after publishing."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mode === "edit" ? (
              <a
                href={`/experiences/${form.slug}?preview=1`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                <EyeIcon />
                Preview
              </a>
            ) : null}
            <Button variant="secondary" size="sm" onClick={() => handleSave()} disabled={isPending}>
              {isPending ? "Saving…" : form.status === "live" ? "Save Changes" : "Save Draft"}
            </Button>
            <Button size="sm" onClick={() => handleSave("live")} disabled={isPending}>
              {isPending ? "Publishing…" : "Publish"}
            </Button>
            {mode === "edit" ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="More actions"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-500 transition hover:bg-neutral-50"
                >
                  <MoreIcon />
                </button>
                {menuOpen ? (
                  <div className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-xl border border-stone bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteOpen(true);
                      }}
                      className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete experience
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* BODY — tabs on the left, persistent media/availability sidebar   */}
      {/* on the right (mirrors how the mockup keeps images/video/         */}
      {/* availability visible regardless of which tab is open).           */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <Tabs
            active={activeTab}
            onChange={setActiveTab}
            tabs={[
              {
                key: "basic",
                label: "Basic Info",
                content: (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <h3 className="mb-4 text-sm font-semibold text-ink">Basic Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Field label="Experience Title" required>
                            <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
                          </Field>
                        </div>
                        <Field label="Slug" required hint="lowercase-with-hyphens">
                          <Input
                            value={form.slug}
                            onChange={(e) => update("slug", e.target.value)}
                            placeholder="florence-duomo-walking-tour"
                          />
                        </Field>
                        <Field label="Category" required>
                          <Select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
                            <option value="" disabled>
                              Select a category
                            </option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field label="Duration" required hint='e.g. "3 hours"'>
                          <Input value={form.durationLabel} onChange={(e) => update("durationLabel", e.target.value)} />
                        </Field>
                        <div>
                          <Field label="Status">
                            <Select
                              value={form.status}
                              onChange={(e) => update("status", e.target.value as ProductFormData["status"])}
                            >
                              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </Select>
                          </Field>
                        </div>
                      </div>

                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <Field label="Short description" required hint={`${form.shortDescription.length}/300`}>
                        <Textarea
                          rows={2}
                          value={form.shortDescription}
                          onChange={(e) => update("shortDescription", e.target.value)}
                        />
                      </Field>
                      <div className="mt-4">
                        <Field label="Full description" required>
                          <Textarea
                            rows={7}
                            value={form.description}
                            onChange={(e) => update("description", e.target.value)}
                          />
                        </Field>
                      </div>
                      <div className="mt-4">
                        <Field label="Badges" hint="Shown as pills on the public page">
                          <div className="flex flex-wrap gap-1.5">
                            {PRODUCT_BADGE_OPTIONS.map((option) => {
                              const active = form.badges.includes(option.value);
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() =>
                                    update(
                                      "badges",
                                      active
                                        ? form.badges.filter((b) => b !== option.value)
                                        : [...form.badges, option.value],
                                    )
                                  }
                                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                    active
                                      ? "border-cypress bg-cypress text-white"
                                      : "border-stone bg-white text-neutral-700 hover:bg-neutral-50"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </Field>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "content",
                label: "Content & Location",
                content: (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <Field label="Highlights" hint="One per line">
                        <Textarea
                          rows={4}
                          value={linesToText(form.highlights)}
                          onChange={(e) => update("highlights", textToLines(e.target.value))}
                        />
                      </Field>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <Field
                        label="Good to know"
                        hint="One per line — shown as tips on the public page, alongside the cancellation policy"
                      >
                        <Textarea
                          rows={4}
                          value={linesToText(form.goodToKnow)}
                          onChange={(e) => update("goodToKnow", textToLines(e.target.value))}
                          placeholder={
                            "Show your voucher (mobile or printed) at the entrance\nArrive 10–15 minutes early\nBring a valid photo ID matching your booking name"
                          }
                        />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-stone bg-white p-5">
                        <Field label="Inclusions" hint="One per line">
                          <Textarea
                            rows={5}
                            value={linesToText(form.inclusions)}
                            onChange={(e) => update("inclusions", textToLines(e.target.value))}
                          />
                        </Field>
                      </div>
                      <div className="rounded-2xl border border-stone bg-white p-5">
                        <Field label="Exclusions" hint="One per line">
                          <Textarea
                            rows={5}
                            value={linesToText(form.exclusions)}
                            onChange={(e) => update("exclusions", textToLines(e.target.value))}
                          />
                        </Field>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <h3 className="mb-4 text-sm font-semibold text-ink">Meeting Location</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Field label="Meeting point" hint="Street address or venue name">
                            <Input
                              value={form.meetingPoint ?? ""}
                              onChange={(e) => update("meetingPoint", e.target.value || null)}
                            />
                          </Field>
                        </div>
                        <Field label="Meeting city">
                          <Input
                            value={form.meetingCity ?? ""}
                            onChange={(e) => update("meetingCity", e.target.value || null)}
                          />
                        </Field>
                        <Field label="Meeting country">
                          <Input
                            value={form.meetingCountry ?? ""}
                            onChange={(e) => update("meetingCountry", e.target.value || null)}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "pricing",
                label: "Pricing & Availability",
                content: (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Price from" required>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.priceFromAmount}
                            onChange={(e) => update("priceFromAmount", Number(e.target.value))}
                          />
                        </Field>
                        <Field label="Currency" hint="Display only — checkout still charges in EUR">
                          <Select
                            value={form.priceFromCurrency}
                            onChange={(e) => update("priceFromCurrency", e.target.value)}
                          >
                            {CURRENCY_OPTIONS.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </Select>
                        </Field>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-ink">Pricing tiers</h3>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            update("options", [
                              ...form.options,
                              {
                                name: "",
                                description: "",
                                priceAmount: 0,
                                priceCurrency: form.priceFromCurrency,
                                isActive: true,
                              },
                            ])
                          }
                        >
                          + Add tier
                        </Button>
                      </div>
                      <p className="mb-3 text-xs text-ink-faint">
                        Each row is a bookable variant — e.g. &ldquo;Adult&rdquo;, &ldquo;Child&rdquo;. Removing a row
                        hides it rather than deleting it outright, so past bookings that reference it are unaffected.
                      </p>
                      <div className="space-y-3">
                        {form.options.map((opt, index) => (
                          <div key={opt.id ?? `new-${index}`} className="rounded-xl border border-stone bg-white p-3">
                            <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                              <Field label="Name">
                                <Input
                                  value={opt.name}
                                  onChange={(e) =>
                                    update(
                                      "options",
                                      form.options.map((o, i) => (i === index ? { ...o, name: e.target.value } : o)),
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Price">
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={opt.priceAmount}
                                  onChange={(e) =>
                                    update(
                                      "options",
                                      form.options.map((o, i) =>
                                        i === index ? { ...o, priceAmount: Number(e.target.value) } : o,
                                      ),
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Currency">
                                <Select
                                  value={opt.priceCurrency}
                                  onChange={(e) =>
                                    update(
                                      "options",
                                      form.options.map((o, i) =>
                                        i === index ? { ...o, priceCurrency: e.target.value } : o,
                                      ),
                                    )
                                  }
                                >
                                  {CURRENCY_OPTIONS.map((c) => (
                                    <option key={c.value} value={c.value}>
                                      {c.label}
                                    </option>
                                  ))}
                                </Select>
                              </Field>
                              <div className="flex items-end gap-2">
                                <label className="flex items-center gap-1.5 pb-2.5 text-xs font-medium text-ink">
                                  <input
                                    type="checkbox"
                                    checked={opt.isActive}
                                    onChange={(e) =>
                                      update(
                                        "options",
                                        form.options.map((o, i) =>
                                          i === index ? { ...o, isActive: e.target.checked } : o,
                                        ),
                                      )
                                    }
                                    className="h-4 w-4 rounded border-neutral-300"
                                  />
                                  Active
                                </label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => update("options", form.options.filter((_, i) => i !== index))}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Field label="Description" hint="Optional">
                                <Input
                                  value={opt.description ?? ""}
                                  onChange={(e) =>
                                    update(
                                      "options",
                                      form.options.map((o, i) =>
                                        i === index ? { ...o, description: e.target.value } : o,
                                      ),
                                    )
                                  }
                                />
                              </Field>
                            </div>
                          </div>
                        ))}
                        {form.options.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-stone p-4 text-center text-sm text-ink-faint">
                            No pricing tiers yet — add one above.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <h3 className="mb-1 text-sm font-semibold text-ink">Time Slots</h3>
                      <p className="mb-3 text-xs text-ink-faint">
                        The times shown on this experience&rsquo;s public booking card.
                      </p>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {form.timeSlots.map((slot) => (
                          <span
                            key={slot}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-stone bg-cream-deep/40 px-2.5 py-1 text-xs font-medium text-ink"
                          >
                            {slot}
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(slot)}
                              aria-label={`Remove ${slot}`}
                              className="text-ink-faint hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {form.timeSlots.length === 0 ? (
                          <span className="text-xs text-ink-faint">
                            No time slots set — the public page falls back to a default schedule.
                          </span>
                        ) : null}
                      </div>
                      <div className="flex max-w-sm gap-1.5">
                        <input
                          type="text"
                          value={newSlot}
                          onChange={(e) => setNewSlot(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addTimeSlot();
                            }
                          }}
                          placeholder="e.g. 09:00 AM"
                          className="min-w-0 flex-1 rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs outline-none focus:border-cypress"
                        />
                        <button
                          type="button"
                          onClick={addTimeSlot}
                          className="shrink-0 rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                        >
                          + Add Slot
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <h3 className="mb-4 text-sm font-semibold text-ink">Availability Calendar</h3>
                      {mode === "create" || !productId ? (
                        <p className="rounded-xl border border-dashed border-stone p-6 text-center text-sm text-ink-faint">
                          Save this experience first to manage its availability calendar.
                        </p>
                      ) : (
                        <AvailabilityPanel
                          productId={productId}
                          availability={availability}
                          onAvailabilityChange={setAvailability}
                        />
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: "seo",
                label: "SEO",
                content: (
                  <div className="rounded-2xl border border-stone bg-white p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Field label="Meta title" hint={`${(form.metaTitle ?? "").length}/70`}>
                          <Input
                            value={form.metaTitle ?? ""}
                            onChange={(e) => update("metaTitle", e.target.value || null)}
                          />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Meta description" hint={`${(form.metaDescription ?? "").length}/200`}>
                          <Textarea
                            rows={3}
                            value={form.metaDescription ?? ""}
                            onChange={(e) => update("metaDescription", e.target.value || null)}
                          />
                        </Field>
                      </div>
                      <Field label="Canonical URL">
                        <Input
                          value={form.canonicalUrl ?? ""}
                          onChange={(e) => update("canonicalUrl", e.target.value || null)}
                        />
                      </Field>
                      <div>
                        <ImageField
                          label="Open Graph image"
                          value={form.ogImage ?? ""}
                          onChange={(url) => update("ogImage", url || null)}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm font-medium text-ink">
                        <input
                          type="checkbox"
                          checked={form.noIndex}
                          onChange={(e) => update("noIndex", e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-300"
                        />
                        No-index this page
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-ink">
                        <input
                          type="checkbox"
                          checked={form.noFollow}
                          onChange={(e) => update("noFollow", e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-300"
                        />
                        No-follow links on this page
                      </label>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* =============================================================== */}
        {/* SIDEBAR — media, video, availability summary + time slots,      */}
        {/* cancellation policy, and supplier assignment. Persistent across */}
        {/* every tab, same as the mockup. */}
        {/* =============================================================== */}
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-stone bg-white">
            <div className="relative aspect-[4/3] w-full bg-neutral-100">
              {mainImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-entered/uploaded URL, not an optimizable local asset
                <img src={mainImage.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-ink-faint">
                  No main image yet
                </div>
              )}
              {form.featured ? (
                <span className="absolute left-3 top-3 rounded-full bg-cypress px-2.5 py-1 text-[10px] font-semibold text-white">
                  Featured
                </span>
              ) : null}
            </div>
            <div className="space-y-2 p-3">
              <HomepageMediaField
                value={mainImage?.url ?? ""}
                onChange={(url) => updateMainImage({ url })}
                kind="image"
                folder="experiences"
                placeholder="Main image URL"
                compact
              />
              <input
                type="text"
                value={mainImage?.alt ?? ""}
                onChange={(e) => updateMainImage({ alt: e.target.value })}
                placeholder="Alt text (required)"
                className="w-full rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs outline-none focus:border-cypress"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-stone bg-white p-4">
            <div className="mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Gallery Images</h3>
            </div>
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((img, i) => (
                  <div key={i} className="relative">
                    <button
                      type="button"
                      onClick={() => setExpandedGalleryIndex(expandedGalleryIndex === i ? null : i)}
                      className={`group relative aspect-square w-full overflow-hidden rounded-lg border bg-neutral-100 ${
                        expandedGalleryIndex === i ? "border-cypress" : "border-stone"
                      }`}
                    >
                      {img.url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-entered/uploaded URL, not an optimizable local asset
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-ink-faint">Empty</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      aria-label="Remove image"
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md bg-black/60 text-white transition hover:bg-black/80"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-stone p-4 text-center text-xs text-ink-faint">
                No gallery images yet.
              </p>
            )}
            {expandedGalleryIndex !== null && galleryImages[expandedGalleryIndex] ? (
              <div className="mt-3 space-y-2 rounded-lg border border-stone bg-cream-deep/40 p-2.5">
                <HomepageMediaField
                  value={galleryImages[expandedGalleryIndex].url}
                  onChange={(url) => updateGalleryImage(expandedGalleryIndex, { url })}
                  kind="image"
                  folder="experiences"
                  compact
                />
                <input
                  type="text"
                  value={galleryImages[expandedGalleryIndex].alt}
                  onChange={(e) => updateGalleryImage(expandedGalleryIndex, { alt: e.target.value })}
                  placeholder="Alt text (required)"
                  className="w-full rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs outline-none focus:border-cypress"
                />
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-stone bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">Video (Optional)</h3>
            <HomepageMediaField
              value={form.videoUrl ?? ""}
              onChange={(url) => update("videoUrl", url || null)}
              kind="video"
              folder="experiences"
              compact
            />
          </div>

          <div className="rounded-2xl border border-stone bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Availability &amp; Time Slots
            </h3>
            <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-stone bg-cream-deep/40 px-3 py-2">
              <span className="text-xs text-ink-soft">
                {availabilityRange ? `${fmtDate(availabilityRange.from)} – ${fmtDate(availabilityRange.to)}` : "No dates generated yet"}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                className="shrink-0 text-xs font-semibold text-cypress hover:underline"
              >
                Manage →
              </button>
            </div>

            <p className="mb-1.5 text-xs font-semibold text-ink">Time Slots</p>
            {form.timeSlots.length > 0 ? (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {form.timeSlots.map((slot) => (
                  <span
                    key={slot}
                    className="inline-flex items-center rounded-lg border border-stone bg-cream-deep/40 px-2.5 py-1 text-[11px] font-medium text-ink"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="text-xs text-ink-faint">
              Time slots are added from the{" "}
              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                className="font-semibold text-cypress hover:underline"
              >
                Pricing &amp; Availability
              </button>{" "}
              tab.
            </p>

            <div className="mt-4 border-t border-stone pt-4">
              <p className="mb-1.5 text-xs font-semibold text-ink">Cancellation Policy</p>
              <Textarea
                rows={3}
                value={form.cancellationPolicy}
                onChange={(e) => update("cancellationPolicy", e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-stone bg-white p-4">
            <button
              type="button"
              onClick={() => setAdditionalOpen((o) => !o)}
              className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-faint"
            >
              Additional Settings
              <ChevronIcon open={additionalOpen} />
            </button>
            {additionalOpen ? (
              <div className="mt-3">
                <Field label="Supplier" required>
                  <Select value={form.supplierId} onChange={(e) => update("supplierId", e.target.value)}>
                    <option value="" disabled>
                      Select a supplier
                    </option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this experience?"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          This permanently removes &ldquo;{form.title || "this experience"}&rdquo; and its images and pricing options.
          If it has any bookings or is in a customer&rsquo;s cart, the delete will be blocked — pause it instead.
        </p>
      </Modal>
    </div>
  );
}

function AvailabilityPanel({
  productId,
  availability,
  onAvailabilityChange,
}: {
  productId: string;
  availability: AvailabilityRow[];
  onAvailabilityChange: (rows: AvailabilityRow[]) => void;
}) {
  const [days, setDays] = useState(90);
  const [capacityTotal, setCapacityTotal] = useState(20);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateAvailabilityAction(productId, { days, capacityTotal });
      if (result.success) {
        onAvailabilityChange(result.availability ?? []);
        showToast(`Generated availability for the next ${days} days.`, "success");
      } else {
        showToast(result.error ?? "Could not generate availability.", "error");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-stone bg-white p-4">
        <div className="w-28">
          <Field label="Days ahead">
            <Input type="number" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </Field>
        </div>
        <div className="w-28">
          <Field label="Daily capacity">
            <Input
              type="number"
              min={1}
              max={9999}
              value={capacityTotal}
              onChange={(e) => setCapacityTotal(Number(e.target.value))}
            />
          </Field>
        </div>
        <Button size="sm" onClick={handleGenerate} disabled={isPending}>
          {isPending ? "Generating…" : "Generate availability"}
        </Button>
        <p className="text-xs text-ink-faint">
          Raises capacity for existing dates too — never lowers a date below what&rsquo;s already booked.
        </p>
      </div>

      {availability.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone p-6 text-center text-sm text-ink-faint">
          No availability generated yet.
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto rounded-xl border border-stone">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 border-b border-stone bg-cream-deep/60">
              <tr>
                <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Date</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Capacity</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Booked</th>
                <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-faint" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone bg-white">
              {availability.map((row) => (
                <AvailabilityRowItem key={row.date} productId={productId} row={row} onChange={onAvailabilityChange} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AvailabilityRowItem({
  productId,
  row,
  onChange,
}: {
  productId: string;
  row: AvailabilityRow;
  onChange: (rows: AvailabilityRow[]) => void;
}) {
  const [capacity, setCapacity] = useState(row.capacityTotal);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const dirty = capacity !== row.capacityTotal;

  function handleSaveCapacity() {
    startTransition(async () => {
      const result = await updateAvailabilityCapacityAction(productId, row.date, capacity);
      if (result.success) onChange(result.availability ?? []);
      else showToast(result.error ?? "Could not update capacity.", "error");
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAvailabilityDateAction(productId, row.date);
      if (result.success) onChange(result.availability ?? []);
      else showToast(result.error ?? "Could not remove that date.", "error");
    });
  }

  return (
    <tr>
      <td className="px-4 py-2.5 text-ink">{row.date}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-20">
            <Input
              type="number"
              min={row.capacityBooked}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </div>
          {dirty ? (
            <Button variant="secondary" size="sm" onClick={handleSaveCapacity} disabled={isPending}>
              Save
            </Button>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-2.5 text-ink">{row.capacityBooked}</td>
      <td className="px-4 py-2.5 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isPending || row.capacityBooked > 0}
          title={row.capacityBooked > 0 ? "Has bookings — can't be removed" : undefined}
        >
          Remove
        </Button>
      </td>
    </tr>
  );
}
