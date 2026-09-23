import { defineType, defineField, defineArrayMember } from "sanity";

// Singleton — global site copy shared by both the EN and /pl/ pages.
// Fields that are genuinely identical in both languages (contact details,
// the CV file, the copyright year, shared photo gallery) stay as plain
// fields; everything that reads as page copy is bilingual (localeString /
// localeText) so one document drives both language versions of the site.
//
// Groups are organized by homepage section / page, with each section's
// on/off toggle (when it has one) as the first field in its group — so
// turning a section off sits right next to the content it turns off.
export default defineType({
  name: "siteSettings",
  title: "Home page",
  type: "document",
  groups: [
    { name: "identity", title: "Identity & contact" },
    { name: "hero", title: "Hero" },
    { name: "overview", title: "\"Who is...\" overview section" },
    { name: "about", title: "About split section" },
    { name: "services", title: "Services section" },
    { name: "stats", title: "Stats section" },
    { name: "portfolio", title: "Portfolio section" },
    { name: "products", title: "Products section" },
    { name: "photography", title: "Photography section" },
    { name: "testimonials", title: "Testimonials section" },
    { name: "bigQuote", title: "Big quote banner" },
    { name: "finalCta", title: "Final CTA banner" },
    { name: "aboutPage", title: "About page" },
    { name: "contactPage", title: "Contact page" },
    { name: "footer", title: "Footer" },
  ],
  fields: [

    // Identity & contact — not translated, not a toggleable section
    defineField({ name: "name", title: "Your name", type: "string", group: "identity" }),
    defineField({ name: "role", title: "Role / Title", type: "localeString", group: "identity" }),
    defineField({ name: "phone", title: "Phone", type: "string", group: "identity" }),
    defineField({ name: "email", title: "Email", type: "string", group: "identity" }),
    defineField({ name: "linkedinUrl", title: "LinkedIn URL", type: "url", group: "identity" }),
    defineField({
      name: "linkedinLabel",
      title: "LinkedIn — display name",
      description: "The text shown for this link in the nav, side menu, and footer. Leave empty to show \"LinkedIn\".",
      type: "localeString",
      group: "identity",
    }),
    defineField({ name: "figmaUrl", title: "Figma URL", type: "url", group: "identity" }),
    defineField({
      name: "figmaLabel",
      title: "Figma — display name",
      description: "The text shown for this link in the side menu and footer. Leave empty to show \"Figma\".",
      type: "localeString",
      group: "identity",
    }),
    defineField({ name: "metaDescription", title: "Meta description (SEO)", type: "localeText", group: "identity" }),
    defineField({ name: "availabilityStatus", title: "Availability status (About/Contact pill)", type: "localeString", group: "identity" }),
    defineField({ name: "cv", title: "CV / Resume file", type: "file", group: "identity" }),
    defineField({
      name: "profilePhoto",
      title: "Profile photo",
      description: "Used on the homepage \"who is\" card and the About / Contact pages. Falls back to the built-in placeholder photo if left empty. Recommended: 800×1000px (4:5), portrait, subject positioned near the top — it's cropped from the top down at heights from ~220px up to ~440px.",
      type: "image",
      options: { hotspot: true },
      group: "identity",
    }),
    defineField({
      name: "showLogo",
      title: "Show logo in the top nav",
      type: "boolean",
      initialValue: true,
      group: "identity",
    }),
    defineField({
      name: "showBrandText",
      title: "Show name/role text in the top nav",
      type: "boolean",
      initialValue: true,
      group: "identity",
    }),
    defineField({
      name: "siteUrl",
      title: "Live site URL",
      description: "Your site's live domain once deployed, e.g. https://dewole.com (no trailing slash). Used to build absolute links for social share previews (WhatsApp, Slack, iMessage, etc.) and canonical URLs — without it, some platforms won't display your share image correctly.",
      type: "url",
      group: "identity",
    }),
    defineField({
      name: "ogImage",
      title: "Social share image (SEO / link previews)",
      description: "Shown when a page is shared on social media, Slack, WhatsApp, iMessage, etc. Recommended: exactly 1200×630px (jpg or png), with any key text kept within the center ~80% since some platforms crop the edges. Used as the default for every page; a Portfolio/Product page falls back to that item's own cover image if you haven't set one there.",
      type: "image",
      options: { hotspot: false },
      group: "identity",
    }),
    defineField({
      name: "logo",
      title: "Logo (top nav)",
      description: "Shown beside the name/role text in the top navigation, with a \"difference\" blend effect so it stays visible over any background. Static logo: upload an SVG — it's vector, so any size works. Animated logo: upload a Lottie/Bodymovin .json export — it's displayed at a fixed 28-32px height and sizes its width automatically from its own artboard, so any dimensions work there too.",
      type: "file",
      options: {
        accept: "image/svg+xml,application/json,.svg,.json",
      },
      group: "identity",
    }),

    // Hero — top of the homepage, always shown
    defineField({ name: "heroEyebrow", title: "Hero — eyebrow label", type: "localeString", group: "hero" }),
    defineField({ name: "heroTitle", title: "Hero — title", type: "localeString", group: "hero" }),
    defineField({ name: "heroSubtitle", title: "Hero — subtitle (script line)", type: "localeString", group: "hero" }),
    defineField({ name: "heroHandwriteText", title: "Hero — handwritten name", type: "string", group: "hero" }),
    defineField({
      name: "heroBackgroundImage",
      title: "Hero — background image",
      description: "Optional. A full-bleed photo behind the hero text. Recommended: 1920×1080px or larger, landscape — it's cropped to cover the full hero area on any screen size. If a background video/animation below or a Spline scene is also set, those take priority over this image.",
      type: "image",
      options: { hotspot: true },
      group: "hero",
    }),
    defineField({
      name: "heroBackgroundAttachment",
      title: "Hero — background video / animation (mp4 / json)",
      description: "Optional. Upload an mp4 to autoplay a looping, muted video behind the hero text, or a Lottie/Bodymovin .json for an animated background — either replaces the background image above. Recommended for video: 1920×1080px (16:9) or larger, a few seconds long and loop-friendly since it repeats continuously. Takes priority over the background image, but a Spline scene below still takes priority over this.",
      type: "file",
      options: { accept: "video/mp4,application/json,.mp4,.json" },
      group: "hero",
    }),
    defineField({
      name: "heroSplineUrl",
      title: "Hero — Spline background URL",
      description: "Optional. Paste a Spline scene's public viewer URL (from Spline's Share/Export panel, e.g. https://my.spline.design/xxxxxxxx/) to show that 3D scene as an animated background behind the Hero section, taking priority over the image/video/animation above. It's shown non-interactively, purely as a background. Leave everything in this group empty to keep the default background.",
      type: "url",
      group: "hero",
    }),

    // "Who is..." overview section (homepage)
    defineField({
      name: "showOverview",
      title: "Show this section",
      type: "boolean",
      initialValue: true,
      group: "overview",
    }),
    defineField({ name: "updatedLabel", title: "Overview — updated label", type: "localeString", group: "overview" }),
    defineField({ name: "bioParagraph", title: "Bio paragraph", type: "localeText", group: "overview" }),
    defineField({ name: "specialties", title: "Specialties line", type: "localeText", group: "overview" }),
    defineField({ name: "proof", title: "Proof line", type: "localeText", group: "overview" }),
    defineField({ name: "industries", title: "Industries line", type: "localeText", group: "overview" }),

    // About split section (homepage — bio + CTA card, distinct from the About page)
    defineField({
      name: "showAbout",
      title: "Show this section",
      type: "boolean",
      initialValue: true,
      group: "about",
    }),
    defineField({ name: "aboutHeading", title: "About — heading", type: "localeText", group: "about" }),
    defineField({ name: "aboutParagraph", title: "About — paragraph", type: "localeText", group: "about" }),
    defineField({ name: "ctaCardHeading", title: "CTA card — heading", type: "localeString", group: "about" }),
    defineField({ name: "ctaCardParagraph", title: "CTA card — paragraph", type: "localeText", group: "about" }),

    // Services section (homepage)
    defineField({
      name: "showServices",
      title: "Show this section",
      type: "boolean",
      initialValue: true,
      group: "services",
    }),
    defineField({ name: "servicesHeading", title: "Services — heading", type: "localeString", group: "services" }),
    defineField({ name: "servicesSubheading", title: "Services — subheading", type: "localeText", group: "services" }),

    // Stats section (homepage)
    defineField({
      name: "showStats",
      title: "Show this section",
      type: "boolean",
      initialValue: true,
      group: "stats",
    }),
    defineField({ name: "statsHeading", title: "Stats — heading", type: "localeString", group: "stats" }),
    defineField({ name: "statsParagraph", title: "Stats — paragraph", type: "localeText", group: "stats" }),
    defineField({ name: "statNumber", title: "Stats — big number", type: "localeString", group: "stats" }),
    defineField({ name: "statCaption", title: "Stats — caption", type: "localeText", group: "stats" }),

    // Portfolio section (homepage) — content lives in the Case Studies collection
    defineField({
      name: "showPortfolio",
      title: "Show Portfolio (case studies) section",
      type: "boolean",
      initialValue: true,
      group: "portfolio",
    }),

    // Products section (homepage) — content lives in the Products collection
    defineField({
      name: "showProducts",
      title: "Show Products section",
      type: "boolean",
      initialValue: true,
      group: "products",
    }),

    // Photography section (homepage) — shared gallery, bilingual copy
    defineField({
      name: "showPhotography",
      title: "Show this section",
      type: "boolean",
      initialValue: true,
      group: "photography",
    }),
    defineField({ name: "photographyKicker", title: "Photography — kicker", type: "localeString", group: "photography" }),
    defineField({ name: "photographyHeading", title: "Photography — heading", type: "localeString", group: "photography" }),
    defineField({ name: "photographyIntro", title: "Photography — paragraph", type: "localeText", group: "photography" }),
    defineField({ name: "photographyCtaLabel", title: "Photography — \"view more\" link label", type: "localeString", group: "photography" }),
    defineField({ name: "photographyCtaUrl", title: "Photography — \"view more\" link URL", type: "url", group: "photography" }),
    defineField({
      name: "photographyImages",
      title: "Photography gallery images (shared across languages)",
      description: "Recommended: roughly square, ~1200×1200px — shown in fixed square tiles (240-380px depending on screen size) and cropped to fit.",
      type: "array",
      of: [{ type: "image" }],
      group: "photography",
    }),

    // Testimonials section (homepage) — content lives in the Testimonials collection
    defineField({
      name: "showTestimonials",
      title: "Show Testimonials section",
      type: "boolean",
      initialValue: true,
      group: "testimonials",
    }),

    // Big quote banner (homepage) — its own section, separate from Stats
    defineField({
      name: "showBigQuote",
      title: "Show this section",
      type: "boolean",
      initialValue: true,
      group: "bigQuote",
    }),
    defineField({
      name: "bigQuoteBackgroundImage",
      title: "Big quote — background image",
      description: "Optional. A full-bleed photo behind this banner's text. Recommended: 1920\u00d71080px or larger, landscape. If a background video/animation below is also set, that takes priority over this image.",
      type: "image",
      options: { hotspot: true },
      group: "bigQuote",
    }),
    defineField({
      name: "bigQuoteBackgroundAttachment",
      title: "Big quote — background video / animation (mp4 / json)",
      description: "Optional. Upload an mp4 to autoplay a looping, muted video behind this banner's text, or a Lottie/Bodymovin .json for an animated background \u2014 either replaces the background image above.",
      type: "file",
      options: { accept: "video/mp4,application/json,.mp4,.json" },
      group: "bigQuote",
    }),
    defineField({ name: "bigQuoteLead", title: "Big quote — lead (bright text)", type: "localeString", group: "bigQuote" }),
    defineField({ name: "bigQuoteFade", title: "Big quote — fade (muted text)", type: "localeString", group: "bigQuote" }),
    defineField({ name: "bigQuoteParagraph", title: "Big quote — paragraph", type: "localeText", group: "bigQuote" }),

    // Final CTA banner (homepage)
    defineField({
      name: "showFinalCta",
      title: "Show this section",
      type: "boolean",
      initialValue: true,
      group: "finalCta",
    }),
    defineField({ name: "finalCtaHeading", title: "Final CTA — heading", type: "localeString", group: "finalCta" }),
    defineField({ name: "finalCtaSubheading", title: "Final CTA — subheading", type: "localeString", group: "finalCta" }),

    // About page — not a homepage section, so no on/off toggle
    defineField({ name: "aboutBioLong", title: "About page — long bio", type: "localeText", group: "aboutPage" }),
    defineField({ name: "experienceHeading", title: "Experience section heading", type: "localeString", group: "aboutPage" }),
    defineField({ name: "experienceIntro", title: "Experience section intro", type: "localeText", group: "aboutPage" }),
    defineField({ name: "howIWorkHeading", title: "\"How I work\" heading", type: "localeString", group: "aboutPage" }),
    defineField({ name: "howIWorkIntro", title: "\"How I work\" intro", type: "localeText", group: "aboutPage" }),
    defineField({ name: "howIWorkStep1Title", title: "Step 1 — title", type: "localeString", group: "aboutPage" }),
    defineField({ name: "howIWorkStep1Desc", title: "Step 1 — description", type: "localeText", group: "aboutPage" }),
    defineField({ name: "howIWorkStep2Title", title: "Step 2 — title", type: "localeString", group: "aboutPage" }),
    defineField({ name: "howIWorkStep2Desc", title: "Step 2 — description", type: "localeText", group: "aboutPage" }),
    defineField({ name: "howIWorkStep3Title", title: "Step 3 — title", type: "localeString", group: "aboutPage" }),
    defineField({ name: "howIWorkStep3Desc", title: "Step 3 — description", type: "localeText", group: "aboutPage" }),
    defineField({ name: "skillsHeading", title: "Skills & tools — heading", type: "localeString", group: "aboutPage" }),
    defineField({ name: "skillsIntro", title: "Skills & tools — intro", type: "localeText", group: "aboutPage" }),
    defineField({ name: "aboutCtaHeading", title: "About page — CTA heading", type: "localeString", group: "aboutPage" }),
    defineField({ name: "aboutCtaParagraph", title: "About page — CTA paragraph", type: "localeText", group: "aboutPage" }),
    defineField({ name: "aboutCtaButtonLabel", title: "About page — CTA button label", type: "localeString", group: "aboutPage" }),

    // Contact page — not a homepage section, so no on/off toggle
    defineField({ name: "contactHeading", title: "Contact page — heading", type: "localeString", group: "contactPage" }),
    defineField({ name: "contactIntro", title: "Contact page — intro", type: "localeText", group: "contactPage" }),
    defineField({
      name: "contactFormEndpoint",
      title: "Contact form submission endpoint",
      description: "Where the contact form sends its submissions. Sign up free at formspree.io, create a form pointed at your email, and paste the endpoint it gives you here (looks like https://formspree.io/f/xxxxxxxx). Leave empty and the form will still display, but submissions won't go anywhere until this is set.",
      type: "url",
      group: "contactPage",
    }),

    // Footer
    defineField({ name: "copyrightYear", title: "Copyright year", type: "string", group: "footer" }),
    defineField({ name: "footerNote", title: "Footer note", type: "localeString", group: "footer" }),
    defineField({
      name: "footerLinks",
      title: "Footer — extra links",
      description: "Additional links shown in the footer's LINKS column, after Figma and LinkedIn. Add, remove, or reorder as many as you like.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "footerLink",
          fields: [
            defineField({ name: "label", title: "Label", type: "localeString", validation: (Rule) => Rule.required() }),
            defineField({ name: "url", title: "URL", type: "url", validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: "label.en", subtitle: "url" } },
        }),
      ],
      group: "footer",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Home page" };
    },
  },
});
