"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/admin/(protected)/categories/actions";
import type { CategoryFormData } from "@/lib/validation/categories";
import type { CategoryIcon } from "@/lib/types";
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

export interface CategoryEditorProps {
  mode: "create" | "edit";
  categoryId?: string;
  initialValues: CategoryFormData;
  productCount?: number;
}

export function CategoryEditor({ mode, categoryId, initialValues, productCount = 0 }: CategoryEditorProps) {
  const [form, setForm] = useState<CategoryFormData>(initialValues);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const lastSavedSlug = useRef(initialValues.slug);
  const { showToast } = useToast();
  const router = useRouter();

  function update<K extends keyof CategoryFormData>(key: K, value: CategoryFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildSubmission(): CategoryFormData {
    return {
      ...form,
      highlights: cleanLines(form.highlights).slice(0, 6),
    };
  }

  function handleSave(statusOverride?: CategoryFormData["status"]) {
    const submission = { ...buildSubmission(), ...(statusOverride ? { status: statusOverride } : {}) };
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCategoryAction(submission)
          : await updateCategoryAction(categoryId as string, submission, lastSavedSlug.current);

      if (!result.success) {
        showToast(result.error ?? "Something went wrong. Please try again.", "error");
        return;
      }
      lastSavedSlug.current = submission.slug;
      if (mode === "create" && result.id) {
        showToast(statusOverride === "published" ? "Category created and published." : "Category created.", "success");
        router.push(`/admin/categories/${result.id}`);
        return;
      }
      setForm(submission);
      showToast(statusOverride === "published" ? "Published." : "Changes saved.", "success");
    });
  }

  function handleDelete() {
    if (!categoryId) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId, form.slug);
      if (!result.success) {
        showToast(result.error ?? "Could not delete this category.", "error");
        setDeleteOpen(false);
        return;
      }
      showToast("Category deleted.", "success");
      router.push("/admin/categories");
    });
  }

  return (
    <div className="pb-16 space-y-6">
      {/* ================================================================= */}
      {/* HEADER */}
      {/* ================================================================= */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-stone bg-cream/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <p className="text-[11px] font-medium text-ink-faint">
          <Link href="/admin/categories" className="hover:text-cypress">
            Categories
          </Link>{" "}
          / {mode === "create" ? "New Category" : "Edit Category"}
        </p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">
              {mode === "create" ? "New Category" : "Edit Category"}
            </h1>
            <p className="mt-1 text-xs text-ink-faint sm:text-[13px]">
              {mode === "create"
                ? "Fill in the details to create a new category."
                : "Update this category. Changes go live on the public Categories page after publishing."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mode === "edit" ? (
              <a
                href={`/experiences/category/${form.slug}?preview=1`}
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
        defaultTab="basic"
        tabs={[
          {
            key: "basic",
            label: "Basics",
            content: (
              <div className="space-y-5">
                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Basic Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Category Name" required>
                        <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Slug" required hint="lowercase-with-hyphens">
                      <Input
                        value={form.slug}
                        onChange={(e) => update("slug", e.target.value)}
                        placeholder="museums-galleries"
                      />
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
                          onChange={(e) => update("status", e.target.value as CategoryFormData["status"])}
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
                      Featured on homepage
                    </label>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <Field label="Short description" required hint={`${form.shortDescription.length}/300`}>
                    <Textarea
                      rows={3}
                      value={form.shortDescription}
                      onChange={(e) => update("shortDescription", e.target.value)}
                    />
                  </Field>
                </div>

                {mode === "edit" ? (
                  <p className="text-xs text-ink-faint">
                    {productCount} experience{productCount === 1 ? "" : "s"} currently assigned to this category.
                    Display order is managed from the{" "}
                    <Link href="/admin/categories" className="font-semibold text-cypress hover:underline">
                      Categories list
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            ),
          },
          {
            key: "content",
            label: "Content",
            content: (
              <div className="rounded-2xl border border-stone bg-white p-5">
                <h3 className="mb-4 text-sm font-semibold text-ink">Highlights, Badge & CTA</h3>
                <div className="space-y-4">
                  <Field label="Highlights" hint="One per line, up to 6 — shown as bullet points on the category card">
                    <Textarea
                      rows={5}
                      value={linesToText(form.highlights)}
                      onChange={(e) => update("highlights", textToLines(e.target.value))}
                      placeholder={"Skip-the-line entry\nSmall group sizes\nExpert local guides"}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Badge text" hint="Small pill shown on the card, e.g. “Most Popular”">
                      <Input
                        value={form.badgeText ?? ""}
                        onChange={(e) => update("badgeText", e.target.value || null)}
                      />
                    </Field>
                    <Field label="CTA label" hint='e.g. "Explore tours"'>
                      <Input
                        value={form.ctaLabel ?? ""}
                        onChange={(e) => update("ctaLabel", e.target.value || null)}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="CTA link" hint="Relative or absolute URL the CTA button points to">
                        <Input
                          value={form.ctaHref ?? ""}
                          onChange={(e) => update("ctaHref", e.target.value || null)}
                          placeholder={`/experiences/category/${form.slug || "..."}`}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "media",
            label: "Media",
            content: (
              <div className="space-y-5">
                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Card Image</h3>
                  <p className="mb-4 text-xs text-ink-faint">Shown on the Categories page and homepage category grid.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ImageField
                      label="Card image"
                      required
                      value={form.imageUrl}
                      onChange={(url) => update("imageUrl", url)}
                    />
                    <Field label="Card image alt text" required>
                      <Input value={form.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} />
                    </Field>
                  </div>
                </div>
                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Hero Image</h3>
                  <p className="mb-4 text-xs text-ink-faint">
                    Used in the Categories page mosaic hero. Falls back to the card image when left blank.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ImageField
                      label="Hero image"
                      value={form.heroImageUrl ?? ""}
                      onChange={(url) => update("heroImageUrl", url || null)}
                    />
                    <Field label="Hero image alt text">
                      <Input
                        value={form.heroImageAlt ?? ""}
                        onChange={(e) => update("heroImageAlt", e.target.value || null)}
                      />
                    </Field>
                  </div>
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

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete category?"
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
            ? `This category has ${productCount} experience${productCount === 1 ? "" : "s"} assigned. Deletion will be blocked until they're reassigned — unpublish it instead if you just want it off the public site.`
            : "This can't be undone."}
        </p>
      </Modal>
    </div>
  );
}
