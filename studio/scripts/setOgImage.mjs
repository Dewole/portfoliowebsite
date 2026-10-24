// Uploads scripts/og-image.jpg (1200×630, made from the homepage hero) and
// sets it as the Home page's "Social share image". Won't replace an image
// that's already set unless you add --force.
//
// Run from inside studio/:
//   npx sanity exec scripts/setOgImage.mjs --with-user-token
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sanityCli from "sanity/cli";
const { getCliClient } = sanityCli;

const client = getCliClient({ apiVersion: "2024-01-01" });
const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "og-image.jpg");
const force = process.argv.includes("--force");

const current = await client.fetch(`*[_id == "siteSettings"][0]{ "has": defined(ogImage.asset) }`);
if (current && current.has && !force) {
  console.log("A social share image is already set — nothing changed. Re-run with `-- --force` to replace it.");
  process.exit(0);
}
const asset = await client.assets.upload("image", fs.createReadStream(file), { filename: "dewole-og-image.jpg", contentType: "image/jpeg" });
await client
  .transaction()
  .createIfNotExists({ _id: "siteSettings", _type: "siteSettings" })
  .patch("siteSettings", (p) => p.set({ ogImage: { _type: "image", asset: { _type: "reference", _ref: asset._id } } }))
  .commit();
console.log("Done — the hero OG image is now the Home page → Social share image.");
