import { defineType, defineField, defineArrayMember } from "sanity";

// Same idea as localeText, but for content that needs real formatting —
// multiple paragraphs, bullet/numbered lists, bold, italic, underline, and
// links. Rendered on the site via lib/portableText.js (see .eleventy.js's
// "portableText" filter), so no new npm dependency is needed to turn this
// into HTML at build time.
//
// Kept deliberately simple: a couple of heading sizes for sub-headers
// within a long description, lists, and the everyday text marks — not a
// full page-builder. Stacked English-then-Polish (rather than side by side
// like localeString/localeText) since a rich text editor needs more room
// to work in.
const richTextBlock = defineArrayMember({
  type: "block",
  styles: [
    { title: "Normal", value: "normal" },
    { title: "Heading", value: "h3" },
    { title: "Subheading", value: "h4" },
  ],
  lists: [
    { title: "Bullet list", value: "bullet" },
    { title: "Numbered list", value: "number" },
  ],
  marks: {
    decorators: [
      { title: "Bold", value: "strong" },
      { title: "Italic", value: "em" },
      { title: "Underline", value: "underline" },
    ],
    annotations: [
      {
        name: "link",
        type: "object",
        title: "Link",
        fields: [
          defineField({ name: "href", title: "URL", type: "url" }),
        ],
      },
    ],
  },
});

export default defineType({
  name: "localeRichText",
  title: "Rich text (EN / PL)",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "array", of: [richTextBlock] }),
    defineField({ name: "pl", title: "Polish", type: "array", of: [richTextBlock] }),
  ],
  preview: {
    select: { blocks: "en" },
    prepare({ blocks }) {
      const block = Array.isArray(blocks) ? blocks.find((b) => b && b._type === "block") : null;
      const text = block && Array.isArray(block.children)
        ? block.children.map((c) => c.text || "").join("")
        : "";
      return { title: text ? (text.length > 80 ? `${text.slice(0, 80)}…` : text) : "(empty)" };
    },
  },
});
