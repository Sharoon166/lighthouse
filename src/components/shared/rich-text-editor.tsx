// "use client";

// import {
//   BoldIcon,
//   CodeIcon,
//   ImageUploadIcon,
//   LeftToRightListBulletIcon,
//   LeftToRightListNumberIcon,
//   Link01Icon,
//   QuoteUpIcon,
//   RedoIcon,
//   SeparatorHorizontalIcon,
//   TextClearIcon,
//   TextItalicIcon,
//   TextUnderlineIcon,
//   UndoIcon,
// } from "@hugeicons/core-free-icons";
// import { HugeiconsIcon } from "@hugeicons/react";
// import { EditorContent, type JSONContent, useEditor, useEditorState } from "@tiptap/react";
// import { useCallback, useEffect, useRef, useState } from "react";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { uploadInlineImage } from "@/features/blog/actions";
// import { cn } from "@/lib/utils";
// import {
//   createTiptapExtensions,
//   tiptapContentClassName,
// } from "./rich-text-constants";

// interface RichTextEditorProps {
//   value?: JSONContent | null;
//   onChange?: (value: JSONContent) => void;
//   placeholder?: string;
//   className?: string;
//   /** Extra classes applied to the scrollable content area. */
//   editorClassName?: string;
//   /** Focus the editor when it mounts. */
//   autoFocus?: boolean;
// }

// function ToolbarButton({
//   active,
//   onClick,
//   label,
//   icon,
//   text,
//   disabled,
// }: {
//   active?: boolean;
//   onClick: () => void;
//   label: string;
//   icon?: Parameters<typeof HugeiconsIcon>[0]["icon"];
//   text?: string;
//   disabled?: boolean;
// }) {
//   return (
//     <button
//       type="button"
//       aria-label={label}
//       title={label}
//       disabled={disabled}
//       onClick={onClick}
//       className={cn(
//         "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
//         active && "bg-muted text-foreground",
//       )}
//     >
//       {icon ? (
//         <HugeiconsIcon icon={icon} size={16} />
//       ) : (
//         <span className="text-xs font-semibold">{text}</span>
//       )}
//     </button>
//   );
// }

// export function RichTextEditor({
//   value,
//   onChange,
//   placeholder,
//   className,
//   editorClassName,
//   autoFocus,
// }: RichTextEditorProps) {
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const editor = useEditor({
//     extensions: createTiptapExtensions(placeholder ?? "Write something…"),
//     immediatelyRender: false,
//     content: value ?? "",
//     onUpdate({ editor: current }) {
//       onChange?.(current.getJSON());
//     },
//     editorProps: {
//       handleDrop: (view, event, slice, moved) => {
//         if (!event.dataTransfer || moved) return false;

//         const files = Array.from(event.dataTransfer.files);
//         const imageFile = files.find((file) => file.type.startsWith("image/"));

//         if (imageFile) {
//           event.preventDefault();
//           const { schema } = view.state;
//           const coordinates = view.posAtCoords({
//             left: event.clientX,
//             top: event.clientY,
//           });

//           if (!coordinates) return true;

//           handleImageUpload(imageFile, coordinates.pos);
//           return true;
//         }

//         return false;
//       },
//       handlePaste: (view, event) => {
//         const items = event.clipboardData?.items;
//         if (!items) return false;

//         const imageItem = Array.from(items).find((item) =>
//           item.type.startsWith("image/"),
//         );

//         if (imageItem) {
//           event.preventDefault();
//           const file = imageItem.getAsFile();
//           if (file) {
//             const pos = view.state.selection.from;
//             handleImageUpload(file, pos);
//           }
//           return true;
//         }

//         return false;
//       },
//     },
//   });

//   const autoFocusRef = useRef(autoFocus);

//   useEffect(() => {
//     if (!editor || !autoFocusRef.current) return;
//     autoFocusRef.current = false;
//     editor.commands.focus("end");
//   }, [editor]);

//   useEffect(() => {
//     if (!editor || !value) return;
//     if (JSON.stringify(value) !== JSON.stringify(editor.getJSON())) {
//       editor.commands.setContent(value);
//     }
//   }, [editor, value]);

//   const handleImageUpload = useCallback(
//     async (file: File, position?: number) => {
//       if (!editor) return;

//       setIsUploading(true);

//       try {
//         // Optimize image before uploading
//         const { optimizeImage, IMAGE_OPTIMIZATION_PRESETS } = await import(
//           "@/lib/image-optimizer"
//         );
//         const optimizedBlob = await optimizeImage(
//           file,
//           IMAGE_OPTIMIZATION_PRESETS.blogInline,
//         );

//         // Convert back to File for upload
//         const optimizedFile = new File([optimizedBlob], file.name, {
//           type: optimizedBlob.type,
//         });

//         const formData = new FormData();
//         formData.append("file", optimizedFile);

//         const result = await uploadInlineImage(formData);

//         if (result.ok) {
//           if (position !== undefined) {
//             editor
//               .chain()
//               .focus()
//               .insertContentAt(position, {
//                 type: "image",
//                 attrs: { src: result.url },
//               })
//               .run();
//           } else {
//             editor.chain().focus().setImage({ src: result.url }).run();
//           }
//         } else {
//           alert(result.message || "Failed to upload image");
//         }
//       } catch (error) {
//         console.error("Image upload error:", error);
//         const message =
//           error instanceof Error ? error.message : "Failed to upload image";
//         alert(`${message}. Please try again.`);
//       } finally {
//         setIsUploading(false);
//       }
//     },
//     [editor],
//   );

//   if (!editor) return null;

//   const toggleLink = () => {
//     const previousUrl = editor.getAttributes("link").href as string | undefined;
//     const url = window.prompt("Link URL", previousUrl ?? "https://");
//     if (url === null) return;
//     if (url === "") {
//       editor.chain().focus().extendMarkRange("link").unsetLink().run();
//       return;
//     }
//     editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
//   };

//   const addImage = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file && file.type.startsWith("image/")) {
//       handleImageUpload(file);
//     }
//     // Reset input so same file can be selected again
//     event.target.value = "";
//   };

//   const setImageAlignment = (align: "left" | "center" | "right") => {
//     editor
//       .chain()
//       .focus()
//       .updateAttributes("image", { align })
//       .run();
//   };

//   return (
//     <div
//       className={cn(
//         "relative overflow-hidden rounded-lg border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
//         isUploading && "pointer-events-none opacity-60",
//         className,
//       )}
//     >
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/*"
//         className="hidden"
//         onChange={handleFileSelect}
//       />
//       <div className="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
//         <ToolbarButton
//           label="Heading 2"
//           text="H2"
//           active={editor.isActive("heading", { level: 2 })}
//           onClick={() =>
//             editor.chain().focus().toggleHeading({ level: 2 }).run()
//           }
//         />
//         <ToolbarButton
//           label="Heading 3"
//           text="H3"
//           active={editor.isActive("heading", { level: 3 })}
//           onClick={() =>
//             editor.chain().focus().toggleHeading({ level: 3 }).run()
//           }
//         />
//         <ToolbarButton
//           label="Heading 4"
//           text="H4"
//           active={editor.isActive("heading", { level: 4 })}
//           onClick={() =>
//             editor.chain().focus().toggleHeading({ level: 4 }).run()
//           }
//         />
//         <ToolbarButton
//           label="Heading 5"
//           text="H5"
//           active={editor.isActive("heading", { level: 5 })}
//           onClick={() =>
//             editor.chain().focus().toggleHeading({ level: 5 }).run()
//           }
//         />
//         <span className="mx-1 h-5 w-px bg-border" />
//         <ToolbarButton
//           label="Bold"
//           icon={BoldIcon}
//           active={editor.isActive("bold")}
//           onClick={() => editor.chain().focus().toggleBold().run()}
//         />
//         <ToolbarButton
//           label="Italic"
//           icon={TextItalicIcon}
//           active={editor.isActive("italic")}
//           onClick={() => editor.chain().focus().toggleItalic().run()}
//         />
//         <ToolbarButton
//           label="Underline"
//           icon={TextUnderlineIcon}
//           active={editor.isActive("underline")}
//           onClick={() => editor.chain().focus().toggleUnderline().run()}
//         />
//         <ToolbarButton
//           label="Link"
//           icon={Link01Icon}
//           active={editor.isActive("link")}
//           onClick={toggleLink}
//         />
//         <span className="mx-1 h-5 w-px bg-border" />
//         <ToolbarButton
//           label="Bullet list"
//           icon={LeftToRightListBulletIcon}
//           active={editor.isActive("bulletList")}
//           onClick={() => editor.chain().focus().toggleBulletList().run()}
//         />
//         <ToolbarButton
//           label="Numbered list"
//           icon={LeftToRightListNumberIcon}
//           active={editor.isActive("orderedList")}
//           onClick={() => editor.chain().focus().toggleOrderedList().run()}
//         />
//         <ToolbarButton
//           label="Blockquote"
//           icon={QuoteUpIcon}
//           active={editor.isActive("blockquote")}
//           onClick={() => editor.chain().focus().toggleBlockquote().run()}
//         />
//         <ToolbarButton
//           label="Code"
//           icon={CodeIcon}
//           active={editor.isActive("codeBlock")}
//           onClick={() => editor.chain().focus().toggleCodeBlock().run()}
//         />
//         <ToolbarButton
//           label="Upload Image"
//           icon={ImageUploadIcon}
//           onClick={addImage}
//           disabled={isUploading}
//         />
//         <ToolbarButton
//           label="Horizontal rule"
//           icon={SeparatorHorizontalIcon}
//           onClick={() => editor.chain().focus().setHorizontalRule().run()}
//         />
//         <span className="mx-1 h-5 w-px bg-border" />
//         <ToolbarButton
//           label="Clear formatting"
//           icon={TextClearIcon}
//           onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
//         />
//         <ToolbarButton
//           label="Undo"
//           icon={UndoIcon}
//           disabled={!editor.can().chain().focus().undo().run()}
//           onClick={() => editor.chain().focus().undo().run()}
//         />
//         <ToolbarButton
//           label="Redo"
//           icon={RedoIcon}
//           disabled={!editor.can().chain().focus().redo().run()}
//           onClick={() => editor.chain().focus().redo().run()}
//         />

//           {editor.isActive("img") && (<>
//             <span className="mx-1 h-5 w-px bg-border" />

//             <ToolbarButton
//               label="Align image left"
//               text="L"
//               active={editor.isActive("image", { align: "left" })}
//               onClick={() => setImageAlignment("left")}
//             />

//             <ToolbarButton
//               label="Center image"
//               text="C"
//               active={editor.isActive("image", { align: "center" })}
//               onClick={() => setImageAlignment("center")}
//             />

//             <ToolbarButton
//               label="Align image right"
//               text="R"
//               active={editor.isActive("image", { align: "right" })}
//               onClick={() => setImageAlignment("right")}
//             />
//           </>)}

//       </div>
//       <ScrollArea className={cn("max-h-[32rem] min-h-40", editorClassName)}>
//         <EditorContent editor={editor} className={tiptapContentClassName} />
//       </ScrollArea>
//       {isUploading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-background/50">
//           <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm shadow-lg">
//             <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
//             <span>Uploading image...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import {
  BoldIcon,
  CaptionsIcon,
  CheckIcon,
  CodeIcon,
  ImageUploadIcon,
  InformationCircleIcon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  QuoteUpIcon,
  RedoIcon,
  SeparatorHorizontalIcon,
  TextClearIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  UndoIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  EditorContent,
  type JSONContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

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
  editorClassName?: string;
  autoFocus?: boolean;
}

type ImageAlignment = "left" | "center" | "right";

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
        "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-40",
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

interface SelectedFigure {
  pos: number;
  imagePos: number;
  alt: string;
  width: number | null;
  height: number | null;
  align: ImageAlignment;
  caption: string;
}

function ImageToolbar({
  editor,
  figure,
  position,
}: {
  editor: NonNullable<ReturnType<typeof useEditor>>;
  figure: SelectedFigure | null;
  position: {
    top: number;
    left: number;
    width: number;
    height: number;
    wrapperWidth?: number;
    wrapperHeight?: number;
  } | null;
}) {
  const [altText, setAltText] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [clampedLeft, setClampedLeft] = useState(0);
  const [clampedTop, setClampedTop] = useState(0);

  useLayoutEffect(() => {
    if (!toolbarRef.current || !position) return;

    const toolbarWidth = toolbarRef.current.offsetWidth;
    const toolbarHeight = toolbarRef.current.offsetHeight || 38;
    const padding = 8;
    const minTop = 44; // below the top editor toolbar

    // Center toolbar horizontally over the figure within wrapper bounds
    const idealLeft = position.left + position.width / 2 - toolbarWidth / 2;
    const maxLeft = (position.wrapperWidth ?? 0) - toolbarWidth - padding;
    setClampedLeft(
      Math.min(Math.max(idealLeft, padding), Math.max(padding, maxLeft)),
    );

    // Place toolbar above the figure if space allows, otherwise place inside/below figure top
    let targetTop = position.top - toolbarHeight - 6;
    if (targetTop < minTop) {
      targetTop = Math.max(minTop + 6, position.top + 8);
    }
    const maxTop = (position.wrapperHeight ?? 500) - toolbarHeight - padding;
    setClampedTop(Math.min(targetTop, Math.max(minTop + 6, maxTop)));
  }, [position]);

  useEffect(() => {
    setAltText(figure?.alt ?? "");
    setWidth(figure?.width != null ? String(figure.width) : "");
    setHeight(figure?.height != null ? String(figure.height) : "");
  }, [figure?.pos, figure?.alt, figure?.width, figure?.height]);

  if (
    !figure ||
    !position ||
    position.top + position.height < 40 ||
    (position.wrapperHeight && position.top > position.wrapperHeight)
  ) {
    return null;
  }

  const dismiss = () => {
    const figureNode = editor.state.doc.nodeAt(figure.pos);
    const afterPos = figure.pos + (figureNode?.nodeSize ?? 1);
    editor.chain().focus().setTextSelection(afterPos).run();
  };

  const handleSaveAndDismiss = () => {
    const nextAlt = altText.trim();
    const requestedWidth = width.trim() === "" ? null : Number(width);
    const requestedHeight = height.trim() === "" ? null : Number(height);

    const validWidth =
      requestedWidth !== null &&
      Number.isFinite(requestedWidth) &&
      requestedWidth > 0
        ? requestedWidth
        : null;
    const validHeight =
      requestedHeight !== null &&
      Number.isFinite(requestedHeight) &&
      requestedHeight > 0
        ? requestedHeight
        : null;

    let nextWidth = validWidth;
    let nextHeight = validHeight;

    const imageElement = editor.view.nodeDOM(figure.imagePos);
    if (imageElement instanceof HTMLImageElement) {
      const naturalWidth = imageElement.naturalWidth;
      const naturalHeight = imageElement.naturalHeight;

      if (naturalWidth && naturalHeight) {
        if (nextWidth !== null && nextHeight === null) {
          nextHeight = Math.round(nextWidth * (naturalHeight / naturalWidth));
        } else if (nextHeight !== null && nextWidth === null) {
          nextWidth = Math.round(nextHeight * (naturalWidth / naturalHeight));
        }
      }
    }

    editor
      .chain()
      .setNodeSelection(figure.imagePos)
      .updateAttributes("image", {
        alt: nextAlt,
        width: nextWidth,
        height: nextHeight,
      })
      .setNodeSelection(figure.pos)
      .updateAttributes("figure", {
        align: "center",
      })
      .run();

    dismiss();
  };

  const focusCaption = () => {
    const figureNode = editor.state.doc.nodeAt(figure.pos);
    if (!figureNode || figureNode.type.name !== "figure") {
      return;
    }

    const imageNode = figureNode.child(0);
    const captionNode = figureNode.child(1);
    const captionStart = figure.pos + 1 + imageNode.nodeSize + 1;
    const captionEnd = captionStart + captionNode.content.size;

    editor.chain().focus().setTextSelection(captionEnd).run();
  };

  return (
    <div
      ref={toolbarRef}
      className="pointer-events-auto absolute z-50 flex items-center gap-1 rounded-lg border border-border bg-popover p-1.5 shadow-lg"
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        top: clampedTop,
        left: clampedLeft,
      }}
    >
      {/* Width */}
      <label className="flex h-8 items-center gap-1.5 px-1">
        <span className="text-[11px] font-medium text-muted-foreground">W</span>
        <input
          type="number"
          min="1"
          value={width}
          onChange={(event) => setWidth(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSaveAndDismiss();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              dismiss();
            }
          }}
          placeholder="Auto"
          aria-label="Image width"
          className="h-7 w-16 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
        />
        <span className="text-[10px] text-muted-foreground">px</span>
      </label>

      {/* Height */}
      <label className="flex h-8 items-center gap-1.5 px-1">
        <span className="text-[11px] font-medium text-muted-foreground">H</span>
        <input
          type="number"
          min="1"
          value={height}
          onChange={(event) => setHeight(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSaveAndDismiss();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              dismiss();
            }
          }}
          placeholder="Auto"
          aria-label="Image height"
          className="h-7 w-16 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
        />
        <span className="text-[10px] text-muted-foreground">px</span>
      </label>

      <span className="mx-1 h-6 w-px bg-border" />

      {/* Caption */}
      <ToolbarButton
        label="Edit caption"
        icon={CaptionsIcon}
        active={Boolean(figure.caption)}
        onClick={focusCaption}
      />

      <span className="mx-1 h-6 w-px bg-border" />

      {/* Alt text */}
      <label className="flex h-8 items-center gap-2 px-2">
        <span className="font-mono uppercase">ALT</span>
        <input
          type="text"
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSaveAndDismiss();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              dismiss();
            }
          }}
          placeholder="Alt text..."
          aria-label="Image alt text"
          className="h-7 w-36 border-0 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <span className="mx-1 h-6 w-px bg-border" />

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSaveAndDismiss}
        className="flex h-7 items-center gap-1 rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        title="Save attributes and dismiss"
      >
        <HugeiconsIcon icon={CheckIcon} size={14} />
        <span>Save</span>
      </button>
    </div>
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

  const editorWrapperRef = useRef<HTMLDivElement>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: createTiptapExtensions(placeholder ?? "Write something…"),

    immediatelyRender: false,

    content: value ?? "",

    onUpdate({ editor: current }) {
      onChange?.(current.getJSON());
    },

    editorProps: {
      handleClickOn: (view, pos, node, nodePos, event) => {
        if (node.type.name !== "figure") {
          return false;
        }

        if (editor) editor.chain().focus().setNodeSelection(nodePos).run();

        return true;
      },

      handleDrop: (view, event, slice, moved) => {
        if (!event.dataTransfer || moved) {
          return false;
        }

        const files = Array.from(event.dataTransfer.files);

        const imageFile = files.find((file) => file.type.startsWith("image/"));

        if (!imageFile) {
          return false;
        }

        event.preventDefault();

        const coordinates = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        if (!coordinates) {
          return true;
        }

        handleImageUpload(imageFile, coordinates.pos);

        return true;
      },

      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;

        if (!items) {
          return false;
        }

        const imageItem = Array.from(items).find((item) =>
          item.type.startsWith("image/"),
        );

        if (!imageItem) {
          return false;
        }

        event.preventDefault();

        const file = imageItem.getAsFile();

        if (file) {
          const pos = view.state.selection.from;

          handleImageUpload(file, pos);
        }

        return true;
      },
    },
  });

  /*
   * Detect the currently selected figure.
   *
   * We intentionally do not import NodeSelection
   * from @tiptap/pm/state.
   */
  const selectedFigure = useEditorState({
    editor,

    selector: ({ editor }) => {
      if (!editor) {
        return null;
      }

      const { selection } = editor.state;

      /*
       * A selected figure is a node
       * selection spanning exactly one
       * figure node.
       */
      const node = selection.$from.nodeAfter;

      if (!node || node.type.name !== "figure") {
        return null;
      }

      if (selection.to !== selection.from + node.nodeSize) {
        return null;
      }

      const imageNode = node.child(0);

      const captionNode = node.child(1);

      return {
        pos: selection.from,

        /*
         * Figure position + 1 points
         * to the image node.
         */
        imagePos: selection.from + 1,

        alt: (imageNode.attrs.alt as string) ?? "",

        width:
          typeof imageNode.attrs.width === "number"
            ? imageNode.attrs.width
            : null,

        height:
          typeof imageNode.attrs.height === "number"
            ? imageNode.attrs.height
            : null,

        align: (node.attrs.align as ImageAlignment) ?? "center",

        caption: captionNode.textContent ?? "",
      };
    },
  });

  const [imageToolbarPosition, setImageToolbarPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    wrapperWidth?: number;
    wrapperHeight?: number;
  } | null>(null);

  /*
   * Calculate the toolbar position from
   * the selected figure's actual DOM element.
   */
  const updateImageToolbarPosition = useCallback(() => {
    if (!editor || !selectedFigure || !editorWrapperRef.current) {
      setImageToolbarPosition(null);

      return;
    }

    const figureElement = editor.view.nodeDOM(selectedFigure.pos);

    if (!(figureElement instanceof HTMLElement)) {
      setImageToolbarPosition(null);

      return;
    }

    const wrapperRect = editorWrapperRef.current.getBoundingClientRect();

    const figureRect = figureElement.getBoundingClientRect();

    setImageToolbarPosition({
      top: figureRect.top - wrapperRect.top,

      left: figureRect.left - wrapperRect.left,

      width: figureRect.width,
      height: figureRect.height,
      wrapperWidth: wrapperRect.width,
      wrapperHeight: wrapperRect.height,
    });
  }, [editor, selectedFigure]);

  useLayoutEffect(() => {
    updateImageToolbarPosition();
  }, [updateImageToolbarPosition]);

  /*
   * Keep the toolbar positioned correctly
   * while scrolling/resizing.
   */
  useEffect(() => {
    if (!selectedFigure) {
      return;
    }

    const handleUpdate = () => {
      requestAnimationFrame(updateImageToolbarPosition);
    };

    window.addEventListener("resize", handleUpdate);

    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);

      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [selectedFigure, updateImageToolbarPosition]);

  const autoFocusRef = useRef(autoFocus);

  useEffect(() => {
    if (!editor || !autoFocusRef.current) {
      return;
    }

    autoFocusRef.current = false;

    editor.commands.focus("end");
  }, [editor]);

  /*
   * Keep editor content synchronized
   * with external value.
   */
  useEffect(() => {
    if (!editor || !value) {
      return;
    }

    if (JSON.stringify(value) !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const handleImageUpload = useCallback(
    async (file: File, position?: number) => {
      if (!editor) {
        return;
      }

      setIsUploading(true);

      try {
        const { optimizeImage, IMAGE_OPTIMIZATION_PRESETS } = await import(
          "@/lib/image-optimizer"
        );

        const optimizedBlob = await optimizeImage(
          file,
          IMAGE_OPTIMIZATION_PRESETS.blogInline,
        );

        const optimizedFile = new File([optimizedBlob], file.name, {
          type: optimizedBlob.type,
        });

        const formData = new FormData();

        formData.append("file", optimizedFile);

        const result = await uploadInlineImage(formData);

        if (!result.ok) {
          alert(result.message || "Failed to upload image");

          return;
        }

        /*
         * New images are inserted as:
         *
         * figure
         * ├── image
         * └── figcaption
         */
        const figureContent = {
          type: "figure",

          attrs: {
            align: "center",
          },

          content: [
            {
              type: "image",

              attrs: {
                src: result.url,
                alt: "",
              },
            },

            {
              type: "figcaption",

              content: [],
            },
          ],
        };

        if (position !== undefined) {
          editor.chain().focus().insertContentAt(position, figureContent).run();
        } else {
          editor.chain().focus().insertContent(figureContent).run();
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

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;

    const url = window.prompt("Link URL", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
      })
      .run();
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }

    event.target.value = "";
  };

  return (
    <div
      ref={editorWrapperRef}
      className={cn(
        "relative overflow-hidden rounded-lg border border-input bg-background shadow-xs transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
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

      {/* Main toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
        <ToolbarButton
          label="Heading 2"
          text="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
        />

        <ToolbarButton
          label="Heading 3"
          text="H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 3,
              })
              .run()
          }
        />

        <ToolbarButton
          label="Heading 4"
          text="H4"
          active={editor.isActive("heading", { level: 4 })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 4,
              })
              .run()
          }
        />

        <ToolbarButton
          label="Heading 5"
          text="H5"
          active={editor.isActive("heading", { level: 5 })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 5,
              })
              .run()
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
          label="Clear formatting"
          icon={TextClearIcon}
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        />

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

      {/* Editor */}
      <ScrollArea
        ref={scrollAreaRef}
        className={cn("max-h-128 min-h-40", editorClassName)}
      >
        <EditorContent editor={editor} className={tiptapContentClassName} />
      </ScrollArea>

      {/* Contextual figure toolbar */}
      <ImageToolbar
        editor={editor}
        figure={selectedFigure}
        position={imageToolbarPosition}
      />

      {isUploading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50">
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm shadow-lg">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />

            <span>Uploading image...</span>
          </div>
        </div>
      )}
    </div>
  );
}
