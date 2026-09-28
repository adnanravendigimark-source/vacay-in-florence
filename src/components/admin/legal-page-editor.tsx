"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Field, Input, Textarea, Button, Tabs, useToast } from "@/components/admin/ui";
import type { LegalPageContent } from "@/lib/types";
import type { LegalPageKey } from "@/lib/data/site-content";
import { saveLegalPageContentAction } from "@/app/admin/(protected)/content/legal-actions";

function linesToText(lines: string[]): string {
  return lines.join("\n");
}
function textToLines(text: string): string[] {
  return text.split("\n");
}
function cleanLines(lines: string[]): string[] {
  return lines.map((l) => l.trim()).filter(Boolean);
}

interface LegalPageEditorProps {
  pageKey: LegalPageKey;
  editorTitle: string;
  publicPath: string;
  initialData: LegalPageContent;
}

/** Shared editor for Privacy Policy, Terms & Conditions, and the
 * Cancellation & Refund Policy — same content shape (title, effective
 * date, intro, a list of heading+paragraphs sections), so one editor
 * covers all three rather than three near-identical files. */
export function LegalPageEditor({ pageKey, editorTitle, publicPath, initialData }: LegalPageEditorProps) {
  const [data, setData] = useState<LegalPageContent>(initialData);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSave() {
    const cleaned: LegalPageContent = {
      ...data,
      sections: data.sections.map((s) => ({ ...s, body: cleanLines(s.body) })),
    };
    startTransition(async () => {
      const result = await saveLegalPageContentAction(pageKey, cleaned);
      if (result.success) {
        setData(cleaned);
        showToast(`${editorTitle} saved and live on the site.`, "success");
      } else {
        showToast(result.error ?? "Could not save changes.", "error");
      }
    });
  }

  function addSection() {
    setData({ ...data, sections: [...data.sections, { heading: "", body: [] }] });
  }
  function removeSection(i: number) {
    setData({ ...data, sections: data.sections.filter((_, idx) => idx !== i) });
  }
  function moveSection(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= data.sections.length) return;
    const next = [...data.sections];
    [next[i], next[j]] = [next[j], next[i]];
    setData({ ...data, sections: next });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div className="flex flex-col gap-4 border-b border-stone pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">{editorTitle} Editor</h1>
          <p className="mt-1 max-w-2xl text-xs text-ink-faint sm:text-sm">
            The title, effective date, intro, and every section on the public page — sections render top to bottom
            in the order listed here.
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
                  <div className="grid gap-4">
                    <Field label="Page title">
                      <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
                    </Field>
                    <Field label="Effective date" hint='e.g. "September 1, 2026"'>
                      <Input
                        value={data.effectiveDate}
                        onChange={(e) => setData({ ...data, effectiveDate: e.target.value })}
                      />
                    </Field>
                    <Field label="Intro paragraph">
                      <Textarea rows={3} value={data.intro} onChange={(e) => setData({ ...data, intro: e.target.value })} />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">Sections</h3>
                    <Button variant="secondary" size="sm" onClick={addSection}>
                      + Add section
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {data.sections.map((section, i) => (
                      <div key={i} className="rounded-xl border border-stone bg-white p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink-faint">Section {i + 1}</span>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => moveSection(i, -1)} disabled={i === 0}>
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveSection(i, 1)}
                              disabled={i === data.sections.length - 1}
                            >
                              ↓
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeSection(i)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-3">
                          <Field label="Heading">
                            <Input
                              value={section.heading}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  sections: data.sections.map((s, idx) =>
                                    idx === i ? { ...s, heading: e.target.value } : s,
                                  ),
                                })
                              }
                            />
                          </Field>
                          <Field label="Body" hint="One paragraph per line">
                            <Textarea
                              rows={5}
                              value={linesToText(section.body)}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  sections: data.sections.map((s, idx) =>
                                    idx === i ? { ...s, body: textToLines(e.target.value) } : s,
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
