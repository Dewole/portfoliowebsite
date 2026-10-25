// Changes the Home page "Stats — big number" (e.g. "6+ YEARS") to lowercase
// ("6+ years") in both languages. You can also just edit the field by hand:
// Home page → Stats section → "Stats — big number".
//
// Run from inside studio/:
//   npx sanity exec scripts/lowercaseStatNumber.mjs --with-user-token
import sanityCli from "sanity/cli";
const { getCliClient } = sanityCli;
const client = getCliClient({ apiVersion: "2024-01-01" });

for (const id of ["siteSettings", "drafts.siteSettings"]) {
  const doc = await client.fetch(`*[_id == $id][0]{ statNumber }`, { id });
  if (!doc || !doc.statNumber) continue;
  const set = {};
  for (const lang of ["en", "pl"]) {
    const v = doc.statNumber[lang];
    if (typeof v === "string" && v !== v.toLowerCase()) set[`statNumber.${lang}`] = v.toLowerCase();
  }
  if (Object.keys(set).length) {
    await client.patch(id).set(set).commit();
    console.log(`${id}:`, Object.entries(set).map(([k, v]) => `${k.split(".")[1].toUpperCase()} → "${v}"`).join(", "));
  }
}
console.log("Done.");
