# Portfolio + CMS

A multi-page static portfolio site (Eleventy) for a brand & product designer, with a
[Decap CMS](https://decapcms.org/) admin panel at `/admin/`. Edit your bio, case
studies, products, testimonials, and services through a web form — every
save is a Git commit, and Netlify rebuilds the live site automatically. No database,
no server to maintain.

## Pages

| Page | Path | Built from |
|---|---|---|
| Home | `/` | `src/index.njk` |
| Portfolio (listing, with category filter pills) | `/portfolio/` | `src/portfolio.njk` |
| Case study (one per entry) | `/portfolio/<slug>/` | `src/case-study.njk` (paginated) |
| Products (listing, with category filter pills) | `/products/` | `src/products.njk` |
| Product detail (one per entry) | `/products/<slug>/` | `src/product-study.njk` (paginated) |
| About | `/about/` | `src/about.njk` |
| Contact | `/contact/` | `src/contact.njk` |

All pages share the same header, side menu, and footer navigation, defined once in
`src/_includes/base.njk`.

## How content is organized

```
content/
  site.json            ← single file: hero text, bio, contact info, footer copy
  case-studies/*.json  ← one file per case study (also feeds the /portfolio/ detail pages)
  products/*.json      ← one file per shipped product
  testimonials/*.json  ← one file per client quote
  services/*.json      ← one file per service card
```

The Eleventy templates in `src/` read these files at build time and render the page —
you never touch HTML to update content once this is deployed.

### Category filter pills (Portfolio & Products)

Both the `/portfolio/` and `/products/` pages render a row of filter pills above their
grid. The pills aren't hardcoded — `src/_data/portfolioCategories.js` and
`src/_data/productCategories.js` scan every case study / product at build time and
list each distinct `category` value once, in the order it first appears. To add a new
filter category, just open a case study or product in the CMS and type a new value
into its **Category** field (case-studies also fall back to the **Tag** field if
Category is left blank) — the next build picks it up automatically, no code changes
needed.

### Product detail pages

Every entry in the Products collection gets its own page at `/products/<slug>/`
(the slug comes from the CMS filename), built from `src/product-study.njk`. Clicking
a product card — on the homepage preview or on the `/products/` listing — goes
straight to that page. It shows the product's name, status, category, description,
and (if filled in) the **The problem / The approach / The outcome** fields from the
CMS, plus a CTA that links out to the product's **Link** field if it's set to a real
URL, or falls back to "Start a project like this" (pointing at `/contact/`) if the
link is still the placeholder `#`.

### Image galleries (Case study & Product detail pages)

Both the Case Studies and Products collections have a **Gallery** field in the
CMS — an "Add photo" list where you can upload as many images as you like. If
you've uploaded at least one photo, the detail page (`/portfolio/<slug>/` or
`/products/<slug>/`) shows a real photo gallery instead of the gradient
placeholder block: the first photo runs full-width and tall, and any additional
photos fall into an even grid underneath. Leave the Gallery empty and the page
falls back to the original gradient placeholder automatically — nothing to
configure either way.

### Experience section (About page)

The About page has an **Experience** timeline between "How I work" and the new
closing CTA, listing your work history — company, role, period, and an optional
description per row. It's a separate repeatable collection in the CMS
(**Experience**, alongside Case Studies/Products/etc.), so you can add, remove,
or reorder roles (via each entry's **Display order** field) without touching
code. Every field has an optional `_pl` sibling, translated the same way as
everything else on the site.

### Closing CTA (About page)

Right after the Experience timeline, the About page ends with a "Let's talk
about your project" call-to-action — heading, paragraph, and a button linking
to `/contact/` — editable under **Site Settings → About page CTA** in the CMS.

### Photography section (Home page)

The homepage now has an "I'm also a photographer" section between Products and
Testimonials. Upload photos to **Site Settings → Homepage — Photography gallery
images** and they'll appear in a 4-column grid; leave it empty and four gradient
placeholder tiles show instead. These photos are shared between the English and
Polish homepages (a photo isn't language-specific), while the heading/intro/CTA
text around them are translated independently via their `_pl` fields.

## Polish version (`/pl/`)

The site now has a full second, Polish-language version — Home, Portfolio listing,
Products listing, About, Contact, and every individual case-study and product detail
page — living under `/pl/` (e.g. `/pl/about/`, `/pl/portfolio/<slug>/`,
`/pl/products/<slug>/`). It uses its own layout (`src/_includes/base.pl.njk`) and its
own Eleventy page templates (`src/pl/*.njk`), so the English site is never at risk of
breaking when the Polish content changes. Detail pages read from `caseStudiesPl` /
`productsPl` (the same `_pl`-overlay mechanism described below), so the long-form
overview/objective/approach/outcome prose is translated per entry in the CMS.

### How translations work

Every translatable field in the CMS has an optional sibling field suffixed `_pl`
(e.g. a case study's **Title** field has a matching **Title (Polish)** field). Leave
a `_pl` field blank and the English value is used as a fallback automatically — you
don't need to translate everything on day one. This is handled by
`lib/localize.js`, a small helper that overlays any non-empty `_pl` value onto its
base field at build time.

- `content/site.pl.json` — the Polish counterpart to `content/site.json` (hero copy,
  nav labels, contact page copy, footer note), editable in the CMS under **Site
  Settings (Polish — /pl/ version)**.
- Case studies, products, testimonials, and services each gained `_pl` fields
  directly alongside their English ones in the CMS — no separate collections to
  manage.

The language switcher in the top nav (English / Polski) swaps between a page and its
`/pl/` equivalent, mapping the current path rather than always bouncing to the
homepage.

### Adding a new case study, product, etc.

Fill in the English fields as before, and optionally fill in the matching `_pl`
fields if you want that entry to appear translated on the Polish listing pages. If
you skip the `_pl` fields, the English text just shows through — nothing breaks.

## 1. Push this to GitHub

```bash
cd cms-portfolio
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on GitHub (via github.com → New repository), then:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

## 2. Deploy on Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Connect your GitHub account and pick the repo you just pushed.
3. Build settings should auto-detect from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `_site`
4. Click **Deploy**. Your site will be live at a `*.netlify.app` URL (you can add a custom domain later in Site settings → Domain management).

## 3. Turn on the CMS login (Netlify Identity + Git Gateway)

The admin panel at `/admin/` needs a way to authenticate you and a way to write
commits back to your repo. Netlify provides both for free:

1. In your Netlify site dashboard: **Site configuration → Identity → Enable Identity**.
2. Under Identity settings, set **Registration** to **Invite only** (so random people can't sign themselves up).
3. Still under Identity: **Services → Git Gateway → Enable Git Gateway**. This lets the CMS commit to your repo using Netlify's credentials instead of your own GitHub token.
4. Go to **Identity → Invite users**, and invite your own email address. You'll get an email with a link to set a password.

## 4. Log in and edit content

1. Visit `https://<your-site>.netlify.app/admin/`.
2. Log in with the account you just set up.
3. You'll see five sections in the sidebar: Site Settings, Case Studies, Products,
   Testimonials, and Services. Click into any of them, edit the fields,
   and hit **Publish**. Netlify rebuilds the site within a minute or two.

Every field you can edit maps directly to what's on the page — hero headline, bio
paragraph, stats, each case study's title/tag/date, each product's status
(live vs. coming soon), etc.

## Local development

```bash
npm install
npm start        # serves the site at http://localhost:8080 with live reload
npm run build    # builds the static site into _site/
```

The `/admin/` panel won't fully log in when run locally against `file://` or a plain
dev server, since Git Gateway auth needs the deployed Netlify site — do content edits
against the live `/admin/` URL once deployed. Local dev is for template/design changes.

## Contact form

The `/contact/` page posts to Netlify Forms (`data-netlify="true"` on the `<form>`),
so submissions show up under **Site configuration → Forms** in your Netlify dashboard
with zero backend code. It only works once the site is deployed on Netlify — locally
the form will render but submissions won't be captured.

## Design system

All CSS lives in `src/assets/style.css`, all interactive behavior (word-reveal
animations, custom cursor, side menu, category filtering, testimonial carousel) in
`src/assets/main.js`. Both are plain vanilla JS/CSS — no build step or framework
beyond Eleventy's templating.

**Homepage portfolio marquee** (`#caseMarquee`) auto-scrolls slowly and is swipeable —
drag with a mouse (click-and-drag) or a finger (native touch scroll) to browse faster,
hover to pause the auto-scroll, and it loops seamlessly since the case studies are
rendered twice in the track and the scroll position wraps once it passes the halfway
point.

**Products listing page** (`/products/`) uses the same borderless card treatment as
the Portfolio listing (`.prod-grid.wide` / `.case-grid.wide`) — no card border or
background, just the thumbnail, title, and description, matching the rest of the site.

**Buttons** with an icon (arrow, external-link glyph, etc.) split their label and icon
into separate `.btn-label` / `.btn-icon` spans so each one text-reveals independently on
hover, matching the "Download CV" button. Icon-only directional controls (like the
testimonial prev/next arrows) instead nudge a few pixels in the direction they point.

The "Origin Display" font is embedded as base64 inside `style.css` for headings;
body copy uses Instrument Sans loaded from Google Fonts; the hero's "Digital
designer" line uses a handwritten script font called "Rinature One", also embedded
as base64. **Note on that font's license:** the file supplied for this build is
labeled in its own metadata as "Rinature One DEMO © Lemonthe 2023 — All Rights
Reserved." Demo fonts are typically restricted from commercial use and
redistribution (which embedding it in a public site's CSS effectively does).
Before deploying this live, please confirm you hold a proper web-embedding license
for Rinature One, or swap in a licensed alternative — search for "@font-face" in
`style.css` to find and replace the embedded font.
