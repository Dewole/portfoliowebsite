// Central SEO logic for every page: titles, meta descriptions, share
// images, canonical URLs, indexing and JSON-LD structured data.
//
// Each template has a tiny "<template>.11tydata.js" next to it that calls
// seoPage(kind, locale). Values typed into the CMS ("Search & sharing"
// fields) always win; when they're empty, sensible defaults are built from
// the page's own content. Nothing here invents facts — every value comes
// from the CMS or from the site's fixed copy.
const { plainText } = require("./portableText");

const T = {
  en: {
    country: (c) => c || "Poland",
    home: (d) => `${d.full} (${d.brand}) — ${d.role}, ${d.city}`,
    homeDesc: (d) => `Portfolio of ${d.full}, ${d.role} in ${d.city}, ${d.country} — UI/UX, product, web and brand identity design for teams in Europe and remote.`,
    about: (d) => `About ${d.full} — ${d.role}`,
    aboutDesc: (d) => `${d.full} is a ${d.role} in ${d.city}, ${d.country}: experience, process, skills and tools across UI/UX, product, web and brand identity design.`,
    portfolio: (d) => `UI/UX & Product Design Case Studies | ${d.brand}`,
    portfolioDesc: (d) => `Selected UI/UX, product, web and brand identity case studies by ${d.full}, ${d.role} in ${d.city} — the problem, the process and the outcome.`,
    products: (d) => `Digital Products I Design & Build | ${d.brand}`,
    productsDesc: (d) => `Independent digital products designed and built end-to-end by ${d.full} — brand, UX/UI, front end and launch.`,
    contact: (d) => `Contact — Hire a Product & UI/UX Designer | ${d.brand}`,
    contactDesc: (d) => `Hire ${d.full}, ${d.role} in ${d.city}, ${d.country}, for product design, UI/UX, websites or brand identity — on-site or remote.`,
    caseStudy: (x, d) => `${x}${d.cat ? ` — ${d.cat}` : ""} Case Study | ${d.brand}`,
    product: (x, d) => `${x}${d.cat ? ` — ${d.cat}` : ""} | Product by ${d.brand}`,
    notFound: (d) => `Page not found | ${d.brand}`,
    crumbs: { home: "Home", portfolio: "Portfolio", products: "Products", about: "About", contact: "Contact" },
  },
  pl: {
    country: (c) => (c === "Poland" || !c ? "Polska" : c),
    home: (d) => `${d.full} (${d.brand}) — ${d.role}, ${d.city}`,
    homeDesc: (d) => `${d.full} — ${d.role}, ${d.city}. Projektowanie UI/UX, produktów cyfrowych, stron www i identyfikacji marki dla firm w Polsce i zdalnie.`,
    about: (d) => `O mnie — ${d.full}, ${d.role}`,
    aboutDesc: (d) => `${d.full} — ${d.role} (${d.city}, ${d.country}): doświadczenie, proces pracy, umiejętności i narzędzia w UI/UX, projektowaniu produktów, stron www i marek.`,
    portfolio: (d) => `Studia przypadków UI/UX i projektowania produktów | ${d.brand}`,
    portfolioDesc: (d) => `Wybrane projekty UI/UX, produktów cyfrowych, stron www i identyfikacji marki — ${d.full}, ${d.city}. Problem, proces i efekt.`,
    products: (d) => `Produkty cyfrowe, które projektuję i buduję | ${d.brand}`,
    productsDesc: (d) => `Własne produkty cyfrowe zaprojektowane i zbudowane od A do Z przez ${d.full} — marka, UX/UI, front end i wdrożenie.`,
    contact: (d) => `Kontakt — projektant produktów i UI/UX | ${d.brand}`,
    contactDesc: (d) => `Porozmawiajmy o projekcie: projektowanie produktów, UI/UX, strony www lub identyfikacja marki. ${d.full}, ${d.city} — stacjonarnie lub zdalnie.`,
    caseStudy: (x, d) => `${x}${d.cat ? ` — ${d.cat}` : ""} | Studium przypadku | ${d.brand}`,
    product: (x, d) => `${x}${d.cat ? ` — ${d.cat}` : ""} | ${d.brand}`,
    notFound: (d) => `Nie znaleziono strony | ${d.brand}`,
    crumbs: { home: "Strona główna", portfolio: "Portfolio", products: "Produkty", about: "O mnie", contact: "Kontakt" },
  },
};

const clean = (s) => String(s || "").replace(/\s*\|\|\s*/g, " ").replace(/\s+/g, " ").trim();
const asText = (v) => (Array.isArray(v) ? plainText(v) : clean(v));
function truncate(s, max) {
  s = clean(s);
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6)).replace(/[\s,;:.—–-]+$/, "") + "…";
}
const shortTitle = (s, max = 42) => truncate(s, max);

function absolute(url, siteUrl) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return siteUrl ? siteUrl + (url.startsWith("/") ? url : "/" + url) : "";
}
// Sanity image → 1200×630 crop for link previews
function shareImage(url) {
  if (!url || !/cdn\.sanity\.io\/images\//.test(url) || /\.svg(\?|$)/.test(url)) return url || "";
  return url + (url.includes("?") ? "&" : "?") + "w=1200&h=630&fit=crop&auto=format&q=80";
}

// Obvious placeholder/demo content that shouldn't be in Google.
const PLACEHOLDER = /\b(20XX|Month 20\w*|Product Name|\[Company|Company Name\]|lorem ipsum|placeholder)\b/i;
function isPlaceholder(item) {
  if (!item) return false;
  const slug = String(item.slug || "");
  if (/^(case|product)-(one|two|three|four|five|six|seven|eight|nine|ten|\d+)$/i.test(slug)) return true;
  const name = clean(item.title || item.name);
  if (name.length > 0 && name.length < 4) return true;
  const hay = [item.title, item.name, item.date, item.client, item.description, asText(item.overview)].map(clean).join(" ");
  return PLACEHOLDER.test(hay);
}
function decideNoindex(item, seo) {
  const mode = (seo && seo.indexing) || "auto";
  if (mode === "noindex") return true;
  if (mode === "index") return false;
  return isPlaceholder(item);
}

function ctx(data, locale) {
  const site = (locale === "pl" ? data.sitePl : data.site) || {};
  const t = T[locale];
  const siteUrl = site.siteUrl || "";
  const d = {
    site, t, siteUrl, locale,
    brand: site.name || "Dewole",
    full: site.fullName || "Emmanuel Ikuesan",
    role: clean(site.seoJobTitle || site.role || (locale === "pl" ? "Projektant produktów i marek" : "Product & Brand Designer")),
    city: site.seoCity || "Poznań",
    country: t.country(site.seoCountry),
    countryCode: site.seoCountryCode || "PL",
    prefix: locale === "pl" ? "/pl" : "",
  };
  return d;
}

function personNode(d, data) {
  const s = d.site;
  const services = (d.locale === "pl" ? data.servicesPl : data.services) || [];
  const skills = (d.locale === "pl" ? data.skillsPl : data.skills) || [];
  const knows = [...new Set([...services.map((x) => clean(x.title)), ...skills.map((x) => clean(x.name))].filter(Boolean))].slice(0, 25);
  const sameAs = [s.linkedinUrl, s.figmaUrl, ...(Array.isArray(s.seoProfiles) ? s.seoProfiles : [])].filter((u) => /^https?:\/\//.test(u || ""));
  const node = {
    "@type": "Person",
    "@id": `${d.siteUrl}/#person`,
    name: d.full,
    alternateName: d.brand !== d.full ? d.brand : undefined,
    jobTitle: d.role,
    url: d.siteUrl + "/",
    image: absolute(s.profilePhoto, d.siteUrl) || undefined,
    email: s.email ? `mailto:${s.email}` : undefined,
    address: { "@type": "PostalAddress", addressLocality: d.city, addressCountry: d.countryCode },
    sameAs: sameAs.length ? sameAs : undefined,
    knowsAbout: knows.length ? knows : undefined,
    worksFor: s.seoEmployer ? { "@type": "Organization", name: s.seoEmployer } : undefined,
  };
  return node;
}
const websiteNode = (d) => ({
  "@type": "WebSite",
  "@id": `${d.siteUrl}/#website`,
  url: d.siteUrl + "/",
  name: d.brand,
  alternateName: d.full,
  inLanguage: ["en", "pl"],
  publisher: { "@id": `${d.siteUrl}/#person` },
});
function breadcrumb(d, items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absolute(it.url, d.siteUrl) })),
  };
}
const strip = (o) => JSON.parse(JSON.stringify(o)); // drop undefined

function build(kind, data, locale) {
  const d = ctx(data, locale);
  const { t, site } = d;
  const url = data.page && data.page.url ? data.page.url : "/";
  const out = { title: "", description: "", image: "", noindex: false, canonical: "", ogType: "website", jsonld: null };
  let seo = {};
  let page = { "@type": "WebPage" };
  const graph = [];
  const crumbs = [{ name: t.crumbs.home, url: d.prefix + "/" }];

  if (kind === "home") {
    seo = site.seoHome || {};
    out.title = seo.title || t.home(d);
    out.description = seo.description || site.metaDescription || t.homeDesc(d);
    page = { "@type": "WebPage", about: { "@id": `${d.siteUrl}/#person` } };
  } else if (kind === "about") {
    seo = site.aboutSeo || {};
    out.title = seo.title || t.about(d);
    out.description = seo.description || site.aboutSeoDescription || asText(site.aboutBio) || clean(site.aboutBioLong) || clean(site.aboutPageIntro || site.aboutParagraph) || t.aboutDesc(d);
    out.ogType = "profile";
    page = { "@type": "ProfilePage", mainEntity: { "@id": `${d.siteUrl}/#person` }, dateModified: site.aboutUpdatedAt || site._updatedAt || undefined };
    crumbs.push({ name: t.crumbs.about, url });
  } else if (kind === "portfolio" || kind === "products") {
    seo = (kind === "portfolio" ? site.seoPortfolio : site.seoProducts) || {};
    const items = (kind === "portfolio" ? (locale === "pl" ? data.caseStudiesPl : data.caseStudies) : (locale === "pl" ? data.productsPl : data.products)) || [];
    out.title = seo.title || t[kind](d);
    out.description = seo.description || clean(kind === "portfolio" ? site.portfolioPageIntro : site.productsPageIntro) || t[kind + "Desc"](d);
    const base = kind === "portfolio" ? "/portfolio/" : "/products/";
    page = {
      "@type": "CollectionPage",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: items.filter((x) => !decideNoindex(x, x.seo)).map((x, i) => ({
          "@type": "ListItem", position: i + 1, url: absolute(`${d.prefix}${base}${x.slug}/`, d.siteUrl), name: clean(x.title || x.name),
        })),
      },
    };
    crumbs.push({ name: t.crumbs[kind], url });
  } else if (kind === "contact") {
    seo = site.seoContact || {};
    out.title = seo.title || t.contact(d);
    out.description = seo.description || clean(site.contactIntro) || t.contactDesc(d);
    page = { "@type": "ContactPage", about: { "@id": `${d.siteUrl}/#person` } };
    crumbs.push({ name: t.crumbs.contact, url });
  } else if (kind === "caseStudy" || kind === "product") {
    const item = kind === "caseStudy" ? data.cs : data.p;
    seo = (item && item.seo) || {};
    const name = clean(item.title || item.name);
    const cat = clean(item.category || item.tag);
    const lead = item.client ? clean(item.client) : shortTitle(name);
    out.title = seo.title || (kind === "caseStudy" ? t.caseStudy(lead, { ...d, cat }) : t.product(shortTitle(name, 48), { ...d, cat }));
    out.description = seo.description || (kind === "product" && clean(item.description)) || asText(item.overview) || clean(item.description) || name;
    out.image = seo.image || item.coverImage || item.heroImage || "";
    out.noindex = decideNoindex(item, seo);
    out.ogType = "article";
    const listName = kind === "caseStudy" ? t.crumbs.portfolio : t.crumbs.products;
    const listUrl = `${d.prefix}${kind === "caseStudy" ? "/portfolio/" : "/products/"}`;
    crumbs.push({ name: listName, url: listUrl }, { name: shortTitle(name, 60), url });
    const year = /\b(19|20)\d{2}\b/.exec(String(item.date || ""));
    const keywords = (seo.keywords && seo.keywords.length ? seo.keywords : [cat, clean(item.services)]).filter(Boolean);
    graph.push(strip({
      "@type": "CreativeWork",
      "@id": absolute(url, d.siteUrl) + "#work",
      name,
      headline: name,
      description: truncate(out.description, 300),
      url: absolute(url, d.siteUrl),
      image: absolute(out.image, d.siteUrl) || undefined,
      creator: { "@id": `${d.siteUrl}/#person` },
      author: { "@id": `${d.siteUrl}/#person` },
      dateCreated: year ? year[0] : undefined,
      dateModified: item._updatedAt || undefined,
      genre: cat || undefined,
      keywords: keywords.length ? keywords.join(", ") : undefined,
      inLanguage: locale,
      sameAs: /^https?:\/\//.test(item.link || "") ? item.link : undefined,
    }));
    page = { "@type": "WebPage", mainEntity: { "@id": absolute(url, d.siteUrl) + "#work" } };
  } else if (kind === "notFound") {
    out.title = t.notFound(d);
    out.description = locale === "pl" ? "Ta strona nie istnieje lub została przeniesiona." : "The page you're looking for doesn't exist or has moved.";
    out.noindex = true;
  }

  if (kind !== "caseStudy" && kind !== "product" && kind !== "notFound") out.noindex = (seo.indexing === "noindex");
  out.title = clean(out.title);
  out.description = truncate(out.description, 160);
  out.image = shareImage(seo.image || out.image);
  out.canonical = seo.canonical || (d.siteUrl ? d.siteUrl + url : "");

  if (d.siteUrl && !out.noindex && kind !== "notFound") {
    graph.unshift(
      websiteNode(d),
      strip(personNode(d, data)),
      strip({
        ...page,
        "@id": absolute(url, d.siteUrl) + "#webpage",
        url: absolute(url, d.siteUrl),
        name: out.title,
        description: out.description,
        inLanguage: locale,
        isPartOf: { "@id": `${d.siteUrl}/#website` },
      })
    );
    if (crumbs.length > 1) graph.push(breadcrumb(d, crumbs));
    out.jsonld = { "@context": "https://schema.org", "@graph": graph };
  }
  return out;
}

// Use in a template data file: module.exports = seoPage("caseStudy", "en")
function seoPage(kind, locale) {
  const memo = new WeakMap();
  const get = (data) => {
    // computed keys are resolved one by one — build once per page
    const key = data.page || data;
    if (!memo.has(key)) memo.set(key, build(kind, data, locale));
    return memo.get(key);
  };
  return {
    seoLocale: locale,
    eleventyComputed: {
      title: (data) => get(data).title,
      description: (data) => get(data).description,
      image: (data) => get(data).image,
      noindex: (data) => get(data).noindex,
      canonical: (data) => get(data).canonical,
      ogType: (data) => get(data).ogType,
      jsonld: (data) => get(data).jsonld,
    },
  };
}

module.exports = { seoPage, isPlaceholder, decideNoindex, truncate };
