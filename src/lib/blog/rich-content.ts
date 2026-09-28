import "server-only";
import DOMPurify from "isomorphic-dompurify";
import type { TocItem } from "./content";

/**
 * Full rich-HTML pipeline for the Tiptap-authored `body` column — the
 * counterpart to content.ts's plain-text `renderBlogBody` for posts
 * written with the Admin Blog Editor's rich text editor
 * (src/components/admin/rich-text-editor.tsx). Two responsibilities:
 *
 * 1. Sanitize on write (called from the admin data layer before a post
 *    is ever saved to the DB — see src/lib/data/admin/blog.ts) so
 *    nothing unexpected ever reaches the public page's
 *    dangerouslySetInnerHTML, regardless of what the client posted.
 * 2. Render for the public page: inject stable slugged `id`s onto every
 *    heading (Tiptap doesn't add these itself) so the article sidebar's
 *    table of contents can jump-link to them, and extract that same
 *    TOC in the exact shape content.ts's legacy renderer already
 *    produces, so blog-sidebar.tsx needs no changes either way.
 */

const ALLOWED_TAGS = [
  "h1", "h2", "h3",
  "p", "br",
  "strong", "b", "em", "i", "u",
  "a",
  "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td",
  "img", "figure", "figcaption",
  "blockquote",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "style", "colspan", "rowspan", "id"];

// DOMPurify would otherwise let a `style` attribute through untouched —
// fine for the one thing we actually use it for (Tiptap's text-align
// extension writes `style="text-align: center"` on headings/paragraphs)
// but not for arbitrary CSS smuggled in through a paste. Strip every
// style attribute down to just text-align, and nothing else.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.hasAttribute("style")) {
    const align = /text-align\s*:\s*(left|center|right|justify)/i.exec(node.getAttribute("style") || "");
    if (align) node.setAttribute("style", `text-align:${align[1].toLowerCase()}`);
    else node.removeAttribute("style");
  }
  if (node.tagName === "A") {
    node.setAttribute("rel", (node.getAttribute("rel") || "").includes("nofollow") ? "nofollow noopener noreferrer" : "noopener noreferrer");
    if (node.getAttribute("target") === "_blank") node.setAttribute("rel", node.getAttribute("rel") + "");
  }
});

/** Sanitizes Tiptap's `editor.getHTML()` output before it's stored. */
export function sanitizeRichBody(html: string): string {
  return DOMPurify.sanitize(html || "", { ALLOWED_TAGS, ALLOWED_ATTR }).trim();
}

/** A rich (Tiptap-authored) body always starts with a real HTML block tag; a legacy plain-text/mini-markdown body never does. */
export function isRichHtmlBody(body: string): boolean {
  return /^\s*<[a-z][a-z0-9]*[\s>]/i.test(body || "");
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export interface RenderedRichBody {
  html: string;
  toc: TocItem[];
}

/**
 * Renders an already-sanitized rich body for the public page: injects
 * `id`s onto h2/h3 headings and builds the matching TOC array. (h1 is
 * intentionally excluded from the TOC — the post's own title already IS
 * the page's H1, same convention as the old editor's allowedHeadings.)
 */
export function renderRichBlogBody(body: string): RenderedRichBody {
  const clean = sanitizeRichBody(body);
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();

  const html = clean.replace(/<(h[23])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (match, tag: string, attrs = "", inner: string) => {
    const level = tag === "h2" ? 2 : 3;
    const text = inner.replace(/<[^>]+>/g, "").trim();
    let id = slugifyHeading(text) || `section-${toc.length + 1}`;
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;
    toc.push({ id, text, level });
    const cleanedAttrs = (attrs || "").replace(/\sid="[^"]*"/gi, "");
    return `<${tag} id="${id}"${cleanedAttrs}>${inner}</${tag}>`;
  });

  return { html, toc };
}
