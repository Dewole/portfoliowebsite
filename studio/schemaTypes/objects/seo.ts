import { defineType, defineField } from "sanity";

// Reusable "Search & sharing" settings, added to every page type. Every
// field is optional: when left empty the site builds sensible defaults from
// the page's own content (title, intro, cover image) — see lib/seo.js.
export default defineType({
  name: "seo",
  title: "Search & sharing (SEO)",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "SEO title",
      description: "Shown as the blue link in Google and as the browser tab title. Aim for 50–60 characters, most important words first. Leave empty to use the automatic title.",
      type: "localeString",
    }),
    defineField({
      name: "description",
      title: "Meta description",
      description: "The grey text under the link in Google. Aim for 140–160 characters: what the page is, for whom, and why it's worth clicking. Leave empty to use the page's intro text.",
      type: "localeText",
    }),
    defineField({
      name: "image",
      title: "Social sharing image",
      description: "Shown when the page is shared on LinkedIn, Slack, WhatsApp, X… 1200×630px works best. Leave empty to use the cover image (or the site-wide share image).",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "indexing",
      title: "Search engines",
      description: "\"Automatic\" hides obvious placeholder pages (e.g. \"Product Name One\", \"Month 20XX\") and shows everything else.",
      type: "string",
      options: {
        list: [
          { title: "Automatic", value: "auto" },
          { title: "Show in search results", value: "index" },
          { title: "Hide from search results (noindex)", value: "noindex" },
        ],
        layout: "radio",
      },
      initialValue: "auto",
    }),
    defineField({
      name: "canonical",
      title: "Canonical URL override",
      description: "Only if this content is published elsewhere first (e.g. a Behance or Medium version) and that copy should rank instead. Leave empty in almost every case.",
      type: "url",
    }),
    defineField({
      name: "keywords",
      title: "Topics / skills (structured data)",
      description: "Optional. A few words describing the work, e.g. \"UI/UX design\", \"design system\", \"fintech\". Used in the page's structured data (not shown on the page).",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
});
