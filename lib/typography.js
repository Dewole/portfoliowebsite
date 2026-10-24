// Global typography rules, applied to every generated page at build time
// (registered as an Eleventy transform in .eleventy.js). Server-side only,
// so there's nothing for the browser to re-arrange after load, and the text
// stored in Sanity is never modified — only the HTML that's published.
//
//  1. Polish pages (<html lang="pl">): "sierotki" — a non-breaking space
//     (U+00A0) after single-letter words (a, i, o, u, w, z) and, optionally,
//     the extended short-word list in typography.config.js.
//  2. All languages: the editorial "||" line-break marker in headings
//     becomes <br class="ed-br"> (shown on tablet/desktop only — see CSS).
//
// Only visible text is touched: tags, attributes, <script>, <style>, <pre>,
// <code>, <kbd>, <samp>, <textarea> and <svg> are passed through untouched,
// so URLs, email addresses, code and file paths are never altered. Inside
// <title> and attributes, "||" is just turned back into a space.

const config = require("./typography.config");

const NBSP = " ";
const BLOCK_TAGS = new Set([
  "address", "article", "aside", "blockquote", "body", "br", "dd", "details", "div", "dl", "dt",
  "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6",
  "header", "hr", "html", "label", "legend", "li", "main", "nav", "ol", "p", "section",
  "summary", "table", "td", "th", "tr", "ul", "button", "option", "select",
]);
const SKIP_BLOCKS = /<!--[\s\S]*?-->|<(script|style|pre|code|kbd|samp|textarea|svg)\b[^>]*>[\s\S]*?<\/\1\s*>|<[^>]+>/gi;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function polishWords(opts = {}) {
  const pl = config.polish;
  const extended = opts.extended ?? pl.useExtendedWords;
  return extended ? [...pl.singleLetterWords, ...pl.extendedWords] : [...pl.singleLetterWords];
}

const reCache = new Map();
function polishRegex(words, allowStart) {
  const key = words.join("|") + (allowStart ? "^" : "");
  if (!reCache.has(key)) {
    // A protected word that stands on its own (start of the text run — only
    // when the run itself starts a new word — or after a space / opening
    // bracket or quote / dash), followed by ordinary whitespace and then
    // more text (or the end of this run, e.g. "w <strong>domu</strong>").
    // Longest first so "we" can't shadow "więc".
    const alt = [...words].sort((a, b) => b.length - a.length).map(escapeRe).join("|");
    const before = `[\\s\\u00A0(\\[{„"«‚“'‘–—-]`;
    reCache.set(key, new RegExp(`(?<=${allowStart ? "^|" : ""}${before})(${alt})[ \\t\\r\\n]+(?=\\S|$)`, "giu"));
  }
  return reCache.get(key);
}

/**
 * Apply the locale's typography rules to a plain string (no HTML).
 * `previousChar` is the character that came right before this string in the
 * flowing text (so the "w" in "Sło<b>w</b>" isn't mistaken for a standalone
 * word). Case-insensitive; punctuation is preserved.
 */
function applyLocaleTypography(text, locale, opts = {}) {
  if (!text || locale !== "pl") return text;
  const prev = opts.previousChar ?? " ";
  const startsWord = /[\s\u00A0(\[{„"«‚“'‘–—-]/u.test(prev);
  return text.replace(polishRegex(polishWords(opts), startsWord), (m, word) => word + NBSP);
}

function stripMarker(s) {
  const marker = config.editorialBreakMarker;
  return s.includes(marker) ? s.split(marker).map((p) => p.trim()).join(" ") : s;
}

/** Process a whole HTML document (or fragment). */
function typographyTransform(html, localeHint) {
  if (typeof html !== "string" || !html) return html;
  const locale = localeHint || ((/<html[^>]*\blang="([a-z-]+)"/i.exec(html) || [])[1] || "en").slice(0, 2).toLowerCase();
  const marker = config.editorialBreakMarker;
  const hasMarker = html.includes(marker);
  if (locale !== "pl" && !hasMarker) return html;

  let out = "";
  let last = 0;
  let prevChar = " ";
  let inTitle = false;

  const handleText = (text) => {
    if (!text) return text;
    let t = text;
    if (hasMarker && t.includes(marker)) {
      t = inTitle
        ? stripMarker(t)
        : t.split(marker).map((p, i, arr) => (i < arr.length - 1 ? p.replace(/\s+$/, "") : p)).map((p, i) => (i ? p.replace(/^\s+/, "") : p)).join(' <br class="ed-br">');
    }
    if (locale === "pl" && !inTitle) {
      // Only the text parts — leave the <br> we may have just added alone.
      t = t.split(/(<br class="ed-br">)/).map((part, i) => {
        if (i % 2) { prevChar = " "; return part; }
        const res = applyLocaleTypography(part, "pl", { previousChar: prevChar });
        if (part) prevChar = part[part.length - 1];
        return res;
      }).join("");
    } else {
      prevChar = text[text.length - 1];
    }
    return t;
  };

  SKIP_BLOCKS.lastIndex = 0;
  let m;
  while ((m = SKIP_BLOCKS.exec(html))) {
    out += handleText(html.slice(last, m.index));
    let tok = m[0];
    const tag = (/^<\/?([a-z0-9]+)/i.exec(tok) || [])[1];
    if (tag) {
      const t = tag.toLowerCase();
      if (t === "title") inTitle = tok[1] !== "/";
      if (BLOCK_TAGS.has(t)) prevChar = " ";
      // "||" inside attributes (alt text, aria-label, meta content…) → space
      if (hasMarker && tok.includes(marker) && !m[1]) tok = tok.replace(/\s*\|\|\s*/g, " ");
    }
    if (m[1] && /^<script[^>]*application\/ld\+json/i.test(tok) && hasMarker) tok = tok.replace(/\s*\|\|\s*/g, " ");
    out += tok;
    last = m.index + m[0].length;
  }
  out += handleText(html.slice(last));
  return out;
}

module.exports = { applyLocaleTypography, typographyTransform, NBSP };
