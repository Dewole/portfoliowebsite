# Migrating this site from Decap CMS to Sanity

This project used to ship with **Decap CMS** (`/admin`, git-gateway backend,
JSON files under `content/`). It now uses **Sanity's free plan** as the CMS,
with a Studio (the admin panel) that edits both the English and Polish copy
of every field side by side, and supports png / jpg / mp4 / json uploads on
case studies and products.

Nothing in `content/` or `_legacy-decap-admin/` was deleted — they're kept
as a reference and as the source data for the one-time migration below. The
Eleventy site (`src/_data/*.js`) now pulls its content from Sanity at build
time instead of reading those JSON files.

I can't finish the last few steps myself: they require your own Sanity
account (OAuth login in a browser) and `npm install` (this sandbox has no
network access to npm/Sanity from where I'm running). Here's exactly what
to run, in order, in a terminal on your own machine.

## 1. Create your free Sanity project

```bash
cd studio
npm install
npx sanity login       # opens your browser — log in or sign up, it's free
npx sanity init --project-id list   # lists any existing projects, or:
npx sanity init         # walks you through creating a new project
```

During `sanity init`, when it asks:
- "Use the default dataset configuration?" -> yes (dataset: `production`)
- "Would you like to add configuration files for a Sanity project?" -> if
  it offers to overwrite `sanity.config.ts` / schema, say **no** — this
  project already has them hand-built for you.

Note the **Project ID** it prints (or find it later at
https://www.sanity.io/manage).

## 2. Wire up your environment variables

```bash
# in studio/
cp .env.example .env
# edit studio/.env: set SANITY_STUDIO_PROJECT_ID to your project ID

# in the repo root
cp .env.example .env
# edit .env: set SANITY_PROJECT_ID to the same project ID
```

You'll also need a write token to run the migration (read-only access is
enough for the Eleventy build itself, but not for importing content):

1. Go to https://www.sanity.io/manage -> your project -> API -> Tokens
2. "Add API token", name it e.g. "migration", permission **Editor**
3. Paste it into `studio/.env` as `SANITY_API_TOKEN`

## 3. Import your existing content

This reads every file under `content/` (both `site.json` and `site.pl.json`,
and all the case studies / products / testimonials / experience / services)
and creates matching documents in Sanity, combining the old `_pl` fields
into one bilingual field per item, and uploading `src/assets/cv.pdf` as the
CV file.

```bash
cd studio
npm run migrate
```

It's safe to re-run — it replaces documents by the same deterministic ID
each time rather than duplicating them.

## 4. Run the Studio and check the content

```bash
cd studio
npm run dev
```

Opens at http://localhost:3333 — you should see Site Settings (singleton)
plus Case Studies, Products, Services, Testimonials and Experience, all
prefilled. Every bilingual field shows an English and Polish box side by
side. Images upload as normal Sanity images (drag & drop, crop/hotspot);
the "Attachments" field on Case Studies and Products accepts `.mp4` and
`.json` files specifically.

## 5. Build the Eleventy site against Sanity

Back in the repo root:

```bash
npm install
npm run start    # or `npm run build`
```

If `SANITY_PROJECT_ID` isn't set, the build still runs but every page shows
empty content (with a console warning) rather than crashing — so you can
tell right away if the `.env` file didn't get picked up.

## 6. Deploy both to Vercel

**Main site** (this repo root): import the repo into Vercel as its own
project. `vercel.json` already sets the build command and output
directory (`_site`). Add the two env vars from `.env` (`SANITY_PROJECT_ID`,
`SANITY_DATASET`) in the Vercel project's Settings -> Environment Variables.

**Studio** (`studio/`): import the same repo as a *second* Vercel project,
with its Root Directory set to `studio`. Its `vercel.json` builds it as a
static app (`npm run build` -> `dist`). Add `SANITY_STUDIO_PROJECT_ID` and
`SANITY_STUDIO_DATASET` as env vars there too. (You can also just run
`npx sanity deploy` from inside `studio/` for free hosting at
`<your-name>.sanity.studio` instead of Vercel, if you'd rather not manage a
second Vercel project — either works, Vercel is not required for the
Studio.)

Whoever should be able to log into the Studio and edit content needs to be
invited as a project member at https://www.sanity.io/manage — anyone not
invited can't sign in, free plan included.

## What changed, file by file

- `studio/` — new. The Sanity Studio: schemas in `studio/schemaTypes/`,
  config in `studio/sanity.config.ts`, migration script in
  `studio/scripts/migrate.mjs`.
- `lib/sanityClient.js`, `lib/fetchCollection.js`, `lib/fetchSiteSettings.js`
  — new. Build-time GROQ queries against Sanity, shaped to match the old
  JSON exactly (including `_pl` suffixed fields) so `lib/localize.js` and
  every `.njk` template needed zero changes.
- `src/_data/*.js` — rewritten to call the new fetch helpers (now async)
  instead of `lib/loadCollection.js` (moved to `lib/_legacy-decap/`).
- `.eleventy.js` — no longer copies `admin/` to the built site; loads
  `.env` via `dotenv`.
- `admin/` -> `_legacy-decap-admin/`, kept only as a reference.
- `content/*.json` — unchanged, kept only as the migration script's source
  data and a readable backup of your original copy.
- `package.json` — added `@sanity/client` + `dotenv`.
- `vercel.json` (root) and `studio/vercel.json` — new, one per Vercel
  project as described above.
- `netlify.toml` — left in place but unused now that you're deploying to
  Vercel; delete it whenever you like.

## Media types

Sanity's built-in `image` field already only accepts image formats
(png/jpg included) with cropping and hotspot support. The new
**Attachments** field on Case Studies and Products is a generic file field
restricted to `video/mp4` and `application/json` specifically, per your
request — a video walkthrough or a raw data export can now be attached
directly to a project or case study. mp4s are stored as plain files (the
free Sanity plan doesn't include video transcoding/streaming), so they play
back as a direct file link/embed rather than an adaptive-bitrate player.
