import { defineType, defineField } from "sanity";

// A single non-image file attachment — used for mp4 video or raw json data
// files on case studies / products. Images (png/jpg) use Sanity's native
// "image" array field instead, so they get cropping + hotspot for free.
export default defineType({
  name: "attachment",
  title: "Attachment",
  type: "object",
  fields: [
    defineField({
      name: "file",
      title: "File (mp4 or json)",
      type: "file",
      options: {
        accept: "video/mp4,application/json,.mp4,.json",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption / description",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "caption", filename: "file.asset.originalFilename" },
    prepare({ title, filename }) {
      return { title: title || filename || "Attachment" };
    },
  },
});
