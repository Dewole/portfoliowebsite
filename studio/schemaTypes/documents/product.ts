import { defineType, defineField } from "sanity";

// A shipped/in-progress product ("Projects" section of the brief).
export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  fieldsets: [
    {
      name: "projectDetails",
      title: "Product Details card (shown right after the hero banner)",
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
      title: "Slug (URL — /products/<slug>/)",
      type: "slug",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "name", title: "Product name", type: "localeString", validation: (Rule) => Rule.required() }),
    defineField({ name: "description", title: "Description", type: "localeText" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: [{ title: "Live", value: "live" }, { title: "Coming soon", value: "coming-soon" }] },
    }),
    defineField({
      name: "category",
      title: "Category (drives the filter pills on the Products page)",
      type: "localeString",
    }),
    defineField({
      name: "coverImage",
      title: "Cover photo",
      description: "Shown on every card for this project (homepage, listing page, related work) — always cropped to a 3:2 landscape shape. Upload at least 1500×1000px. Use Crop and the hotspot dot to choose what stays in view; the previews below show the result.",
      type: "image",
      options: {
        // Every card shows the cover at the same 3:2 shape (homepage strip,
        // listing grid, related work). Drag the hotspot onto what must stay
        // in view; the previews show exactly what visitors see.
        hotspot: {
          previews: [
            { title: "Homepage card (3:2)", aspectRatio: 3 / 2 },
            { title: "Listing page card (3:2)", aspectRatio: 3 / 2 },
          ],
        },
      },
    }),
    defineField({
      name: "heroImage",
      title: "Hero banner — image (jpg / png / gif)",
      description: "The banner at the top of this project's page. It's always 16:9 on every screen (desktop and mobile), so a 16:9 upload shows in full with nothing cut off. Recommended: 1920×1080px (or 2560×1440px). The image and the video/animation below use the same size. If empty, the cover photo is used. A video/animation below takes priority over this image.",
      type: "image",
      options: {
        hotspot: {
          previews: [
            { title: "Banner — desktop & mobile (16:9)", aspectRatio: 16 / 9 },
          ],
        },
      },
    }),
    defineField({
      name: "heroAttachment",
      title: "Hero banner — video / animation (mp4 / json)",
      description: "Optional. An mp4 (plays muted and looping) or a Lottie .json animation, shown in the same 16:9 banner as the image above. Export at 1920×1080px (16:9) — the same size as the banner image — and it shows in full on every screen. Takes priority over the banner image.",
      type: "file",
      options: { accept: "video/mp4,application/json,.mp4,.json" },
    }),
    defineField({
      name: "galleryKicker",
      title: "Gallery section — kicker label",
      description: "Small label above the gallery, further down the page. Leave empty to show \"GALLERY\".",
      type: "localeString",
    }),

    // Product Details card — the banner right after the hero.
    defineField({ name: "overview", title: "Description — main paragraph", type: "localeRichText", fieldset: "projectDetails" }),
    defineField({
      name: "secondaryDescription",
      title: "Description — secondary paragraph (dimmed)",
      description: "Optional. A second, more muted block of text shown right below the main one.",
      type: "localeRichText",
      fieldset: "projectDetails",
    }),
    defineField({ name: "client", title: "Client", type: "localeString", fieldset: "projectDetails" }),
    defineField({
      name: "services",
      title: "Services",
      description: "What you did on this product, e.g. \"Product Design, Branding\".",
      type: "localeString",
      fieldset: "projectDetails",
    }),
    defineField({ name: "date", title: "Year", type: "string", fieldset: "projectDetails" }),
    defineField({
      name: "link",
      title: "Site — live product URL",
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
    defineField({
      name: "seo",
      title: "Search & sharing (SEO)",
      description: "Optional — leave empty for automatic SEO built from this page's content.",
      type: "seo",
    }),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name.en", subtitle: "status", media: "coverImage" },
  },
});
