// One-time (safely re-runnable) migration: reads the old Decap-CMS content
// files from ../content/*.json and ../src/assets/*, and writes matching
// documents into Sanity so the Studio starts out prefilled instead of empty.
//
// Usage (from inside studio/):
//   npm install
//   cp .env.example .env   # then fill in the real values
//   npm run migrate

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { createClient } from "@sanity/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..", "..");
const CONTENT_DIR = path.join(REPO_ROOT, "content");
const ASSETS_DIR = path.join(REPO_ROOT, "src", "assets");

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing SANITY_STUDIO_PROJECT_ID or SANITY_API_TOKEN.\n" +
    "Copy studio/.env.example to studio/.env and fill in real values first."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const assetCache = new Map();

// Uploads a local file (relative to src/assets/) as a Sanity asset, once,
// and reuses the same asset document on subsequent runs.
async function uploadAsset(relativePath, kind /* "image" | "file" */) {
  if (!relativePath) return null;
  const cleanRel = relativePath.replace(/^\/assets\//, "");
  const cacheKey = `${kind}:${cleanRel}`;
  if (assetCache.has(cacheKey)) return assetCache.get(cacheKey);

  const absPath = path.join(ASSETS_DIR, cleanRel);
  if (!fs.existsSync(absPath)) {
    console.warn(`  ! skipping missing asset: ${absPath}`);
    return null;
  }

  const stream = fs.createReadStream(absPath);
  const filename = path.basename(absPath);
  const asset =
    kind === "image"
      ? await client.assets.upload("image", stream, { filename })
      : await client.assets.upload("file", stream, { filename });

  const ref = { _type: kind, asset: { _type: "reference", _ref: asset._id } };
  assetCache.set(cacheKey, ref);
  return ref;
}

function readJson(...segments) {
  const p = path.join(CONTENT_DIR, ...segments);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function readCollection(folder) {
  const dir = path.join(CONTENT_DIR, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((file) => {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      data.__slug = file.replace(/\.json$/, "");
      return data;
    });
}

// Turns { title: "...", title_pl: "..." } into { en: "...", pl: "..." }
function locale(item, key) {
  return { en: item[key] ?? "", pl: item[`${key}_pl`] ?? "" };
}

async function migrateSiteSettings() {
  console.log("Migrating Site Settings...");
  const en = readJson("site.json");
  const pl = readJson("site.pl.json");
  const both = (key) => ({ en: en[key] ?? "", pl: pl[key] ?? "" });

  const cv = await uploadAsset(en.cvUrl, "file");

  const doc = {
    _id: "siteSettings",
    _type: "siteSettings",
    name: en.name || "",
    role: both("role"),
    phone: en.phone || "",
    email: en.email || "",
    linkedinUrl: en.linkedinUrl || undefined,
    figmaUrl: en.figmaUrl || undefined,
    metaDescription: both("metaDescription"),
    availabilityStatus: both("availabilityStatus"),
    cv: cv || undefined,
    heroEyebrow: both("heroEyebrow"),
    heroTitle: both("heroTitle"),
    heroSubtitle: both("heroSubtitle"),
    heroHandwriteText: en.heroHandwriteText || "",
    updatedLabel: both("updatedLabel"),
    bioParagraph: both("bioParagraph"),
    specialties: both("specialties"),
    proof: both("proof"),
    industries: both("industries"),
    servicesHeading: both("servicesHeading"),
    servicesSubheading: both("servicesSubheading"),
    statsHeading: both("statsHeading"),
    statsParagraph: both("statsParagraph"),
    statNumber: both("statNumber"),
    statCaption: both("statCaption"),
    bigQuoteLead: both("bigQuoteLead"),
    bigQuoteFade: both("bigQuoteFade"),
    bigQuoteParagraph: both("bigQuoteParagraph"),
    aboutHeading: both("aboutHeading"),
    aboutParagraph: both("aboutParagraph"),
    aboutBioLong: both("aboutBioLong"),
    experienceHeading: both("experienceHeading"),
    experienceIntro: both("experienceIntro"),
    aboutCtaHeading: both("aboutCtaHeading"),
    aboutCtaParagraph: both("aboutCtaParagraph"),
    aboutCtaButtonLabel: both("aboutCtaButtonLabel"),
    howIWorkHeading: both("howIWorkHeading"),
    howIWorkIntro: both("howIWorkIntro"),
    howIWorkStep1Title: both("howIWorkStep1Title"),
    howIWorkStep1Desc: both("howIWorkStep1Desc"),
    howIWorkStep2Title: both("howIWorkStep2Title"),
    howIWorkStep2Desc: both("howIWorkStep2Desc"),
    howIWorkStep3Title: both("howIWorkStep3Title"),
    howIWorkStep3Desc: both("howIWorkStep3Desc"),
    contactHeading: both("contactHeading"),
    contactIntro: both("contactIntro"),
    ctaCardHeading: both("ctaCardHeading"),
    ctaCardParagraph: both("ctaCardParagraph"),
    finalCtaHeading: both("finalCtaHeading"),
    finalCtaSubheading: both("finalCtaSubheading"),
    photographyKicker: both("photographyKicker"),
    photographyHeading: both("photographyHeading"),
    photographyIntro: both("photographyIntro"),
    photographyCtaLabel: both("photographyCtaLabel"),
    photographyCtaUrl: en.photographyCtaUrl || undefined,
    photographyImages: [],
    copyrightYear: en.copyrightYear || "",
    footerNote: both("footerNote"),
  };

  if (Array.isArray(en.photographyImages) && en.photographyImages.length) {
    doc.photographyImages = (
      await Promise.all(en.photographyImages.map((img) => uploadAsset(img.src, "image")))
    ).filter(Boolean);
  } else {
    // Nothing to migrate for this field — don't overwrite whatever's
    // already in Sanity (e.g. photos added directly in the Studio).
    delete doc.photographyImages;
  }
  if (!cv) delete doc.cv; // same idea: don't clobber a CV uploaded in the Studio

  // createIfNotExists + patch (not createOrReplace): a re-run of this script
  // only touches the text fields it actually migrates. profilePhoto and any
  // image fields left untouched above are preserved even if this has been
  // run before and someone has since edited things in the Studio.
  const { _id, _type, ...fieldsToSet } = doc;
  await client.createIfNotExists({ _id, _type });
  await client.patch(_id).set(fieldsToSet).commit();
  console.log("  done.");
}

async function migrateImagesAndAttachments(item) {
  const images = Array.isArray(item.images)
    ? (await Promise.all(item.images.map((img) => uploadAsset(img.src, "image")))).filter(Boolean)
    : [];
  return images;
}

async function migrateCollection({ folder, type, idPrefix, fields, identifierField }) {
  console.log(`Migrating ${type} (content/${folder})...`);
  const items = readCollection(folder);
  for (const item of items) {
    const doc = {
      _id: `${idPrefix}-${item.__slug}`,
      _type: type,
      order: typeof item.order === "number" ? item.order : 1,
    };
    if ("slug" in fields) {
      doc.slug = { _type: "slug", current: item.__slug };
    }
    for (const [key, kind] of Object.entries(fields)) {
      if (key === "slug") continue;
      if (kind === "locale") doc[key] = locale(item, key);
      else if (kind === "flat") doc[key] = item[key] ?? "";
      else if (kind === "number") doc[key] = item[key];
    }
    if (type === "caseStudy" || type === "product") {
      const images = await migrateImagesAndAttachments(item);
      // Only set "images" if the old content file actually had some —
      // otherwise leave whatever's already in Sanity (e.g. a cover photo or
      // gallery added directly in the Studio) untouched on a re-run.
      if (images.length) doc.images = images;
    }

    const { _id, _type, ...fieldsToSet } = doc;
    await client.createIfNotExists({ _id, _type });
    await client.patch(_id).set(fieldsToSet).commit();
    console.log(`  - ${item.__slug} (${item[identifierField] || item.__slug})`);
  }
}

async function run() {
  await migrateSiteSettings();

  await migrateCollection({
    folder: "case-studies",
    type: "caseStudy",
    idPrefix: "caseStudy",
    identifierField: "title",
    fields: {
      slug: true,
      title: "locale",
      tag: "locale",
      category: "locale",
      date: "flat",
      thumbClass: "flat",
      client: "locale",
      role: "locale",
      overview: "locale",
      objective: "locale",
      approach: "locale",
      outcome: "locale",
      link: "flat",
    },
  });

  await migrateCollection({
    folder: "products",
    type: "product",
    idPrefix: "product",
    identifierField: "name",
    fields: {
      slug: true,
      name: "locale",
      description: "locale",
      status: "flat",
      category: "locale",
      thumbClass: "flat",
      link: "flat",
      problem: "locale",
      approach: "locale",
      outcome: "locale",
    },
  });

  await migrateCollection({
    folder: "testimonials",
    type: "testimonial",
    idPrefix: "testimonial",
    identifierField: "name",
    fields: {
      quote: "locale",
      name: "locale",
      rating: "number",
    },
  });

  await migrateCollection({
    folder: "experience",
    type: "experience",
    idPrefix: "experience",
    identifierField: "company",
    fields: {
      company: "locale",
      role: "locale",
      period: "locale",
      description: "locale",
    },
  });

  await migrateCollection({
    folder: "services",
    type: "service",
    idPrefix: "service",
    identifierField: "title",
    fields: {
      title: "locale",
      description: "locale",
    },
  });

  console.log("\nAll done! Open the Studio (npm run dev) to review the imported content.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
