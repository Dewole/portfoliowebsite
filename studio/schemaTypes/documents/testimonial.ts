import { defineType, defineField } from "sanity";

export default defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 1,
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "quote", title: "Quote", type: "localeText", validation: (Rule) => Rule.required() }),
    defineField({ name: "name", title: "Client name", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({
      name: "rating",
      title: "Rating (1-5)",
      type: "number",
      initialValue: 5,
      validation: (Rule) => Rule.min(1).max(5).integer(),
    }),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name.en", subtitle: "quote.en" },
  },
});
