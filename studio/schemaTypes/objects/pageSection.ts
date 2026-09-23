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
      name: "media",
      title: "Media (images, videos, animations)",
      description: "Add as many as you like, in any mix. Images (jpg/png/gif) get Sanity's built-in cropping tool; mp4 videos autoplay in place (muted, looping) once scrolled into view; Lottie/Bodymovin .json files render as animations at their own native size. Anything here can be clicked to view full-size.",
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
      return {
        title: title || "Section",
        subtitle: description,
        media,
      };
    },
  },
});
