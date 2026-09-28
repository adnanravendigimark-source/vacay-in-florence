import { isRichHtmlBody, renderRichBlogBody } from "./rich-content";

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
 * Renders a blog post's `body` column into safe article HTML, extracting
 * a table of contents along the way. `body` holds one of two formats,
 * detected automatically so every caller (this function's signature is
 * unchanged) keeps working with either:
 *
 * - Rich HTML, written by the Admin Blog Editor's Tiptap-based rich text
 *   editor (src/components/admin/rich-text-editor.tsx) — real headings,
 *   bold/italic/underline, links, ordered/unordered lists, tables,
 *   images, blockquotes, and text alignment. Delegated to
 *   rich-content.ts's renderRichBlogBody, which re-sanitizes on the way
 *   out (defense in depth) and injects heading ids for the TOC.
 * - The original plain-text/mini-markdown format every post written
 *   before the rich editor existed already uses: plain "\n\n"-separated
 *   paragraphs, "## "/"### " headings, "- " bullet lines. Handled by the
 *   parser below exactly as before — nothing about it changed, so every
 *   old post keeps rendering exactly as it always did.
 *
 * A body is treated as rich HTML only when it starts with a real HTML
 * tag (see isRichHtmlBody) — something plain prose or the mini-markdown
 * syntax never does — so detection can't misfire on old content.
 */
export function renderBlogBody(body: string): RenderedBlogBody {
  if (isRichHtmlBody(body)) return renderRichBlogBody(body);
  return renderLegacyBlogBody(body);
}

function renderLegacyBlogBody(body: string): RenderedBlogBody {
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
