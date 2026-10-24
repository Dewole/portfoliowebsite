// One-time: copies the old plain-text About bio (EN + PL) into the new
// rich-text "Long bio" editor, one paragraph per blank-line-separated block.
// Never overwrites a language that already has content in the editor.
// Safe to re-run.
//
// Run from inside studio/:
//   npx sanity exec scripts/convertAboutBio.mjs --with-user-token
import sanityCli from "sanity/cli";
const { getCliClient } = sanityCli;

const client = getCliClient({ apiVersion: "2024-01-01" });
const key = () => Math.random().toString(36).slice(2, 12);

function toBlocks(text) {
  return String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({
      _type: "block", _key: key(), style: "normal", markDefs: [],
      children: [{ _type: "span", _key: key(), text: p, marks: [] }],
    }));
}

const about = (await client.fetch(`*[_id == "aboutPage"][0]{ aboutBio, aboutBioLong }`)) || {};
const home = (await client.fetch(`*[_id == "siteSettings"][0]{ aboutBioLong }`)) || {};
const old = about.aboutBioLong || home.aboutBioLong || {};
const current = about.aboutBio || {};

const set = {};
for (const lang of ["en", "pl"]) {
  if ((!current[lang] || !current[lang].length) && old[lang]) set[`aboutBio.${lang}`] = toBlocks(old[lang]);
}

const tx = client.transaction();
tx.createIfNotExists({ _id: "aboutPage", _type: "aboutPage" });
if (Object.keys(set).length) tx.patch("aboutPage", (p) => p.setIfMissing({ aboutBio: { _type: "localeRichTextFull" } }).set(set));
await tx.commit();
console.log(Object.keys(set).length ? `Copied the bio into the editor for: ${Object.keys(set).map((k) => k.split(".")[1].toUpperCase()).join(", ")}` : "Nothing to copy — the editor already has content (or there was no old bio).");
