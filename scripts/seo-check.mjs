// Quick SEO sanity check of the built site (run after `npm run build`):
//   npm run seo:check            (checks ./_site)
//   node scripts/seo-check.mjs <folder>
// Fails (exit 1) on: missing <title>/description, duplicate titles or
// descriptions, missing canonical on indexable pages, not exactly one <h1>,
// invalid JSON-LD, broken internal links, or sitemap URLs that are noindex.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || "_site");
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== "admin") walk(p); }
    else if (e.name.endsWith(".html")) pages.push(p);
  }
})(root);

const problems = [];
const seenTitle = new Map(), seenDesc = new Map();
const noindexUrls = new Set();
const get = (s, re) => (re.exec(s) || [])[1];
for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const rel = "/" + path.relative(root, file).replace(/index\.html$/, "").replace(/\\/g, "/");
  const noindex = /<meta name="robots" content="noindex/.test(html);
  if (noindex) noindexUrls.add(rel);
  const title = get(html, /<title>([^<]*)<\/title>/);
  const desc = get(html, /<meta name="description" content="([^"]*)"/);
  if (!title) problems.push(`${rel}: missing <title>`);
  if (!desc) problems.push(`${rel}: missing meta description`);
  // duplicates only count within one language (an untranslated Polish page
  // legitimately repeats the English text and is linked to it via hreflang)
  const lang = rel.startsWith("/pl/") ? "pl:" : "en:";
  if (!noindex) {
    if (title) { if (seenTitle.has(lang + title)) problems.push(`${rel}: duplicate title (also ${seenTitle.get(lang + title)})`); else seenTitle.set(lang + title, rel); }
    if (desc) { if (seenDesc.has(lang + desc)) problems.push(`${rel}: duplicate description (also ${seenDesc.get(lang + desc)})`); else seenDesc.set(lang + desc, rel); }
    if (!/<link rel="canonical"/.test(html) && !rel.endsWith("404.html")) problems.push(`${rel}: missing canonical`);
  }
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${rel}: ${h1} <h1> elements (expected 1)`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { problems.push(`${rel}: invalid JSON-LD`); }
  }
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const t = m[1].replace(/^\//, "");
    if (!fs.existsSync(path.join(root, t)) && !fs.existsSync(path.join(root, t, "index.html"))) problems.push(`${rel}: broken link ${m[1]}`);
  }
}
const sitemap = path.join(root, "sitemap.xml");
if (fs.existsSync(sitemap)) {
  const locs = [...fs.readFileSync(sitemap, "utf8").matchAll(/<loc>[^<]*?(\/[^<]*)<\/loc>/g)].map((m) => m[1].replace(/^\/\/[^/]+/, ""));
  for (const l of locs) if (noindexUrls.has(l)) problems.push(`sitemap lists noindex page ${l}`);
  console.log(`sitemap: ${locs.length} URLs`);
} else problems.push("no sitemap.xml");
console.log(`${pages.length} pages checked, ${noindexUrls.size} noindex`);
if (problems.length) { console.log(problems.map((p) => " ✗ " + p).join("\n")); process.exit(1); }
console.log(" ✓ no SEO problems found");
