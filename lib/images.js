// Responsive, compressed images for everything served from Sanity's image
// CDN — applied to every built page (Eleventy transform in .eleventy.js),
// so templates and CMS content don't need to change. Each <img> gets a
// modern format (auto=format → WebP/AVIF), a sensible default width, a
// srcset the browser picks from, `sizes` matched to where the image sits,
// and async decoding. Lightbox "full size" links keep the original file.
const WIDTHS = [400, 700, 1000, 1400, 2000];
const SIZES = [
  [/case-thumb/, "(max-width: 700px) 82vw, (max-width: 1400px) 36vw, 500px"],
  [/prod-thumb/, "(max-width: 600px) 92vw, (max-width: 980px) 46vw, 560px"],
  [/photo-tile/, "(max-width: 700px) 70vw, 360px"],
  [/cs-hero-img|hero-bg-media|bigquote-bg-media/, "100vw"],
  [/photo-stack/, "340px"],
  [/cta-photo/, "(max-width: 640px) 92vw, 280px"],
  [/photo-block/, "(max-width: 900px) 92vw, 560px"],
  [/cs-media-img|rt-figure/, "(max-width: 700px) 92vw, (max-width: 1240px) 60vw, 760px"],
  [/skill-icon|how-icon/, "40px"],
];
const isSanity = (u) => /^https:\/\/cdn\.sanity\.io\/images\//.test(u) && !/\.svg(\?|$)/i.test(u);
const withParams = (u, p) => u + (u.includes("?") ? "&" : "?") + p;

function imagesTransform(html) {
  if (typeof html !== "string" || !html.includes("cdn.sanity.io/images/")) return html;
  return html.replace(/<img\b([^>]*?)\s*\/?>/gi, (tag, attrs, offset) => {
    const m = /\ssrc="([^"]+)"/i.exec(" " + attrs);
    if (!m) return tag;
    const src = m[1].replace(/&amp;/g, "&");
    if (!isSanity(src) || /[?&]w=\d/.test(src) || /\ssrcset=/i.test(attrs)) {
      return /decoding=/i.test(attrs) ? tag : tag.replace(/<img\b/i, '<img decoding="async"');
    }
    const context = html.slice(Math.max(0, offset - 260), offset) + attrs;
    const sizes = (SIZES.find(([re]) => re.test(attrs)) || SIZES.find(([re]) => re.test(context)) || [null, "(max-width: 900px) 100vw, 50vw"])[1];
    const small = /skill-icon|how-icon/.test(context);
    const widths = small ? [80, 160] : WIDTHS;
    const base = small ? 80 : 1000;
    const enc = (u) => u.replace(/&/g, "&amp;");
    const newSrc = enc(withParams(src, `w=${base}&auto=format&q=80`));
    const srcset = widths.map((w) => `${enc(withParams(src, `w=${w}&auto=format&q=80`))} ${w}w`).join(", ");
    let out = attrs.replace(/\ssrc="[^"]+"/i, ` src="${newSrc}" srcset="${srcset}" sizes="${sizes}"`);
    if (!/decoding=/i.test(out)) out += ' decoding="async"';
    if (/loading="eager"/i.test(out) && /hero-bg-media/.test(context) && !/fetchpriority/i.test(out)) out += ' fetchpriority="high"';
    return `<img${out.startsWith(" ") ? "" : " "}${out}>`;
  });
}
module.exports = { imagesTransform };
