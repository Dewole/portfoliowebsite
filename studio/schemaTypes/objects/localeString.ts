import { defineType, defineField } from "sanity";

// A short bilingual text field: one Sanity field that holds both the
// English and Polish version side by side in the Studio.
export default defineType({
  name: "localeString",
  title: "Text (EN / PL)",
  type: "object",
  fieldsets: [
    { name: "translations", title: "Translations", options: { columns: 2 } },
  ],
  fields: [
    defineField({ name: "en", title: "English", type: "string", fieldset: "translations" }),
    defineField({ name: "pl", title: "Polish", type: "string", fieldset: "translations" }),
  ],
  preview: {
    select: { title: "en", subtitle: "pl" },
    prepare({ title, subtitle }) {
      return { title: title || "(empty)", subtitle: subtitle ? `PL: ${subtitle}` : undefined };
    },
  },
});
