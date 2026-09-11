require("dotenv").config();
const { createClient } = require("@sanity/client");

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";

// Read-only, CDN-backed client used at Eleventy build time. Falls back to a
// placeholder project id so requiring this file never crashes before the
// user has set up their .env — fetchCollection()/fetchSiteSettings() below
// check for a real project id and return empty data instead of querying.
// useCdn:false in dev so `npm run watch:sanity` + a Studio edit shows up on
// the next rebuild immediately, instead of waiting out the CDN's cache.
// Production builds (Vercel sets NODE_ENV=production) use the faster CDN.
const client = createClient({
  projectId: projectId || "placeholder-project",
  dataset,
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  useCdn: process.env.NODE_ENV === "production",
});

let warned = false;
function hasProjectId() {
  if (!projectId) {
    if (!warned) {
      console.warn(
        "[sanity] SANITY_PROJECT_ID is not set (see .env.example) — the site will build with empty content until it is."
      );
      warned = true;
    }
    return false;
  }
  return true;
}

module.exports = { client, hasProjectId };
