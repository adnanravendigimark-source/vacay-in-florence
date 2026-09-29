"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { DOMParser as ProseMirrorDOMParser } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import HeadingExtension, { type Level, type HeadingOptions } from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Node, mergeAttributes } from "@tiptap/core";
import { RichImageModal, type RichImageModalData } from "./rich-image-modal";
import { RichLinkModal, type RichLinkModalResult } from "./rich-link-modal";

/**
 * Tiptap-based rich text editor for the Admin Blog Editor's Article
 * Content field, ported from the Amsterdam reference repo's
 * TiptapArticleEditor.tsx (built on Tiptap v3 here, matched to this
 * project's React 19 — Amsterdam runs React 18/Tiptap v2, same API).
 *
 * Tiptap v3's OWN default clipboard handling turned out not to reliably
 * preserve formatting pasted from real websites or ChatGPT's web UI —
 * headings/bold/links were silently dropping to plain text (a real,
 * reported regression, not present in Amsterdam's v2 setup). Rather than
 * trust that default pipeline, `handlePaste` below explicitly intercepts
 * the clipboard event and runs it through the same paste-cleaning
 * heuristics Amsterdam's OTHER editor (RichTextEditor.tsx, used for its
 * simpler CMS fields) has relied on for a long time: prefer real pasted
 * HTML when it has genuine structure, normalize Word/Google-Docs-style
 * "Heading N" paragraphs and strip stray fonts/colors, fall back to
 * parsing markdown-flavored plain text (what ChatGPT's copy button often
 * puts on the clipboard instead of real HTML), and otherwise fall back to
 * plain paragraphs — then parses the resulting clean HTML through
 * ProseMirror's own schema-aware DOMParser and inserts it directly, so
 * the editor's node/mark schema (headings, links, images, tables, …)
 * still governs what's actually allowed in, exactly as it did before.
 *
 * The saved HTML is re-sanitized server-side before it's ever written
 * to the DB (see src/lib/blog/rich-content.ts) — this editor's own
 * sanitization (via Tiptap's schema, which simply can't produce a tag
 * outside its configured extensions) is the first layer, not the only
 * one.
 */

function normalizeUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return url;
  if (/^([a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(url)) return url;
  return `https://${url}`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/___(.*?)___/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

/**
 * Converts Markdown text (like ChatGPT copy output or standard markdown)
 * into clean semantic HTML — ported from Amsterdam's RichTextEditor.tsx.
 */
function markdownToHtml(markdown: string, allowedHeadings: (1 | 2 | 3)[]): string {
  const lines = markdown.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let inBlockquote = false;
  let inTable = false;
  let tableRows: string[] = [];

  function closeList() {
    if (inList) {
      htmlParts.push(`</${inList}>`);
      inList = null;
    }
  }

  function closeBlockquote() {
    if (inBlockquote) {
      htmlParts.push(`</blockquote>`);
      inBlockquote = false;
    }
  }

  function closeTable() {
    if (inTable && tableRows.length > 0) {
      const isHeaderSep = (row: string) => /^\s*\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?\s*$/.test(row);
      const rowsHtml: string[] = [];
      let headerDone = false;

      for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows[i];
        if (isHeaderSep(row)) {
          headerDone = true;
          continue;
        }
        const cells = row
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => !(idx === 0 && arr[0] === "") && !(idx === arr.length - 1 && arr[arr.length - 1] === ""));

        const tag = !headerDone && i === 0 ? "th" : "td";
        const rowContent = cells.map((cell) => `<${tag}>${formatInlineMarkdown(cell)}</${tag}>`).join("");
        rowsHtml.push(`<tr>${rowContent}</tr>`);
      }

      htmlParts.push(`<table><tbody>${rowsHtml.join("")}</tbody></table>`);
      tableRows = [];
      inTable = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line.startsWith("|") && line.endsWith("|")) {
      closeList();
      closeBlockquote();
      inTable = true;
      tableRows.push(line);
      continue;
    } else {
      closeTable();
    }

    if (!line) {
      closeList();
      closeBlockquote();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      closeBlockquote();
      const levelNum = headingMatch[1].length;
      let targetLevel: 1 | 2 | 3 = 2;
      if (levelNum === 1) targetLevel = allowedHeadings.includes(1) ? 1 : 2;
      else if (levelNum === 2) targetLevel = 2;
      else targetLevel = 3;

      htmlParts.push(`<h${targetLevel}>${formatInlineMarkdown(headingMatch[2])}</h${targetLevel}>`);
      continue;
    }

    if (line.startsWith(">")) {
      closeList();
      const quoteText = line.replace(/^>\s*/, "");
      if (!inBlockquote) {
        htmlParts.push(`<blockquote>`);
        inBlockquote = true;
      }
      htmlParts.push(`<p>${formatInlineMarkdown(quoteText)}</p>`);
      continue;
    } else {
      closeBlockquote();
    }

    const ulMatch = line.match(/^[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (inList !== "ul") {
        closeList();
        htmlParts.push(`<ul>`);
        inList = "ul";
      }
      htmlParts.push(`<li>${formatInlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (inList !== "ol") {
        closeList();
        htmlParts.push(`<ol>`);
        inList = "ol";
      }
      htmlParts.push(`<li>${formatInlineMarkdown(olMatch[1])}</li>`);
      continue;
    }

    closeList();
    htmlParts.push(`<p>${formatInlineMarkdown(line)}</p>`);
  }

  closeList();
  closeBlockquote();
  closeTable();

  return htmlParts.join("");
}

// Real pages / Word / Google Docs almost always carry proper HTML on the
// clipboard, but plain everyday article text very often ALSO happens to
// match the markdown heuristics below (a numbered intro like "1. Book
// tickets early", a stray "**word**", a "|" somewhere in a sentence). When
// that happens we must not throw the good HTML away — only fall back to
// the markdown/plain-text path when there's no real structure to keep.
function hasRichHtmlStructure(rawHtml: string): boolean {
  try {
    const doc = new window.DOMParser().parseFromString(rawHtml, "text/html");
    const body = doc.body;
    if (body.querySelector("h1, h2, h3, h4, h5, h6, table, ul, ol, blockquote")) return true;
    if (body.querySelectorAll("p").length > 1) return true;
    if (body.querySelector("strong, b, em, i, u, a, img")) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Cleans and normalizes HTML pasted from rich sources (Google Docs, Word,
 * ChatGPT web copy, or any website) — ported from Amsterdam's
 * RichTextEditor.tsx. Maps headings to the allowed levels (including
 * Word/Google Docs' habit of marking headings as styled <p> elements
 * instead of real <h1>-<h6> tags), strips fonts/colors/classes that would
 * fight this site's own styling, and sets safe rel/target on links —
 * Tiptap's schema (via ProseMirror's own DOMParser, applied right after
 * this) drops anything left over that isn't one of this editor's
 * configured node/mark types.
 */
function cleanRichHtml(rawHtml: string, allowedHeadings: (1 | 2 | 3)[]): string {
  try {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");
    const body = doc.body;

    const headingParas = body.querySelectorAll("p");
    headingParas.forEach((p) => {
      const signature = `${p.getAttribute("style") || ""} ${p.getAttribute("class") || ""}`;
      const match = signature.match(/heading\s*(\d)/i);
      if (!match) return;
      const level = Math.min(3, Math.max(1, parseInt(match[1], 10)));
      const tag = `h${level}`;
      const replacement = doc.createElement(tag);
      replacement.innerHTML = p.innerHTML;
      p.replaceWith(replacement);
    });

    const headings = body.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((h) => {
      const tag = h.tagName.toLowerCase();
      let targetTag = "h2";
      if (tag === "h1") targetTag = allowedHeadings.includes(1) ? "h1" : "h2";
      else if (tag === "h2") targetTag = "h2";
      else targetTag = "h3";

      if (tag !== targetTag) {
        const replacement = doc.createElement(targetTag);
        replacement.innerHTML = h.innerHTML;
        h.replaceWith(replacement);
      }
    });

    const allElements = body.querySelectorAll("*");
    allElements.forEach((el) => {
      el.removeAttribute("class");
      el.removeAttribute("style");
    });

    const links = body.querySelectorAll("a");
    links.forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });

    return body.innerHTML;
  } catch {
    return rawHtml;
  }
}

/**
 * The actual paste interception, wired into Tiptap's editorProps below.
 * Reads both clipboard flavors, picks the right path (rich HTML / markdown
 * plain text / flat HTML / plain paragraphs — same decision order
 * Amsterdam's editor uses), and inserts the result through ProseMirror's
 * own schema-aware parser so the editor's node/mark schema still has the
 * final say over what's actually allowed in.
 */
function buildPastedHtml(clipboardData: DataTransfer, allowedHeadings: (1 | 2 | 3)[]): string {
  const pastedHtml = clipboardData.getData("text/html");
  const pastedText = clipboardData.getData("text/plain");

  const hasRichHtml = !!pastedHtml && hasRichHtmlStructure(pastedHtml);
  const isMarkdown =
    !!pastedText &&
    (/(^|\n)#{1,6}\s+/.test(pastedText) ||
      /(^|\n)[-*+]\s+/.test(pastedText) ||
      /(^|\n)\d+\.\s+/.test(pastedText) ||
      /\*\*[^*]+\*\*/.test(pastedText) ||
      /\[[^\]]+\]\([^)]+\)/.test(pastedText) ||
      /(^|\n)\|.*\|/.test(pastedText));

  if (hasRichHtml) {
    return cleanRichHtml(pastedHtml, allowedHeadings);
  }
  if (pastedText) {
    if (isMarkdown) {
      return markdownToHtml(pastedText, allowedHeadings);
    }
    if (pastedHtml) {
      return cleanRichHtml(pastedHtml, allowedHeadings);
    }
    const paras = pastedText.split(/\r?\n\r?\n/);
    return paras
      .map((p) => {
        const clean = escapeHtml(p.trim()).replace(/\r?\n/g, "<br>");
        return clean ? `<p>${clean}</p>` : "";
      })
      .filter(Boolean)
      .join("");
  }
  return "";
}

// Restrict headings to the levels allowed in this field, mapping any
// out-of-schema pasted heading down to a sensible in-schema level
// instead of losing it — an H1 becomes H2 when H1 isn't allowed (the
// post's own title already IS the page's H1), H4-H6 become H3, the
// smallest heading the public article styles.
const Heading = HeadingExtension.extend({
  addOptions(): HeadingOptions {
    return { ...(this.parent?.() ?? { levels: [1, 2, 3] as Level[], HTMLAttributes: {} }), levels: [1, 2, 3] as Level[] };
  },
  parseHTML() {
    const allowed = (this.options.levels as number[]) || [1, 2, 3];
    return [1, 2, 3, 4, 5, 6].map((tagLevel) => {
      let level: number;
      if (tagLevel === 1) level = allowed.includes(1) ? 1 : 2;
      else if (tagLevel === 2) level = 2;
      else level = 3;
      return { tag: `h${tagLevel}`, attrs: { level } };
    });
  },
});

// Per-link target/rel attributes (not just a site-wide default) so the
// Link modal's "No follow" / "Open in new tab" choices apply per link.
const LinkWithAttrs = LinkExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      target: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("target"),
        renderHTML: (attrs: Record<string, unknown>) => (attrs.target ? { target: attrs.target } : {}),
      },
      rel: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute("rel"),
        renderHTML: (attrs: Record<string, unknown>) => (attrs.rel ? { rel: attrs.rel } : {}),
      },
    };
  },
});

// A captioned image (<figure><img/><figcaption>...</figcaption></figure>).
// A plain, uncaptioned image just uses the standard Image extension.
const Figure = Node.create({
  name: "figure",
  group: "block",
  content: "inline*",
  isolating: true,
  addAttributes() {
    return { src: { default: null }, alt: { default: "" } };
  },
  parseHTML() {
    return [
      {
        tag: "figure",
        contentElement: "figcaption",
        getAttrs: (el: HTMLElement | string) => {
          if (typeof el === "string") return false;
          const img = el.querySelector("img");
          if (!img) return false;
          return { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "" };
        },
      },
    ];
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Tiptap's own NodeSpec#renderHTML types `node` as `any` internally; matched here rather than fighting it.
  renderHTML({ node, HTMLAttributes }: { node: any; HTMLAttributes: Record<string, unknown> }) {
    return [
      "figure",
      mergeAttributes(HTMLAttributes),
      ["img", { src: node.attrs.src, alt: node.attrs.alt || "" }],
      ["figcaption", 0],
    ];
  },
});

function ToolbarButton({
  label,
  title,
  active = false,
  disabled = false,
  onClick,
}: {
  label: React.ReactNode;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-cypress text-white shadow-sm ring-1 ring-cypress" : "text-ink-soft hover:bg-cream-deep hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  allowedHeadings?: (1 | 2 | 3)[];
  stickyOffset?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = "16rem",
  allowedHeadings = [2, 3],
  stickyOffset,
}: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const allowedHeadingsRef = useRef(allowedHeadings);
  useEffect(() => {
    allowedHeadingsRef.current = allowedHeadings;
  }, [allowedHeadings]);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editingImageData, setEditingImageData] = useState<RichImageModalData | null>(null);
  const editingImageRef = useRef<{ pos: number } | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  const editor = useEditor(
    {
      immediatelyRender: false,
      content: value || "",
      editorProps: {
        attributes: {
          class:
            "tiptap rich-content max-w-none px-3.5 py-3 text-sm text-ink outline-none [&_img]:cursor-pointer [&_figure]:cursor-pointer",
        },
        handleClickOn: (_view, pos, node) => {
          if (node.type.name === "image") {
            editingImageRef.current = { pos };
            setEditingImageData({ url: (node.attrs.src as string) || "", alt: (node.attrs.alt as string) || "", caption: "" });
            setImageModalOpen(true);
            return true;
          }
          if (node.type.name === "figure") {
            editingImageRef.current = { pos };
            setEditingImageData({
              url: (node.attrs.src as string) || "",
              alt: (node.attrs.alt as string) || "",
              caption: node.textContent || "",
            });
            setImageModalOpen(true);
            return true;
          }
          return false;
        },
        // See the module docstring — Tiptap v3's default clipboard
        // handling wasn't reliably preserving formatting pasted from
        // real websites or ChatGPT. This explicitly cleans the pasted
        // HTML (or converts markdown-flavored plain text) the way
        // Amsterdam's editor does, then hands the result to
        // ProseMirror's own schema-aware parser.
        handlePaste: (view, event) => {
          const clipboardData = event.clipboardData;
          if (!clipboardData) return false;

          const finalHtml = buildPastedHtml(clipboardData, allowedHeadingsRef.current);
          if (!finalHtml) return false;

          event.preventDefault();
          const dom = document.createElement("div");
          dom.innerHTML = finalHtml;
          const parser = ProseMirrorDOMParser.fromSchema(view.state.schema);
          const slice = parser.parseSlice(dom, { preserveWhitespace: true });
          view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
          return true;
        },
      },
      extensions: [
        StarterKit.configure({ heading: false, link: false, underline: false }),
        Heading.configure({ levels: allowedHeadings.length ? allowedHeadings : [2, 3] }),
        Underline,
        LinkWithAttrs.configure({ openOnClick: false, autolink: false }),
        ImageExtension,
        Figure,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Placeholder.configure({ placeholder: placeholder || "Write here…" }),
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      onUpdate: ({ editor: ed }: { editor: Editor }) => {
        onChangeRef.current(ed.getHTML());
      },
    },
    [],
  );

  // Tiptap v3 no longer auto re-renders React on every transaction —
  // force one on selection/content changes too, so the toolbar's
  // active-state highlighting (H2/H3/Bold/…) stays accurate as the
  // cursor moves, not just when content changes.
  const [, forceRerender] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const rerender = () => forceRerender((n) => n + 1);
    editor.on("selectionUpdate", rerender);
    editor.on("transaction", rerender);
    return () => {
      editor.off("selectionUpdate", rerender);
      editor.off("transaction", rerender);
    };
  }, [editor]);

  const replaceNodeAt = useCallback((ed: Editor, pos: number, content: Record<string, unknown>) => {
    ed.chain()
      .focus()
      .command(({ tr }) => {
        const current = tr.doc.nodeAt(pos);
        if (!current) return false;
        tr.delete(pos, pos + current.nodeSize);
        return true;
      })
      .run();
    ed.chain().focus().insertContentAt(pos, content).run();
  }, []);

  function openNewImageModal() {
    editingImageRef.current = null;
    setEditingImageData(null);
    setImageModalOpen(true);
  }

  function handleImageModalSave(data: RichImageModalData) {
    if (!editor) return;
    const caption = data.caption.trim();
    const content = caption
      ? { type: "figure", attrs: { src: data.url, alt: data.alt || "" }, content: [{ type: "text", text: caption }] }
      : { type: "image", attrs: { src: data.url, alt: data.alt || "" } };

    if (editingImageRef.current) {
      replaceNodeAt(editor, editingImageRef.current.pos, content);
    } else {
      editor.chain().focus().insertContent(content).run();
    }
    setImageModalOpen(false);
    setEditingImageData(null);
    editingImageRef.current = null;
  }

  function handleImageDelete() {
    if (!editor || !editingImageRef.current) return;
    const pos = editingImageRef.current.pos;
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        const node = tr.doc.nodeAt(pos);
        if (!node) return false;
        tr.delete(pos, pos + node.nodeSize);
        return true;
      })
      .run();
    setImageModalOpen(false);
    setEditingImageData(null);
    editingImageRef.current = null;
  }

  function handleLinkInsert({ url, nofollow, newTab }: RichLinkModalResult) {
    if (!editor) return;
    const normalized = normalizeUrl(url);
    const attrs: { href: string; target: string | null; rel: string | null } = { href: normalized, target: null, rel: null };
    if (newTab) {
      attrs.target = "_blank";
      attrs.rel = nofollow ? "nofollow noopener noreferrer" : "noopener noreferrer";
    } else if (nofollow) {
      attrs.rel = "nofollow";
    }

    const { from, to } = editor.state.selection;
    if (from === to) {
      editor.chain().focus().insertContent({ type: "text", text: normalized, marks: [{ type: "link", attrs }] }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink(attrs).run();
    }
    setLinkModalOpen(false);
  }

  function getFormatLabel(): string {
    if (!editor) return "Paragraph";
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor.isActive("bulletList")) return "Bullet list";
    if (editor.isActive("orderedList")) return "Numbered list";
    if (editor.isActive("blockquote")) return "Quote";
    if (editor.isActive("table")) return "Table";
    return "Paragraph";
  }

  if (!editor) {
    return (
      <div className="rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-3 text-sm text-ink-faint" style={{ minHeight }}>
        Loading editor…
      </div>
    );
  }

  const inTable = editor.isActive("table");

  return (
    <div className="rounded-xl border border-neutral-300 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
      <div
        className="sticky z-20 flex flex-wrap items-center justify-between gap-1 rounded-t-xl border-b border-stone bg-cream-deep p-1.5"
        style={{ top: stickyOffset || 0 }}
      >
        <div className="flex flex-wrap items-center gap-0.5">
          {allowedHeadings.includes(1) && (
            <ToolbarButton label="H1" title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
          )}
          {allowedHeadings.includes(2) && (
            <ToolbarButton label="H2" title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
          )}
          {allowedHeadings.includes(3) && (
            <ToolbarButton label="H3" title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
          )}
          <ToolbarButton label="P" title="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} />
          <span className="mx-1 h-4 w-px bg-stone" />
          <ToolbarButton label={<span className="font-bold">B</span>} title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
          <ToolbarButton label={<span className="italic">I</span>} title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
          <ToolbarButton label={<span className="underline">U</span>} title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
          <span className="mx-1 h-4 w-px bg-stone" />
          <ToolbarButton label="• List" title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <ToolbarButton label="1. List" title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <ToolbarButton label="“ ”" title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <span className="mx-1 h-4 w-px bg-stone" />
          <ToolbarButton label="⟵" title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} />
          <ToolbarButton label="↔" title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} />
          <ToolbarButton label="⟶" title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} />
          <span className="mx-1 h-4 w-px bg-stone" />
          <ToolbarButton label="Link" title="Insert link" onClick={() => setLinkModalOpen(true)} />
          <ToolbarButton label="Image" title="Insert image" onClick={openNewImageModal} />
          <ToolbarButton label="Table" title="Insert 3×3 table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
          {inTable && (
            <>
              <span className="mx-1 h-4 w-px bg-stone" />
              <ToolbarButton label="+Row" title="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()} />
              <ToolbarButton label="+Col" title="Add column after" onClick={() => editor.chain().focus().addColumnAfter().run()} />
              <ToolbarButton label="-Row" title="Delete current row" onClick={() => editor.chain().focus().deleteRow().run()} />
              <ToolbarButton label="-Col" title="Delete current column" onClick={() => editor.chain().focus().deleteColumn().run()} />
              <ToolbarButton label="Del Table" title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()} />
            </>
          )}
          <span className="mx-1 h-4 w-px bg-stone" />
          <ToolbarButton label="Clear" title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} />
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-ink-faint">
          <span className="h-2 w-2 rounded-full bg-cypress" />
          <span>Current:</span>
          <span className="font-semibold text-ink">{getFormatLabel()}</span>
        </div>
      </div>

      <EditorContent editor={editor} style={{ minHeight }} />

      {imageModalOpen && (
        <RichImageModal
          initialValues={editingImageData || undefined}
          isEditing={!!editingImageData}
          onInsert={handleImageModalSave}
          onDelete={editingImageData ? handleImageDelete : undefined}
          onClose={() => {
            setImageModalOpen(false);
            setEditingImageData(null);
            editingImageRef.current = null;
          }}
        />
      )}
      {linkModalOpen && <RichLinkModal onInsert={handleLinkInsert} onClose={() => setLinkModalOpen(false)} />}
    </div>
  );
}
