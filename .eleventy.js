require("dotenv").config();

module.exports = function (eleventyConfig) {
  // "01", "02", ... for the numbered service cards.
  eleventyConfig.addFilter("pad2", (n) => String(n).padStart(2, "0"));

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
