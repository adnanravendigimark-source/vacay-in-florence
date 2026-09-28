"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
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
 * Tiptap (ProseMirror) gives real, battle-tested HTML paste handling —
 * headings, bold/italic/underline, links, lists, tables, images, and
 * blockquotes pasted from Word, Google Docs, or any website come
 * through correctly, without hand-rolled paste-cleaning heuristics.
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
        className="sticky z-10 flex flex-wrap items-center justify-between gap-1 rounded-t-xl border-b border-stone bg-cream-deep p-1.5"
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
