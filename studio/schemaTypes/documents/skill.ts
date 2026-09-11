import { defineType, defineField } from "sanity";

export default defineType({
  name: "skill",
  title: "Skill / Tool",
  type: "document",
  fields: [
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 1,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      description: "E.g. Figma, Adobe Creative Cloud, Prototyping, Branding.",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon / logo",
      description: "Upload the tool's logo, or an icon representing the skill. Recommended: square, at least 128×128px, transparent background (PNG or SVG) works best. Leave empty to show the skill as a plain text label.",
      type: "image",
      options: { hotspot: false },
    }),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name.en", media: "icon" },
  },
});
