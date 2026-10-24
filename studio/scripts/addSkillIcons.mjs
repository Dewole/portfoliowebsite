// Gives every Skill / Tool in the CMS a matching icon or logo:
//  - tool logos (Figma, Webflow, Framer, Notion, Blender, React…) from
//    Simple Icons (CC0)
//  - duotone icons for everything else (Illustrator, Photoshop, Branding,
//    UX research, Prototyping…) from Phosphor Icons, duotone weight (MIT),
//    recoloured in the site's blues.
// The icon files live in scripts/skill-icons/; icon-map.json says which
// words in a skill's name pick which icon (first match wins).
// Skills that already have an icon are left alone unless you add --force.
//
// Run from inside studio/:
//   npx sanity exec scripts/addSkillIcons.mjs --with-user-token
//   npx sanity exec scripts/addSkillIcons.mjs --with-user-token -- --force
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sanityCli from "sanity/cli";
const { getCliClient } = sanityCli;

const client = getCliClient({ apiVersion: "2024-01-01" });
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "skill-icons");
const MAP = JSON.parse(fs.readFileSync(path.join(DIR, "icon-map.json"), "utf8"));
const force = process.argv.includes("--force");

const pick = (name) => {
  const n = ` ${String(name || "").toLowerCase()} `;
  const hit = MAP.find((r) => r.match.some((k) => n.includes(k)));
  return hit ? hit.file : null;
};

const skills = await client.fetch(`*[_type == "skill" && !(_id in path("drafts.**"))]{ _id, "name": name.en, "hasIcon": defined(icon.asset) }`);
const uploaded = new Map();
let done = 0;
const unmatched = [];
for (const s of skills) {
  if (s.hasIcon && !force) { console.log(`• ${s.name}: already has an icon — skipped`); continue; }
  const file = pick(s.name);
  if (!file) { unmatched.push(s.name); continue; }
  if (!uploaded.has(file)) {
    const asset = await client.assets.upload("image", fs.createReadStream(path.join(DIR, file)), { filename: `skill-${file}`, contentType: "image/svg+xml" });
    uploaded.set(file, asset._id);
  }
  await client.patch(s._id).set({ icon: { _type: "image", asset: { _type: "reference", _ref: uploaded.get(file) } } }).commit();
  console.log(`✓ ${s.name} → ${file.replace(".svg", "")}`);
  done++;
}
console.log(`\nAdded ${done} icon(s).`);
if (unmatched.length) console.log(`No icon match for: ${unmatched.join(", ")} — upload one by hand in the Studio, or tell Claude the names.`);
