export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface RenderedBlogBody {
  html: string;
  toc: TocItem[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Minimal, safe inline markup — **bold** and *italic* only, applied after
// escaping so nothing in the body can inject raw HTML.
function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
}

/**
 * Renders a blog post's plain-text `body` column into safe article HTML,
 * extracting a table of contents from any "## Heading" / "### Subheading"
 * lines along the way.
 *
 * Deliberately NOT a full markdown parser or a structured content-block
 * model (contrast with the Amsterdam reference repo's ContentBlock[] JSON
 * schema stored per-post) — `body` stays a single plain-text column, so
 * every post written before this feature existed keeps rendering exactly
 * as it always did: plain "\n\n"-separated paragraphs, no headings, no
 * TOC entries. A post opts into richer structure just by adding "## " /
 * "### " lines or "- " bullet lines; nothing else about the pipeline
 * changes, and nothing is ever interpreted as raw HTML.
 */
export function renderBlogBody(body: string): RenderedBlogBody {
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  const blocks = (body || "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const html = blocks
    .map((block) => {
      const headingMatch = /^(#{2,3})\s+(.+)$/.exec(block);
      if (headingMatch) {
        const level = headingMatch[1].length === 2 ? 2 : 3;
        const text = headingMatch[2].trim();
        let id = slugifyHeading(text) || `section-${toc.length + 1}`;
        const count = seen.get(id) ?? 0;
        seen.set(id, count + 1);
        if (count > 0) id = `${id}-${count + 1}`;
        toc.push({ id, text, level: level as 2 | 3 });
        return `<h${level} id="${id}">${renderInline(text)}</h${level}>`;
      }

      const lines = block.split("\n").map((line) => line.trim());
      if (lines.length > 0 && lines.every((line) => line.startsWith("- "))) {
        const items = lines.map((line) => `<li>${renderInline(line.slice(2))}</li>`).join("");
        return `<ul>${items}</ul>`;
      }

      return `<p>${renderInline(block).replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return { html, toc };
}
