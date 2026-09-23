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
