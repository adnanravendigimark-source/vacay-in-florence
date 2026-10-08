"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  createAttractionAction,
  updateAttractionAction,
  deleteAttractionAction,
  assignProductToAttractionAction,
  removeProductFromAttractionAction,
  moveProductInAttractionAction,
} from "@/app/admin/(protected)/experiences/attractions/actions";
import { setProductStatusAction } from "@/app/admin/(protected)/experiences/actions";
import { StatusBadge, formatPrice } from "@/components/admin/experience-table";
import type { AttractionFormData } from "@/lib/validation/attractions";
import type { CategoryIcon } from "@/lib/types";
import { DEFAULT_ATTRACTION_WHY_CHOOSE_ITEMS } from "@/lib/attraction-defaults";
import type { AdminProductListItem } from "@/lib/data/admin/products";
import { Field, Input, Select, Textarea, Button, Tabs, ImageField, Modal, useToast } from "@/components/admin/ui";

const ICON_LABEL: Record<CategoryIcon, string> = {
  landmark: "Landmark",
  museum: "Museum",
  "tour-guide": "Tour Guide",
  "food-wine": "Food & Wine",
  "day-trip": "Day Trip",
  outdoor: "Outdoor",
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

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export interface AttractionEditorProps {
  mode: "create" | "edit";
  attractionId?: string;
  initialValues: AttractionFormData;
  productCount?: number;
  assignedProducts?: AdminProductListItem[];
  unassignedProducts?: AdminProductListItem[];
}

export function AttractionEditor({
  mode,
  attractionId,
  initialValues,
  productCount = 0,
  assignedProducts = [],
  unassignedProducts = [],
}: AttractionEditorProps) {
  const [form, setForm] = useState<AttractionFormData>(initialValues);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const lastSavedSlug = useRef(initialValues.slug);
  const { showToast } = useToast();
  const router = useRouter();

  // Tickets & Experiences panel — separate pending state so a reorder/
  // assign/remove click never disables the main Save/Publish buttons.
  const [ticketsPending, startTicketsTransition] = useTransition();
  const [toAssign, setToAssign] = useState(unassignedProducts[0]?.id ?? "");

  function handleAssignTicket() {
    if (!attractionId || !toAssign) return;
    const product = unassignedProducts.find((p) => p.id === toAssign);
    if (!product) return;
    startTicketsTransition(async () => {
      const result = await assignProductToAttractionAction(product.id, attractionId, form.slug, product.slug);
      if (result.success) {
        showToast(`“${product.title}” assigned to this attraction.`, "success");
        router.refresh();
      } else {
        showToast(result.error ?? "Could not assign this ticket.", "error");
      }
    });
  }

  function handleRemoveTicket(product: AdminProductListItem) {
    if (!attractionId) return;
    startTicketsTransition(async () => {
      const result = await removeProductFromAttractionAction(product.id, attractionId, form.slug, product.slug);
      if (result.success) {
        showToast(`Removed “${product.title}” from this attraction.`, "success");
        router.refresh();
      } else {
        showToast(result.error ?? "Could not remove this ticket.", "error");
      }
    });
  }

  function handleMoveTicket(product: AdminProductListItem, direction: "up" | "down") {
    if (!attractionId) return;
    startTicketsTransition(async () => {
      const result = await moveProductInAttractionAction(product.id, direction, attractionId, form.slug);
      if (result.success) {
        router.refresh();
      } else {
        showToast(result.error ?? "Could not reorder tickets.", "error");
      }
    });
  }

  function handleToggleTicketStatus(product: AdminProductListItem) {
    const next = product.status === "live" ? "paused" : "live";
    startTicketsTransition(async () => {
      const result = await setProductStatusAction(product.id, next, product.slug);
      if (result.success) {
        showToast(next === "live" ? "Ticket published." : "Ticket paused.", "success");
        router.refresh();
      } else {
        showToast(result.error ?? "Could not update status.", "error");
      }
    });
  }

  function update<K extends keyof AttractionFormData>(key: K, value: AttractionFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateWhyChooseItem(index: number, field: "icon" | "title" | "description", value: string) {
    setForm((prev) => {
      const items = [...(prev.whyChooseItems ?? DEFAULT_ATTRACTION_WHY_CHOOSE_ITEMS)];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, whyChooseItems: items };
    });
  }

  function buildSubmission(): AttractionFormData {
    return {
      ...form,
      highlights: cleanLines(form.highlights).slice(0, 6),
      whyChooseItems: (form.whyChooseItems ?? DEFAULT_ATTRACTION_WHY_CHOOSE_ITEMS).map((item) => ({
        icon: item.icon.trim(),
        title: item.title.trim(),
        description: item.description.trim(),
      })),
    };
  }

  function handleSave(statusOverride?: AttractionFormData["status"]) {
    const submission = { ...buildSubmission(), ...(statusOverride ? { status: statusOverride } : {}) };
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createAttractionAction(submission)
          : await updateAttractionAction(attractionId as string, submission, lastSavedSlug.current);

      if (!result.success) {
        showToast(result.error ?? "Something went wrong. Please try again.", "error");
        return;
      }
      lastSavedSlug.current = submission.slug;
      if (mode === "create" && result.id) {
        showToast(
          statusOverride === "published" ? "Attraction created and published." : "Attraction created.",
          "success",
        );
        router.push(`/admin/experiences/attractions/${result.id}`);
        return;
      }
      setForm(submission);
      showToast(statusOverride === "published" ? "Published." : "Changes saved.", "success");
    });
  }

  function handleDelete() {
    if (!attractionId) return;
    startTransition(async () => {
      const result = await deleteAttractionAction(attractionId, form.slug);
      if (!result.success) {
        showToast(result.error ?? "Could not delete this attraction.", "error");
        setDeleteOpen(false);
        return;
      }
      showToast("Attraction deleted.", "success");
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
          / {mode === "create" ? "New Attraction" : "Edit Attraction"}
        </p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">
              {mode === "create" ? "New Attraction" : "Edit Attraction"}
            </h1>
            <p className="mt-1 text-xs text-ink-faint sm:text-[13px]">
              {mode === "create"
                ? "Fill in the details to create a new attraction (e.g. “Uffizi Gallery”, “Day Trips”)."
                : "Update this attraction. Changes go live on its public listing page after publishing."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mode === "edit" ? (
              <a
                href={`/experiences/attraction/${form.slug}?preview=1`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                <EyeIcon />
                Preview
              </a>
            ) : null}
            <Button variant="secondary" size="sm" onClick={() => handleSave()} disabled={isPending}>
              {isPending ? "Saving…" : form.status === "published" ? "Save Changes" : "Save Draft"}
            </Button>
            <Button size="sm" onClick={() => handleSave("published")} disabled={isPending}>
              {isPending ? "Publishing…" : "Publish"}
            </Button>
            {mode === "edit" ? (
              <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} disabled={isPending}>
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* BODY */}
      {/* ================================================================= */}
      <Tabs
        defaultTab="hero"
        tabs={[
          {
            key: "hero",
            label: "Hero Section",
            content: (
              <div className="space-y-5">
                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Basic Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Attraction Name" required hint='Shown as the H1 headline on this attraction’s page, e.g. "Uffizi Gallery"'>
                        <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Slug" required hint="lowercase-with-hyphens">
                      <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="uffizi-gallery" />
                    </Field>
                    <Field label="Icon" required>
                      <Select value={form.icon} onChange={(e) => update("icon", e.target.value as CategoryIcon)}>
                        {Object.entries(ICON_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <div>
                      <Field label="Status">
                        <Select
                          value={form.status}
                          onChange={(e) => update("status", e.target.value as AttractionFormData["status"])}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </Select>
                      </Field>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium text-ink">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => update("featured", e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300"
                      />
                      Featured
                    </label>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-3 text-sm font-semibold text-ink">Eyebrow Badge</h3>
                  <p className="mb-4 text-xs text-ink-faint">
                    Shown as the small pill above the headline on this attraction&apos;s page, and as the badge on its card on the /experiences grid.
                  </p>
                  <Field label="Badge text" hint='e.g. "Most Popular" — leave blank to show the default "ICONIC ATTRACTIONS" pill'>
                    <Input value={form.badgeText ?? ""} onChange={(e) => update("badgeText", e.target.value || null)} />
                  </Field>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <Field label="Short description" required hint={`${form.shortDescription.length}/300`}>
                    <Textarea
                      rows={3}
                      value={form.shortDescription}
                      onChange={(e) => update("shortDescription", e.target.value)}
                    />
                  </Field>
                  <p className="mt-2 text-xs text-ink-faint">
                    Used as the hero paragraph on this page, and reused in the About &amp; Gallery section below.
                  </p>
                </div>

                <div className="rounded-2xl border border-stone bg-cream px-5 py-4 text-xs text-ink-faint">
                  The italic subtitle shown under the headline (
                  <span className="font-medium text-ink">
                    {form.highlights[0] ? `“${form.highlights[0]}”` : "— none set —"}
                  </span>
                  ) is automatically the first line of <strong className="font-semibold text-ink">Highlights</strong>,
                  edited in the <strong className="font-semibold text-ink">About &amp; Gallery</strong> tab. The three
                  feature badges and the Location / Tickets / Rating info bar below the headline are generated
                  automatically and aren&apos;t editable here.
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Hero Image</h3>
                  <p className="mb-4 text-xs text-ink-faint">
                    Used as the background photo on this attraction&apos;s own page (<code className="text-[11px]">/experiences/attraction/{form.slug}</code>). Falls back to the Card Image (its own tab) when left blank.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ImageField label="Hero image" value={form.heroImageUrl ?? ""} onChange={(url) => update("heroImageUrl", url || null)} />
                    <Field label="Hero image alt text">
                      <Input value={form.heroImageAlt ?? ""} onChange={(e) => update("heroImageAlt", e.target.value || null)} />
                    </Field>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "about",
            label: "About & Gallery",
            content: (
              <div className="space-y-5">
                <div className="rounded-2xl border border-stone bg-cream px-5 py-4 text-xs text-ink-faint">
                  This is the &quot;Discover {form.name || "this attraction"}&quot; section on the page. Its heading and
                  paragraph are generated automatically from the Short description (Hero Section tab) plus the
                  Highlights below — there&apos;s no separate paragraph to write here.
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-1 text-sm font-semibold text-ink">Highlights</h3>
                  <p className="mb-4 text-xs text-ink-faint">
                    One per line, up to 6. The <strong className="font-semibold text-ink">first line</strong> becomes
                    the hero subtitle; all of them are woven into the &quot;Don&apos;t miss&quot; sentence and shown
                    as up to 4 highlight chips in this section. Also shown as bullet points on the attraction&apos;s
                    card on the /experiences grid.
                  </p>
                  <Field label="Highlights">
                    <Textarea
                      rows={5}
                      value={linesToText(form.highlights)}
                      onChange={(e) => update("highlights", textToLines(e.target.value))}
                      placeholder={"Botticelli's Birth of Venus\nSkip-the-line timed entry\nExpert-led gallery walkthroughs"}
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-dashed border-stone bg-cream px-5 py-4 text-xs text-ink-faint">
                  <h3 className="mb-1 text-sm font-semibold text-ink">Gallery</h3>
                  The 3-photo collage next to this text is pulled automatically from this attraction&apos;s first 3
                  published tickets&apos; photos (falling back to the Hero Image if there are fewer than 3 tickets).
                  There&apos;s no separate gallery to manage — add, reorder, or swap the photos on tickets in the{" "}
                  <strong className="font-semibold text-ink">Tickets &amp; Experiences</strong> tab to change what
                  shows up here.
                </div>
              </div>
            ),
          },
          {
            key: "tickets",
            label: "Tickets & Experiences",
            content:
              mode === "create" || !attractionId ? (
                <div className="rounded-2xl border border-stone bg-white p-5 text-sm text-ink-faint">
                  Save this attraction first — then come back here to assign tickets to it.
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-stone bg-white p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-ink">Tickets & Experiences</h3>
                        <p className="mt-0.5 text-xs text-ink-faint">
                          Every ticket below belongs ONLY to this attraction and appears on{" "}
                          <code className="text-[11px]">/experiences/attraction/{form.slug}</code> in this order.
                        </p>
                      </div>
                      <Button
                        href={`/admin/experiences/new?attractionId=${attractionId}`}
                        size="sm"
                      >
                        + Create new ticket
                      </Button>
                    </div>

                    {assignedProducts.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-stone bg-cream px-4 py-6 text-center text-xs text-ink-faint">
                        No tickets assigned yet. Create one, or assign an existing unassigned ticket below.
                      </p>
                    ) : (
                      <div className="divide-y divide-stone overflow-hidden rounded-xl border border-stone">
                        {assignedProducts.map((p, index) => (
                          <div key={p.id} className="flex items-center gap-3 bg-white px-3 py-2.5">
                            <div className="flex shrink-0 flex-col">
                              <button
                                type="button"
                                disabled={ticketsPending || index === 0}
                                onClick={() => handleMoveTicket(p, "up")}
                                title="Move up"
                                className="rounded px-1 text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={ticketsPending || index === assignedProducts.length - 1}
                                onClick={() => handleMoveTicket(p, "down")}
                                title="Move down"
                                className="rounded px-1 text-ink-faint hover:bg-stone hover:text-ink disabled:opacity-30"
                              >
                                ↓
                              </button>
                            </div>
                            <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                              {p.image ? (
                                <Image src={p.image.src} alt={p.image.alt} fill sizes="56px" className="object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                              <p className="truncate text-xs text-ink-faint">
                                {formatPrice(p.priceFromAmount, p.priceFromCurrency)} · {p.durationLabel}
                              </p>
                            </div>
                            <StatusBadge status={p.status} />
                            <div className="flex shrink-0 items-center gap-1.5">
                              <Button href={`/admin/experiences/${p.id}`} variant="secondary" size="sm">
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={ticketsPending || (p.status !== "live" && p.status !== "paused")}
                                onClick={() => handleToggleTicketStatus(p)}
                              >
                                {p.status === "live" ? "Pause" : "Publish"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={ticketsPending}
                                onClick={() => handleRemoveTicket(p)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="mt-4 text-xs text-ink-faint">
                      {productCount} experience{productCount === 1 ? "" : "s"} currently assigned to this attraction.
                      An attraction only shows on the public /experiences page once it&apos;s published and has at
                      least one live experience assigned.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone bg-white p-5">
                    <h3 className="mb-3 text-sm font-semibold text-ink">Assign an existing ticket</h3>
                    {unassignedProducts.length === 0 ? (
                      <p className="text-xs text-ink-faint">
                        No unassigned tickets available — every existing ticket already belongs to an attraction.
                      </p>
                    ) : (
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="min-w-[260px] flex-1">
                          <Field label="Ticket">
                            <Select value={toAssign} onChange={(e) => setToAssign(e.target.value)}>
                              {unassignedProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.title}
                                </option>
                              ))}
                            </Select>
                          </Field>
                        </div>
                        <Button size="sm" disabled={ticketsPending || !toAssign} onClick={handleAssignTicket}>
                          {ticketsPending ? "Assigning…" : "Assign to this attraction"}
                        </Button>
                      </div>
                    )}
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
                  <h3 className="text-sm font-semibold text-ink">
                    &quot;Why Choose Our {form.name || "This Attraction"} Experiences?&quot; banner
                  </h3>
                  <p className="mt-1 mb-4 text-xs text-ink-faint">
                    Only the heading inserts this attraction&apos;s name automatically — the photo is this
                    attraction&apos;s Hero Image. The four value-point cards below are editable per attraction; leave
                    them as-is to keep showing the site&apos;s default points.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(form.whyChooseItems ?? DEFAULT_ATTRACTION_WHY_CHOOSE_ITEMS).map((item, index) => (
                      <div key={index} className="space-y-2 rounded-xl border border-stone bg-cream p-3">
                        <div className="flex gap-2">
                          <div className="w-16 shrink-0">
                            <Field label="Icon">
                              <Input
                                value={item.icon}
                                onChange={(e) => updateWhyChooseItem(index, "icon", e.target.value)}
                                maxLength={4}
                                className="text-center"
                              />
                            </Field>
                          </div>
                          <div className="flex-1">
                            <Field label="Title">
                              <Input
                                value={item.title}
                                onChange={(e) => updateWhyChooseItem(index, "title", e.target.value)}
                                maxLength={40}
                              />
                            </Field>
                          </div>
                        </div>
                        <Field label="Description">
                          <Input
                            value={item.description}
                            onChange={(e) => updateWhyChooseItem(index, "description", e.target.value)}
                            maxLength={120}
                          />
                        </Field>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-1 text-sm font-semibold text-ink">
                    Bottom &quot;Need help planning your Florence visit?&quot; banner
                  </h3>
                  <p className="mb-4 text-xs text-ink-faint">
                    The same sitewide concierge banner shown at the bottom of every attraction page and the main
                    /experiences page — its heading and paragraph aren&apos;t attraction-specific. Only its button is
                    editable here; leave blank to show the site default.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Button label" hint='e.g. "Browse All Experiences" (default when blank)'>
                      <Input value={form.ctaLabel ?? ""} onChange={(e) => update("ctaLabel", e.target.value || null)} />
                    </Field>
                    <Field label="Button link" hint="/experiences (default when blank)">
                      <Input value={form.ctaHref ?? ""} onChange={(e) => update("ctaHref", e.target.value || null)} />
                    </Field>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "card",
            label: "Card Image",
            content: (
              <div className="rounded-2xl border border-stone bg-white p-5">
                <h3 className="mb-4 text-sm font-semibold text-ink">Card Image</h3>
                <p className="mb-4 text-xs text-ink-faint">
                  Not shown on this attraction&apos;s own page — this photo appears on its card on the{" "}
                  <code className="text-[11px]">/experiences</code> grid (the attraction list people browse before
                  clicking in), and is used as a fallback Hero Image when no Hero Image is set in the Hero Section tab.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ImageField label="Card image" required value={form.imageUrl} onChange={(url) => update("imageUrl", url)} />
                  <Field label="Card image alt text" required>
                    <Input value={form.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} />
                  </Field>
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
                      <Input value={form.metaTitle ?? ""} onChange={(e) => update("metaTitle", e.target.value || null)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Meta description" hint={`${(form.metaDescription ?? "").length}/200`}>
                      <Textarea rows={3} value={form.metaDescription ?? ""} onChange={(e) => update("metaDescription", e.target.value || null)} />
                    </Field>
                  </div>
                  <Field label="Canonical URL">
                    <Input value={form.canonicalUrl ?? ""} onChange={(e) => update("canonicalUrl", e.target.value || null)} />
                  </Field>
                  <div>
                    <ImageField label="Open Graph image" value={form.ogImage ?? ""} onChange={(url) => update("ogImage", url || null)} />
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

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete attraction?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-soft">
          {productCount > 0
            ? `This attraction has ${productCount} experience${productCount === 1 ? "" : "s"} assigned. Deletion will be blocked until they're reassigned — unpublish it instead if you just want it off the public site.`
            : "This can't be undone."}
        </p>
      </Modal>
    </div>
  );
}
