import React from "react";
import { defineType, defineField, defineArrayMember } from "sanity";
import { HighlightIcon } from "@sanity/icons";

// The "full" rich text editor — used for long-form copy like the About
// page bio. Everything localeRichText has, plus: H2 headings, quotes,
// strikethrough, inline code, highlight, nested lists, links that can be
// internal (/portfolio/), email (mailto:) or phone (tel:) and optionally
// open in a new tab, and images with alt text + caption.
// Rendered by lib/portableText.js.
const block = defineArrayMember({
  type: "block",
  styles: [
    { title: "Normal", value: "normal" },
    { title: "Large heading", value: "h2" },
    { title: "Heading", value: "h3" },
    { title: "Subheading", value: "h4" },
    { title: "Quote", value: "blockquote" },
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
      { title: "Strikethrough", value: "strike-through" },
      { title: "Code", value: "code" },
      {
        title: "Highlight",
        value: "highlight",
        icon: HighlightIcon,
        component: (props: { children?: React.ReactNode }) =>
          React.createElement("mark", { style: { background: "#bfe0ff", color: "inherit", padding: "0 2px" } }, props.children),
      },
    ],
    annotations: [
      {
        name: "link",
        type: "object",
        title: "Link",
        fields: [
          defineField({
            name: "href",
            title: "URL",
            description: "A full address (https://…), a page on your site (/portfolio/), an email (mailto:…) or a phone number (tel:…).",
            type: "url",
            validation: (Rule) => Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }),
          }),
          defineField({ name: "newTab", title: "Open in a new tab", type: "boolean", initialValue: false }),
        ],
      },
    ],
  },
});

const image = defineArrayMember({
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({ name: "alt", title: "Description (for screen readers)", type: "string" }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
});

export default defineType({
  name: "localeRichTextFull",
  title: "Rich text editor (EN / PL)",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "array", of: [block, image] }),
    defineField({ name: "pl", title: "Polish", type: "array", of: [block, image] }),
  ],
  preview: {
    select: { blocks: "en" },
    prepare({ blocks }) {
      const b = Array.isArray(blocks) ? blocks.find((x) => x && x._type === "block") : null;
      const text = b && Array.isArray(b.children) ? b.children.map((c: { text?: string }) => c.text || "").join("") : "";
      return { title: text ? (text.length > 80 ? `${text.slice(0, 80)}…` : text) : "(empty)" };
    },
  },
});
