// One-time move: copies the About-page content that used to live on the
// "Home page" document into the new "About page" document, then removes it
// from the Home page document so it isn't shown twice. Safe to re-run: it
// never overwrites anything already filled in on the About page.
//
// Run from inside studio/:
//   npx sanity exec scripts/moveAboutPage.mjs --with-user-token
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2024-01-01" });
const FIELDS = ["aboutKicker", "aboutPageHeading", "aboutPageIntro", "aboutSeoDescription", "aboutPhotos", "aboutBioKicker", "aboutBioLong", "aboutContactLabel", "showHowIWork", "howIWorkKicker", "howIWorkHeading", "howIWorkIntro", "howIWorkStep1Title", "howIWorkStep1Desc", "howIWorkStep1Icon", "howIWorkStep2Title", "howIWorkStep2Desc", "howIWorkStep2Icon", "howIWorkStep3Title", "howIWorkStep3Desc", "howIWorkStep3Icon", "showSkills", "skillsKicker", "skillsHeading", "skillsIntro", "showExperience", "experienceKicker", "experienceHeading", "experienceIntro", "showAboutCta", "aboutCtaHeading", "aboutCtaParagraph", "aboutCtaButtonLabel", "aboutCtaButtonLink"];

const source = await client.fetch(`*[_id == "siteSettings"][0]`);
const draftSource = await client.fetch(`*[_id == "drafts.siteSettings"][0]`);
const target = (await client.fetch(`*[_id == "aboutPage"][0]`)) || {};

const toSet = {};
for (const f of FIELDS) {
  const value = (draftSource && draftSource[f] != null) ? draftSource[f] : source && source[f];
  if (value != null && target[f] == null) toSet[f] = value;
}

const tx = client.transaction();
tx.createIfNotExists({ _id: "aboutPage", _type: "aboutPage" });
if (Object.keys(toSet).length) tx.patch("aboutPage", (p) => p.set(toSet));
if (source) tx.patch("siteSettings", (p) => p.unset(FIELDS));
if (draftSource) tx.patch("drafts.siteSettings", (p) => p.unset(FIELDS));
await tx.commit();

console.log(`Moved ${Object.keys(toSet).length} field(s) to the About page:`, Object.keys(toSet).join(", ") || "(nothing new)");
console.log("Done. Open the Studio → About page to check.");
