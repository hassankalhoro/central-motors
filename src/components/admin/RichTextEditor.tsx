"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function Btn({ editor, active, onClick, label }: { editor: Editor; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2.5 py-1 text-sm font-semibold transition ${active ? "bg-suzuki-dark text-white" : "text-ink-soft hover:bg-paper"}`}
    >
      {label}
    </button>
  );
}

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] rounded-b-[10px] border border-t-0 border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink outline-none [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-2 [&_h3]:text-lg [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_a]:text-suzuki-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-line [&_blockquote]:pl-3 [&_blockquote]:text-ink-muted",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-[10px] border border-line bg-paper px-2 py-1.5">
        <Btn editor={editor} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="B" />
        <Btn editor={editor} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="I" />
        <span className="mx-1 h-5 w-px bg-line" />
        <Btn editor={editor} active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" />
        <Btn editor={editor} active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" />
        <span className="mx-1 h-5 w-px bg-line" />
        <Btn editor={editor} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="• List" />
        <Btn editor={editor} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="1. List" />
        <Btn editor={editor} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="❝" />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
