import { defineType, defineField } from "sanity";

// Same idea as localeString, but for longer paragraph-style copy.
export default defineType({
  name: "localeText",
  title: "Paragraph (EN / PL)",
  type: "object",
  fieldsets: [
    { name: "translations", title: "Translations", options: { columns: 2 } },
  ],
  fields: [
    defineField({ name: "en", title: "English", type: "text", rows: 3, fieldset: "translations" }),
    defineField({ name: "pl", title: "Polish", type: "text", rows: 3, fieldset: "translations" }),
  ],
  preview: {
    select: { title: "en", subtitle: "pl" },
    prepare({ title, subtitle }) {
      return { title: title || "(empty)", subtitle: subtitle ? `PL: ${subtitle}` : undefined };
    },
  },
});
