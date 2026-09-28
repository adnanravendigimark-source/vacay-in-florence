"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Field, Input, Textarea, Button, Tabs, useToast } from "@/components/admin/ui";
import type { LeadPageContent } from "@/lib/types";
import { saveLeadPageContentAction, type LeadPageKey } from "@/app/admin/(protected)/content/lead-actions";

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

// Fields a lead is useless without — always required, always shown, not
// admin-togglable (label/placeholder text is still editable). Matches the
// same "name"/"email" ids used in both the supplier and affiliate forms.
const LOCKED_FIELD_IDS = new Set(["name", "email"]);

interface LeadPageEditorProps {
  pageKey: LeadPageKey;
  editorTitle: string;
  publicPath: string;
  initialData: LeadPageContent;
}

/** Shared editor for Become a Supplier and Become an Affiliate — same
 * content shape (hero, benefit cards, form heading/copy, a configurable
 * field list, SEO). */
export function LeadPageEditor({ pageKey, editorTitle, publicPath, initialData }: LeadPageEditorProps) {
  const [data, setData] = useState<LeadPageContent>(initialData);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSave() {
    startTransition(async () => {
      const result = await saveLeadPageContentAction(pageKey, data);
      if (result.success) {
        showToast(`${editorTitle} saved and live on the site.`, "success");
      } else {
        showToast(result.error ?? "Could not save changes.", "error");
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div className="flex flex-col gap-4 border-b border-stone pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">{editorTitle} Editor</h1>
          <p className="mt-1 max-w-2xl text-xs text-ink-faint sm:text-sm">
            Page copy, benefit cards, and the application form&rsquo;s fields — labels, placeholders, and which fields are
            required or shown.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={publicPath}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-stone bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-cream-deep"
          >
            &larr; View public page
          </Link>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          {
            key: "content",
            label: "Page Content",
            content: (
              <div className="space-y-5">
                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Hero</h3>
                  <div className="grid gap-4">
                    <Field label="Eyebrow">
                      <Input
                        value={data.hero.eyebrow}
                        onChange={(e) => setData({ ...data, hero: { ...data.hero, eyebrow: e.target.value } })}
                      />
                    </Field>
                    <Field label="Headline">
                      <Input
                        value={data.hero.headline}
                        onChange={(e) => setData({ ...data, hero: { ...data.hero, headline: e.target.value } })}
                      />
                    </Field>
                    <Field label="Subheadline">
                      <Textarea
                        rows={3}
                        value={data.hero.subheadline}
                        onChange={(e) => setData({ ...data, hero: { ...data.hero, subheadline: e.target.value } })}
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">Benefit Cards</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setData({ ...data, benefits: [...data.benefits, { id: newId("benefit"), title: "", description: "" }] })
                      }
                    >
                      + Add card
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {data.benefits.map((b, i) => (
                      <div key={b.id} className="rounded-xl border border-stone bg-white p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink-faint">Card {i + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setData({ ...data, benefits: data.benefits.filter((_, idx) => idx !== i) })}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid gap-3">
                          <Field label="Title">
                            <Input
                              value={b.title}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  benefits: data.benefits.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)),
                                })
                              }
                            />
                          </Field>
                          <Field label="Description">
                            <Textarea
                              rows={2}
                              value={b.description}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  benefits: data.benefits.map((x, idx) =>
                                    idx === i ? { ...x, description: e.target.value } : x,
                                  ),
                                })
                              }
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Application Form — Copy</h3>
                  <div className="grid gap-4">
                    <Field label="Form heading">
                      <Input value={data.formHeading} onChange={(e) => setData({ ...data, formHeading: e.target.value })} />
                    </Field>
                    <Field label="Form subheading">
                      <Input
                        value={data.formSubheading}
                        onChange={(e) => setData({ ...data, formSubheading: e.target.value })}
                      />
                    </Field>
                    <Field label="Submit button label">
                      <Input
                        value={data.submitButtonLabel}
                        onChange={(e) => setData({ ...data, submitButtonLabel: e.target.value })}
                      />
                    </Field>
                    <Field label="Success message" hint="Shown after a successful submission">
                      <Textarea
                        rows={2}
                        value={data.successMessage}
                        onChange={(e) => setData({ ...data, successMessage: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-1 text-sm font-semibold text-ink">Application Form — Fields</h3>
                  <p className="mb-4 text-xs text-ink-faint">
                    Edit each field&rsquo;s label and placeholder, whether it&rsquo;s required, and whether it shows on the
                    form at all. Name and Email always stay required and visible — a submission is useless without
                    them. The set of fields itself is fixed.
                  </p>
                  <div className="space-y-3">
                    {data.fields.map((field, i) => {
                      const locked = LOCKED_FIELD_IDS.has(field.id);
                      return (
                        <div key={field.id} className="rounded-xl border border-stone bg-white p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold text-ink-faint">{field.id}</span>
                            {locked ? <span className="text-[10px] font-semibold uppercase text-ink-faint">Always on</span> : null}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Label">
                              <Input
                                value={field.label}
                                onChange={(e) =>
                                  setData({
                                    ...data,
                                    fields: data.fields.map((f, idx) =>
                                      idx === i ? { ...f, label: e.target.value } : f,
                                    ),
                                  })
                                }
                              />
                            </Field>
                            <Field label="Placeholder">
                              <Input
                                value={field.placeholder}
                                onChange={(e) =>
                                  setData({
                                    ...data,
                                    fields: data.fields.map((f, idx) =>
                                      idx === i ? { ...f, placeholder: e.target.value } : f,
                                    ),
                                  })
                                }
                              />
                            </Field>
                          </div>
                          <div className="mt-3 flex items-center gap-5">
                            <label className={`flex items-center gap-2 text-xs font-medium text-ink ${locked ? "opacity-50" : ""}`}>
                              <input
                                type="checkbox"
                                checked={field.required}
                                disabled={locked}
                                onChange={(e) =>
                                  setData({
                                    ...data,
                                    fields: data.fields.map((f, idx) =>
                                      idx === i ? { ...f, required: e.target.checked } : f,
                                    ),
                                  })
                                }
                                className="h-4 w-4 rounded border-neutral-300"
                              />
                              Required
                            </label>
                            <label className={`flex items-center gap-2 text-xs font-medium text-ink ${locked ? "opacity-50" : ""}`}>
                              <input
                                type="checkbox"
                                checked={field.visible}
                                disabled={locked}
                                onChange={(e) =>
                                  setData({
                                    ...data,
                                    fields: data.fields.map((f, idx) =>
                                      idx === i ? { ...f, visible: e.target.checked } : f,
                                    ),
                                  })
                                }
                                className="h-4 w-4 rounded border-neutral-300"
                              />
                              Visible on form
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "seo",
            label: "SEO & Meta",
            content: (
              <div className="rounded-2xl border border-stone bg-white p-5">
                <div className="grid gap-4">
                  <Field label="SEO title">
                    <Input
                      value={data.seo.title}
                      onChange={(e) => setData({ ...data, seo: { ...data.seo, title: e.target.value } })}
                    />
                  </Field>
                  <Field label="Meta description">
                    <Textarea
                      rows={3}
                      value={data.seo.description}
                      onChange={(e) => setData({ ...data, seo: { ...data.seo, description: e.target.value } })}
                    />
                  </Field>
                  <Field label="Open Graph image URL" hint="Optional — shown when the page is shared">
                    <Input
                      value={data.seo.ogImage ?? ""}
                      onChange={(e) => setData({ ...data, seo: { ...data.seo, ogImage: e.target.value || null } })}
                    />
                  </Field>
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={data.seo.noIndex ?? false}
                      onChange={(e) => setData({ ...data, seo: { ...data.seo, noIndex: e.target.checked } })}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    Hide this page from search engines (noindex)
                  </label>
                  <Field label="URL" hint="Fixed by the site's routing — not editable here">
                    <Input value={publicPath} disabled />
                  </Field>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
