"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction,
} from "@/app/admin/(protected)/blog/actions";
import type { BlogPostFormData } from "@/lib/validation/blog";
import { Field, Input, Select, Textarea, Button, Tabs, ImageField, Modal, useToast } from "@/components/admin/ui";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

function linesToText(lines: string[]): string {
  return lines.join(", ");
}
function textToTags(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export interface BlogPostEditorProps {
  mode: "create" | "edit";
  postId?: string;
  initialValues: BlogPostFormData;
}

export function BlogPostEditor({ mode, postId, initialValues }: BlogPostEditorProps) {
  const [form, setForm] = useState<BlogPostFormData>(initialValues);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const lastSavedSlug = useRef(initialValues.slug);
  const lastSavedCategory = useRef(initialValues.category);
  const { showToast } = useToast();
  const router = useRouter();

  function update<K extends keyof BlogPostFormData>(key: K, value: BlogPostFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const wordCount = useMemo(() => stripHtml(form.body).split(/\s+/).filter(Boolean).length, [form.body]);

  function handleSave(statusOverride?: BlogPostFormData["status"]) {
    const submission = { ...form, ...(statusOverride ? { status: statusOverride } : {}) };
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createBlogPostAction(submission)
          : await updateBlogPostAction(postId as string, submission, lastSavedSlug.current, lastSavedCategory.current);

      if (!result.success) {
        showToast(result.error ?? "Something went wrong. Please try again.", "error");
        return;
      }
      lastSavedSlug.current = submission.slug;
      lastSavedCategory.current = submission.category;
      if (mode === "create" && result.id) {
        showToast(statusOverride === "published" ? "Article created and published." : "Article created.", "success");
        router.push(`/admin/blog/${result.id}`);
        return;
      }
      setForm(submission);
      showToast(statusOverride === "published" ? "Published." : "Changes saved.", "success");
    });
  }

  function handleDelete() {
    if (!postId) return;
    startTransition(async () => {
      const result = await deleteBlogPostAction(postId, form.slug, form.category);
      if (!result.success) {
        showToast(result.error ?? "Could not delete this article.", "error");
        setDeleteOpen(false);
        return;
      }
      showToast("Article deleted.", "success");
      router.push("/admin/blog");
    });
  }

  return (
    <div className="pb-16 space-y-6">
      {/* ================================================================= */}
      {/* HEADER */}
      {/* ================================================================= */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-stone bg-cream/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <p className="text-[11px] font-medium text-ink-faint">
          <Link href="/admin/blog" className="hover:text-cypress">
            Blog
          </Link>{" "}
          / {mode === "create" ? "New Article" : "Edit Article"}
        </p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">
              {mode === "create" ? "New Article" : "Edit Article"}
            </h1>
            <p className="mt-1 text-xs text-ink-faint sm:text-[13px]">
              {mode === "create"
                ? "Fill in the details, then write the article below."
                : "Update this article. Changes go live on the public blog after publishing."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mode === "edit" ? (
              <a
                href={`/blog/${form.slug}?preview=1`}
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
        defaultTab="content"
        tabs={[
          {
            key: "content",
            label: "Content",
            content: (
              <div className="space-y-5">
                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Basics</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Title" required>
                        <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Slug" required hint="lowercase-with-hyphens">
                      <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="best-gelato-in-florence" />
                    </Field>
                    <Field label="Category" required>
                      <Input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="e.g. Trip Planning" />
                    </Field>
                    <Field label="Author" required>
                      <Input value={form.author} onChange={(e) => update("author", e.target.value)} placeholder="e.g. VACAY Florence Editorial" />
                    </Field>
                    <div>
                      <Field label="Status">
                        <Select value={form.status} onChange={(e) => update("status", e.target.value as BlogPostFormData["status"])}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </Select>
                      </Field>
                    </div>
                    <Field label="Publish date" required hint={form.status === "draft" ? "Used once you publish" : undefined}>
                      <Input type="date" value={form.publishDate} onChange={(e) => update("publishDate", e.target.value)} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Tags" hint="Comma-separated, e.g. food, gelato, local tips">
                        <Input value={linesToText(form.tags)} onChange={(e) => update("tags", textToTags(e.target.value))} placeholder="food, gelato, local tips" />
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <Field label="Excerpt" required hint={`${form.excerpt.length}/300 — shown on the blog listing card`}>
                    <Textarea rows={2} value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} />
                  </Field>
                  <div className="mt-4">
                    <Field label="Quick Answer callout" hint='Optional — the highlighted "TL;DR" box right under the title.'>
                      <Textarea rows={2} value={form.quickAnswer} onChange={(e) => update("quickAnswer", e.target.value)} />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-1 text-sm font-semibold text-ink">Article Content</h3>
                  <p className="mb-4 text-xs text-ink-faint">
                    Write the article top to bottom. Use the toolbar for headings, bold/italic/underline, links, lists, tables,
                    images, or blockquotes — pasted content from Word, Google Docs, or a website keeps its formatting.
                  </p>
                  <RichTextEditor
                    value={form.body}
                    onChange={(html) => update("body", html)}
                    placeholder="Write the article here…"
                    allowedHeadings={[2, 3]}
                    minHeight="26rem"
                    stickyOffset="130px"
                  />
                  <p className="mt-2 text-xs text-ink-faint">~{wordCount} words in the article body.</p>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Featured Image</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ImageField label="Featured image" required value={form.coverImageUrl} onChange={(url) => update("coverImageUrl", url)} />
                    <Field label="Image alt text" required>
                      <Input value={form.coverImageAlt} onChange={(e) => update("coverImageAlt", e.target.value)} />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-1 text-sm font-semibold text-ink">&quot;Ready to plan your trip?&quot; callout</h3>
                  <p className="mb-4 text-xs text-ink-faint">The closing box at the end of the article.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Heading">
                      <Input value={form.ctaHeading} onChange={(e) => update("ctaHeading", e.target.value)} />
                    </Field>
                    <Field label="Button text">
                      <Input value={form.ctaButtonText} onChange={(e) => update("ctaButtonText", e.target.value)} />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Body text">
                      <Textarea rows={2} value={form.ctaBody} onChange={(e) => update("ctaBody", e.target.value)} />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Button link" hint="A relative path (e.g. /experiences) or a full https:// URL.">
                      <Input value={form.ctaButtonHref} onChange={(e) => update("ctaButtonHref", e.target.value)} />
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
                    <Field label="Meta title" hint={`${(form.metaTitle ?? "").length}/70 — falls back to the article title`}>
                      <Input value={form.metaTitle ?? ""} onChange={(e) => update("metaTitle", e.target.value || null)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Meta description" hint={`${(form.metaDescription ?? "").length}/200 — falls back to the excerpt`}>
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
                    <input type="checkbox" checked={form.noIndex} onChange={(e) => update("noIndex", e.target.checked)} className="h-4 w-4 rounded border-neutral-300" />
                    No-index this page
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-ink">
                    <input type="checkbox" checked={form.noFollow} onChange={(e) => update("noFollow", e.target.checked)} className="h-4 w-4 rounded border-neutral-300" />
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
        title="Delete article?"
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
        <p className="text-sm text-ink-soft">This permanently deletes this article. This can&apos;t be undone.</p>
      </Modal>
    </div>
  );
}
