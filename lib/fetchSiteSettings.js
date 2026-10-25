const { client, hasProjectId } = require("./sanityClient");

// Fields that are bilingual ({ en, pl }) on the siteSettings document.
// Everything else on the document is shared as-is between languages.
const LOCALE_FIELDS = [
  "aboutBio",
  "aboutKicker", "aboutPageHeading", "aboutPageIntro", "aboutSeoDescription", "aboutBioKicker", "aboutContactLabel", "howIWorkKicker", "skillsKicker", "experienceKicker",
  "role", "metaDescription", "availabilityStatus",
  "heroEyebrow", "heroTitle", "heroSubtitle", "updatedLabel",
  "bioParagraph", "specialties", "proof", "industries",
  "servicesHeading", "servicesSubheading",
  "statsHeading", "statsParagraph", "statNumber", "statCaption",
  "linkedinLabel", "figmaLabel",
  "portfolioKicker", "portfolioHeading", "portfolioIntro", "portfolioLinkLabel", "portfolioPageHeading", "portfolioPageIntro", "productsKicker", "productsHeading", "productsIntro", "productsLinkLabel", "productsPageHeading", "productsPageIntro",
  "bigQuoteLead", "bigQuoteFade", "bigQuoteParagraph",
  "aboutHeading", "aboutParagraph", "aboutBioLong",
  "experienceHeading", "experienceIntro",
  "aboutCtaHeading", "aboutCtaParagraph", "aboutCtaButtonLabel",
  "skillsHeading", "skillsIntro",
  "howIWorkHeading", "howIWorkIntro",
  "howIWorkStep1Title", "howIWorkStep1Desc",
  "howIWorkStep2Title", "howIWorkStep2Desc",
  "howIWorkStep3Title", "howIWorkStep3Desc",
  "contactHeading", "contactIntro",
  "ctaCardHeading", "ctaCardParagraph",
  "finalCtaHeading", "finalCtaSubheading",
  "photographyKicker", "photographyHeading", "photographyIntro", "photographyCtaLabel",
  "footerNote",
];

const QUERY = `*[_type == "siteSettings"][0]{
  name,
  role,
  phone,
  email,
  linkedinUrl,
  figmaUrl,
  linkedinLabel,
  portfolioKicker,
  portfolioHeading,
  portfolioIntro,
  portfolioLinkLabel,
  portfolioPageHeading,
  portfolioPageIntro,
  productsKicker,
  productsHeading,
  productsIntro,
  productsLinkLabel,
  productsPageHeading,
  productsPageIntro,
  figmaLabel,
  metaDescription,
  availabilityStatus,
  "cvUrl": cv.asset->url,
  "profilePhoto": profilePhoto.asset->url,
  "homeSections": homeSections[]{
    _key, show, placeAfter, kicker, title, description, layout, buttonLabel, buttonLink, backgroundColor, backgroundCustom,
    "media": media[]{
      _type, alt,
      "src": select(_type == "attachment" => file.asset->url, asset->url),
      "mimeType": select(_type == "attachment" => file.asset->mimeType, "image"),
      "caption": caption
    }
  },
  "aboutPhotos": aboutPhotos[]{ "url": asset->url, alt, hotspot, crop, "w": asset->metadata.dimensions.width, "h": asset->metadata.dimensions.height },
  "profilePhotoMeta": profilePhoto{ hotspot, crop, "w": asset->metadata.dimensions.width, "h": asset->metadata.dimensions.height },
  "ogImage": ogImage.asset->url,
  siteUrl,
  showLogo,
  showBrandText,
  "logo": logo.asset->url,
  "logoMimeType": logo.asset->mimeType,
  showOverview,
  showAbout,
  showServices,
  showStats,
  showPortfolio,
  showProducts,
  showPhotography,
  showTestimonials,
  showBigQuote,
  showFinalCta,
  heroEyebrow,
  heroTitle,
  heroSubtitle,
  heroHandwriteText,
  "heroBackgroundImage": heroBackgroundImage.asset->url,
  "heroBackgroundAttachment": heroBackgroundAttachment{ "src": asset->url, "mimeType": asset->mimeType },
  heroSplineUrl,
  updatedLabel,
  bioParagraph,
  specialties,
  proof,
  industries,
  servicesHeading,
  servicesSubheading,
  statsHeading,
  statsParagraph,
  statNumber,
  statCaption,
  bigQuoteLead,
  bigQuoteFade,
  bigQuoteParagraph,
  "bigQuoteBackgroundImage": bigQuoteBackgroundImage.asset->url,
  "bigQuoteBackgroundAttachment": bigQuoteBackgroundAttachment{ "src": asset->url, "mimeType": asset->mimeType },
  aboutHeading,
  aboutParagraph,
  aboutBioLong,
  aboutKicker,
  aboutPageHeading,
  aboutPageIntro,
  aboutSeoDescription,
  aboutBioKicker,
  aboutContactLabel,
  howIWorkKicker,
  skillsKicker,
  experienceKicker,
  showHowIWork,
  showSkills,
  showExperience,
  showAboutCta,
  aboutCtaButtonLink,
  "howIWorkStep1Icon": howIWorkStep1Icon.asset->url,
  "howIWorkStep2Icon": howIWorkStep2Icon.asset->url,
  "howIWorkStep3Icon": howIWorkStep3Icon.asset->url,
  experienceHeading,
  experienceIntro,
  aboutCtaHeading,
  skillsHeading,
  skillsIntro,
  aboutCtaParagraph,
  aboutCtaButtonLabel,
  howIWorkHeading,
  howIWorkIntro,
  howIWorkStep1Title,
  howIWorkStep1Desc,
  howIWorkStep2Title,
  howIWorkStep2Desc,
  howIWorkStep3Title,
  howIWorkStep3Desc,
  contactHeading,
  contactIntro,
  contactFormEndpoint,
  ctaCardHeading,
  ctaCardParagraph,
  finalCtaHeading,
  finalCtaSubheading,
  photographyKicker,
  photographyHeading,
  photographyIntro,
  photographyCtaLabel,
  photographyCtaUrl,
  "photographyImages": photographyImages[]{ "src": asset->url },
  copyrightYear,
  footerNote,
  "footerLinks": footerLinks[]{ "label": label.en, "label_pl": label.pl, url }
}`;

let cached = null;

const ABOUT_QUERY = `*[_type == "aboutPage"][0]{
  "aboutBio": aboutBio{ "en": en[]{ ..., _type == "image" => { "url": asset->url, "w": asset->metadata.dimensions.width, "h": asset->metadata.dimensions.height } }, "pl": pl[]{ ..., _type == "image" => { "url": asset->url, "w": asset->metadata.dimensions.width, "h": asset->metadata.dimensions.height } } },
  aboutKicker,
  aboutPageHeading,
  aboutPageIntro,
  aboutSeoDescription,
  "aboutPhotos": aboutPhotos[]{ "url": asset->url, alt, hotspot, crop, "w": asset->metadata.dimensions.width, "h": asset->metadata.dimensions.height },
  aboutBioKicker,
  aboutBioLong,
  aboutContactLabel,
  showHowIWork,
  howIWorkKicker,
  howIWorkHeading,
  howIWorkIntro,
  howIWorkStep1Title,
  howIWorkStep1Desc,
  "howIWorkStep1Icon": howIWorkStep1Icon.asset->url,
  howIWorkStep2Title,
  howIWorkStep2Desc,
  "howIWorkStep2Icon": howIWorkStep2Icon.asset->url,
  howIWorkStep3Title,
  howIWorkStep3Desc,
  "howIWorkStep3Icon": howIWorkStep3Icon.asset->url,
  showSkills,
  skillsKicker,
  skillsHeading,
  skillsIntro,
  showExperience,
  experienceKicker,
  experienceHeading,
  experienceIntro,
  showAboutCta,
  aboutCtaHeading,
  aboutCtaParagraph,
  aboutCtaButtonLabel,
  aboutCtaButtonLink
}`;

async function loadDoc() {
  if (!hasProjectId()) return {};
  if (cached) return cached;
  cached = (await client.fetch(QUERY)) || {};
  // About-page copy lives in its own "aboutPage" document. Anything set there
  // wins; anything still empty falls back to the value previously stored on
  // the Home page document, so the site never loses content mid-migration.
  const about = (await client.fetch(ABOUT_QUERY)) || {};
  for (const [key, value] of Object.entries(about)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value) && !value.length) continue;
    cached[key] = value;
  }
  return cached;
}

// Fetches an animated (.json) logo's raw Lottie data at build time and
// serializes it safely for embedding in a <script> tag. Same reasoning as
// fetchCollection.js's fetchAttachmentJson: Sanity's file CDN doesn't send
// CORS headers, so a browser-side fetch of the logo JSON would be blocked;
// doing it here, server-side, sidesteps that entirely.
const logoJsonCache = new Map();
async function fetchLogoJson(url) {
  if (!url) return null;
  if (logoJsonCache.has(url)) return logoJsonCache.get(url);
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const serialized = JSON.stringify(data).replace(/<\/script/gi, "<\\/script");
    const result = { serialized, width: data && data.w, height: data && data.h };
    logoJsonCache.set(url, result);
    return result;
  } catch (err) {
    return null;
  }
}

module.exports = async function fetchSiteSettings(locale) {
  const doc = await loadDoc();
  const out = {};
  for (const [key, value] of Object.entries(doc)) {
    if (key === "logoMimeType") continue; // internal only — see logoIsAnimated below
    if (LOCALE_FIELDS.includes(key) && value && typeof value === "object") {
      out[key] = value[locale] ?? "";
    } else {
      out[key] = value;
    }
  }
  // A .json logo is a Lottie/Bodymovin animation and needs a different render
  // path (an animation container instead of a plain <img>) — see base.njk.
  out.logoIsAnimated = doc.logoMimeType === "application/json";
  if (out.logoIsAnimated) {
    const result = await fetchLogoJson(doc.logo);
    if (result) {
      out.logoAnimationDataSafe = result.serialized;
      out.logoWidth = result.width;
      out.logoHeight = result.height;
    }
  }
  if (out.heroBackgroundAttachment && out.heroBackgroundAttachment.mimeType === "application/json") {
    const result = await fetchLogoJson(out.heroBackgroundAttachment.src);
    if (result) {
      out.heroBackgroundAttachment.jsonDataSafe = result.serialized;
      out.heroBackgroundAttachment.jsonWidth = result.width;
      out.heroBackgroundAttachment.jsonHeight = result.height;
    }
  }
  if (out.bigQuoteBackgroundAttachment && out.bigQuoteBackgroundAttachment.mimeType === "application/json") {
    const result = await fetchLogoJson(out.bigQuoteBackgroundAttachment.src);
    if (result) {
      out.bigQuoteBackgroundAttachment.jsonDataSafe = result.serialized;
      out.bigQuoteBackgroundAttachment.jsonWidth = result.width;
      out.bigQuoteBackgroundAttachment.jsonHeight = result.height;
    }
  }
  // Profile photo: honour the crop + hotspot chosen in the Studio. The crop
  // becomes a Sanity image-CDN rect, the hotspot becomes object-position so
  // the subject stays in frame whatever shape the photo is cropped to.
  const meta = out.profilePhotoMeta;
  delete out.profilePhotoMeta;
  if (out.profilePhoto && meta && meta.w && meta.h) {
    const c = meta.crop || { left: 0, top: 0, right: 0, bottom: 0 };
    const cw = 1 - (c.left || 0) - (c.right || 0);
    const ch = 1 - (c.top || 0) - (c.bottom || 0);
    if (meta.crop && cw > 0 && ch > 0) {
      const rect = [c.left * meta.w, c.top * meta.h, cw * meta.w, ch * meta.h].map(Math.round).join(",");
      out.profilePhoto = `${out.profilePhoto}?rect=${rect}`;
    }
    if (meta.hotspot && cw > 0 && ch > 0) {
      const clamp = (n) => Math.max(0, Math.min(100, Math.round(n * 100)));
      out.profilePhotoPosition = `${clamp((meta.hotspot.x - (c.left || 0)) / cw)}% ${clamp((meta.hotspot.y - (c.top || 0)) / ch)}%`;
    }
  }

  // Extra homepage sections: pick this locale's copy for each bilingual
  // field, and inline any Lottie .json media (Sanity's CDN has no CORS).
  if (Array.isArray(out.homeSections)) {
    const pick = (v) => (v && typeof v === "object" && !Array.isArray(v) ? (v[locale] ?? "") : v);
    out.homeSections = out.homeSections.filter((s) => s && s.show !== false).map((s) => ({
      ...s,
      kicker: pick(s.kicker), title: pick(s.title), description: pick(s.description), buttonLabel: pick(s.buttonLabel),
      media: Array.isArray(s.media) ? s.media.filter((m) => m && m.src) : [],
    }));
    for (const s of out.homeSections) {
      for (const m of s.media) {
        if (m.mimeType === "application/json") {
          const r = await fetchLogoJson(m.src);
          if (r) { m.jsonDataSafe = r.serialized; m.jsonWidth = r.width; m.jsonHeight = r.height; }
        }
      }
    }
  }

  // About-page photo stack: same crop/hotspot treatment as the profile photo,
  // plus a sensible width for the CDN.
  if (Array.isArray(out.aboutPhotos)) {
    out.aboutPhotos = out.aboutPhotos.filter((p) => p && p.url).map((p) => {
      const c = p.crop || { left: 0, top: 0, right: 0, bottom: 0 };
      const cw = 1 - (c.left || 0) - (c.right || 0);
      const ch = 1 - (c.top || 0) - (c.bottom || 0);
      const params = ["w=900", "auto=format", "q=82"];
      if (p.crop && p.w && p.h && cw > 0 && ch > 0) {
        params.unshift("rect=" + [c.left * p.w, c.top * p.h, cw * p.w, ch * p.h].map(Math.round).join(","));
      }
      let position = "";
      if (p.hotspot && cw > 0 && ch > 0) {
        const clamp = (n) => Math.max(0, Math.min(100, Math.round(n * 100)));
        position = `${clamp((p.hotspot.x - (c.left || 0)) / cw)}% ${clamp((p.hotspot.y - (c.top || 0)) / ch)}%`;
      }
      return { src: `${p.url}?${params.join("&")}`, alt: p.alt || "", position };
    });
  }

  // Canonical / og:url / hreflang need an absolute origin. Prefer the CMS
  // "siteUrl" field; fall back to SITE_URL or Vercel's production domain so
  // those tags never silently disappear. Trailing slash is stripped because
  // templates append page.url (which already starts with "/").
  let siteUrl = out.siteUrl || process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  out.siteUrl = String(siteUrl).trim().replace(/\/+$/, "");
  return out;
};
