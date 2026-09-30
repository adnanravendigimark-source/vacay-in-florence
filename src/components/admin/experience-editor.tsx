"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createProductAction as adminCreateProductAction,
  deleteProductAction as adminDeleteProductAction,
  generateAvailabilityAction as adminGenerateAvailabilityAction,
  updateAvailabilityCapacityAction as adminUpdateAvailabilityCapacityAction,
  deleteAvailabilityDateAction as adminDeleteAvailabilityDateAction,
  updateProductAction as adminUpdateProductAction,
  type AvailabilityRow,
} from "@/app/admin/(protected)/experiences/actions";
import type { MutationResult } from "@/lib/data/admin/products";
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
  rejected: "Rejected",
  changes_requested: "Changes requested",
};

function linesToText(lines: (string | { category?: string; title: string; description?: string; badge?: string; icon?: string })[]): string {
  return lines
    .map((l) => {
      if (typeof l === "object" && l !== null) {
        if (l.description) return `${l.title} — ${l.description}`;
        return l.title;
      }
      return String(l || "");
    })
    .join("\n");
}
function textToLines(text: string): string[] {
  return text.split("\n");
}
function cleanLines(lines: string[]): string[] {
  return lines.map((s) => s.trim()).filter(Boolean);
}
function cleanHighlights(
  lines: (string | { category?: string; title: string; description?: string; badge?: string; icon?: string })[],
): (string | { category: string; title: string; description: string; badge: string; icon: string })[] {
  return lines
    .map((l) => {
      if (typeof l === "object" && l !== null) {
        return {
          category: l.category?.trim() || "",
          title: l.title.trim(),
          description: l.description?.trim() || "",
          badge: l.badge?.trim() || "",
          icon: l.icon?.trim() || "",
        };
      }
      return String(l || "").trim();
    })
    .filter((l) => (typeof l === "object" ? Boolean(l.title) : Boolean(l)));
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

export interface ExperienceEditorActions {
  create: (input: ProductFormData) => Promise<MutationResult>;
  update: (id: string, input: ProductFormData, previousSlug?: string) => Promise<MutationResult>;
  delete: (id: string, slug?: string) => Promise<MutationResult>;
  generateAvailability: (
    productId: string,
    input: { days: number; capacityTotal: number },
  ) => Promise<MutationResult & { availability?: AvailabilityRow[] }>;
  updateAvailabilityCapacity: (
    productId: string,
    date: string,
    capacityTotal: number,
  ) => Promise<MutationResult & { availability?: AvailabilityRow[] }>;
  deleteAvailabilityDate: (
    productId: string,
    date: string,
  ) => Promise<MutationResult & { availability?: AvailabilityRow[] }>;
}

export interface ExperienceEditorProps {
  mode: "create" | "edit";
  productId?: string;
  initialValues: ProductFormData;
  initialAvailability?: AvailabilityRow[];
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  /** Where the "Experiences" breadcrumb points and where create/delete
   * redirect back to. Defaults to the admin module's own list. */
  basePath?: string;
  /** Overrides the 6 mutating Server Actions this editor calls — used by
   * the supplier panel (src/app/supplier/(protected)/experiences) to route
   * every mutation through ownership-checked, status-neutering wrappers
   * instead of the admin actions. Defaults to the admin actions so every
   * existing admin call site is unaffected. */
  actions?: ExperienceEditorActions;
  /** Label + resulting status for the header's primary CTA. Admin default
   * is "Publish" -> "live". The supplier panel uses "Submit for Review" ->
   * "pending_review", since a supplier can never publish directly. */
  publishLabel?: string;
  publishStatus?: ProductFormData["status"];
  /** True in the supplier panel: hides the free-text Status dropdown
   * (a supplier's submitted status is never trusted anyway — see the
   * supplier Server Actions, which recompute it server-side regardless of
   * what's submitted — but hiding it here avoids showing a control that
   * would silently do nothing). */
  lockStatusField?: boolean;
  /** True in the supplier panel: hides the Supplier picker (a supplier can
   * never reassign their own listing to someone else) and shows their own
   * supplier name as plain text instead. */
  lockSupplierField?: boolean;
}

export function ExperienceEditor({
  mode,
  productId,
  initialValues,
  initialAvailability,
  categories,
  suppliers,
  basePath = "/admin/experiences",
  actions,
  publishLabel = "Publish",
  publishStatus = "live",
  lockStatusField = false,
  lockSupplierField = false,
}: ExperienceEditorProps) {
  const createProductAction = actions?.create ?? adminCreateProductAction;
  const updateProductAction = actions?.update ?? adminUpdateProductAction;
  const deleteProductAction = actions?.delete ?? adminDeleteProductAction;
  const generateAvailabilityAction = actions?.generateAvailability ?? adminGenerateAvailabilityAction;
  const updateAvailabilityCapacityAction = actions?.updateAvailabilityCapacity ?? adminUpdateAvailabilityCapacityAction;
  const deleteAvailabilityDateAction = actions?.deleteAvailabilityDate ?? adminDeleteAvailabilityDateAction;
  const [form, setForm] = useState<ProductFormData>(initialValues);
  const [availability, setAvailability] = useState<AvailabilityRow[]>(initialAvailability ?? []);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [expandedGalleryIndex, setExpandedGalleryIndex] = useState<number | null>(null);
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState("");
  const [newFeatureText, setNewFeatureText] = useState<Record<number, string>>({});
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
  // The public product page only ever renders up to 3 gallery thumbnails
  // (src/app/(public)/experiences/[slug]/page.tsx galleryThumbs =
  // product.images.slice(1, 4)) — a 4th+ gallery image would be saved but
  // never actually shown to a visitor, so the admin editor caps it here
  // too rather than letting someone add images that silently do nothing.
  const MAX_GALLERY_IMAGES = 3;

  // Appends a new empty gallery slot (images[0] is always the main image,
  // so a gallery entry always lands at images[1+]). If there's no main
  // image row yet, seed an empty one first so the new slot still lands
  // in the gallery rather than becoming the main image by accident.
  function addGalleryImage() {
    if (galleryImages.length >= MAX_GALLERY_IMAGES) return;
    const nextImages =
      form.images.length === 0 ? [{ url: "", alt: "" }, { url: "", alt: "" }] : [...form.images, { url: "", alt: "" }];
    update("images", nextImages);
    setExpandedGalleryIndex(nextImages.length - 2);
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

  function addOptionFeature(optionIndex: number) {
    const value = (newFeatureText[optionIndex] ?? "").trim();
    if (!value) return;
    update(
      "options",
      form.options.map((o, i) =>
        i === optionIndex && !o.features.includes(value) ? { ...o, features: [...o.features, value] } : o,
      ),
    );
    setNewFeatureText((prev) => ({ ...prev, [optionIndex]: "" }));
  }
  function removeOptionFeature(optionIndex: number, feature: string) {
    update(
      "options",
      form.options.map((o, i) => (i === optionIndex ? { ...o, features: o.features.filter((f) => f !== feature) } : o)),
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
      highlights: cleanHighlights(form.highlights),
      inclusions: cleanLines(form.inclusions),
      exclusions: cleanLines(form.exclusions),
      badges: cleanLines(form.badges),
      timeSlots: form.timeSlots.map((s) => s.trim()).filter(Boolean),
      goodToKnow: cleanLines(form.goodToKnow),
      images: form.images.filter((img) => img.url.trim() && img.alt.trim()),
      options: form.options.filter((o) => o.name.trim()).map((o) => ({ ...o, features: cleanLines(o.features) })),
      // New public-page content sections — same "drop empty rows, keep
      secretHistoryPoints: form.secretHistoryPoints
        .map((p) => {
          if (typeof p === "string") {
            const trimmed = p.trim();
            return trimmed ? { title: trimmed, description: "", image: "" } : null;
          }
          if (!p.title.trim()) return null;
          return {
            title: p.title.trim(),
            description: p.description?.trim() ?? "",
            image: p.image?.trim() ?? "",
          };
        })
        .filter((p): p is { title: string; description: string; image: string } => p !== null),
      ultimateExperiencePoints: form.ultimateExperiencePoints
        .map((p) => {
          if (typeof p === "string") {
            const trimmed = p.trim();
            return trimmed ? { title: trimmed, description: "", icon: "star" } : null;
          }
          if (!p.title.trim()) return null;
          return {
            title: p.title.trim(),
            description: p.description?.trim() ?? "",
            icon: p.icon?.trim() ?? "star",
          };
        })
        .filter((p): p is { title: string; description: string; icon: string } => p !== null),
      bestTimeToVisitTips: form.bestTimeToVisitTips
        .map((t) => {
          if (typeof t === "string") {
            const trimmed = t.trim();
            return trimmed ? { season: "", months: "", title: "", description: trimmed, image: "", icon: "" } : null;
          }
          if (!t.description?.trim() && !t.season?.trim() && !t.months?.trim() && !t.title?.trim()) return null;
          return {
            season: t.season?.trim() ?? "",
            months: t.months?.trim() ?? t.title?.trim() ?? "",
            title: t.title?.trim() ?? t.months?.trim() ?? "",
            description: t.description?.trim() ?? "",
            image: t.image?.trim() ?? "",
            icon: t.icon?.trim() ?? "",
          };
        })
        .filter((t): t is { season: string; months: string; title: string; description: string; image: string; icon: string } => t !== null),
      relatedBlogSlugs: cleanLines(form.relatedBlogSlugs),
      itinerary: form.itinerary
        .filter((s) => s.title.trim())
        .map((s) => ({
          title: s.title.trim(),
          time: s.time?.trim() ?? "",
          description: s.description?.trim() ?? "",
          image: s.image?.trim() ?? "",
          tag: s.tag?.trim() ?? "",
          icon: s.icon?.trim() ?? "store",
        })),
      entrances: form.entrances.filter((e) => e.name.trim()),
      openingHours: form.openingHours.filter((r) => r.day.trim() && r.hours.trim()),
      gettingThereOptions: form.gettingThereOptions
        .filter((g) => g.mode.trim())
        .map((g) => ({
          mode: g.mode.trim(),
          description: g.description?.trim() ?? "",
          image: g.image?.trim() ?? "",
          tag: g.tag?.trim() ?? "",
          icon: g.icon?.trim() ?? "foot",
        })),
      faqs: form.faqs.filter((f) => f.question.trim() && f.answer.trim()),
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
        router.push(`${basePath}/${result.id}`);
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
      router.push(basePath);
    });
  }

  return (
    <div className="pb-16 space-y-6">
      {/* ================================================================= */}
      {/* HEADER */}
      {/* ================================================================= */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-stone bg-cream/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <p className="text-[11px] font-medium text-ink-faint">
          <Link href={basePath} className="hover:text-cypress">
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
            <Button size="sm" onClick={() => handleSave(publishStatus)} disabled={isPending}>
              {isPending ? "Saving…" : publishLabel}
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
                            {lockStatusField ? (
                              <p className="flex h-10 items-center rounded-xl border border-stone bg-neutral-50 px-3.5 text-sm text-ink-faint">
                                {STATUS_LABEL[form.status]} — use the buttons above to save a draft or submit for
                                review
                              </p>
                            ) : (
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
                            )}
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
                                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active
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
                      <Field label="Highlights" hint="One per line — 'Title — Description' format creates rich cards on the public page">
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
                key: "sections",
                label: "Page Sections",
                content: (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-ink">Why Visit &amp; 4 Feature Highlights</h3>
                        <p className="mt-0.5 text-xs text-ink-faint">
                          The prominent top hook and 4 highlight cards shown below the gallery on the public experience page.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-ink mb-1">
                            Why Visit Hook (Main Pitch)
                          </label>
                          <Textarea
                            rows={3}
                            value={form.whyVisit ?? ""}
                            onChange={(e) => update("whyVisit", e.target.value || null)}
                            placeholder="Why this experience is worth visitors' time — the pitch in 1-3 sentences (e.g. You don't just watch someone cook Tuscan food — you shop for it at a real local market, then cook and eat every course yourself.)."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-ink mb-1">
                            Feature Highlight Cards (4 Cards)
                          </label>
                          <p className="text-[11px] text-ink-faint mb-1.5">
                            One per line. Use <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">Title — Description</code> format to show bold titles with descriptions on the cards.
                          </p>
                          <Textarea
                            rows={4}
                            value={linesToText(form.highlights)}
                            onChange={(e) => update("highlights", textToLines(e.target.value))}
                            placeholder={"Hands-on masterclass — Roll up your sleeves and prepare fresh pasta from scratch\nMarket visit included — Pick fresh, seasonal ingredients with your local chef\nThree-course feast — Enjoy your meal paired with fine Tuscan estate wine\nSmall group — Personalized attention with a genuine local guide"}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-ink">Recommended Visit Schedule (Day at a Glance)</h3>
                          <p className="mt-0.5 text-xs text-ink-faint">
                            Step-by-step visual cards shown on the public experience page with photos, badges, and itinerary details.
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            update("itinerary", [
                              ...form.itinerary,
                              { time: "", title: "", description: "", image: "", tag: "", icon: "store" },
                            ])
                          }
                        >
                          + Add step
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {form.itinerary.map((step, index) => (
                          <div key={index} className="rounded-xl border border-stone/80 bg-[#faf9f6] p-4 transition hover:border-neutral-400">
                            {/* Step Header */}
                            <div className="mb-3 flex items-center justify-between border-b border-stone/60 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#183D2B] text-[11px] font-bold text-white">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="text-xs font-bold text-ink">
                                  {step.title ? step.title : `Step ${index + 1}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => {
                                    if (index === 0) return;
                                    const next = [...form.itinerary];
                                    const [moved] = next.splice(index, 1);
                                    next.splice(index - 1, 0, moved);
                                    update("itinerary", next);
                                  }}
                                  className="rounded p-1 text-xs text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                                  title="Move Up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  disabled={index === form.itinerary.length - 1}
                                  onClick={() => {
                                    if (index === form.itinerary.length - 1) return;
                                    const next = [...form.itinerary];
                                    const [moved] = next.splice(index, 1);
                                    next.splice(index + 1, 0, moved);
                                    update("itinerary", next);
                                  }}
                                  className="rounded p-1 text-xs text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                                  title="Move Down"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => update("itinerary", form.itinerary.filter((_, i) => i !== index))}
                                  className="rounded px-2 py-0.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            {/* Step Inputs */}
                            <div className="grid gap-3 sm:grid-cols-3">
                              <Field label="Step Title" required>
                                <Input
                                  value={step.title}
                                  placeholder="e.g. Meet at Sant'Ambrogio Market"
                                  onChange={(e) =>
                                    update(
                                      "itinerary",
                                      form.itinerary.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)),
                                    )
                                  }
                                />
                              </Field>

                              <Field label="Tag / Time Pill" hint="e.g. Start, Mid-morning, 9:30 AM">
                                <Input
                                  value={step.tag || step.time || ""}
                                  placeholder="e.g. Start or Mid-morning"
                                  onChange={(e) =>
                                    update(
                                      "itinerary",
                                      form.itinerary.map((s, i) =>
                                        i === index ? { ...s, tag: e.target.value, time: e.target.value } : s,
                                      ),
                                    )
                                  }
                                />
                              </Field>

                              <Field label="Step Icon">
                                <select
                                  value={step.icon || "store"}
                                  onChange={(e) =>
                                    update(
                                      "itinerary",
                                      form.itinerary.map((s, i) => (i === index ? { ...s, icon: e.target.value } : s)),
                                    )
                                  }
                                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
                                >
                                  <option value="store">🛒 Market / Store</option>
                                  <option value="chef">👨‍🍳 Chef / Kitchen</option>
                                  <option value="utensils">🍽️ Dining / Food</option>
                                  <option value="wine">🍷 Wine & Drinks</option>
                                  <option value="ticket">🎟️ Ticket / Entry</option>
                                  <option value="museum">🏛️ Museum / Gallery</option>
                                  <option value="landmark">🏰 Monument / Landmark</option>
                                  <option value="camera">📷 Viewpoint / Photo</option>
                                  <option value="bike">🚲 Bike / Active</option>
                                  <option value="compass">🧭 Guided Walk / Tour</option>
                                  <option value="bus">🚌 Transport / Pickup</option>
                                  <option value="clock">⏱️ Timed Check-in</option>
                                </select>
                              </Field>
                            </div>

                            {/* Image Uploader & Preview */}
                            <div className="mt-3">
                              <ImageField
                                label="Step Photo"
                                hint="Upload or paste image URL for this schedule card"
                                value={step.image || ""}
                                onChange={(url) =>
                                  update(
                                    "itinerary",
                                    form.itinerary.map((s, i) => (i === index ? { ...s, image: url } : s)),
                                  )
                                }
                              />
                            </div>

                            {/* Step Description */}
                            <div className="mt-3">
                              <Field label="Description" hint="Detailed instructions or overview for this phase">
                                <Textarea
                                  rows={2}
                                  value={step.description || ""}
                                  placeholder="e.g. Your instructor walks the stalls with you, picking seasonal ingredients for the day's menu."
                                  onChange={(e) =>
                                    update(
                                      "itinerary",
                                      form.itinerary.map((s, i) => (i === index ? { ...s, description: e.target.value } : s)),
                                    )
                                  }
                                />
                              </Field>
                            </div>
                          </div>
                        ))}

                        {form.itinerary.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-stone bg-[#faf9f6] p-6 text-center">
                            <p className="text-sm font-medium text-ink">No itinerary steps yet.</p>
                            <p className="mt-1 text-xs text-ink-faint">
                              Click "+ Add step" above to build the recommended visit schedule with images and icons.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-ink">Secrets, History &amp; Artistic Significance</h3>
                          <p className="mt-0.5 text-xs text-ink-faint">
                            Curated stories, hidden facts, and art historical insights shown with photo cards on the public page.
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const normalized = form.secretHistoryPoints.map((p) =>
                              typeof p === "string" ? { title: p, description: "", image: "" } : p,
                            );
                            update("secretHistoryPoints", [
                              ...normalized,
                              { title: "", description: "", image: "" },
                            ]);
                          }}
                        >
                          + Add story
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {form.secretHistoryPoints.map((rawPoint, index) => {
                          const point =
                            typeof rawPoint === "string"
                              ? { title: rawPoint, description: "", image: "" }
                              : rawPoint;

                          return (
                            <div
                              key={index}
                              className="rounded-xl border border-stone/80 bg-[#faf9f6] p-4 transition hover:border-neutral-400"
                            >
                              {/* Card Header */}
                              <div className="mb-3 flex items-center justify-between border-b border-stone/60 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#183D2B] text-[11px] font-bold text-white">
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                  <span className="text-xs font-bold text-ink">
                                    {point.title ? point.title : `Story ${index + 1}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => {
                                      if (index === 0) return;
                                      const normalized = form.secretHistoryPoints.map((p) =>
                                        typeof p === "string" ? { title: p, description: "", image: "" } : p,
                                      );
                                      const [moved] = normalized.splice(index, 1);
                                      normalized.splice(index - 1, 0, moved);
                                      update("secretHistoryPoints", normalized);
                                    }}
                                    className="rounded p-1 text-xs text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                                    title="Move Up"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === form.secretHistoryPoints.length - 1}
                                    onClick={() => {
                                      if (index === form.secretHistoryPoints.length - 1) return;
                                      const normalized = form.secretHistoryPoints.map((p) =>
                                        typeof p === "string" ? { title: p, description: "", image: "" } : p,
                                      );
                                      const [moved] = normalized.splice(index, 1);
                                      normalized.splice(index + 1, 0, moved);
                                      update("secretHistoryPoints", normalized);
                                    }}
                                    className="rounded p-1 text-xs text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                                    title="Move Down"
                                  >
                                    ↓
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      update(
                                        "secretHistoryPoints",
                                        form.secretHistoryPoints.filter((_, i) => i !== index),
                                      )
                                    }
                                    className="rounded px-2 py-0.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>

                              {/* Card Inputs */}
                              <div className="space-y-3">
                                <Field label="Story Title / Headline" required>
                                  <Input
                                    value={point.title}
                                    placeholder="e.g. The Uffizi was originally built in 1560"
                                    onChange={(e) => {
                                      const normalized = form.secretHistoryPoints.map((p, i) => {
                                        const obj =
                                          typeof p === "string" ? { title: p, description: "", image: "" } : { ...p };
                                        return i === index ? { ...obj, title: e.target.value } : obj;
                                      });
                                      update("secretHistoryPoints", normalized);
                                    }}
                                  />
                                </Field>

                                <Field label="Story Context / Description" hint="Historical background and significance">
                                  <Textarea
                                    rows={2}
                                    value={point.description || ""}
                                    placeholder="e.g. as government offices ('uffizi' literally means offices) for Cosimo I de' Medici."
                                    onChange={(e) => {
                                      const normalized = form.secretHistoryPoints.map((p, i) => {
                                        const obj =
                                          typeof p === "string" ? { title: p, description: "", image: "" } : { ...p };
                                        return i === index ? { ...obj, description: e.target.value } : obj;
                                      });
                                      update("secretHistoryPoints", normalized);
                                    }}
                                  />
                                </Field>

                                <ImageField
                                  label="Story Photo"
                                  hint="Upload or paste image URL for this historical card"
                                  value={point.image || ""}
                                  onChange={(url) => {
                                    const normalized = form.secretHistoryPoints.map((p, i) => {
                                      const obj =
                                        typeof p === "string" ? { title: p, description: "", image: "" } : { ...p };
                                      return i === index ? { ...obj, image: url } : obj;
                                    });
                                    update("secretHistoryPoints", normalized);
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}

                        {form.secretHistoryPoints.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-stone bg-[#faf9f6] p-6 text-center">
                            <p className="text-sm font-medium text-ink">No secret history stories yet.</p>
                            <p className="mt-1 text-xs text-ink-faint">
                              Click "+ Add story" above to create engaging history cards with images and titles.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-ink">Key Entrances & Access Points</h3>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => update("entrances", [...form.entrances, { name: "", description: "" }])}
                        >
                          + Add entrance
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {form.entrances.map((entrance, index) => (
                          <div key={index} className="rounded-xl border border-stone bg-white p-3">
                            <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
                              <Field label="Name">
                                <Input
                                  value={entrance.name}
                                  onChange={(e) =>
                                    update("entrances", form.entrances.map((n, i) => (i === index ? { ...n, name: e.target.value } : n)))
                                  }
                                />
                              </Field>
                              <Field label="Description" hint="Optional">
                                <Input
                                  value={entrance.description}
                                  onChange={(e) =>
                                    update("entrances", form.entrances.map((n, i) => (i === index ? { ...n, description: e.target.value } : n)))
                                  }
                                />
                              </Field>
                              <div className="flex items-end">
                                <Button variant="ghost" size="sm" onClick={() => update("entrances", form.entrances.filter((_, i) => i !== index))}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {form.entrances.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-stone p-4 text-center text-sm text-ink-faint">
                            No entrances listed yet — add one above.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-ink">The Ultimate Experience / Premium Highlights</h3>
                          <p className="mt-0.5 text-xs text-ink-faint">
                            Headline, overview paragraph, and feature highlight cards that explain why this experience stands out.
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const normalized = form.ultimateExperiencePoints.map((p) =>
                              typeof p === "string" ? { title: p, description: "", icon: "star" } : p,
                            );
                            update("ultimateExperiencePoints", [
                              ...normalized,
                              { title: "", description: "", icon: "chef" },
                            ]);
                          }}
                        >
                          + Add feature
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <Field label="Section Headline" hint='e.g. "Cook It Yourself — Don&#39;t Just Watch"'>
                          <Input
                            value={form.ultimateExperienceTitle ?? ""}
                            onChange={(e) => update("ultimateExperienceTitle", e.target.value || null)}
                            placeholder="e.g. Cook It Yourself — Don't Just Watch"
                          />
                        </Field>

                        <Field label="Section Subtitle / Overview" hint="e.g. Small groups, hands-on every course, and a market visit that actually shapes what you cook that day.">
                          <Textarea
                            rows={2}
                            value={form.ultimateExperienceDescription ?? ""}
                            placeholder="Small groups, hands-on every course, and a market visit that actually shapes what you cook that day."
                            onChange={(e) => update("ultimateExperienceDescription", e.target.value || null)}
                          />
                        </Field>

                        <div>
                          <ImageField
                            label="Section Feature Photo (Arched Card)"
                            hint="Upload or paste image URL for the prominent arched photo in this section (e.g. /images/hero2-chianti-wine.jpg)"
                            value={form.ultimateExperienceImage || ""}
                            onChange={(url) => update("ultimateExperienceImage", url || null)}
                          />
                        </div>

                        <div className="mt-4 space-y-4">
                          <label className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                            Feature Highlight Cards
                          </label>

                          {form.ultimateExperiencePoints.map((rawPoint, index) => {
                            const point =
                              typeof rawPoint === "string"
                                ? { title: rawPoint, description: "", icon: "star" }
                                : rawPoint;

                            return (
                              <div
                                key={index}
                                className="rounded-xl border border-stone/80 bg-[#faf9f6] p-4 transition hover:border-neutral-400"
                              >
                                {/* Card Header */}
                                <div className="mb-3 flex items-center justify-between border-b border-stone/60 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#183D2B] text-[11px] font-bold text-white">
                                      {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-xs font-bold text-ink">
                                      {point.title || `Feature ${index + 1}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={index === 0}
                                      onClick={() => {
                                        if (index === 0) return;
                                        const normalized = form.ultimateExperiencePoints.map((p) =>
                                          typeof p === "string" ? { title: p, description: "", icon: "star" } : p,
                                        );
                                        const [moved] = normalized.splice(index, 1);
                                        normalized.splice(index - 1, 0, moved);
                                        update("ultimateExperiencePoints", normalized);
                                      }}
                                      className="rounded p-1 text-xs text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                                      title="Move Up"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      disabled={index === form.ultimateExperiencePoints.length - 1}
                                      onClick={() => {
                                        if (index === form.ultimateExperiencePoints.length - 1) return;
                                        const normalized = form.ultimateExperiencePoints.map((p) =>
                                          typeof p === "string" ? { title: p, description: "", icon: "star" } : p,
                                        );
                                        const [moved] = normalized.splice(index, 1);
                                        normalized.splice(index + 1, 0, moved);
                                        update("ultimateExperiencePoints", normalized);
                                      }}
                                      className="rounded p-1 text-xs text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                                      title="Move Down"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        update(
                                          "ultimateExperiencePoints",
                                          form.ultimateExperiencePoints.filter((_, i) => i !== index),
                                        )
                                      }
                                      className="rounded px-2 py-0.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>

                                {/* Card Inputs */}
                                <div className="grid gap-3 sm:grid-cols-3">
                                  <div className="sm:col-span-2">
                                    <Field label="Feature Title" required>
                                      <Input
                                        value={point.title || ""}
                                        placeholder='e.g. "You cook every course — this isn&#39;t a demonstration"'
                                        onChange={(e) => {
                                          const normalized = form.ultimateExperiencePoints.map((p, i) => {
                                            const obj =
                                              typeof p === "string" ? { title: p, description: "", icon: "star" } : { ...p };
                                            return i === index ? { ...obj, title: e.target.value } : obj;
                                          });
                                          update("ultimateExperiencePoints", normalized);
                                        }}
                                      />
                                    </Field>
                                  </div>

                                  <Field label="Feature Icon">
                                    <select
                                      value={point.icon || "star"}
                                      onChange={(e) => {
                                        const normalized = form.ultimateExperiencePoints.map((p, i) => {
                                          const obj =
                                            typeof p === "string" ? { title: p, description: "", icon: "star" } : { ...p };
                                          return i === index ? { ...obj, icon: e.target.value } : obj;
                                        });
                                        update("ultimateExperiencePoints", normalized);
                                      }}
                                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
                                    >
                                      <option value="chef">👨‍🍳 Chef / Hands-on Cooking</option>
                                      <option value="book">📖 Recipe Booklet / Take-home</option>
                                      <option value="wine">🍷 Wine Pairing / Drinks</option>
                                      <option value="ticket">🎟️ Skip-the-line / Fast Track</option>
                                      <option value="museum">🏛️ Museum Masterpieces</option>
                                      <option value="crown">👑 VIP / Small Group</option>
                                      <option value="guide">🧭 Local Florentine Guide</option>
                                      <option value="camera">📷 Scenic Views / Terrace</option>
                                      <option value="star">⭐ Premium Feature</option>
                                    </select>
                                  </Field>
                                </div>

                                {/* Description */}
                                <div className="mt-3">
                                  <Field label="Feature Description" hint="Detailed benefit or takeaway">
                                    <Textarea
                                      rows={2}
                                      value={point.description || ""}
                                      placeholder="Get hands-on with every dish, from start to finish, with expert guidance at your side."
                                      onChange={(e) => {
                                        const normalized = form.ultimateExperiencePoints.map((p, i) => {
                                          const obj =
                                            typeof p === "string" ? { title: p, description: "", icon: "star" } : { ...p };
                                          return i === index ? { ...obj, description: e.target.value } : obj;
                                        });
                                        update("ultimateExperiencePoints", normalized);
                                      }}
                                    />
                                  </Field>
                                </div>
                              </div>
                            );
                          })}

                          {form.ultimateExperiencePoints.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-stone bg-[#faf9f6] p-6 text-center">
                              <p className="text-sm font-medium text-ink">No feature highlights yet.</p>
                              <p className="mt-1 text-xs text-ink-faint">
                                Click "+ Add feature" above to showcase why this experience is extraordinary.
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-ink">Opening Hours & Operational Info</h3>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => update("openingHours", [...form.openingHours, { day: "", hours: "" }])}
                        >
                          + Add row
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {form.openingHours.map((row, index) => (
                          <div key={index} className="rounded-xl border border-stone bg-white p-3">
                            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                              <Field label="Day(s)" hint='e.g. "Mon–Fri" or "Every day"'>
                                <Input
                                  value={row.day}
                                  onChange={(e) =>
                                    update("openingHours", form.openingHours.map((r, i) => (i === index ? { ...r, day: e.target.value } : r)))
                                  }
                                />
                              </Field>
                              <Field label="Hours" hint='e.g. "9:00 AM – 6:00 PM"'>
                                <Input
                                  value={row.hours}
                                  onChange={(e) =>
                                    update("openingHours", form.openingHours.map((r, i) => (i === index ? { ...r, hours: e.target.value } : r)))
                                  }
                                />
                              </Field>
                              <div className="flex items-end">
                                <Button variant="ghost" size="sm" onClick={() => update("openingHours", form.openingHours.filter((_, i) => i !== index))}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {form.openingHours.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-stone p-4 text-center text-sm text-ink-faint">
                            No opening hours set yet — add a row above.
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-4">
                        <Field label="Operational notes" hint='Optional — e.g. "Last entry 30 minutes before closing"'>
                          <Input
                            value={form.operationalInfo ?? ""}
                            onChange={(e) => update("operationalInfo", e.target.value || null)}
                          />
                        </Field>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-ink">Location &amp; How to Get There</h3>
                          <p className="mt-0.5 text-xs text-ink-faint">
                            Curate transport cards (On foot, By bus, Taxi, Shuttle) with photos, duration pills, and icons.
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            update("gettingThereOptions", [
                              ...form.gettingThereOptions,
                              { mode: "", description: "", image: "", tag: "", icon: "foot" },
                            ])
                          }
                        >
                          + Add transport option
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {form.gettingThereOptions.map((opt, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-stone/80 bg-[#faf9f6] p-4 transition hover:border-neutral-400"
                          >
                            {/* Card Header */}
                            <div className="mb-3 flex items-center justify-between border-b border-stone/60 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#183D2B] text-[11px] font-bold text-white">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="text-xs font-bold text-ink">
                                  {opt.mode ? opt.mode : `Option ${index + 1}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => {
                                    if (index === 0) return;
                                    const next = [...form.gettingThereOptions];
                                    const [moved] = next.splice(index, 1);
                                    next.splice(index - 1, 0, moved);
                                    update("gettingThereOptions", next);
                                  }}
                                  className="rounded p-1 text-xs text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                                  title="Move Up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  disabled={index === form.gettingThereOptions.length - 1}
                                  onClick={() => {
                                    if (index === form.gettingThereOptions.length - 1) return;
                                    const next = [...form.gettingThereOptions];
                                    const [moved] = next.splice(index, 1);
                                    next.splice(index + 1, 0, moved);
                                    update("gettingThereOptions", next);
                                  }}
                                  className="rounded p-1 text-xs text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                                  title="Move Down"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    update(
                                      "gettingThereOptions",
                                      form.gettingThereOptions.filter((_, i) => i !== index),
                                    )
                                  }
                                  className="rounded px-2 py-0.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            {/* Card Inputs */}
                            <div className="grid gap-3 sm:grid-cols-3">
                              <Field label="Transport Mode" required>
                                <Input
                                  value={opt.mode}
                                  placeholder='e.g. "On Foot", "By Bus", "By Taxi"'
                                  onChange={(e) =>
                                    update(
                                      "gettingThereOptions",
                                      form.gettingThereOptions.map((g, i) =>
                                        i === index ? { ...g, mode: e.target.value } : g,
                                      ),
                                    )
                                  }
                                />
                              </Field>

                              <Field label="Duration / Stops Tag" hint='e.g. "15 minutes", "14 stops"'>
                                <Input
                                  value={opt.tag || ""}
                                  placeholder='e.g. "15 minutes" or "Line 14"'
                                  onChange={(e) =>
                                    update(
                                      "gettingThereOptions",
                                      form.gettingThereOptions.map((g, i) =>
                                        i === index ? { ...g, tag: e.target.value } : g,
                                      ),
                                    )
                                  }
                                />
                              </Field>

                              <Field label="Icon">
                                <select
                                  value={opt.icon || "foot"}
                                  onChange={(e) =>
                                    update(
                                      "gettingThereOptions",
                                      form.gettingThereOptions.map((g, i) =>
                                        i === index ? { ...g, icon: e.target.value } : g,
                                      ),
                                    )
                                  }
                                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
                                >
                                  <option value="foot">🚶 On Foot / Walking</option>
                                  <option value="bus">🚌 Public Bus</option>
                                  <option value="taxi">🚕 Taxi / Car</option>
                                  <option value="train">🚆 Train / Tram</option>
                                  <option value="bike">🚲 Bicycle</option>
                                  <option value="pickup">🚐 Coach / Shuttle Pickup</option>
                                  <option value="pin">📍 Meeting Point</option>
                                </select>
                              </Field>
                            </div>

                            {/* Image Uploader & Preview */}
                            <div className="mt-3">
                              <ImageField
                                label="Option Photo"
                                hint="Upload or paste image URL for this transport card"
                                value={opt.image || ""}
                                onChange={(url) =>
                                  update(
                                    "gettingThereOptions",
                                    form.gettingThereOptions.map((g, i) =>
                                      i === index ? { ...g, image: url } : g,
                                    ),
                                  )
                                }
                              />
                            </div>

                            {/* Option Description */}
                            <div className="mt-3">
                              <Field label="Directions &amp; Details" hint="Walking directions, bus lines, or taxi instructions">
                                <Textarea
                                  rows={2}
                                  value={opt.description || ""}
                                  placeholder="e.g. Sant'Ambrogio Market is about a 15-minute walk east of the Duomo, in a quieter part of the historic center."
                                  onChange={(e) =>
                                    update(
                                      "gettingThereOptions",
                                      form.gettingThereOptions.map((g, i) =>
                                        i === index ? { ...g, description: e.target.value } : g,
                                      ),
                                    )
                                  }
                                />
                              </Field>
                            </div>
                          </div>
                        ))}

                        {form.gettingThereOptions.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-stone bg-[#faf9f6] p-6 text-center">
                            <p className="text-sm font-medium text-ink">No transport options yet.</p>
                            <p className="mt-1 text-xs text-ink-faint">
                              Click "+ Add transport option" above to build the travel guide cards.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-ink">When to Visit &amp; Seasonal Highlights</h3>
                          <p className="mt-0.5 text-xs text-ink-faint">
                            Overview description and seasonal cards (Spring, Summer, Autumn &amp; Winter) with photos and weather tips.
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const normalized = form.bestTimeToVisitTips.map((t) =>
                              typeof t === "string"
                                ? { season: "", months: "", title: "", description: t, image: "", icon: "flower" }
                                : t,
                            );
                            update("bestTimeToVisitTips", [
                              ...normalized,
                              { season: "Spring", months: "March – May", title: "March – May", description: "", image: "", icon: "flower" },
                            ]);
                          }}
                        >
                          + Add season
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <Field label="Section Subtitle / Overview" hint="e.g. The experience is enjoyable year-round, but genuinely varies with the seasons...">
                          <Textarea
                            rows={2}
                            value={form.bestTimeToVisit ?? ""}
                            placeholder="The market is enjoyable year-round, but the experience genuinely varies with the seasons..."
                            onChange={(e) => update("bestTimeToVisit", e.target.value || null)}
                          />
                        </Field>

                        <div className="mt-4 space-y-4">
                          <label className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                            Seasonal Recommendation Cards
                          </label>

                          {form.bestTimeToVisitTips.map((rawTip, index) => {
                            const tip =
                              typeof rawTip === "string"
                                ? { season: "", months: "", title: "", description: rawTip, image: "", icon: "flower" }
                                : rawTip;

                            return (
                              <div
                                key={index}
                                className="rounded-xl border border-stone/80 bg-[#faf9f6] p-4 transition hover:border-neutral-400"
                              >
                                {/* Card Header */}
                                <div className="mb-3 flex items-center justify-between border-b border-stone/60 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#183D2B] text-[11px] font-bold text-white">
                                      {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-xs font-bold text-ink">
                                      {tip.season || tip.months || tip.title || `Season ${index + 1}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={index === 0}
                                      onClick={() => {
                                        if (index === 0) return;
                                        const normalized = form.bestTimeToVisitTips.map((t) =>
                                          typeof t === "string"
                                            ? { season: "", months: "", title: "", description: t, image: "", icon: "flower" }
                                            : t,
                                        );
                                        const [moved] = normalized.splice(index, 1);
                                        normalized.splice(index - 1, 0, moved);
                                        update("bestTimeToVisitTips", normalized);
                                      }}
                                      className="rounded p-1 text-xs text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                                      title="Move Up"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      disabled={index === form.bestTimeToVisitTips.length - 1}
                                      onClick={() => {
                                        if (index === form.bestTimeToVisitTips.length - 1) return;
                                        const normalized = form.bestTimeToVisitTips.map((t) =>
                                          typeof t === "string"
                                            ? { season: "", months: "", title: "", description: t, image: "", icon: "flower" }
                                            : t,
                                        );
                                        const [moved] = normalized.splice(index, 1);
                                        normalized.splice(index + 1, 0, moved);
                                        update("bestTimeToVisitTips", normalized);
                                      }}
                                      className="rounded p-1 text-xs text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                                      title="Move Down"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        update(
                                          "bestTimeToVisitTips",
                                          form.bestTimeToVisitTips.filter((_, i) => i !== index),
                                        )
                                      }
                                      className="rounded px-2 py-0.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>

                                {/* Card Inputs */}
                                <div className="grid gap-3 sm:grid-cols-3">
                                  <Field label="Season Label" hint='e.g. "Spring", "Summer"'>
                                    <Input
                                      value={tip.season || ""}
                                      placeholder='e.g. "Spring" or "Autumn & Winter"'
                                      onChange={(e) => {
                                        const normalized = form.bestTimeToVisitTips.map((t, i) => {
                                          const obj =
                                            typeof t === "string"
                                              ? { season: "", months: "", title: "", description: t, image: "", icon: "flower" }
                                              : { ...t };
                                          return i === index ? { ...obj, season: e.target.value } : obj;
                                        });
                                        update("bestTimeToVisitTips", normalized);
                                      }}
                                    />
                                  </Field>

                                  <Field label="Months / Period" hint='e.g. "March – May"'>
                                    <Input
                                      value={tip.months || tip.title || ""}
                                      placeholder='e.g. "March – May"'
                                      onChange={(e) => {
                                        const normalized = form.bestTimeToVisitTips.map((t, i) => {
                                          const obj =
                                            typeof t === "string"
                                              ? { season: "", months: "", title: "", description: t, image: "", icon: "flower" }
                                              : { ...t };
                                          return i === index ? { ...obj, months: e.target.value, title: e.target.value } : obj;
                                        });
                                        update("bestTimeToVisitTips", normalized);
                                      }}
                                    />
                                  </Field>

                                  <Field label="Season Icon">
                                    <select
                                      value={tip.icon || "flower"}
                                      onChange={(e) => {
                                        const normalized = form.bestTimeToVisitTips.map((t, i) => {
                                          const obj =
                                            typeof t === "string"
                                              ? { season: "", months: "", title: "", description: t, image: "", icon: "flower" }
                                              : { ...t };
                                          return i === index ? { ...obj, icon: e.target.value } : obj;
                                        });
                                        update("bestTimeToVisitTips", normalized);
                                      }}
                                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
                                    >
                                      <option value="flower">🌸 Spring / Flowers</option>
                                      <option value="sun">☀️ Summer / Sunshine</option>
                                      <option value="leaf">🍃 Autumn / Harvest Leaf</option>
                                      <option value="snow">❄️ Winter / Crisp &amp; Cozy</option>
                                      <option value="clock">⏱️ Time / Hours</option>
                                    </select>
                                  </Field>
                                </div>

                                {/* Image Uploader & Preview */}
                                <div className="mt-3">
                                  <ImageField
                                    label="Season Photo"
                                    hint="Upload or paste image URL for this seasonal card"
                                    value={tip.image || ""}
                                    onChange={(url) => {
                                      const normalized = form.bestTimeToVisitTips.map((t, i) => {
                                        const obj =
                                          typeof t === "string"
                                            ? { season: "", months: "", title: "", description: t, image: "", icon: "flower" }
                                            : { ...t };
                                        return i === index ? { ...obj, image: url } : obj;
                                      });
                                      update("bestTimeToVisitTips", normalized);
                                    }}
                                  />
                                </div>

                                {/* Description */}
                                <div className="mt-3">
                                  <Field label="Seasonal Description / Advice" hint="Atmosphere, crowd levels, and weather tips">
                                    <Textarea
                                      rows={2}
                                      value={tip.description || ""}
                                      placeholder="Mild weather, blooming flowers and a lively atmosphere make spring a great time to visit."
                                      onChange={(e) => {
                                        const normalized = form.bestTimeToVisitTips.map((t, i) => {
                                          const obj =
                                            typeof t === "string"
                                              ? { season: "", months: "", title: "", description: t, image: "", icon: "flower" }
                                              : { ...t };
                                          return i === index ? { ...obj, description: e.target.value } : obj;
                                        });
                                        update("bestTimeToVisitTips", normalized);
                                      }}
                                    />
                                  </Field>
                                </div>
                              </div>
                            );
                          })}

                          {form.bestTimeToVisitTips.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-stone bg-[#faf9f6] p-6 text-center">
                              <p className="text-sm font-medium text-ink">No seasonal recommendation cards yet.</p>
                              <p className="mt-1 text-xs text-ink-faint">
                                Click "+ Add season" above to create Spring, Summer, and Autumn/Winter cards.
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-ink">Frequently Asked Questions</h3>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => update("faqs", [...form.faqs, { question: "", answer: "" }])}
                        >
                          + Add question
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {form.faqs.map((faq, index) => (
                          <div key={index} className="rounded-xl border border-stone bg-white p-3">
                            <div className="grid gap-3 sm:grid-cols-[2fr_auto] items-end">
                              <Field label="Question">
                                <Input
                                  value={faq.question}
                                  onChange={(e) =>
                                    update("faqs", form.faqs.map((f, i) => (i === index ? { ...f, question: e.target.value } : f)))
                                  }
                                />
                              </Field>
                              <Button variant="ghost" size="sm" onClick={() => update("faqs", form.faqs.filter((_, i) => i !== index))}>
                                Remove
                              </Button>
                            </div>
                            <div className="mt-3">
                              <Field label="Answer">
                                <Textarea
                                  rows={2}
                                  value={faq.answer}
                                  onChange={(e) =>
                                    update("faqs", form.faqs.map((f, i) => (i === index ? { ...f, answer: e.target.value } : f)))
                                  }
                                />
                              </Field>
                            </div>
                          </div>
                        ))}
                        {form.faqs.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-stone p-4 text-center text-sm text-ink-faint">
                            No FAQs yet — add one above.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <Field
                        label="Related Travel Guides & Blog Articles"
                        hint="Blog post slugs, one per line, in display order — leave empty to auto-match by category"
                      >
                        <Textarea
                          rows={2}
                          value={linesToText(form.relatedBlogSlugs)}
                          onChange={(e) => update("relatedBlogSlugs", textToLines(e.target.value))}
                          placeholder="florence-hidden-gems"
                        />
                      </Field>
                    </div>

                    <div className="rounded-2xl border border-stone bg-white p-5">
                      <h3 className="mb-1 text-sm font-semibold text-ink">Bottom Call-to-Action</h3>
                      <p className="mb-3 text-xs text-ink-faint">
                        Optional overrides for the closing banner — leave blank to use the default copy.
                      </p>
                      <div className="space-y-4">
                        <Field label="Headline" hint="Optional">
                          <Input
                            value={form.ctaHeadline ?? ""}
                            onChange={(e) => update("ctaHeadline", e.target.value || null)}
                            placeholder="Ready to explore Florence?"
                          />
                        </Field>
                        <Field label="Subtext" hint="Optional">
                          <Textarea
                            rows={2}
                            value={form.ctaSubtext ?? ""}
                            onChange={(e) => update("ctaSubtext", e.target.value || null)}
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
                                features: [],
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
                            <div className="mt-3">
                              <Field
                                label="Features"
                                hint="Powers the public Ticket Comparison table — e.g. &ldquo;Skip the line&rdquo;"
                              >
                                <div className="mb-2 flex flex-wrap gap-1.5">
                                  {opt.features.map((feature) => (
                                    <span
                                      key={feature}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone bg-cream-deep/40 px-2.5 py-1 text-xs font-medium text-ink"
                                    >
                                      {feature}
                                      <button
                                        type="button"
                                        onClick={() => removeOptionFeature(index, feature)}
                                        aria-label={`Remove ${feature}`}
                                        className="text-ink-faint hover:text-red-600"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                  {opt.features.length === 0 ? (
                                    <span className="text-xs text-ink-faint">No features set for this tier yet.</span>
                                  ) : null}
                                </div>
                                <div className="flex max-w-sm gap-1.5">
                                  <input
                                    type="text"
                                    value={newFeatureText[index] ?? ""}
                                    onChange={(e) => setNewFeatureText((prev) => ({ ...prev, [index]: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addOptionFeature(index);
                                      }
                                    }}
                                    placeholder="e.g. Audio guide included"
                                    className="min-w-0 flex-1 rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs outline-none focus:border-cypress"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => addOptionFeature(index)}
                                    className="shrink-0 rounded-lg border border-stone bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                  >
                                    + Add
                                  </button>
                                </div>
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
                          generateAvailabilityAction={generateAvailabilityAction}
                          updateAvailabilityCapacityAction={updateAvailabilityCapacityAction}
                          deleteAvailabilityDateAction={deleteAvailabilityDateAction}
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
            <div className="mb-1 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Gallery Images</h3>
              {galleryImages.length < MAX_GALLERY_IMAGES ? (
                <Button type="button" variant="secondary" size="sm" onClick={addGalleryImage}>
                  + Add Image
                </Button>
              ) : null}
            </div>
            <p className="mb-3 text-[11px] text-ink-faint">
              Up to {MAX_GALLERY_IMAGES} — that&apos;s all the public page displays ({galleryImages.length}/{MAX_GALLERY_IMAGES} used).
            </p>
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((img, i) => (
                  <div key={i} className="relative">
                    <button
                      type="button"
                      onClick={() => setExpandedGalleryIndex(expandedGalleryIndex === i ? null : i)}
                      className={`group relative aspect-square w-full overflow-hidden rounded-lg border bg-neutral-100 ${expandedGalleryIndex === i ? "border-cypress" : "border-stone"
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
                  {lockSupplierField ? (
                    <p className="flex h-10 items-center rounded-xl border border-stone bg-neutral-50 px-3.5 text-sm text-ink-faint">
                      {suppliers.find((s) => s.id === form.supplierId)?.name ?? "—"}
                    </p>
                  ) : (
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
                  )}
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
  generateAvailabilityAction,
  updateAvailabilityCapacityAction,
  deleteAvailabilityDateAction,
}: {
  productId: string;
  availability: AvailabilityRow[];
  onAvailabilityChange: (rows: AvailabilityRow[]) => void;
  generateAvailabilityAction: ExperienceEditorActions["generateAvailability"];
  updateAvailabilityCapacityAction: ExperienceEditorActions["updateAvailabilityCapacity"];
  deleteAvailabilityDateAction: ExperienceEditorActions["deleteAvailabilityDate"];
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
                <AvailabilityRowItem
                  key={row.date}
                  productId={productId}
                  row={row}
                  onChange={onAvailabilityChange}
                  updateAvailabilityCapacityAction={updateAvailabilityCapacityAction}
                  deleteAvailabilityDateAction={deleteAvailabilityDateAction}
                />
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
  updateAvailabilityCapacityAction,
  deleteAvailabilityDateAction,
}: {
  productId: string;
  row: AvailabilityRow;
  onChange: (rows: AvailabilityRow[]) => void;
  updateAvailabilityCapacityAction: ExperienceEditorActions["updateAvailabilityCapacity"];
  deleteAvailabilityDateAction: ExperienceEditorActions["deleteAvailabilityDate"];
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
