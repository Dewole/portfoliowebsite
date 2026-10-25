require("dotenv").config();

module.exports = function (eleventyConfig) {
  // "01", "02", ... for the numbered service cards.
  eleventyConfig.addFilter("pad2", (n) => String(n).padStart(2, "0"));

  // Renders a localeRichText field's portable-text block array to HTML —
  // used as {{ field | portableText | safe }} for any field the CMS lets
  // Emmanuel format with paragraphs, lists, bold/italic, and links.
  eleventyConfig.addFilter("portableText", require("./lib/portableText"));
  eleventyConfig.addFilter("richTextPlain", require("./lib/portableText").plainText);

  // A CMS-entered "live URL" field (case study / product "Site" link) is a
  // plain string, not Sanity's dedicated url type — someone can easily type
  // "kaprexdesign.com" without a protocol. Left as-is, that renders as a
  // *relative* link (e.g. /portfolio/kaprex/kaprexdesign.com) instead of
  // taking the visitor to the actual external site. This prefixes a
  // protocol whenever one is missing, so the link always points out.
  eleventyConfig.addFilter("absoluteUrl", (url) => {
    if (!url) return url;
    const trimmed = String(url).trim();
    if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  });

  // Per-section background colour picked in the CMS. Returns an inline
  // style string (background + a readable text colour chosen from the
  // background's brightness), or "" when no background is set.
  eleventyConfig.addFilter("sectionBg", (section) => {
    if (!section || !section.backgroundColor || section.backgroundColor === "none") return "";
    const presets = { white: "#ffffff", light: "#f1efea", cream: "#f6ecdc", dark: "#16161a", black: "#000000" };
    let hex = section.backgroundColor === "custom" ? String(section.backgroundCustom || "").trim() : presets[section.backgroundColor];
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex || "")) return "";
    let h = hex.slice(1);
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
    return `background:${hex};color:${light ? "#111" : "#fff"};`;
  });

  // true when a section's chosen background is dark (so it can get the
  // site's on-dark styles: light kicker, focus ring, etc.)
  eleventyConfig.addFilter("sectionIsDark", (section) => /color:#fff/.test(eleventyConfig.getFilter("sectionBg")(section)));

  // "+48 660 853 823" -> "tel:+48660853823" so tapping a phone number opens the dialer.
  eleventyConfig.addFilter("telHref", (phone) => {
    const cleaned = String(phone || "").replace(/[^\d+]/g, "");
    return cleaned ? `tel:${cleaned}` : "#";
  });

  // Global typography (lib/typography.js + lib/typography.config.js):
  // Polish "sierotki" non-breaking spaces on /pl/ pages and the editorial
  // "||" heading line-break marker. Runs on every HTML page after it's
  // rendered, so all text — templates, Sanity fields and rich text — gets
  // the same rules without anything being changed in the CMS.
  const { typographyTransform, applyLocaleTypography } = require("./lib/typography");
  eleventyConfig.addTransform("typography", function (content) {
    const out = this.page && this.page.outputPath;
    return out && out.endsWith(".html") ? typographyTransform(content) : content;
  });
  eleventyConfig.addFilter("localeTypography", (text, locale) => applyLocaleTypography(text, locale));

  // Static assets (CSS, JS, fonts) copy straight through to the output.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Content itself now lives in Sanity, not local files, so Eleventy has
  // nothing local to watch that would tell it content changed. This file
  // is touched by `npm run watch:sanity` whenever something is edited in
  // the Studio, which makes the dev server rebuild (and live-reload the
  // browser) as if a template had changed.
  eleventyConfig.addWatchTarget("./sanity-live-reload.json");

  eleventyConfig.setServerOptions({
    port: 8080,
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
