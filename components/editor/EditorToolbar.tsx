"use client";

import type { Editor } from "@tiptap/react";

type ToolbarButtonProps = {
  label: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({ label, title, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={
        active
          ? "rounded-md bg-zinc-900 px-2.5 py-1 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
          : "rounded-md px-2.5 py-1 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      }
    >
      {label}
    </button>
  );
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const disabled = !editor;

  return (
    <div
      className="sticky top-14 z-10 flex flex-wrap items-center gap-1 border-y border-zinc-200 bg-zinc-50/95 px-3 py-2 sm:top-16 sm:px-4"
      role="toolbar"
      aria-label="Text formatting"
    >
      <ToolbarButton
        label="Bold"
        title="Bold"
        active={editor?.isActive("bold")}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="Italic"
        title="Italic"
        active={editor?.isActive("italic")}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="Underline"
        title="Underline"
        active={editor?.isActive("underline")}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      />
      <span className="mx-1 hidden h-5 w-px bg-zinc-200 sm:block" aria-hidden />
      <ToolbarButton
        label="H1"
        title="Heading 1"
        active={editor?.isActive("heading", { level: 1 })}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolbarButton
        label="H2"
        title="Heading 2"
        active={editor?.isActive("heading", { level: 2 })}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <span className="mx-1 hidden h-5 w-px bg-zinc-200 sm:block" aria-hidden />
      <ToolbarButton
        label="Bullet list"
        title="Bullet list"
        active={editor?.isActive("bulletList")}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="Numbered list"
        title="Numbered list"
        active={editor?.isActive("orderedList")}
        disabled={disabled}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      />
    </div>
  );
}
