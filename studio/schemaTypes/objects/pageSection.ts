import { defineType, defineField, defineArrayMember } from "sanity";

// A single flexible content block for a case study / product detail page —
// its own title, description, and a mix of images/videos/animations, so a
// long-form project page can be built up section by section (in whatever
// order they're added here) instead of only using the fixed
// overview/objective/approach/outcome fields above it.
export default defineType({
  name: "pageSection",
  title: "Section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Section title",
      type: "localeString",
    }),
    defineField({
      name: "description",
      title: "Section description",
      type: "localeRichText",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      description: "How this section's text and media sit next to each other. \"Full width\" stacks the text above a media grid (best for more than one image/video). The split options work best with a single, larger piece of media beside the text.",
      type: "string",
      options: {
        list: [
          { title: "Full width", value: "full" },
          { title: "Text left, media right", value: "split-media-right" },
          { title: "Text right, media left", value: "split-media-left" },
        ],
        layout: "radio",
      },
      initialValue: "full",
    }),
    defineField({
      name: "backgroundColor",
      title: "Background color",
      description: "Colors this section's background. Text switches between light and dark automatically so it stays readable. Choose \"Custom color\" to enter your own hex code.",
      type: "string",
      options: {
        list: [
          { title: "Default (no background)", value: "none" },
          { title: "White", value: "white" },
          { title: "Light grey", value: "light" },
          { title: "Warm cream", value: "cream" },
          { title: "Dark", value: "dark" },
          { title: "Black", value: "black" },
          { title: "Custom color…", value: "custom" },
        ],
        layout: "dropdown",
      },
      initialValue: "none",
    }),
    defineField({
      name: "backgroundCustom",
      title: "Custom background color (hex)",
      description: "For example #1a4bff or #f5e6d3.",
      type: "string",
      hidden: ({ parent }) => parent?.backgroundColor !== "custom",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          if (ctx.parent?.backgroundColor !== "custom" || !value) return true;
          return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim()) || "Use a hex code like #1a4bff";
        }),
    }),
    defineField({
      name: "media",
      title: "Media (images, videos, animations)",
      description: "Add as many as you like, in any mix. Images get cropping tools; mp4 videos autoplay muted when in view; Lottie .json files play as animations. Everything can be clicked to view full-size. 📐 Recommended sizes — Full width: 1 item → 2400 px wide (e.g. 2400×1350 for 16:9), 2 items → 1600 px wide each, 3+ items → 1200 px wide each (heights can vary, nothing gets cropped). Text + media side by side: 1600 px wide, ideally 4:3 (1600×1200) or square (1600×1600) so it sits level with the text. Videos: mp4 (H.264) at the same widths, under ~10 MB. Lottie .json: any size, it scales to fill the space and keeps its proportions. Images: jpg for photos, png for UI with sharp text; keep files under ~2 MB.",
      type: "array",
      of: [
        defineArrayMember({ type: "image" }),
        defineArrayMember({ type: "attachment" }),
      ],
    }),
  ],
  preview: {
    select: { title: "title.en", description: "description.en", media: "media.0" },
    prepare({ title, description, media }) {
      // "description" is now rich text (an array of blocks), so flatten it
      // to plain text — passing the raw array as the subtitle is what made
      // the Studio show "Invalid preview config".
      const text = Array.isArray(description)
        ? description
            .filter((b) => b && b._type === "block" && Array.isArray(b.children))
            .map((b) => b.children.map((c) => c.text || "").join(""))
            .join(" ")
            .trim()
        : "";
      return {
        title: title || "Section",
        subtitle: text.length > 90 ? `${text.slice(0, 90)}…` : text,
        media,
      };
    },
  },
});
