"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { saveHomepageContentAction } from "@/app/admin/(protected)/content/homepage/actions";
import type { HomepageContentData } from "@/lib/data/homepage";
import type { AdminProductListItem } from "@/lib/data/admin/products";
import { useToast } from "@/components/admin/ui/toast";
import { HomepageMediaField } from "@/components/admin/homepage-media-field";

interface HomepageEditorProps {
  initialData: HomepageContentData;
  allExperiences?: AdminProductListItem[];
}

type TabKey =
  | "hero"
  | "experiences"
  | "whyUs"
  | "landmarks"
  | "itinerary"
  | "mobile"
  | "testimonials"
  | "travelGuide"
  | "cta"
  | "faq"
  | "seo";

const TABS: { key: TabKey; label: string }[] = [
  { key: "hero", label: "Hero Section" },
  { key: "experiences", label: "Featured Experiences" },
  { key: "landmarks", label: "Popular Destinations" },
  { key: "itinerary", label: "Itinerary Planner" },
  { key: "mobile", label: "Mobile Pass Showcase" },
  { key: "whyUs", label: "Why Choose Us" },
  { key: "testimonials", label: "Testimonials" },
  { key: "travelGuide", label: "Travel Guide" },
  { key: "faq", label: "FAQ Section" },
  { key: "cta", label: "CTA Section" },
  { key: "seo", label: "SEO & Meta" },
];

export function HomepageEditor({ initialData, allExperiences = [] }: HomepageEditorProps) {
  const [data, setData] = useState<HomepageContentData>(initialData);
  const [activeTab, setActiveTab] = useState<TabKey>("hero");
  const [expSearch, setExpSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveHomepageContentAction(data);
      if (res.success && res.data) {
        setData(res.data);
        showToast("Homepage content saved and live on website!", "success");
      } else {
        showToast(res.error || "Failed to save changes. Please try again.", "error");
      }
    });
  };

  const updateField = <K extends keyof HomepageContentData>(field: K, value: HomepageContentData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedExpIds = data.featuredExperienceIds ?? [];
  const selectedExperiences = selectedExpIds
    .map((id) => allExperiences.find((e) => e.id === id))
    .filter(Boolean) as AdminProductListItem[];

  const availableExperiences = allExperiences.filter(
    (exp) => !selectedExpIds.includes(exp.id) && exp.status === "live"
  );

  const filteredAvailable = availableExperiences.filter((exp) =>
    exp.title.toLowerCase().includes(expSearch.toLowerCase()) ||
    exp.categoryName.toLowerCase().includes(expSearch.toLowerCase())
  );

  const handleAddExperience = (id: string) => {
    if (selectedExpIds.length >= 8) {
      showToast("You can select up to 8 experiences for the homepage.", "error");
      return;
    }
    if (!selectedExpIds.includes(id)) {
      updateField("featuredExperienceIds", [...selectedExpIds, id]);
    }
  };

  const handleRemoveExperience = (id: string) => {
    updateField(
      "featuredExperienceIds",
      selectedExpIds.filter((item) => item !== id)
    );
  };

  const handleMoveExperience = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedExpIds.length) return;
    const updated = [...selectedExpIds];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    updateField("featuredExperienceIds", updated);
  };

  const handleAutoFillTop8 = () => {
    const top8 = allExperiences
      .filter((e) => e.status === "live")
      .slice(0, 8)
      .map((e) => e.id);
    updateField("featuredExperienceIds", top8);
    showToast("Selected top 8 published experiences.", "success");
  };

  const handleClearExperiences = () => {
    updateField("featuredExperienceIds", []);
    showToast("Cleared homepage selection (will show default top 8).", "success");
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE6DF]">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium text-neutral-900 tracking-tight">
            Homepage Editor
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-500 mt-1 max-w-2xl">
            Manage and edit all content, images, videos and settings for your public homepage. Changes will be live on your website immediately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 bg-white border border-[#EAE6DF] hover:bg-[#FAF8F5] hover:border-neutral-300 transition shadow-2xs"
          >
            <span>&larr; View Public Site</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#183D2B] hover:bg-[#23503A] active:scale-[0.98] transition shadow-sm cursor-pointer disabled:opacity-60"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-currentColor stroke-2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#EAE6DF] scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-[#183D2B] text-white font-semibold shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>


      {/* =================================================================== */}
      {/* 1. HERO SECTION TAB */}
      {/* =================================================================== */}
      {activeTab === "hero" && (
        <div className="rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          {/* Section Header with Enable Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white text-xs font-bold flex items-center justify-center">
                1
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-neutral-900">Hero Section</h2>
                <p className="text-xs text-neutral-400">Main banner section with headline, subtitle and background media.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{data.heroEnabled ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => updateField("heroEnabled", !data.heroEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.heroEnabled ? "bg-[#183D2B]" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.heroEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Grid Layout: Visual Preview (Left) + Form Inputs (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Live Preview Card */}
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[320px] bg-neutral-900 flex flex-col justify-between p-6 text-white shadow-md">
              <Image
                src={data.heroBackgroundImage || "/images/florence-hero.jpg"}
                alt={data.heroImageAlt || "Hero preview"}
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

              <div className="relative z-10">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9.5px] font-bold tracking-wider uppercase text-amber-300">
                  {data.heroBadge || "OFFICIAL FLORENCE TICKETS"}
                </span>
              </div>

              <div className="relative z-10 space-y-2">
                <h3 className="font-display text-2xl font-medium leading-tight text-white drop-shadow">
                  {data.heroHeading}
                </h3>
                <p className="text-xs text-neutral-200 line-clamp-3 leading-relaxed drop-shadow-sm">
                  {data.heroSubheading}
                </p>

                {data.heroVideoUrl ? (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                      <span>▶ Watch Video</span>
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Editable Fields */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Badge / Eyebrow Text</label>
                <input
                  type="text"
                  value={data.heroBadge}
                  onChange={(e) => updateField("heroBadge", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Main Heading</label>
                <input
                  type="text"
                  value={data.heroHeading}
                  onChange={(e) => updateField("heroHeading", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Sub Heading / Description</label>
                <textarea
                  rows={3}
                  value={data.heroSubheading}
                  onChange={(e) => updateField("heroSubheading", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
                />
              </div>

              <HomepageMediaField
                label="Background Image"
                value={data.heroBackgroundImage}
                onChange={(url) => updateField("heroBackgroundImage", url)}
                kind="image"
                folder="homepage/hero"
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Image Alt Text</label>
                <input
                  type="text"
                  value={data.heroImageAlt}
                  onChange={(e) => updateField("heroImageAlt", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
                />
              </div>

              <HomepageMediaField
                label="Video (Optional)"
                value={data.heroVideoUrl || ""}
                onChange={(url) => updateField("heroVideoUrl", url)}
                kind="video"
                folder="homepage/hero"
                placeholder="/video/hero-florence.mp4 or https://..."
              />

              {/* Trending Tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-700">Trending Quick-Search Tags</label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...(data.heroTrendingTags || [])];
                      next.push({ label: "New Tag", href: "/experiences" });
                      updateField("heroTrendingTags", next);
                    }}
                    className="text-[11px] font-semibold text-[#183D2B] hover:underline cursor-pointer"
                  >
                    + Add Tag
                  </button>
                </div>
                <div className="space-y-2">
                  {(data.heroTrendingTags || []).map((tag, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tag.label}
                        onChange={(e) => {
                          const next = [...(data.heroTrendingTags || [])];
                          next[idx] = { ...tag, label: e.target.value };
                          updateField("heroTrendingTags", next);
                        }}
                        placeholder="Label"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#EAE6DF] bg-white"
                      />
                      <input
                        type="text"
                        value={tag.href}
                        onChange={(e) => {
                          const next = [...(data.heroTrendingTags || [])];
                          next[idx] = { ...tag, href: e.target.value };
                          updateField("heroTrendingTags", next);
                        }}
                        placeholder="Link"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#EAE6DF] bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = (data.heroTrendingTags || []).filter((_, i) => i !== idx);
                          updateField("heroTrendingTags", next);
                        }}
                        className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. FEATURED EXPERIENCES TAB */}
      {/* =================================================================== */}
      {activeTab === "experiences" && (
        <div className="rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white text-xs font-bold flex items-center justify-center">
                3
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-neutral-900">Featured Experiences Section</h2>
                <p className="text-xs text-neutral-400">Manage curated top experiences displayed on the home page.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{data.experiencesEnabled ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => updateField("experiencesEnabled", !data.experiencesEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.experiencesEnabled ? "bg-[#183D2B]" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.experiencesEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Badge (optional)</label>
              <input
                type="text"
                value={data.experiencesBadge}
                onChange={(e) => updateField("experiencesBadge", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Section Title</label>
              <input
                type="text"
                value={data.experiencesTitle}
                onChange={(e) => updateField("experiencesTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Section Subtitle</label>
              <input
                type="text"
                value={data.experiencesSubtitle}
                onChange={(e) => updateField("experiencesSubtitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
          </div>

          {/* Experience Selection Manager (8 Slots) */}
          <div className="pt-4 border-t border-[#F0ECE6] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold text-neutral-900">
                    Curated Homepage Experiences
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedExpIds.length === 8
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedExpIds.length > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {selectedExpIds.length} / 8 Selected
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Pick and arrange the exact 8 experiences that appear on the homepage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFillTop8}
                  className="px-3 py-1.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] hover:bg-neutral-100 text-xs font-semibold text-neutral-700 transition cursor-pointer"
                >
                  ⚡ Auto-fill Top 8
                </button>
                {selectedExpIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearExperiences}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Currently Selected Experiences List */}
            {selectedExperiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedExperiences.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#EAE6DF] shadow-2xs hover:border-[#183D2B]/30 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Slot Order Number */}
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#183D2B] text-white text-xs font-bold shadow-2xs">
                        {index + 1}
                      </span>

                      {/* Thumbnail */}
                      {exp.image ? (
                        <div className="relative h-12 w-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={exp.image.src} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-14 rounded-xl bg-neutral-100 shrink-0 border border-neutral-200" />
                      )}

                      {/* Info */}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate leading-snug">{exp.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                          <span className="truncate">{exp.categoryName}</span>
                          <span>&bull;</span>
                          <span className="font-semibold text-neutral-800">€{exp.priceFromAmount.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Move Up / Move Down / Remove */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveExperience(index, "up")}
                        title="Move Up"
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        disabled={index === selectedExperiences.length - 1}
                        onClick={() => handleMoveExperience(index, "down")}
                        title="Move Down"
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        title="Remove from Homepage"
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#EAE6DF] text-center">
                <p className="text-xs font-semibold text-neutral-700">No explicit experiences selected</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  The homepage is currently displaying the top 8 published experiences automatically.
                  Use the picker below or click &quot;Auto-fill Top 8&quot; to customize.
                </p>
              </div>
            )}

            {/* Add Experience Picker (if fewer than 8 selected) */}
            {selectedExpIds.length < 8 && (
              <div className="pt-3 border-t border-[#F0ECE6] space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="exp-search-input" className="block text-xs font-semibold text-neutral-800">
                    Add Experience ({8 - selectedExpIds.length} slot{8 - selectedExpIds.length === 1 ? "" : "s"} remaining)
                  </label>
                  <div className="w-64 max-w-full">
                    <input
                      id="exp-search-input"
                      type="text"
                      placeholder="Search experiences..."
                      value={expSearch}
                      onChange={(e) => setExpSearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EAE6DF] bg-white focus:outline-none focus:border-[#183D2B]"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-2xl border border-[#EAE6DF] bg-white divide-y divide-neutral-100">
                  {filteredAvailable.length > 0 ? (
                    filteredAvailable.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between gap-3 p-2.5 hover:bg-[#FAF8F5] transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {exp.image ? (
                            <div className="relative h-9 w-11 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={exp.image.src} alt="" className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-9 w-11 rounded-lg bg-neutral-100 shrink-0 border border-neutral-200" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-neutral-900 truncate">{exp.title}</p>
                            <p className="text-[10.5px] text-neutral-500 truncate">{exp.categoryName} &bull; €{exp.priceFromAmount.toFixed(0)}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddExperience(exp.id)}
                          className="shrink-0 px-3 py-1 rounded-lg bg-[#183D2B] hover:bg-[#23503A] text-white text-[11px] font-semibold transition cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-neutral-400">
                      {availableExperiences.length === 0
                        ? "All live experiences are already added to the homepage."
                        : "No matching experiences found."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. POPULAR DESTINATIONS TAB */}
      {/* =================================================================== */}
      {activeTab === "landmarks" && (
        <div className="rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white text-xs font-bold flex items-center justify-center">
                4
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-neutral-900">Popular Destinations (Landmark Spotlight)</h2>
                <p className="text-xs text-neutral-400">The 4 monument cards shown in the Landmark Spotlight section.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{data.landmarkEnabled ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => updateField("landmarkEnabled", !data.landmarkEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.landmarkEnabled ? "bg-[#183D2B]" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.landmarkEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Badge</label>
              <input
                type="text"
                value={data.landmarkBadge}
                onChange={(e) => updateField("landmarkBadge", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Landmarks Title</label>
              <input
                type="text"
                value={data.landmarkTitle}
                onChange={(e) => updateField("landmarkTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Landmarks Subtitle</label>
              <textarea
                rows={2}
                value={data.landmarkSubtitle}
                onChange={(e) => updateField("landmarkSubtitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
          </div>

          {/* Landmark Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-700">Landmark Cards</label>
              <button
                type="button"
                onClick={() => {
                  const next = [...(data.landmarkItems || [])];
                  next.push({
                    id: `landmark-${Date.now()}`,
                    name: "New Landmark",
                    tag: "",
                    description: "",
                    image: "/images/florence-hero.jpg",
                    imageAlt: "",
                    href: "/experiences",
                    price: "From €0",
                    rating: "5.0",
                    reviews: "0",
                    queueWithout: "",
                    queueWithUs: "",
                  });
                  updateField("landmarkItems", next);
                }}
                className="text-[11px] font-semibold text-[#183D2B] hover:underline cursor-pointer"
              >
                + Add Landmark
              </button>
            </div>
            <div className="space-y-4">
              {(data.landmarkItems || []).map((landmark, idx) => (
                <div key={landmark.id || idx} className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4 space-y-3">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                    <div className="lg:col-span-3 relative h-24 rounded-xl overflow-hidden bg-neutral-200">
                      <Image src={landmark.image || "/images/florence-hero.jpg"} alt={landmark.name} fill className="object-cover" />
                    </div>
                    <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={landmark.name}
                        onChange={(e) => {
                          const next = [...(data.landmarkItems || [])];
                          next[idx] = { ...landmark, name: e.target.value };
                          updateField("landmarkItems", next);
                        }}
                        placeholder="Name"
                        className="text-xs font-bold bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                      />
                      <input
                        type="text"
                        value={landmark.tag}
                        onChange={(e) => {
                          const next = [...(data.landmarkItems || [])];
                          next[idx] = { ...landmark, tag: e.target.value };
                          updateField("landmarkItems", next);
                        }}
                        placeholder="Tag (e.g. Most Visited Monument)"
                        className="text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                      />
                      <HomepageMediaField
                        compact
                        kind="image"
                        folder="homepage/landmarks"
                        value={landmark.image}
                        onChange={(url) => {
                          const next = [...(data.landmarkItems || [])];
                          next[idx] = { ...landmark, image: url };
                          updateField("landmarkItems", next);
                        }}
                        placeholder="Image URL"
                      />
                      <input
                        type="text"
                        value={landmark.imageAlt}
                        onChange={(e) => {
                          const next = [...(data.landmarkItems || [])];
                          next[idx] = { ...landmark, imageAlt: e.target.value };
                          updateField("landmarkItems", next);
                        }}
                        placeholder="Image Alt Text"
                        className="text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                      />
                      <input
                        type="text"
                        value={landmark.href}
                        onChange={(e) => {
                          const next = [...(data.landmarkItems || [])];
                          next[idx] = { ...landmark, href: e.target.value };
                          updateField("landmarkItems", next);
                        }}
                        placeholder="Link (e.g. /experiences/duomo...)"
                        className="text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                      />
                      <input
                        type="text"
                        value={landmark.price}
                        onChange={(e) => {
                          const next = [...(data.landmarkItems || [])];
                          next[idx] = { ...landmark, price: e.target.value };
                          updateField("landmarkItems", next);
                        }}
                        placeholder="Price (e.g. From €45)"
                        className="text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                      />
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={landmark.description}
                    onChange={(e) => {
                      const next = [...(data.landmarkItems || [])];
                      next[idx] = { ...landmark, description: e.target.value };
                      updateField("landmarkItems", next);
                    }}
                    placeholder="Description"
                    className="w-full text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <input
                      type="text"
                      value={landmark.rating}
                      onChange={(e) => {
                        const next = [...(data.landmarkItems || [])];
                        next[idx] = { ...landmark, rating: e.target.value };
                        updateField("landmarkItems", next);
                      }}
                      placeholder="Rating (e.g. 4.9)"
                      className="text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="text"
                      value={landmark.reviews}
                      onChange={(e) => {
                        const next = [...(data.landmarkItems || [])];
                        next[idx] = { ...landmark, reviews: e.target.value };
                        updateField("landmarkItems", next);
                      }}
                      placeholder="Review count (e.g. 6,340)"
                      className="text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="text"
                      value={landmark.queueWithout}
                      onChange={(e) => {
                        const next = [...(data.landmarkItems || [])];
                        next[idx] = { ...landmark, queueWithout: e.target.value };
                        updateField("landmarkItems", next);
                      }}
                      placeholder="Queue without VACAY"
                      className="text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="text"
                      value={landmark.queueWithUs}
                      onChange={(e) => {
                        const next = [...(data.landmarkItems || [])];
                        next[idx] = { ...landmark, queueWithUs: e.target.value };
                        updateField("landmarkItems", next);
                      }}
                      placeholder="Queue with VACAY"
                      className="text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = (data.landmarkItems || []).filter((_, i) => i !== idx);
                      updateField("landmarkItems", next);
                    }}
                    className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                  >
                    Remove Landmark
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. ITINERARY PLANNER TAB */}
      {/* =================================================================== */}
      {activeTab === "itinerary" && (
        <div className="rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white text-xs font-bold flex items-center justify-center">
                5
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-neutral-900">Florence Itinerary Builder</h2>
                <p className="text-xs text-neutral-400">The interactive multi-day trip planner with hour-by-hour steps.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{data.itineraryEnabled ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => updateField("itineraryEnabled", !data.itineraryEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.itineraryEnabled ? "bg-[#183D2B]" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.itineraryEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Badge</label>
              <input
                type="text"
                value={data.itineraryBadge}
                onChange={(e) => updateField("itineraryBadge", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Section Title</label>
              <input
                type="text"
                value={data.itineraryTitle}
                onChange={(e) => updateField("itineraryTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Section Subtitle</label>
              <input
                type="text"
                value={data.itinerarySubtitle}
                onChange={(e) => updateField("itinerarySubtitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
          </div>

          {/* Plans */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-700">Trip Plans</label>
              <button
                type="button"
                onClick={() => {
                  const next = [...(data.itineraryPlans || [])];
                  next.push({
                    id: `plan-${Date.now()}`,
                    title: "New Plan",
                    subtitle: "",
                    badge: "",
                    pillLabel: "New Plan",
                    steps: [],
                  });
                  updateField("itineraryPlans", next);
                }}
                className="text-[11px] font-semibold text-[#183D2B] hover:underline cursor-pointer"
              >
                + Add Plan
              </button>
            </div>

            <div className="space-y-5">
              {(data.itineraryPlans || []).map((plan, planIdx) => (
                <div key={plan.id || planIdx} className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={plan.pillLabel}
                      onChange={(e) => {
                        const next = [...(data.itineraryPlans || [])];
                        next[planIdx] = { ...plan, pillLabel: e.target.value };
                        updateField("itineraryPlans", next);
                      }}
                      placeholder="Switcher pill label (e.g. 1 Day (Express))"
                      className="text-xs font-semibold bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="text"
                      value={plan.badge}
                      onChange={(e) => {
                        const next = [...(data.itineraryPlans || [])];
                        next[planIdx] = { ...plan, badge: e.target.value };
                        updateField("itineraryPlans", next);
                      }}
                      placeholder="Badge (e.g. ⚡ Most Popular for Short Stays)"
                      className="text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="text"
                      value={plan.title}
                      onChange={(e) => {
                        const next = [...(data.itineraryPlans || [])];
                        next[planIdx] = { ...plan, title: e.target.value };
                        updateField("itineraryPlans", next);
                      }}
                      placeholder="Plan title"
                      className="text-xs font-bold bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                    />
                    <input
                      type="text"
                      value={plan.subtitle}
                      onChange={(e) => {
                        const next = [...(data.itineraryPlans || [])];
                        next[planIdx] = { ...plan, subtitle: e.target.value };
                        updateField("itineraryPlans", next);
                      }}
                      placeholder="Plan subtitle"
                      className="text-xs bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                    />
                  </div>

                  {/* Steps */}
                  <div className="pl-3 border-l-2 border-[#EAE6DF] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Steps</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...(data.itineraryPlans || [])];
                          const steps = [...next[planIdx].steps, { time: "", title: "", description: "", tag: "", href: "", actionText: "", image: "/images/florence-hero.jpg" }];
                          next[planIdx] = { ...next[planIdx], steps };
                          updateField("itineraryPlans", next);
                        }}
                        className="text-[11px] font-semibold text-[#183D2B] hover:underline cursor-pointer"
                      >
                        + Add Step
                      </button>
                    </div>
                    {plan.steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="rounded-xl bg-white border border-[#EAE6DF] p-3 space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            value={step.time}
                            onChange={(e) => {
                              const next = [...(data.itineraryPlans || [])];
                              const steps = [...next[planIdx].steps];
                              steps[stepIdx] = { ...steps[stepIdx], time: e.target.value };
                              next[planIdx] = { ...next[planIdx], steps };
                              updateField("itineraryPlans", next);
                            }}
                            placeholder="Time (e.g. 08:30 AM)"
                            className="text-[11px] bg-[#FAF8F5] border border-[#EAE6DF] px-2 py-1 rounded-md"
                          />
                          <input
                            type="text"
                            value={step.tag}
                            onChange={(e) => {
                              const next = [...(data.itineraryPlans || [])];
                              const steps = [...next[planIdx].steps];
                              steps[stepIdx] = { ...steps[stepIdx], tag: e.target.value };
                              next[planIdx] = { ...next[planIdx], steps };
                              updateField("itineraryPlans", next);
                            }}
                            placeholder="Tag"
                            className="text-[11px] bg-[#FAF8F5] border border-[#EAE6DF] px-2 py-1 rounded-md"
                          />
                          <input
                            type="text"
                            value={step.actionText || ""}
                            onChange={(e) => {
                              const next = [...(data.itineraryPlans || [])];
                              const steps = [...next[planIdx].steps];
                              steps[stepIdx] = { ...steps[stepIdx], actionText: e.target.value };
                              next[planIdx] = { ...next[planIdx], steps };
                              updateField("itineraryPlans", next);
                            }}
                            placeholder="Button text (optional)"
                            className="text-[11px] bg-[#FAF8F5] border border-[#EAE6DF] px-2 py-1 rounded-md"
                          />
                          <input
                            type="text"
                            value={step.href || ""}
                            onChange={(e) => {
                              const next = [...(data.itineraryPlans || [])];
                              const steps = [...next[planIdx].steps];
                              steps[stepIdx] = { ...steps[stepIdx], href: e.target.value };
                              next[planIdx] = { ...next[planIdx], steps };
                              updateField("itineraryPlans", next);
                            }}
                            placeholder="Link (optional)"
                            className="text-[11px] bg-[#FAF8F5] border border-[#EAE6DF] px-2 py-1 rounded-md"
                          />
                        </div>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const next = [...(data.itineraryPlans || [])];
                            const steps = [...next[planIdx].steps];
                            steps[stepIdx] = { ...steps[stepIdx], title: e.target.value };
                            next[planIdx] = { ...next[planIdx], steps };
                            updateField("itineraryPlans", next);
                          }}
                          placeholder="Step title"
                          className="w-full text-xs font-semibold bg-[#FAF8F5] border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                        />
                        <textarea
                          rows={2}
                          value={step.description}
                          onChange={(e) => {
                            const next = [...(data.itineraryPlans || [])];
                            const steps = [...next[planIdx].steps];
                            steps[stepIdx] = { ...steps[stepIdx], description: e.target.value };
                            next[planIdx] = { ...next[planIdx], steps };
                            updateField("itineraryPlans", next);
                          }}
                          placeholder="Step description"
                          className="w-full text-xs bg-[#FAF8F5] border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg"
                        />
                        <HomepageMediaField
                          compact
                          kind="image"
                          folder="homepage/itinerary"
                          value={step.image}
                          onChange={(url) => {
                            const next = [...(data.itineraryPlans || [])];
                            const steps = [...next[planIdx].steps];
                            steps[stepIdx] = { ...steps[stepIdx], image: url };
                            next[planIdx] = { ...next[planIdx], steps };
                            updateField("itineraryPlans", next);
                          }}
                          placeholder="Image URL"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...(data.itineraryPlans || [])];
                            const steps = next[planIdx].steps.filter((_, i) => i !== stepIdx);
                            next[planIdx] = { ...next[planIdx], steps };
                            updateField("itineraryPlans", next);
                          }}
                          className="text-[10.5px] font-semibold text-red-500 hover:underline cursor-pointer"
                        >
                          Remove Step
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = (data.itineraryPlans || []).filter((_, i) => i !== planIdx);
                      updateField("itineraryPlans", next);
                    }}
                    className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                  >
                    Remove Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. MOBILE PASS SHOWCASE TAB */}
      {/* =================================================================== */}
      {activeTab === "mobile" && (
        <div className="rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white text-xs font-bold flex items-center justify-center">
                6
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-neutral-900">Mobile Pass Showcase</h2>
                <p className="text-xs text-neutral-400">The &ldquo;Scan &amp; Walk Right In&rdquo; digital wallet section.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{data.mobileEnabled ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => updateField("mobileEnabled", !data.mobileEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.mobileEnabled ? "bg-[#183D2B]" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.mobileEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Badge</label>
              <input
                type="text"
                value={data.mobileBadge}
                onChange={(e) => updateField("mobileBadge", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Headline</label>
              <input
                type="text"
                value={data.mobileTitle}
                onChange={(e) => updateField("mobileTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
              <p className="mt-1 text-[10.5px] text-neutral-400">
                End the first sentence with a period to split it across two lines with an italic accent, matching the default style.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={data.mobileSubtitle}
                onChange={(e) => updateField("mobileSubtitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] p-4 flex items-start gap-3">
            <svg viewBox="0 0 24 24" className="w-4 h-4 mt-0.5 shrink-0 fill-none stroke-neutral-400 stroke-2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-[11.5px] text-neutral-500 leading-relaxed">
              The 3 sample digital passes shown on the phone mockup are a design illustration (they link to real experiences by slug) and aren&apos;t editable here to keep this editor simple.
            </p>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. WHY CHOOSE US TAB */}
      {/* =================================================================== */}
      {activeTab === "whyUs" && (
        <div className="rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white text-xs font-bold flex items-center justify-center">
                7
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-neutral-900">Why Choose Us Section</h2>
                <p className="text-xs text-neutral-400">Edit comparison table against box office and customer statistics.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{data.whyUsEnabled ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => updateField("whyUsEnabled", !data.whyUsEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.whyUsEnabled ? "bg-[#183D2B]" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.whyUsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Badge</label>
              <input
                type="text"
                value={data.whyUsBadge}
                onChange={(e) => updateField("whyUsBadge", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Section Title</label>
              <input
                type="text"
                value={data.whyUsTitle}
                onChange={(e) => updateField("whyUsTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Section Subtitle</label>
              <input
                type="text"
                value={data.whyUsSubtitle}
                onChange={(e) => updateField("whyUsSubtitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Comparison CTA Button Text</label>
              <input
                type="text"
                value={data.whyUsCtaText}
                onChange={(e) => updateField("whyUsCtaText", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Comparison CTA Button Link</label>
              <input
                type="text"
                value={data.whyUsCtaLink}
                onChange={(e) => updateField("whyUsCtaLink", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-neutral-700">Comparison Table Rows</label>
            <div className="space-y-2">
              {(data.whyUsComparisonRows || []).map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] items-center text-xs">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={row.feature}
                      onChange={(e) => {
                        const next = [...(data.whyUsComparisonRows || [])];
                        next[idx] = { ...row, feature: e.target.value };
                        updateField("whyUsComparisonRows", next);
                      }}
                      className="w-full bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg font-medium"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={row.gate}
                      onChange={(e) => {
                        const next = [...(data.whyUsComparisonRows || [])];
                        next[idx] = { ...row, gate: e.target.value };
                        updateField("whyUsComparisonRows", next);
                      }}
                      className="w-full bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg text-neutral-500"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={row.vacay}
                      onChange={(e) => {
                        const next = [...(data.whyUsComparisonRows || [])];
                        next[idx] = { ...row, vacay: e.target.value };
                        updateField("whyUsComparisonRows", next);
                      }}
                      className="w-full bg-white border border-[#EAE6DF] px-2.5 py-1.5 rounded-lg text-[#183D2B] font-semibold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-700">Trust Stats Row</label>
              <button
                type="button"
                onClick={() => {
                  const next = [...(data.whyUsStats || [])];
                  next.push({ value: "100%", label: "New Stat" });
                  updateField("whyUsStats", next);
                }}
                className="text-[11px] font-semibold text-[#183D2B] hover:underline cursor-pointer"
              >
                + Add Stat
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(data.whyUsStats || []).map((stat, idx) => (
                <div key={idx} className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-3 space-y-1.5">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const next = [...(data.whyUsStats || [])];
                      next[idx] = { ...stat, value: e.target.value };
                      updateField("whyUsStats", next);
                    }}
                    placeholder="Value (e.g. 98,000+)"
                    className="w-full text-xs font-bold text-center bg-white border border-[#EAE6DF] px-2 py-1.5 rounded-lg"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const next = [...(data.whyUsStats || [])];
                      next[idx] = { ...stat, label: e.target.value };
                      updateField("whyUsStats", next);
                    }}
                    placeholder="Label"
                    className="w-full text-[11px] text-center text-neutral-600 bg-white border border-[#EAE6DF] px-2 py-1 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = (data.whyUsStats || []).filter((_, i) => i !== idx);
                      updateField("whyUsStats", next);
                    }}
                    className="w-full text-[10.5px] font-semibold text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. TESTIMONIALS TAB */}
      {/* =================================================================== */}
      {activeTab === "testimonials" && (
        <div className="rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white text-xs font-bold flex items-center justify-center">
                8
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-neutral-900">Traveler Reviews & Testimonials</h2>
                <p className="text-xs text-neutral-400">Manage social proof reviews shown to visitors on the home page.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{data.testimonialsEnabled ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => updateField("testimonialsEnabled", !data.testimonialsEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.testimonialsEnabled ? "bg-[#183D2B]" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.testimonialsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Badge</label>
              <input
                type="text"
                value={data.testimonialsBadge}
                onChange={(e) => updateField("testimonialsBadge", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div />
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Title</label>
              <input
                type="text"
                value={data.testimonialsTitle}
                onChange={(e) => updateField("testimonialsTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={data.testimonialsSubtitle}
                onChange={(e) => updateField("testimonialsSubtitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Rating Badge Value (e.g. 4.9 / 5.0)</label>
              <input
                type="text"
                value={data.testimonialsRatingValue}
                onChange={(e) => updateField("testimonialsRatingValue", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Rating Badge Review Count (e.g. 14,200+ Reviews)</label>
              <input
                type="text"
                value={data.testimonialsRatingCount}
                onChange={(e) => updateField("testimonialsRatingCount", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-neutral-700">Reviews List</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(data.testimonialsItems || []).map((review, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={review.name}
                      onChange={(e) => {
                        const next = [...(data.testimonialsItems || [])];
                        next[idx] = { ...review, name: e.target.value };
                        updateField("testimonialsItems", next);
                      }}
                      className="text-xs font-bold text-neutral-900 bg-white border border-[#EAE6DF] px-2 py-1 rounded-md"
                    />
                    <span className="text-amber-500 font-bold text-xs">{"★".repeat(review.rating || 5)}</span>
                  </div>
                  <input
                    type="text"
                    value={review.location}
                    placeholder="Location"
                    onChange={(e) => {
                      const next = [...(data.testimonialsItems || [])];
                      next[idx] = { ...review, location: e.target.value };
                      updateField("testimonialsItems", next);
                    }}
                    className="w-full text-[11px] text-neutral-400 bg-transparent px-1"
                  />
                  <textarea
                    rows={3}
                    value={review.quote}
                    onChange={(e) => {
                      const next = [...(data.testimonialsItems || [])];
                      next[idx] = { ...review, quote: e.target.value };
                      updateField("testimonialsItems", next);
                    }}
                    className="w-full text-xs text-neutral-700 bg-white border border-[#EAE6DF] p-2 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 9. TRAVEL GUIDE TAB */}
      {/* =================================================================== */}
      {activeTab === "travelGuide" && (
        <div className="rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white text-xs font-bold flex items-center justify-center">
                9
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-neutral-900">Travel Guide &amp; Blog Teaser</h2>
                <p className="text-xs text-neutral-400">The blog teaser section header near the bottom of the homepage.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{data.travelGuideEnabled ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => updateField("travelGuideEnabled", !data.travelGuideEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.travelGuideEnabled ? "bg-[#183D2B]" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.travelGuideEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Badge</label>
              <input
                type="text"
                value={data.travelGuideBadge}
                onChange={(e) => updateField("travelGuideBadge", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Headline</label>
              <input
                type="text"
                value={data.travelGuideTitle}
                onChange={(e) => updateField("travelGuideTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
              <input
                type="text"
                value={data.travelGuideSubtitle}
                onChange={(e) => updateField("travelGuideSubtitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] p-4 flex items-start gap-3">
            <svg viewBox="0 0 24 24" className="w-4 h-4 mt-0.5 shrink-0 fill-none stroke-neutral-400 stroke-2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-[11.5px] text-neutral-500 leading-relaxed">
              The 3 article cards shown here are your latest published posts, pulled live. Manage posts from{" "}
              <Link href="/admin/blog" className="font-semibold text-[#183D2B] hover:underline">
                Admin → Blog &amp; Content
              </Link>
              . This section is automatically hidden if you have no published posts yet.
            </p>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 10. FAQ SECTION TAB */}
      {/* =================================================================== */}
      {activeTab === "faq" && (
        <div className="rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white text-xs font-bold flex items-center justify-center">
                10
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-neutral-900">FAQ Section</h2>
                <p className="text-xs text-neutral-400">Frequently Asked Questions shown on the home page.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{data.faqEnabled ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => updateField("faqEnabled", !data.faqEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.faqEnabled ? "bg-[#183D2B]" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.faqEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Badge</label>
              <input
                type="text"
                value={data.faqBadge}
                onChange={(e) => updateField("faqBadge", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Title</label>
              <input
                type="text"
                value={data.faqTitle}
                onChange={(e) => updateField("faqTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={data.faqSubtitle}
                onChange={(e) => updateField("faqSubtitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-neutral-700">Q&amp;A Items</label>
            <div className="space-y-3">
              {(data.faqItems || []).map((faq, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] space-y-2">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const next = [...(data.faqItems || [])];
                      next[idx] = { ...faq, question: e.target.value };
                      updateField("faqItems", next);
                    }}
                    className="w-full text-xs font-bold text-neutral-900 bg-white border border-[#EAE6DF] px-3 py-1.5 rounded-lg"
                  />
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => {
                      const next = [...(data.faqItems || [])];
                      next[idx] = { ...faq, answer: e.target.value };
                      updateField("faqItems", next);
                    }}
                    className="w-full text-xs text-neutral-700 bg-white border border-[#EAE6DF] p-2.5 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 11. CTA SECTION TAB */}
      {/* =================================================================== */}
      {activeTab === "cta" && (
        <div className="rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0ECE6]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white text-xs font-bold flex items-center justify-center">
                11
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-neutral-900">VIP Conversion Banner (CTA)</h2>
                <p className="text-xs text-neutral-400">High-converting bottom banner prompting fast ticket reservations.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{data.ctaEnabled ? "Enabled" : "Disabled"}</span>
              <button
                type="button"
                onClick={() => updateField("ctaEnabled", !data.ctaEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.ctaEnabled ? "bg-[#183D2B]" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.ctaEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Banner Badge Text</label>
              <input
                type="text"
                value={data.ctaBadge}
                onChange={(e) => updateField("ctaBadge", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Headline</label>
              <input
                type="text"
                value={data.ctaTitle}
                onChange={(e) => updateField("ctaTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={data.ctaSubtitle}
                onChange={(e) => updateField("ctaSubtitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Primary Button Text</label>
                <input
                  type="text"
                  value={data.ctaButtonText}
                  onChange={(e) => updateField("ctaButtonText", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Primary Button Link</label>
                <input
                  type="text"
                  value={data.ctaButtonLink}
                  onChange={(e) => updateField("ctaButtonLink", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Secondary Link Text (optional)</label>
                <input
                  type="text"
                  value={data.ctaSecondaryButtonText || ""}
                  onChange={(e) => updateField("ctaSecondaryButtonText", e.target.value)}
                  placeholder="Leave blank to hide"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Secondary Link URL</label>
                <input
                  type="text"
                  value={data.ctaSecondaryButtonLink || ""}
                  onChange={(e) => updateField("ctaSecondaryButtonLink", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
                />
              </div>
              <HomepageMediaField
                label="Background Image (subtle, optional)"
                value={data.ctaBackgroundImage || ""}
                onChange={(url) => updateField("ctaBackgroundImage", url)}
                kind="image"
                folder="homepage/cta"
                placeholder="Leave blank for plain background"
              />
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Promo Code</label>
                <input
                  type="text"
                  value={data.ctaPromoCode}
                  onChange={(e) => updateField("ctaPromoCode", e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5] font-mono"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
              <svg viewBox="0 0 24 24" className="w-4 h-4 mt-0.5 shrink-0 fill-none stroke-amber-600 stroke-2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-[11.5px] text-amber-800 leading-relaxed">
                This code is only displayed and copied to the clipboard — there is no discount/coupon system wired up at checkout
                yet, so it currently has no effect on the price a customer pays.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 12. SEO & META TAB */}
      {/* =================================================================== */}
      {activeTab === "seo" && (
        <div className="rounded-3xl bg-white border border-[#EAE6DF] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#F0ECE6]">
            <div className="w-7 h-7 rounded-full bg-[#183D2B] text-white text-xs font-bold flex items-center justify-center">
              12
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-neutral-900">SEO &amp; OpenGraph Metadata</h2>
              <p className="text-xs text-neutral-400">Search engine title, meta description, and social sharing image.</p>
            </div>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Meta Page Title</label>
              <input
                type="text"
                value={data.seoMetaTitle}
                onChange={(e) => updateField("seoMetaTitle", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={data.seoMetaDescription}
                onChange={(e) => updateField("seoMetaDescription", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Canonical URL</label>
              <input
                type="text"
                value={data.seoCanonicalUrl}
                onChange={(e) => updateField("seoCanonicalUrl", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE6DF] focus:outline-none focus:border-[#183D2B] bg-[#FAF8F5]"
              />
            </div>

            <HomepageMediaField
              label="OpenGraph Share Image"
              value={data.seoOgImage}
              onChange={(url) => updateField("seoOgImage", url)}
              kind="image"
              folder="homepage/seo"
            />
          </div>
        </div>
      )}
    </div>
  );
}
