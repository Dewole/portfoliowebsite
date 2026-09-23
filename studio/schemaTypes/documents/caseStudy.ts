import { defineType, defineField } from "sanity";

// A single portfolio case study. Slug is the same "slug" every collection
// used under Decap CMS (the JSON filename) so the site's URLs don't change.
export default defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  fieldsets: [
    {
      name: "projectDetails",
      title: "Project Details card (shown right after the hero banner)",
      description: "Client, services, year, and live site link, plus the two intro paragraphs beside them.",
      options: { collapsible: false },
    },
  ],
  fields: [
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 1,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL — /portfolio/<slug>/)",
      type: "slug",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "title", title: "Title", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({ name: "tag", title: "Tag (e.g. B2B · Health)", type: "localeString" }),
    defineField({
      name: "category",
      title: "Category (drives the filter pills on the Portfolio page)",
      type: "localeString",
    }),
    defineField({
      name: "coverImage",
      title: "Cover photo",
      description: "Shown on listing cards only (homepage, portfolio/products grid). Separate from the Hero image below. Recommended: 1200×900px (4:3) or wider/landscape — it's cropped to fit card sizes that range from ~150px to ~380px tall.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroImage",
      title: "Hero banner — image (jpg / png / gif)",
      description: "The large banner image at the top of this item's detail page. Recommended: 1600×700px or larger, landscape (~2.3:1) — it's cropped to fill a wide banner. Independent of the cover photo above and the gallery below — if left empty, the first gallery photo is used instead. To use a video or animation as the banner instead, fill in \"Hero banner — video / animation\" below; when both are set, the video/animation takes priority.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroAttachment",
      title: "Hero banner — video / animation (mp4 / json)",
      description: "Optional. Upload an mp4 to autoplay a looping video as the banner, or a Lottie/Bodymovin .json to show an animation instead — either replaces the image above. Recommended for video: 1600×900px (16:9), landscape, a few seconds long, no audio needed since it plays muted. A Lottie file sizes itself to its own artboard automatically, so any dimensions work, but a landscape-ish shape reads best in a wide banner.",
      type: "file",
      options: { accept: "video/mp4,application/json,.mp4,.json" },
    }),
    defineField({
      name: "galleryKicker",
      title: "Gallery section — kicker label",
      description: "Small label above the gallery, further down the page. Leave empty to show \"GALLERY\".",
      type: "localeString",
    }),
    defineField({ name: "role", title: "Role on this project", description: "Shown under your name beside the hero banner (e.g. \"Lead Designer\").", type: "localeString" }),

    // Project Details card — the dark banner right after the hero.
    defineField({
      name: "overview",
      title: "Description — main paragraph",
      type: "localeRichText",
      fieldset: "projectDetails",
    }),
    defineField({
      name: "secondaryDescription",
      title: "Description — secondary paragraph (dimmed)",
      description: "Optional. A second, more muted block of text shown right below the main one — good for extra background or context.",
      type: "localeRichText",
      fieldset: "projectDetails",
    }),
    defineField({ name: "client", title: "Client", type: "localeString", fieldset: "projectDetails" }),
    defineField({
      name: "services",
      title: "Services",
      description: "What you did on this project, e.g. \"Website Redesign\" or \"Brand Identity, UX/UI\".",
      type: "localeString",
      fieldset: "projectDetails",
    }),
    defineField({
      name: "date",
      title: "Year",
      description: "Also shown as the small date label at the very top of this page, above the title.",
      type: "string",
      fieldset: "projectDetails",
    }),
    defineField({
      name: "link",
      title: "Site — live project URL",
      description: "Shown as a \"Visit website\" link. Leave as \"#\" or empty to hide this row.",
      type: "string",
      initialValue: "#",
      fieldset: "projectDetails",
    }),
    defineField({
      name: "sections",
      title: "Additional sections",
      description: "Build out a longer-form project page by adding as many custom sections as you like — each with its own title, description, and media (images, videos, animations). These render between the overview above and the gallery below, in the order you place them here.",
      type: "array",
      of: [{ type: "pageSection" }],
    }),
    defineField({
      name: "images",
      title: "Gallery images (png / jpg)",
      description: "Additional photos shown at the bottom of this item's detail page, in a masonry layout that keeps each photo's own aspect ratio (so there's no strict recommended size or shape — portrait, landscape, and square all lay out cleanly side by side). For reasonable load times, keep uploads under ~2500px on the long edge.",
      type: "array",
      of: [{ type: "image" }],
    }),
    defineField({
      name: "attachments",
      title: "Attachments (mp4 video / json data files)",
      description: "Anything besides photos — video walkthroughs, Lottie animations, exported data, etc. — shown alongside the gallery above. mp4 videos and Lottie .json files preview and autoplay in place (on hover or when scrolled into view) at their own natural size; any other file becomes a plain download link.",
      type: "array",
      of: [{ type: "attachment" }],
    }),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title.en", subtitle: "tag.en", media: "coverImage" },
  },
});
