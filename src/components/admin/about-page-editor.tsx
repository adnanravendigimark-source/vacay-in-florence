"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Field, Input, Textarea, Button, Tabs, useToast } from "@/components/admin/ui";
import type { AboutPageContent } from "@/lib/types";
import { saveAboutPageContentAction } from "@/app/admin/(protected)/content/about/actions";

function linesToText(lines: string[]): string {
  return lines.join("\n");
}
function textToLines(text: string): string[] {
  return text.split("\n");
}
function cleanLines(lines: string[]): string[] {
  return lines.map((l) => l.trim()).filter(Boolean);
}
function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AboutPageEditor({ initialData }: { initialData: AboutPageContent }) {
  const [data, setData] = useState<AboutPageContent>(initialData);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSave() {
    const cleaned: AboutPageContent = {
      ...data,
      story: { ...data.story, paragraphs: cleanLines(data.story.paragraphs) },
    };
    startTransition(async () => {
      const result = await saveAboutPageContentAction(cleaned);
      if (result.success) {
        setData(cleaned);
        showToast("About Us page saved and live on the site.", "success");
      } else {
        showToast(result.error ?? "Could not save changes.", "error");
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div className="flex flex-col gap-4 border-b border-stone pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">About Us Editor</h1>
          <p className="mt-1 max-w-2xl text-xs text-ink-faint sm:text-sm">
            Every heading, paragraph, value, stat, and the closing CTA on the public About Us page — changes go live
            immediately after saving.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/about"
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
                  <h3 className="mb-4 text-sm font-semibold text-ink">Our Story</h3>
                  <div className="grid gap-4">
                    <Field label="Heading">
                      <Input
                        value={data.story.heading}
                        onChange={(e) => setData({ ...data, story: { ...data.story, heading: e.target.value } })}
                      />
                    </Field>
                    <Field label="Paragraphs" hint="One per line">
                      <Textarea
                        rows={8}
                        value={linesToText(data.story.paragraphs)}
                        onChange={(e) =>
                          setData({ ...data, story: { ...data.story, paragraphs: textToLines(e.target.value) } })
                        }
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">Stats Row</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setData({ ...data, stats: [...data.stats, { label: "", value: "" }] })}
                    >
                      + Add stat
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {data.stats.map((stat, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                        <Field label="Value">
                          <Input
                            value={stat.value}
                            onChange={(e) =>
                              setData({
                                ...data,
                                stats: data.stats.map((s, idx) => (idx === i ? { ...s, value: e.target.value } : s)),
                              })
                            }
                          />
                        </Field>
                        <Field label="Label">
                          <Input
                            value={stat.label}
                            onChange={(e) =>
                              setData({
                                ...data,
                                stats: data.stats.map((s, idx) => (idx === i ? { ...s, label: e.target.value } : s)),
                              })
                            }
                          />
                        </Field>
                        <div className="flex items-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setData({ ...data, stats: data.stats.filter((_, idx) => idx !== i) })}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">Values Section</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setData({
                          ...data,
                          values: [...data.values, { id: newId("value"), title: "", description: "" }],
                        })
                      }
                    >
                      + Add value
                    </Button>
                  </div>
                  <Field label="Section heading">
                    <Input value={data.valuesHeading} onChange={(e) => setData({ ...data, valuesHeading: e.target.value })} />
                  </Field>
                  <div className="mt-4 space-y-3">
                    {data.values.map((value, i) => (
                      <div key={value.id} className="rounded-xl border border-stone bg-white p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink-faint">Value {i + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setData({ ...data, values: data.values.filter((_, idx) => idx !== i) })}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid gap-3">
                          <Field label="Title">
                            <Input
                              value={value.title}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  values: data.values.map((v, idx) =>
                                    idx === i ? { ...v, title: e.target.value } : v,
                                  ),
                                })
                              }
                            />
                          </Field>
                          <Field label="Description">
                            <Textarea
                              rows={2}
                              value={value.description}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  values: data.values.map((v, idx) =>
                                    idx === i ? { ...v, description: e.target.value } : v,
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
                  <h3 className="mb-4 text-sm font-semibold text-ink">Closing CTA</h3>
                  <div className="grid gap-4">
                    <Field label="Heading">
                      <Input
                        value={data.cta.heading}
                        onChange={(e) => setData({ ...data, cta: { ...data.cta, heading: e.target.value } })}
                      />
                    </Field>
                    <Field label="Body">
                      <Textarea
                        rows={2}
                        value={data.cta.body}
                        onChange={(e) => setData({ ...data, cta: { ...data.cta, body: e.target.value } })}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Button label">
                        <Input
                          value={data.cta.buttonLabel}
                          onChange={(e) => setData({ ...data, cta: { ...data.cta, buttonLabel: e.target.value } })}
                        />
                      </Field>
                      <Field label="Button link">
                        <Input
                          value={data.cta.buttonHref}
                          onChange={(e) => setData({ ...data, cta: { ...data.cta, buttonHref: e.target.value } })}
                        />
                      </Field>
                    </div>
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
                    <Input value="/about" disabled />
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
