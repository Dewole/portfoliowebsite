import { defineType, defineField } from "sanity";

export default defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 1,
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "title", title: "Title", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({ name: "description", title: "Description", type: "localeText" }),
    defineField({
      name: "icon",
      title: "Custom icon (SVG)",
      type: "file",
      description: "Optional. Upload an .svg file to replace the default icon for this service, while keeping the built-in hover animation. It's vector, so any size works, but keep the artwork simple (a few shapes) — the hover effect animates up to the first 4 top-level shapes individually, same as the built-in icons. Leave empty to use the default icon.",
      options: { accept: "image/svg+xml,.svg" },
    }),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title.en", subtitle: "description.en" },
  },
});
