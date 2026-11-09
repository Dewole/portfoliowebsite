import { defineType, defineField, defineArrayMember } from "sanity";

// A custom section you can add anywhere on the homepage (Home page →
// "Extra sections"). Choose where it goes with "Place after", then give it
// any mix of label, heading, rich text, images/videos/animations and a
// button. Rendered by src/_includes/home-extra-sections.njk.
export const HOME_SLOTS = [
  { title: "After Hero (top of page)", value: "hero" },
  { title: "After “Who is…” overview", value: "overview" },
  { title: "After About split section", value: "about" },
  { title: "After Services (What I do)", value: "services" },
  { title: "After Stats (Why me)", value: "stats" },
  { title: "After Portfolio", value: "portfolio" },
  { title: "After Products", value: "products" },
  { title: "After Photography", value: "photography" },
  { title: "After Testimonials", value: "testimonials" },
  { title: "After Big quote banner", value: "bigQuote" },
  { title: "After Final CTA (end of page)", value: "finalCta" },
];

export default defineType({
  name: "homeSection",
  title: "Homepage section",
  type: "object",
  fields: [
    defineField({ name: "show", title: "Show this section", type: "boolean", initialValue: true }),
    defineField({
      name: "placeAfter",
      title: "Place after",
      description: "Which built-in homepage section this one appears after. Several extra sections can share a spot — they show in the order listed here.",
      type: "string",
      options: { list: HOME_SLOTS },
      initialValue: "portfolio",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "kicker", title: "Small label above heading", type: "localeString" }),
    defineField({ name: "title", title: "Heading", description: "Tip: type || where you want a line break on tablet/desktop.", type: "localeText" }),
    defineField({ name: "description", title: "Text", type: "localeRichText" }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Full width (text above media)", value: "full" },
          { title: "Text left, media right", value: "split-media-right" },
          { title: "Text right, media left", value: "split-media-left" },
          { title: "Centred text (no media / media below)", value: "centered" },
        ],
        layout: "radio",
      },
      initialValue: "full",
    }),
    defineField({
      name: "media",
      title: "Media (images, videos, animations)",
      description: "Optional. Images get cropping tools; mp4 videos autoplay muted when in view; Lottie .json files play as animations. Everything can be clicked to view full-size. 📐 Recommended sizes — Full width: 1 item → 2400 px wide (e.g. 2400×1350 for 16:9), 2 items → 1600 px wide each, 3+ items → 1200 px wide each (heights can vary, nothing gets cropped). Text + media side by side: 1600 px wide, ideally 4:3 (1600×1200) or square (1600×1600) so it sits level with the text. Videos: mp4 (H.264) at the same widths, under ~10 MB. Lottie .json: any size, it scales to fill the space and keeps its proportions. Images: jpg for photos, png for UI with sharp text; keep files under ~2 MB.",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Description (for screen readers)", type: "string" })],
        }),
        defineArrayMember({ type: "attachment" }),
      ],
    }),
    defineField({ name: "buttonLabel", title: "Button text (optional)", type: "localeString" }),
    defineField({
      name: "buttonLink",
      title: "Button link",
      description: "A page on your site (/portfolio/) or a full address (https://…). Outside links open in a new tab.",
      type: "string",
    }),
    defineField({
      name: "backgroundColor",
      title: "Background",
      description: "Text switches between light and dark automatically so it stays readable.",
      type: "string",
      options: {
        list: [
          { title: "Default (page background)", value: "none" },
          { title: "White — #FFFFFF", value: "white" },
          { title: "Light grey — #EDF0F3 (page background)", value: "light" },
          { title: "Soft blue — #E8F1FF", value: "cream" },
          { title: "Dark — #13151B", value: "dark" },
          { title: "Black — #0A0B10", value: "black" },
          { title: "Custom colour…", value: "custom" },
        ],
      },
      initialValue: "none",
    }),
    defineField({
      name: "backgroundCustom",
      title: "Custom background colour (hex)",
      type: "string",
      hidden: ({ parent }) => parent?.backgroundColor !== "custom",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const p = ctx.parent as { backgroundColor?: string } | undefined;
          if (p?.backgroundColor !== "custom" || !value) return true;
          return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(value).trim()) || "Use a hex code like #1a4bff";
        }),
    }),
  ],
  preview: {
    select: { title: "title.en", kicker: "kicker.en", place: "placeAfter", show: "show", media: "media.0" },
    prepare({ title, kicker, place, show, media }) {
      const slot = HOME_SLOTS.find((s) => s.value === place);
      return {
        title: (title || kicker || "Untitled section").replace(/\|\|/g, " "),
        subtitle: `${show === false ? "Hidden · " : ""}${slot ? slot.title : ""}`,
        media,
      };
    },
  },
});
