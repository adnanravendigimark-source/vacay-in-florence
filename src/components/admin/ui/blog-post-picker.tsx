"use client";

// Ordered multi-select for the "Related Travel Guides & Blog Articles"
// field. Replaces a raw slug-per-line textarea with a real picker over the
// site's actual published blog posts, so an admin/supplier chooses by
// title (never has to know or type a slug) and controls display order
// with up/down instead of re-typing lines.
export interface BlogPostOption {
  slug: string;
  title: string;
}

export function BlogPostPicker({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (slugs: string[]) => void;
  options: BlogPostOption[];
}) {
  const titleBySlug = new Map(options.map((o) => [o.slug, o.title]));
  const availableOptions = options.filter((o) => !value.includes(o.slug));

  function addSlug(slug: string) {
    if (!slug || value.includes(slug)) return;
    onChange([...value, slug]);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {value.length > 0 ? (
        <ul className="space-y-1.5">
          {value.map((slug, index) => {
            const title = titleBySlug.get(slug);
            return (
              <li
                key={`${slug}-${index}`}
                className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                <span className="flex-1 truncate text-ink">
                  {title ?? <span className="italic text-ink-faint">Unknown slug: {slug}</span>}
                </span>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-md px-1.5 py-1 text-ink-faint hover:bg-cream-deep disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  className="rounded-md px-1.5 py-1 text-ink-faint hover:bg-cream-deep disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="rounded-md px-1.5 py-1 text-red-500 hover:bg-red-50"
                  aria-label="Remove"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-stone p-3 text-center text-xs text-ink-faint">
          No blog posts selected — will auto-match by category.
        </p>
      )}

      <select
        className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand disabled:bg-neutral-50 disabled:text-neutral-400"
        value=""
        onChange={(e) => addSlug(e.target.value)}
        disabled={availableOptions.length === 0}
      >
        <option value="">
          {availableOptions.length === 0 ? "All published posts added" : "+ Add a blog post…"}
        </option>
        {availableOptions.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.title}
          </option>
        ))}
      </select>
    </div>
  );
}
