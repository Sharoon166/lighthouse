// import Image from "@tiptap/extension-image";
// import Link from "@tiptap/extension-link";
// import Placeholder from "@tiptap/extension-placeholder";
// import StarterKit from "@tiptap/starter-kit";

// const BlogImage = Image.extend({
//   selectable: true,

//   addAttributes() {
//     return {
//       ...this.parent?.(),

//       align: {
//         default: "center",

//         parseHTML: (element) =>
//           element.getAttribute("data-align") || "center",

//         renderHTML: (attributes) => ({
//           "data-align": attributes.align,
//         }),
//       },

//       alt: {
//         default: "",

//         parseHTML: (element) =>
//           element.getAttribute("alt") || "",

//         renderHTML: (attributes) => ({
//           alt: attributes.alt || "",
//         }),
//       },
//     };
//   },
// });

// export function createTiptapExtensions(placeholder: string) {
//   return [
//     StarterKit.configure({
//       heading: { levels: [2, 3, 4, 5] },
//       link: false,
//       underline: false,
//     }),

//     Link.configure({
//       openOnClick: false,
//       autolink: true,
//     }),

//     BlogImage,

//     Placeholder.configure({
//       placeholder,
//     }),
//   ];
// }
// export const tiptapContentClassName =
//   "blog-prose [&_.tiptap]:min-h-40 [&_.tiptap]:px-4 [&_.tiptap]:py-3.5 [&_.tiptap]:text-sm [&_.tiptap]:text-foreground [&_.tiptap]:outline-none [&_.tiptap]:focus:outline-none [&_.tiptap>p.is-editor-empty:first-child::before]:text-muted-foreground [&_.tiptap>p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap>p.is-editor-empty:first-child::before]:float-left [&_.tiptap>p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-border [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:text-muted-foreground [&_.tiptap_h2]:font-heading [&_.tiptap_h2]:text-2xl [&_.tiptap_h3]:font-heading [&_.tiptap_h3]:text-xl [&_.tiptap_h4]:font-heading [&_.tiptap_h4]:text-lg [&_.tiptap_h5]:font-heading [&_.tiptap_h5]:text-base [&_.tiptap_pre]:overflow-x-auto [&_.tiptap_pre]:rounded-md [&_.tiptap_pre]:bg-muted [&_.tiptap_pre]:p-3 [&_.tiptap_pre]:font-mono [&_.tiptap_pre]:text-xs [&_.tiptap_pre_code]:font-mono [&_.tiptap_img]:rounded-lg [&_.tiptap_img]:border [&_.tiptap_img]:border-border [&_.tiptap_img[data-align=left]]:mr-auto [&_.tiptap_img[data-align=left]]:ml-0 [&_.tiptap_img[data-align=center]]:mx-auto [&_.tiptap_img[data-align=right]]:ml-auto [&_.tiptap_img[data-align=right]]:mr-0 [&_.tiptap_img[data-align=left]]:block [&_.tiptap_img[data-align=center]]:block [&_.tiptap_img[data-align=right]]:block [&_.tiptap_a]:text-accent [&_.tiptap_a]:underline [&_.tiptap hr]:my-4 [&_.tiptap_hr]:border-border";

// /**
//  * Adds sequential IDs (heading-1, heading-2, ...) to <h2>, <h3>, <h4>, <h5> tags
//  * so the table of contents anchor links work correctly.
//  */
// export function addHeadingIdsToHtml(html: string): string {
//   let counter = 0;
//   return html.replace(/<h([2-5])\b/g, (_match, level) => {
//     counter++;
//     return `<h${level} id="heading-${counter}"`;
//   });
// }

import { mergeAttributes, Node } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { slugify } from "@/lib/utils";

/**
 * Image
 *
 * The image itself owns accessibility-related attributes such as alt text.
 * Alignment belongs to the parent figure.
 */
const BlogImage = Image.extend({
  selectable: true,

  addAttributes() {
    return {
      ...this.parent?.(),

      alt: {
        default: "",

        parseHTML: (element) => element.getAttribute("alt") || "",

        renderHTML: (attributes) => ({
          alt: attributes.alt || "",
        }),
      },

      width: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute("width");
          return value ? Number(value) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }

          return {
            width: attributes.width,
          };
        },
      },

      height: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute("height");
          return value ? Number(value) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }

          return {
            height: attributes.height,
          };
        },
      },
    };
  },
});

/**
 * Figure
 *
 * Produces:
 *
 * <figure data-align="center">
 *   <img ... />
 *   <figcaption>...</figcaption>
 * </figure>
 */
const Figure = Node.create({
  name: "figure",

  group: "block",

  content: "image figcaption",

  defining: true,

  isolating: true,

  selectable: true,

  addAttributes() {
    return {
      align: {
        default: "center",

        parseHTML: (element) => element.getAttribute("data-align") || "center",

        renderHTML: (attributes) => ({
          "data-align": attributes.align,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "figure",
      mergeAttributes(HTMLAttributes, {
        class: "blog-image-figure",
      }),
      0,
    ];
  },
});

/**
 * Figcaption
 *
 * The caption is actual ProseMirror/Tiptap content rather than
 * an attribute on the image.
 */
const Figcaption = Node.create({
  name: "figcaption",

  content: "inline*",

  defining: true,

  parseHTML() {
    return [
      {
        tag: "figcaption",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "figcaption",
      mergeAttributes(HTMLAttributes, {
        class: "blog-image-caption",
      }),
      0,
    ];
  },
});

export function createTiptapExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      heading: {
        levels: [2, 3, 4, 5],
      },

      link: false,

      underline: false,
    }),

    Link.configure({
      openOnClick: false,
      autolink: true,
    }),

    Figure,

    BlogImage,

    Figcaption,

    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === "figcaption") {
          return "";
        }

        return placeholder;
      },

      showOnlyCurrent: true,
    }),
  ];
}

export const tiptapContentClassName =
  "blog-prose " +
  "[&_.tiptap]:min-h-40 " +
  "[&_.tiptap]:px-4 " +
  "[&_.tiptap]:py-3.5 " +
  "[&_.tiptap]:text-base " +
  "[&_.tiptap]:text-foreground " +
  "[&_.tiptap]:outline-none " +
  "[&_.tiptap]:focus:outline-none " +
  /* Empty editor placeholder */
  "[&_.tiptap>p.is-editor-empty:first-child::before]:text-muted-foreground " +
  "[&_.tiptap>p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] " +
  "[&_.tiptap>p.is-editor-empty:first-child::before]:float-left " +
  "[&_.tiptap>p.is-editor-empty:first-child::before]:pointer-events-none " +
  /* Lists */
  "[&_.tiptap_ul]:list-disc " +
  "[&_.tiptap_ul]:pl-6 " +
  /* Blockquote */
  "[&_.tiptap_blockquote]:border-l-2 " +
  "[&_.tiptap_blockquote]:border-border " +
  "[&_.tiptap_blockquote]:pl-4 " +
  "[&_.tiptap_blockquote]:text-muted-foreground " +
  /* Headings */
  "[&_.tiptap_h2]:font-heading " +
  "[&_.tiptap_h2]:text-2xl " +
  "[&_.tiptap_h3]:font-heading " +
  "[&_.tiptap_h3]:text-xl " +
  "[&_.tiptap_h4]:font-heading " +
  "[&_.tiptap_h4]:text-lg " +
  "[&_.tiptap_h5]:font-heading " +
  "[&_.tiptap_h5]:text-base " +
  /* Code */
  "[&_.tiptap_pre]:overflow-x-auto " +
  "[&_.tiptap_pre]:rounded-md " +
  "[&_.tiptap_pre]:bg-muted " +
  "[&_.tiptap_pre]:p-3 " +
  "[&_.tiptap_pre]:font-mono " +
  "[&_.tiptap_pre]:text-xs " +
  "[&_.tiptap_pre_code]:font-mono " +
  /* Figures */
  "[&_.tiptap_figure]:my-6 " +
  "[&_.tiptap_figure]:max-w-full " +
  "[&_.tiptap_figure]:mx-auto " +
  "[&_.tiptap_figure]:text-center " +
  /* Figure alignment */
  "[&_.tiptap_figure[data-align=left]]:mr-auto " +
  "[&_.tiptap_figure[data-align=left]]:ml-0 " +
  "[&_.tiptap_figure[data-align=left]]:w-fit " +
  "[&_.tiptap_figure[data-align=left]]:text-left " +
  "[&_.tiptap_figure[data-align=center]]:mx-auto " +
  "[&_.tiptap_figure[data-align=center]]:text-center " +
  "[&_.tiptap_figure[data-align=right]]:ml-auto " +
  "[&_.tiptap_figure[data-align=right]]:mr-0 " +
  "[&_.tiptap_figure[data-align=right]]:w-fit " +
  "[&_.tiptap_figure[data-align=right]]:text-right " +
  /* Image */
  "[&_.tiptap_figure_img]:block " +
  "[&_.tiptap_figure_img]:max-w-full " +
  "[&_.tiptap_figure_img]:h-auto " +
  "[&_.tiptap_figure_img]:mx-auto " +
  "[&_.tiptap_figure_img]:rounded-lg " +
  "[&_.tiptap_figure_img]:border " +
  "[&_.tiptap_figure_img]:border-border " +
  /* Selected figure */
  "[&_.tiptap_figure.ProseMirror-selectednode]:outline " +
  "[&_.tiptap_figure.ProseMirror-selectednode]:outline-2 " +
  "[&_.tiptap_figure.ProseMirror-selectednode]:outline-ring " +
  "[&_.tiptap_figure.ProseMirror-selectednode]:outline-offset-4 " +
  "[&_.tiptap_figure.ProseMirror-selectednode]:rounded-lg " +
  /* Caption */
  "[&_.tiptap_figcaption]:mt-2 " +
  "[&_.tiptap_figcaption]:min-h-5 " +
  "[&_.tiptap_figcaption]:text-sm " +
  "[&_.tiptap_figcaption]:text-muted-foreground " +
  "[&_.tiptap_figcaption]:italic " +
  "[&_.tiptap_figcaption.is-empty::before]:pointer-events-none " +
  "[&_.tiptap_figcaption.is-empty::before]:text-muted-foreground " +
  "[&_.tiptap_figcaption.is-empty::before]:opacity-60 " +
  "[&_.tiptap_figcaption.is-empty::before]:content-[attr(data-placeholder)] " +
  /* Links */
  "[&_.tiptap_a]:text-gold " +
  "[&_.tiptap_a]:no-underline " +
  "[&_.tiptap_a:hover]:underline " +
  "[&_.tiptap_a]:transition-colors " +
  "[&_.tiptap_a]:cursor-pointer " +
  /* Horizontal rule */
  "[&_.tiptap_hr]:my-4 " +
  "[&_.tiptap_hr]:border-border";

export function addHeadingIdsToHtml(html: string): string {
  return html.replace(
    /<h2\b[^>]*>([\s\S]*?)<\/h2>/g,
    (_match, innerHtml: string) => {
      const text = innerHtml.replace(/<[^>]+>/g, "").trim();
      const id = slugify(text);
      return `<h2 id="${id}">${innerHtml}</h2>`;
    },
  );
}

/**
 * Server-side rendering of TipTap JSON content to HTML.
 * Uses generateHTML from @tiptap/html/server which runs in Node
 * without browser APIs.
 */
export function renderTiptapToHtml(
  content: unknown,
  placeholder = "",
): string {
  const { generateHTML } = require("@tiptap/html/server") as typeof import("@tiptap/html/server");
  const raw = generateHTML(
    (content as import("@tiptap/react").JSONContent) ?? {
      type: "doc",
      content: [],
    },
    createTiptapExtensions(placeholder),
  );
  return addHeadingIdsToHtml(raw);
}
