"use client";

import {
  BoldIcon,
  CodeIcon,
  ImageUploadIcon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  QuoteUpIcon,
  RedoIcon,
  SeparatorHorizontalIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  UndoIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { uploadInlineImage } from "@/features/blog/actions";
import { cn } from "@/lib/utils";
import {
  createTiptapExtensions,
  tiptapContentClassName,
} from "./rich-text-constants";

interface RichTextEditorProps {
  value?: JSONContent | null;
  onChange?: (value: JSONContent) => void;
  placeholder?: string;
  className?: string;
  /** Extra classes applied to the scrollable content area. */
  editorClassName?: string;
  /** Focus the editor when it mounts. */
  autoFocus?: boolean;
}

function ToolbarButton({
  active,
  onClick,
  label,
  icon,
  text,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  icon?: Parameters<typeof HugeiconsIcon>[0]["icon"];
  text?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        active && "bg-muted text-foreground",
      )}
    >
      {icon ? (
        <HugeiconsIcon icon={icon} size={16} />
      ) : (
        <span className="text-xs font-semibold">{text}</span>
      )}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  editorClassName,
  autoFocus,
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: createTiptapExtensions(placeholder ?? "Write something…"),
    immediatelyRender: false,
    content: value ?? "",
    onUpdate({ editor: current }) {
      onChange?.(current.getJSON());
    },
    editorProps: {
      handleDrop: (view, event, slice, moved) => {
        if (!event.dataTransfer || moved) return false;

        const files = Array.from(event.dataTransfer.files);
        const imageFile = files.find((file) => file.type.startsWith("image/"));

        if (imageFile) {
          event.preventDefault();
          const { schema } = view.state;
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (!coordinates) return true;

          handleImageUpload(imageFile, coordinates.pos);
          return true;
        }

        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        const imageItem = Array.from(items).find((item) =>
          item.type.startsWith("image/"),
        );

        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            const pos = view.state.selection.from;
            handleImageUpload(file, pos);
          }
          return true;
        }

        return false;
      },
    },
  });

  const autoFocusRef = useRef(autoFocus);

  useEffect(() => {
    if (!editor || !autoFocusRef.current) return;
    autoFocusRef.current = false;
    editor.commands.focus("end");
  }, [editor]);

  useEffect(() => {
    if (!editor || !value) return;
    if (JSON.stringify(value) !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const handleImageUpload = useCallback(
    async (file: File, position?: number) => {
      if (!editor) return;

      setIsUploading(true);

      try {
        // Optimize image before uploading
        const { optimizeImage, IMAGE_OPTIMIZATION_PRESETS } = await import(
          "@/lib/image-optimizer"
        );
        const optimizedBlob = await optimizeImage(
          file,
          IMAGE_OPTIMIZATION_PRESETS.blogInline,
        );

        // Convert back to File for upload
        const optimizedFile = new File([optimizedBlob], file.name, {
          type: optimizedBlob.type,
        });

        const formData = new FormData();
        formData.append("file", optimizedFile);

        const result = await uploadInlineImage(formData);

        if (result.ok) {
          if (position !== undefined) {
            editor
              .chain()
              .focus()
              .insertContentAt(position, {
                type: "image",
                attrs: { src: result.url },
              })
              .run();
          } else {
            editor.chain().focus().setImage({ src: result.url }).run();
          }
        } else {
          alert(result.message || "Failed to upload image");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        const message =
          error instanceof Error ? error.message : "Failed to upload image";
        alert(`${message}. Please try again.`);
      } finally {
        setIsUploading(false);
      }
    },
    [editor],
  );

  if (!editor) return null;

  const toggleLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
    // Reset input so same file can be selected again
    event.target.value = "";
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        isUploading && "pointer-events-none opacity-60",
        className,
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <div className="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
        <ToolbarButton
          label="Heading 2"
          text="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          label="Heading 3"
          text="H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />
        <ToolbarButton
          label="Heading 4"
          text="H4"
          active={editor.isActive("heading", { level: 4 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
        />
        <ToolbarButton
          label="Heading 5"
          text="H5"
          active={editor.isActive("heading", { level: 5 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
        />
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          label="Bold"
          icon={BoldIcon}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          icon={TextItalicIcon}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Underline"
          icon={TextUnderlineIcon}
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="Link"
          icon={Link01Icon}
          active={editor.isActive("link")}
          onClick={toggleLink}
        />
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          label="Bullet list"
          icon={LeftToRightListBulletIcon}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numbered list"
          icon={LeftToRightListNumberIcon}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Blockquote"
          icon={QuoteUpIcon}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="Code"
          icon={CodeIcon}
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          label="Upload Image"
          icon={ImageUploadIcon}
          onClick={addImage}
          disabled={isUploading}
        />
        <ToolbarButton
          label="Horizontal rule"
          icon={SeparatorHorizontalIcon}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          label="Undo"
          icon={UndoIcon}
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Redo"
          icon={RedoIcon}
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>
      <ScrollArea className={cn("max-h-[32rem] min-h-40", editorClassName)}>
        <EditorContent editor={editor} className={tiptapContentClassName} />
      </ScrollArea>
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm shadow-lg">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Uploading image...</span>
          </div>
        </div>
      )}
    </div>
  );
}
