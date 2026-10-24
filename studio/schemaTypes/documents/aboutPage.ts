import { defineType, defineField, defineArrayMember } from "sanity";

// Singleton — every piece of copy on the About page (/about and /pl/about).
// Bilingual fields are localeString / localeText ({ en, pl }), same as the
// Home page document. Tabs follow the order of the sections on the page.
export default defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  groups: [
    { name: "aboutTop", title: "Top of page", default: true },
    { name: "aboutBio", title: "Photos & bio" },
    { name: "aboutProcess", title: "How I work" },
    { name: "aboutSkills", title: "Skills & tools" },
    { name: "aboutExperience", title: "Experience" },
    { name: "aboutCta", title: "Closing call to action" },
  ],
  fields: [
    defineField({ name: "aboutKicker", title: "Small label above heading", type: "localeString", group: "aboutTop",
      description: "Leave empty to show ABOUT / O MNIE.", }),
    defineField({ name: "aboutPageHeading", title: "Page heading", type: "localeText", group: "aboutTop",
      description: "Leave empty to reuse the Home page \"About\" heading.", }),
    defineField({ name: "aboutPageIntro", title: "Intro paragraph", type: "localeText", group: "aboutTop",
      description: "Leave empty to reuse the Home page \"About\" paragraph.", }),
    defineField({ name: "aboutSeoDescription", title: "Search/social description (SEO)", type: "localeText", group: "aboutTop",
      description: "The short text Google and link previews show. Leave empty to use the long bio.", }),
    defineField({
      name: "aboutPhotos",
      title: "Photo stack",
      description: "Add several photos and they're shown as a stack of prints placed on top of each other at slight angles, next to your bio. Visitors can click/tap the stack to shuffle to the next photo. Drag to reorder — the first photo is on top. Leave empty to show the profile photo instead. Recommended: portrait, about 900×1100px.",
      type: "array",
      group: "aboutBio",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Description (for screen readers)", type: "string" }),
          ],
        }),
      ],
      options: { layout: "grid" },
    }),
    defineField({ name: "aboutBioKicker", title: "Label above bio", type: "localeString", group: "aboutBio",
      description: "Leave empty to show your name · role.", }),
    defineField({
      name: "aboutBio",
      title: "Long bio",
      description: "Full text editor: headings, quotes, bullet/numbered lists, bold, italic, underline, strikethrough, highlight, code, links and images.",
      type: "localeRichTextFull",
      group: "aboutBio",
    }),
    defineField({
      name: "aboutBioLong",
      title: "Long bio (old plain-text version)",
      description: "Your previous bio, kept until it's copied into the editor above. It's only shown on the site while the editor above is empty. Run the conversion command (or retype it above) — this box then disappears.",
      type: "localeText",
      group: "aboutBio",
      readOnly: true,
      hidden: ({ document }) => {
        const d = document as { aboutBio?: { en?: unknown[]; pl?: unknown[] }; aboutBioLong?: { en?: string; pl?: string } } | undefined;
        const hasNew = !!(d?.aboutBio?.en?.length || d?.aboutBio?.pl?.length);
        const hasOld = !!(d?.aboutBioLong?.en || d?.aboutBioLong?.pl);
        return hasNew || !hasOld;
      },
    }),
    defineField({ name: "aboutContactLabel", title: "Button text", type: "localeString", group: "aboutBio",
      description: "Leave empty to show Contact me / Napisz do mnie.", }),
    defineField({ name: "showHowIWork", title: "Show this section", type: "boolean", initialValue: true, group: "aboutProcess", description: "Turn the How I work section on or off." }),
    defineField({ name: "howIWorkKicker", title: "Small label above heading", type: "localeString", group: "aboutProcess",
      description: "Leave empty to show PROCESS / PROCES.", }),
    defineField({ name: "howIWorkHeading", title: "Heading", type: "localeString", group: "aboutProcess", }),
    defineField({ name: "howIWorkIntro", title: "Intro", type: "localeText", group: "aboutProcess", }),
    defineField({ name: "howIWorkStep1Title", title: "Step 1 — title", type: "localeString", group: "aboutProcess", }),
    defineField({ name: "howIWorkStep1Desc", title: "Step 1 — description", type: "localeText", group: "aboutProcess", }),
    defineField({ name: "howIWorkStep1Icon", title: "Step 1 — icon (optional)", type: "image", group: "aboutProcess",
      description: "Upload an SVG or PNG to replace the built-in icon. Square, about 80×80px.", }),
    defineField({ name: "howIWorkStep2Title", title: "Step 2 — title", type: "localeString", group: "aboutProcess", }),
    defineField({ name: "howIWorkStep2Desc", title: "Step 2 — description", type: "localeText", group: "aboutProcess", }),
    defineField({ name: "howIWorkStep2Icon", title: "Step 2 — icon (optional)", type: "image", group: "aboutProcess",
      description: "Upload an SVG or PNG to replace the built-in icon. Square, about 80×80px.", }),
    defineField({ name: "howIWorkStep3Title", title: "Step 3 — title", type: "localeString", group: "aboutProcess", }),
    defineField({ name: "howIWorkStep3Desc", title: "Step 3 — description", type: "localeText", group: "aboutProcess", }),
    defineField({ name: "howIWorkStep3Icon", title: "Step 3 — icon (optional)", type: "image", group: "aboutProcess",
      description: "Upload an SVG or PNG to replace the built-in icon. Square, about 80×80px.", }),
    defineField({ name: "showSkills", title: "Show this section", type: "boolean", initialValue: true, group: "aboutSkills", description: "The pills themselves are edited under Skills & Tools in the sidebar." }),
    defineField({ name: "skillsKicker", title: "Small label above heading", type: "localeString", group: "aboutSkills",
      description: "Leave empty to show TOOLKIT / NARZĘDZIA.", }),
    defineField({ name: "skillsHeading", title: "Heading", type: "localeString", group: "aboutSkills", }),
    defineField({ name: "skillsIntro", title: "Intro", type: "localeText", group: "aboutSkills", }),
    defineField({ name: "showExperience", title: "Show this section", type: "boolean", initialValue: true, group: "aboutExperience", description: "The roles themselves are edited under Experience in the sidebar." }),
    defineField({ name: "experienceKicker", title: "Small label above heading", type: "localeString", group: "aboutExperience",
      description: "Leave empty to show TIMELINE / OŚ CZASU.", }),
    defineField({ name: "experienceHeading", title: "Heading", type: "localeString", group: "aboutExperience", }),
    defineField({ name: "experienceIntro", title: "Intro", type: "localeText", group: "aboutExperience", }),
    defineField({ name: "showAboutCta", title: "Show this section", type: "boolean", initialValue: true, group: "aboutCta", description: "The closing call-to-action banner at the bottom of the page." }),
    defineField({ name: "aboutCtaHeading", title: "Heading", type: "localeString", group: "aboutCta", }),
    defineField({ name: "aboutCtaParagraph", title: "Paragraph", type: "localeText", group: "aboutCta", }),
    defineField({ name: "aboutCtaButtonLabel", title: "Button text", type: "localeString", group: "aboutCta", }),
    defineField({ name: "aboutCtaButtonLink", title: "Button link", type: "string", group: "aboutCta",
      description: "Where the button goes. Leave empty for the Contact page. Use a full https:// address for external links.", }),
  ],
  preview: { prepare: () => ({ title: "About page" }) },
});
