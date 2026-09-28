"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Field, Input, Textarea, Select, Button, Tabs, useToast } from "@/components/admin/ui";
import type { ContactPageContent } from "@/lib/types";
import { saveContactPageContentAction } from "@/app/admin/(protected)/content/contact/actions";

const ICON_OPTIONS: { value: ContactPageContent["infoCards"][number]["icon"]; label: string }[] = [
  { value: "help", label: "Help (question mark bubble)" },
  { value: "partnership", label: "Partnership (briefcase)" },
  { value: "mail", label: "Mail (envelope)" },
];

export function ContactPageEditor({ initialData }: { initialData: ContactPageContent }) {
  const [data, setData] = useState<ContactPageContent>(initialData);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSave() {
    startTransition(async () => {
      const result = await saveContactPageContentAction(data);
      if (result.success) {
        showToast("Contact Us page saved and live on the site.", "success");
      } else {
        showToast(result.error ?? "Could not save changes.", "error");
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div className="flex flex-col gap-4 border-b border-stone pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">Contact Us Editor</h1>
          <p className="mt-1 max-w-2xl text-xs text-ink-faint sm:text-sm">
            This page is a contact-email card, not a submission form — edit the email, info cards, and copy below.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
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
                  <h3 className="mb-4 text-sm font-semibold text-ink">Header</h3>
                  <div className="grid gap-4">
                    <Field label="Badge text">
                      <Input
                        value={data.hero.badge}
                        onChange={(e) => setData({ ...data, hero: { ...data.hero, badge: e.target.value } })}
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
                        rows={2}
                        value={data.hero.subheadline}
                        onChange={(e) => setData({ ...data, hero: { ...data.hero, subheadline: e.target.value } })}
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Email Card</h3>
                  <div className="grid gap-4">
                    <Field label="Email address">
                      <Input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Label above email">
                        <Input value={data.emailLabel} onChange={(e) => setData({ ...data, emailLabel: e.target.value })} />
                      </Field>
                      <Field label="Note below email">
                        <Input value={data.emailNote} onChange={(e) => setData({ ...data, emailNote: e.target.value })} />
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink">Info Cards</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setData({
                          ...data,
                          infoCards: [
                            ...data.infoCards,
                            { id: `card-${Math.random().toString(36).slice(2, 8)}`, icon: "help", title: "", description: "" },
                          ],
                        })
                      }
                    >
                      + Add card
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {data.infoCards.map((card, i) => (
                      <div key={card.id} className="rounded-xl border border-stone bg-white p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink-faint">Card {i + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setData({ ...data, infoCards: data.infoCards.filter((_, idx) => idx !== i) })}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid gap-3">
                          <Field label="Icon">
                            <Select
                              value={card.icon}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  infoCards: data.infoCards.map((c, idx) =>
                                    idx === i
                                      ? { ...c, icon: e.target.value as ContactPageContent["infoCards"][number]["icon"] }
                                      : c,
                                  ),
                                })
                              }
                            >
                              {ICON_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Select>
                          </Field>
                          <Field label="Title">
                            <Input
                              value={card.title}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  infoCards: data.infoCards.map((c, idx) => (idx === i ? { ...c, title: e.target.value } : c)),
                                })
                              }
                            />
                          </Field>
                          <Field label="Description">
                            <Textarea
                              rows={2}
                              value={card.description}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  infoCards: data.infoCards.map((c, idx) =>
                                    idx === i ? { ...c, description: e.target.value } : c,
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
                  <h3 className="mb-4 text-sm font-semibold text-ink">Footer Notes &amp; CTA</h3>
                  <div className="grid gap-4">
                    <Field label="Existing-booking note">
                      <Textarea
                        rows={2}
                        value={data.existingBookingNote}
                        onChange={(e) => setData({ ...data, existingBookingNote: e.target.value })}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="CTA eyebrow">
                        <Input value={data.ctaEyebrow} onChange={(e) => setData({ ...data, ctaEyebrow: e.target.value })} />
                      </Field>
                      <Field label="CTA button label">
                        <Input
                          value={data.ctaButtonLabel}
                          onChange={(e) => setData({ ...data, ctaButtonLabel: e.target.value })}
                        />
                      </Field>
                      <Field label="CTA button link">
                        <Input
                          value={data.ctaButtonHref}
                          onChange={(e) => setData({ ...data, ctaButtonHref: e.target.value })}
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
                    <Input value="/contact" disabled />
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
