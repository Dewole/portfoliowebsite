const { client, hasProjectId } = require("./sanityClient");

// Every projection below reproduces the exact shape the old Decap-CMS JSON
// files had (flat fields, "<field>_pl" companions, "images": [{ src }]) so
// nothing downstream (lib/localize.js, the .njk templates) has to change.
const IMAGES = `"images": images[]{ "src": asset->url }`;
const ATTACHMENTS = `"attachments": attachments[]{ "caption": caption, "src": file.asset->url, "filename": file.asset->originalFilename, "mimeType": file.asset->mimeType }`;
const HERO_ATTACHMENT = `"heroAttachment": heroAttachment{ "src": asset->url, "mimeType": asset->mimeType }`;
const SECTIONS = `"sections": sections[]{
    "title": title.en, "title_pl": title.pl,
    "description": description.en, "description_pl": description.pl,
    layout,
    "media": media[]{
      _type,
      "src": select(_type == "attachment" => file.asset->url, asset->url),
      "mimeType": select(_type == "attachment" => file.asset->mimeType, "image"),
      "caption": caption
    }
  }`;

const QUERIES = {
  "case-studies": `*[_type == "caseStudy"] | order(order asc) {
    order,
    "slug": slug.current,
    "title": title.en, "title_pl": title.pl,
    "tag": tag.en, "tag_pl": tag.pl,
    "category": category.en, "category_pl": category.pl,
    date,
    "coverImage": coverImage.asset->url,
    "heroImage": heroImage.asset->url,
    ${HERO_ATTACHMENT},
    "galleryKicker": galleryKicker.en, "galleryKicker_pl": galleryKicker.pl,
    "role": role.en, "role_pl": role.pl,
    "overview": overview.en, "overview_pl": overview.pl,
    "secondaryDescription": secondaryDescription.en, "secondaryDescription_pl": secondaryDescription.pl,
    "client": client.en, "client_pl": client.pl,
    "services": services.en, "services_pl": services.pl,
    ${SECTIONS},
    link,
    ${IMAGES},
    ${ATTACHMENTS}
  }`,
  products: `*[_type == "product"] | order(order asc) {
    order,
    "slug": slug.current,
    "name": name.en, "name_pl": name.pl,
    "description": description.en, "description_pl": description.pl,
    status,
    "category": category.en, "category_pl": category.pl,
    "coverImage": coverImage.asset->url,
    "heroImage": heroImage.asset->url,
    ${HERO_ATTACHMENT},
    link,
    "overviewKicker": overviewKicker.en, "overviewKicker_pl": overviewKicker.pl,
    "overviewHeading": overviewHeading.en, "overviewHeading_pl": overviewHeading.pl,
    "galleryKicker": galleryKicker.en, "galleryKicker_pl": galleryKicker.pl,
    "problem": problem.en, "problem_pl": problem.pl,
    "approach": approach.en, "approach_pl": approach.pl,
    "outcome": outcome.en, "outcome_pl": outcome.pl,
    ${SECTIONS},
    ${IMAGES},
    ${ATTACHMENTS}
  }`,
  testimonials: `*[_type == "testimonial"] | order(order asc) {
    order,
    "quote": quote.en, "quote_pl": quote.pl,
    "name": name.en, "name_pl": name.pl,
    rating
  }`,
  experience: `*[_type == "experience"] | order(order asc) {
    order,
    "company": company.en, "company_pl": company.pl,
    "role": role.en, "role_pl": role.pl,
    "period": period.en, "period_pl": period.pl,
    "description": description.en, "description_pl": description.pl
  }`,
  services: `*[_type == "service"] | order(order asc) {
    order,
    "title": title.en, "title_pl": title.pl,
    "description": description.en, "description_pl": description.pl,
    "iconUrl": icon.asset->url
  }`,
  skills: `*[_type == "skill"] | order(order asc) {
    order,
    "name": name.en, "name_pl": name.pl,
    "icon": icon.asset->url
  }`,
};

// Fetches the raw SVG markup for a custom service icon at build time, so it
// can be inlined directly into the page (rather than referenced via <img>).
// Inlining is what lets the existing hover CSS -- which targets the icon's
// inner SVG shapes via ".service-icon svg > *:nth-child(n)" -- keep working
// for custom icons, exactly as it does for the built-in ones.
const svgCache = new Map();
async function fetchIconSvg(url) {
  if (!url) return null;
  if (svgCache.has(url)) return svgCache.get(url);
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    let svg = await res.text();
    // Strip XML prolog/doctype/comments; keep just the <svg>...</svg> markup.
    svg = svg.replace(/<\?xml[^>]*\?>/gi, "");
    svg = svg.replace(/<!DOCTYPE[^>]*>/gi, "");
    svg = svg.replace(/<!--[\s\S]*?-->/g, "");
    const match = svg.match(/<svg[\s\S]*<\/svg>/i);
    svg = (match ? match[0] : svg).trim();
    svgCache.set(url, svg);
    return svg;
  } catch (err) {
    return null;
  }
}

// Fetches a Lottie/Bodymovin JSON attachment's raw data at build time and
// serializes it to a string safe to embed inside a <script> tag.
//
// Why this is needed: Sanity's *file* asset CDN (cdn.sanity.io/files/...) --
// unlike its *image* CDN -- doesn't send CORS headers, so a browser-side
// fetch()/XHR for the JSON (which is what lottie-web's `path` option does)
// is blocked by the browser and the animation never loads. Fetching it here,
// server-side during the Eleventy build, has no such restriction, so the
// data is embedded directly into the page instead of being fetched by the
// visitor's browser at all.
const jsonCache = new Map();
async function fetchAttachmentJson(url) {
  if (!url) return null;
  if (jsonCache.has(url)) return jsonCache.get(url);
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    // Escape any literal "</script" so the serialized data can't break out
    // of the <script type="application/json"> tag it gets embedded in.
    const serialized = JSON.stringify(data).replace(/<\/script/gi, "<\\/script");
    // A Lottie/Bodymovin file's own "w"/"h" (its native artboard size) is
    // what the gallery tile should size itself to, rather than a fixed
    // square — a portrait or landscape animation shouldn't get squashed.
    const result = { serialized, width: data && data.w, height: data && data.h };
    jsonCache.set(url, result);
    return result;
  } catch (err) {
    return null;
  }
}

module.exports = async function fetchCollection(name) {
  if (!hasProjectId()) return [];
  const query = QUERIES[name];
  if (!query) throw new Error(`Unknown Sanity collection: "${name}"`);
  const items = await client.fetch(query);
  if (name === "services") {
    await Promise.all(
      items.map(async (item) => {
        if (item.iconUrl) {
          item.iconSvg = await fetchIconSvg(item.iconUrl);
        }
      })
    );
  }
  if (name === "case-studies" || name === "products") {
    await Promise.all(
      items.map(async (item) => {
        const tasks = [];
        if (Array.isArray(item.attachments)) {
          for (const att of item.attachments) {
            if (att.mimeType === "application/json") {
              tasks.push(
                fetchAttachmentJson(att.src).then((result) => {
                  if (result) {
                    att.jsonDataSafe = result.serialized;
                    att.jsonWidth = result.width;
                    att.jsonHeight = result.height;
                  }
                })
              );
            }
          }
        }
        if (item.heroAttachment && item.heroAttachment.mimeType === "application/json") {
          tasks.push(
            fetchAttachmentJson(item.heroAttachment.src).then((result) => {
              if (result) {
                item.heroAttachment.jsonDataSafe = result.serialized;
                item.heroAttachment.jsonWidth = result.width;
                item.heroAttachment.jsonHeight = result.height;
              }
            })
          );
        }
        if (Array.isArray(item.sections)) {
          for (const section of item.sections) {
            if (!Array.isArray(section.media)) continue;
            for (const m of section.media) {
              if (m.mimeType === "application/json") {
                tasks.push(
                  fetchAttachmentJson(m.src).then((result) => {
                    if (result) {
                      m.jsonDataSafe = result.serialized;
                      m.jsonWidth = result.width;
                      m.jsonHeight = result.height;
                    }
                  })
                );
              }
            }
          }
        }
        await Promise.all(tasks);
      })
    );
  }
  return items.map((item) => ({ ...item, slug: item.slug || "" }));
};
