// Live-preview helper for local development. Eleventy only refetches
// content from Sanity when it rebuilds, and Eleventy's --watch mode only
// rebuilds when a *local file* changes — it has no idea Sanity content
// changed. This script bridges the gap: it opens a real-time connection to
// Sanity (the Listen API) and, whenever any of our document types is
// created/edited/published, touches a local trigger file. Eleventy is
// watching that file (see .eleventy.js) and rebuilds when it changes —
// so a save in the Studio shows up in the browser a second or two later.
//
// Run this alongside `npm start` in a second terminal tab:
//   npm run watch:sanity

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { createClient } from "@sanity/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRIGGER_FILE = path.join(__dirname, "..", "sanity-live-reload.json");

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";

if (!projectId) {
  console.error("SANITY_PROJECT_ID is not set — copy .env.example to .env first.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_TOKEN, // optional — only needed for a private dataset
  useCdn: false,
});

const WATCHED_TYPES = [
  "siteSettings",
  "caseStudy",
  "product",
  "testimonial",
  "experience",
  "service",
];

function touchTriggerFile(reason) {
  fs.writeFileSync(
    TRIGGER_FILE,
    JSON.stringify({ updatedAt: Date.now(), reason }, null, 2)
  );
  console.log(`[watch-sanity] change detected (${reason}) — Eleventy will rebuild.`);
}

// Make sure the file exists before Eleventy starts watching it.
if (!fs.existsSync(TRIGGER_FILE)) touchTriggerFile("initial");

const query = `*[_type in [${WATCHED_TYPES.map((t) => `"${t}"`).join(", ")}]]`;

console.log(`[watch-sanity] listening for changes in dataset "${dataset}"...`);
console.log("[watch-sanity] leave this running, and run `npm start` in another tab.");

const subscription = client.listen(query, {}, { includeResult: false }).subscribe({
  next: (event) => touchTriggerFile(`${event.transition} ${event.documentId}`),
  error: (err) => {
    console.error("[watch-sanity] listen error:", err.message);
  },
});

process.on("SIGINT", () => {
  subscription.unsubscribe();
  process.exit(0);
});
