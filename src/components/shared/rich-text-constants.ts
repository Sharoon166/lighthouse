import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

export function createTiptapExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3, 4, 5] },
      // Disable link and underline from StarterKit since we add them separately with custom config
      link: false,
      underline: false,
    }),
    Link.configure({ openOnClick: false, autolink: true }),
    Image,
    Placeholder.configure({ placeholder }),
  ];
}

export const tiptapContentClassName =
  "blog-prose [&_.tiptap]:min-h-40 [&_.tiptap]:px-4 [&_.tiptap]:py-3.5 [&_.tiptap]:text-sm [&_.tiptap]:text-foreground [&_.tiptap]:outline-none [&_.tiptap]:focus:outline-none [&_.tiptap>p.is-editor-empty:first-child::before]:text-muted-foreground [&_.tiptap>p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap>p.is-editor-empty:first-child::before]:float-left [&_.tiptap>p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-border [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:text-muted-foreground [&_.tiptap_h2]:font-heading [&_.tiptap_h2]:text-2xl [&_.tiptap_h3]:font-heading [&_.tiptap_h3]:text-xl [&_.tiptap_h4]:font-heading [&_.tiptap_h4]:text-lg [&_.tiptap_h5]:font-heading [&_.tiptap_h5]:text-base [&_.tiptap_pre]:overflow-x-auto [&_.tiptap_pre]:rounded-md [&_.tiptap_pre]:bg-muted [&_.tiptap_pre]:p-3 [&_.tiptap_pre]:font-mono [&_.tiptap_pre]:text-xs [&_.tiptap_pre_code]:font-mono [&_.tiptap_img]:rounded-lg [&_.tiptap_img]:border [&_.tiptap_img]:border-border [&_.tiptap_a]:text-accent [&_.tiptap_a]:underline [&_.tiptap hr]:my-4 [&_.tiptap_hr]:border-border";

/**
 * Adds sequential IDs (heading-1, heading-2, ...) to <h2>, <h3>, <h4>, <h5> tags
 * so the table of contents anchor links work correctly.
 */
export function addHeadingIdsToHtml(html: string): string {
  let counter = 0;
  return html.replace(/<h([2-5])\b/g, (_match, level) => {
    counter++;
    return `<h${level} id="heading-${counter}"`;
  });
}
