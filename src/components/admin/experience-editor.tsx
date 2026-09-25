"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Field, Input, Select, Textarea, Badge, Button, Tabs, ImageField, Modal, useToast } from "@/components/admin/ui";
import { HomepageMediaField } from "@/components/admin/homepage-media-field";

const STATUS_LABEL: Record<ProductFormData["status"], string> = {
  draft: "Draft",
  pending_review: "Pending review",
  live: "Live",
  paused: "Paused",
};

const STATUS_TONE: Record<ProductFormData["status"], "neutral" | "warning" | "success" | "danger"> = {
  draft: "neutral",
  pending_review: "warning",
  live: "success",
  paused: "danger",
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
  const [isPending, startTransition] = useTransition();
  const lastSavedSlug = useRef(initialValues.slug);
  const { showToast } = useToast();
  const router = useRouter();

  function update<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildSubmission(): ProductFormData {
    return {
      ...form,
      highlights: cleanLines(form.highlights),
      inclusions: cleanLines(form.inclusions),
      exclusions: cleanLines(form.exclusions),
      badges: cleanLines(form.badges),
      images: form.images.filter((img) => img.url.trim() && img.alt.trim()),
      options: form.options.filter((o) => o.name.trim()),
    };
  }

  function handleSave() {
    const submission = buildSubmission();
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
        showToast("Experience created.", "success");
        router.push(`/admin/experiences/${result.id}`);
        return;
      }
      setForm(submission);
      showToast("Changes saved.", "success");
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
      <div className="sticky top-0 z-20 -mx-4 border-b border-stone bg-cream/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-medium text-ink">
              {mode === "create" ? "New Experience" : form.title || "Untitled experience"}
            </h1>
            {mode === "edit" ? (
              <p className="truncate text-xs text-ink-faint">/experiences/{form.slug || "…"}</p>
            ) : null}
          </div>

          <div className="w-40">
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
          </div>
          <Badge tone={STATUS_TONE[form.status]}>{STATUS_LABEL[form.status]}</Badge>

          <label className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Featured
          </label>
          {form.featured ? (
            <div className="w-20">
              <Input
                type="number"
                value={form.featuredRank ?? ""}
                onChange={(e) => update("featuredRank", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="Rank"
              />
            </div>
          ) : null}

          <div className="ml-auto flex items-center gap-2">
            {mode === "edit" ? (
              <a
                href={`/experiences/${form.slug}?preview=1`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
              >
                Preview
              </a>
            ) : null}
            {mode === "edit" ? (
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)} disabled={isPending}>
                Delete
              </Button>
            ) : null}
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        tabs={[
          {
            key: "basics",
            label: "Basics",
            content: (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Title" required>
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
                <Field label="Duration" required hint='e.g. "3 hours"'>
                  <Input value={form.durationLabel} onChange={(e) => update("durationLabel", e.target.value)} />
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
                <div className="sm:col-span-2">
                  <Field label="Short description" required hint="Shown on cards and search results">
                    <Textarea
                      rows={2}
                      value={form.shortDescription}
                      onChange={(e) => update("shortDescription", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Description" required>
                    <Textarea rows={7} value={form.description} onChange={(e) => update("description", e.target.value)} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Tags" hint="Comma-separated, e.g. top-rated, family-friendly">
                    <Input
                      value={form.badges.join(", ")}
                      onChange={(e) => update("badges", e.target.value.split(","))}
                    />
                  </Field>
                </div>
              </div>
            ),
          },
          {
            key: "content",
            label: "Content & Location",
            content: (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Highlights" hint="One per line">
                    <Textarea
                      rows={4}
                      value={linesToText(form.highlights)}
                      onChange={(e) => update("highlights", textToLines(e.target.value))}
                    />
                  </Field>
                </div>
                <Field label="Inclusions" hint="One per line">
                  <Textarea
                    rows={5}
                    value={linesToText(form.inclusions)}
                    onChange={(e) => update("inclusions", textToLines(e.target.value))}
                  />
                </Field>
                <Field label="Exclusions" hint="One per line">
                  <Textarea
                    rows={5}
                    value={linesToText(form.exclusions)}
                    onChange={(e) => update("exclusions", textToLines(e.target.value))}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Cancellation policy" required>
                    <Textarea
                      rows={3}
                      value={form.cancellationPolicy}
                      onChange={(e) => update("cancellationPolicy", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Meeting point" hint="Street address or venue name">
                    <Input
                      value={form.meetingPoint ?? ""}
                      onChange={(e) => update("meetingPoint", e.target.value || null)}
                    />
                  </Field>
                </div>
                <Field label="Meeting city">
                  <Input value={form.meetingCity ?? ""} onChange={(e) => update("meetingCity", e.target.value || null)} />
                </Field>
                <Field label="Meeting country">
                  <Input
                    value={form.meetingCountry ?? ""}
                    onChange={(e) => update("meetingCountry", e.target.value || null)}
                  />
                </Field>
              </div>
            ),
          },
          {
            key: "pricing",
            label: "Pricing & Options",
            content: (
              <div className="space-y-6">
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
                  <Field label="Currency">
                    <Input value={form.priceFromCurrency} onChange={(e) => update("priceFromCurrency", e.target.value)} />
                  </Field>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">Pricing tiers / time slots</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        update("options", [
                          ...form.options,
                          { name: "", description: "", priceAmount: 0, priceCurrency: form.priceFromCurrency, isActive: true },
                        ])
                      }
                    >
                      + Add option
                    </Button>
                  </div>
                  <p className="mb-3 text-xs text-ink-faint">
                    Each row is a bookable variant — e.g. &ldquo;Adult&rdquo;, &ldquo;Child&rdquo;, or a time slot like
                    &ldquo;Morning (9:00am)&rdquo;. Removing a row hides it rather than deleting it outright, so past
                    bookings that reference it are unaffected.
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
                            <Input
                              value={opt.priceCurrency}
                              onChange={(e) =>
                                update(
                                  "options",
                                  form.options.map((o, i) => (i === index ? { ...o, priceCurrency: e.target.value } : o)),
                                )
                              }
                            />
                          </Field>
                          <div className="flex items-end gap-2">
                            <label className="flex items-center gap-1.5 pb-2.5 text-xs font-medium text-ink">
                              <input
                                type="checkbox"
                                checked={opt.isActive}
                                onChange={(e) =>
                                  update(
                                    "options",
                                    form.options.map((o, i) => (i === index ? { ...o, isActive: e.target.checked } : o)),
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
                                  form.options.map((o, i) => (i === index ? { ...o, description: e.target.value } : o)),
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
              </div>
            ),
          },
          {
            key: "media",
            label: "Media",
            content: (
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">Gallery images</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => update("images", [...form.images, { url: "", alt: "" }])}
                    >
                      + Add image
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {form.images.map((img, index) => (
                      <div key={index} className="flex items-start gap-3 rounded-xl border border-stone bg-white p-3">
                        <div className="flex-1">
                          <HomepageMediaField
                            label="Image"
                            value={img.url}
                            onChange={(url) =>
                              update("images", form.images.map((im, i) => (i === index ? { ...im, url } : im)))
                            }
                            kind="image"
                            folder="experiences"
                          />
                        </div>
                        <div className="flex-1">
                          <Field label="Alt text" hint="Describe the image for accessibility & SEO">
                            <Input
                              value={img.alt}
                              onChange={(e) =>
                                update(
                                  "images",
                                  form.images.map((im, i) => (i === index ? { ...im, alt: e.target.value } : im)),
                                )
                              }
                            />
                          </Field>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-6"
                          onClick={() => update("images", form.images.filter((_, i) => i !== index))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    {form.images.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-stone p-4 text-center text-sm text-ink-faint">
                        No images yet — add one above.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="max-w-md">
                  <HomepageMediaField
                    label="Promo / walkthrough video (optional)"
                    value={form.videoUrl ?? ""}
                    onChange={(url) => update("videoUrl", url || null)}
                    kind="video"
                    folder="experiences"
                  />
                </div>
              </div>
            ),
          },
          {
            key: "availability",
            label: "Availability",
            content:
              mode === "create" || !productId ? (
                <p className="rounded-xl border border-dashed border-stone p-6 text-center text-sm text-ink-faint">
                  Save this experience first to manage its availability calendar.
                </p>
              ) : (
                <AvailabilityPanel
                  productId={productId}
                  availability={availability}
                  onAvailabilityChange={setAvailability}
                />
              ),
          },
          {
            key: "seo",
            label: "SEO",
            content: (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Meta title" hint={`${(form.metaTitle ?? "").length}/70`}>
                    <Input value={form.metaTitle ?? ""} onChange={(e) => update("metaTitle", e.target.value || null)} />
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
            ),
          },
        ]}
      />

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
