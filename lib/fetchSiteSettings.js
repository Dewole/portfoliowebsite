const { client, hasProjectId } = require("./sanityClient");

// Fields that are bilingual ({ en, pl }) on the siteSettings document.
// Everything else on the document is shared as-is between languages.
const LOCALE_FIELDS = [
  "role", "metaDescription", "availabilityStatus",
  "heroEyebrow", "heroTitle", "heroSubtitle", "updatedLabel",
  "bioParagraph", "specialties", "proof", "industries",
  "servicesHeading", "servicesSubheading",
  "statsHeading", "statsParagraph", "statNumber", "statCaption",
  "linkedinLabel", "figmaLabel",
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
  figmaLabel,
  metaDescription,
  availabilityStatus,
  "cvUrl": cv.asset->url,
  "profilePhoto": profilePhoto.asset->url,
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

async function loadDoc() {
  if (!hasProjectId()) return {};
  if (cached) return cached;
  cached = (await client.fetch(QUERY)) || {};
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
  return out;
};
