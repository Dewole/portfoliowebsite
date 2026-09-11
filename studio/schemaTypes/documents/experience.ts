import { defineType, defineField } from "sanity";

export default defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  fields: [
    defineField({
      name: "order",
      title: "Display order (most recent first)",
      type: "number",
      initialValue: 1,
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "company", title: "Company", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({ name: "role", title: "Role / Title", type: "localeString" }),
    defineField({ name: "period", title: "Period (e.g. 2023 — Present)", type: "localeString" }),
    defineField({ name: "description", title: "Description", type: "localeText" }),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "company.en", subtitle: "role.en" },
  },
});
