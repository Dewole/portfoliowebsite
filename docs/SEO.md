# SEO for dewole.me

How the site handles search engines, what you control in Sanity, and what to
write for each page. Code lives in `lib/seo.js`, `lib/images.js`,
`src/_includes/seo-head.njk`, `src/sitemap.njk`, `src/robots.njk`.

## What's automatic

| Thing | How it works |
|---|---|
| Titles & descriptions | Built per page from your content (see table below). Anything typed in a page's **Search & sharing (SEO)** box in Sanity wins. Descriptions are trimmed to ~160 characters at a word boundary. |
| Canonical URL | Each page points to itself on `siteUrl` (e.g. `https://www.dewole.me/portfolio/kaprex/`). Override per page only if the work is published elsewhere first. |
| EN ↔ PL | `hreflang` en / pl / x-default on every page and in the sitemap. |
| Indexing | Real pages are indexed. Placeholder pages (slugs like `case-one`, `product-two`, titles under 4 letters, “Month 20XX”, “Product Name…”, “[Company…”) are automatically `noindex` and left out of the sitemap and the portfolio structured data. Per page: Automatic / Show / Hide. |
| Sitemap | `/sitemap.xml` — only indexable pages, with Polish alternates and last-modified dates for case studies and products. |
| robots.txt | Allows everything, points to the sitemap. Hidden pages use `noindex` (not Disallow) so Google can drop them. |
| Structured data (JSON-LD) | WebSite + Person (you) on every page; ProfilePage on About; CollectionPage + ItemList on Portfolio/Products; ContactPage on Contact; CreativeWork for each case study/product; BreadcrumbList on inner pages. Built only from CMS data — no ratings, awards or invented facts. |
| Share previews | Page's SEO image → cover image (auto-cropped to 1200×630) → site-wide share image → built-in hero card. |
| Images | Every Sanity image gets WebP/AVIF, a `srcset` and `sizes`, lazy loading below the fold, async decoding. |
| Internal links | Each case study/product ends with up to 3 related ones (same category first). |
| Redirects | `vercel.json`: `/work`, `/case-studies/*`, `/projects/*`, `/about-me`, `/hire`, `/en/*`, `/index.html` → current URLs. |

## Default titles (when the SEO box is empty)

| Page | Title pattern | Description source |
|---|---|---|
| Home | Emmanuel Ikuesan (Dewole) — {job title}, Poznań | Home SEO → Meta description (Identity) → built-in |
| About | About Emmanuel Ikuesan — {job title} | About SEO → SEO description → bio |
| Portfolio | UI/UX & Product Design Case Studies \| Dewole | Portfolio SEO → page intro → built-in |
| Case study | {Client} — {Category} Case Study \| Dewole | SEO → Project Details paragraph |
| Products | Digital Products I Design & Build \| Dewole | Products SEO → page intro → built-in |
| Product | {Name} — {Category} \| Product by Dewole | SEO → card description |
| Contact | Contact — Hire a Product & UI/UX Designer \| Dewole | Contact SEO → intro → built-in |

`{job title}` = Home page → 🔍 SEO & profile → **Job title (for search)**, else your Role.

## Keyword map (natural use only)

| Page | Primary | Secondary |
|---|---|---|
| Home | Product Designer in Poznań | UI/UX Designer Poland, Digital Product Designer, Brand Identity Designer |
| About | Product Designer portfolio / Emmanuel Ikuesan | UI/UX designer Poznań, design systems, brand & product design |
| Portfolio | UI/UX case studies | product design case studies, web design portfolio |
| Case study | {project} + discipline (e.g. “fintech app UI/UX case study”) | client industry, tools/methods actually used |
| Products | digital products designer | web and mobile app designer, end-to-end product design |
| Contact | hire a product designer | freelance web designer Poznań, remote UI/UX designer |

Use each phrase where it reads naturally (title, H1/intro, one or two body
mentions). Never stack keywords.

## Writing each case study (fill these in Sanity)

1. **What it is** — one sentence: product, audience, platform (web / iOS / Android).
2. **Problem** — what wasn't working, for whom.
3. **Your contribution** — your role and what you personally did (put it in “Role”).
4. **Disciplines** — Services field, e.g. “UX research, UI design, design system”.
5. **Tools & methods** — e.g. Figma, prototyping, usability testing.
6. **Outcome** — only results you can actually back up (launches, adoption, feedback). No invented metrics.
7. **Alt text** — describe what's in key images.
8. **SEO box** — optional; add 3–6 “Topics / skills” for structured data.

## Manual actions

1. **Sanity** → Home page → 🔍 SEO & profile: check Full name, set *Job title (for search)* (e.g. “Product & UI/UX Designer”), City, add Behance/Dribbble/GitHub to *Other public profiles*. Identity → **Live site URL** must be `https://www.dewole.me` (exactly the domain you want in Google).
2. **Sanity**: replace or delete placeholder case studies/products (case-one…, product-one…, “tt”, “I am crazy”). They're hidden from Google automatically, but visitors still see them.
3. **Vercel** → Domains: make `www.dewole.me` primary and redirect `dewole.me` → `www` (or the reverse — just match Live site URL).
4. **Google Search Console**: add the domain property, submit `https://www.dewole.me/sitemap.xml`, use URL Inspection → Request indexing for the homepage, About and best case studies. Repeat in **Bing Webmaster Tools** (can import from GSC).
5. Check share previews with LinkedIn Post Inspector after deploying.
6. After each deploy: `npm test` builds the site and runs `scripts/seo-check.mjs` (titles, descriptions, canonicals, one H1 per page, valid JSON-LD, broken links, sitemap).
