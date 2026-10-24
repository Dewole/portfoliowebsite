// Serializes a Sanity "portable text" block array (what a localeRichText /
// localeRichTextFull field stores) into safe HTML at Eleventy build time.
// Handwritten instead of pulling in @portabletext/to-html — it's a small,
// well-documented format, and this keeps the dependency list unchanged.
// Supports: paragraphs, h2/h3/h4, quotes, bullet/numbered lists (nested),
// bold/italic/underline/strikethrough/code/highlight, links (internal,
// external, mailto:, tel:, optional new tab) and images with alt + caption.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const DECORATORS = [
  ["strong", "strong"],
  ["em", "em"],
  ["underline", "u"],
  ["strike-through", "s"],
  ["code", "code"],
  ["highlight", "mark"],
];

function safeHref(href) {
  const h = String(href || "").trim();
  if (/^(javascript|data|vbscript):/i.test(h)) return "#";
  return h;
}

function renderSpan(span, markDefs) {
  if (!span || typeof span.text !== "string") return "";
  let text = escapeHtml(span.text).replace(/\n/g, "<br>");
  const marks = Array.isArray(span.marks) ? span.marks : [];
  let link = null;
  const decorators = [];
  marks.forEach((mark) => {
    const def = (markDefs || []).find((d) => d._key === mark);
    if (def && def._type === "link" && def.href) link = def;
    else if (!def) decorators.push(mark);
  });
  DECORATORS.forEach(([mark, tag]) => {
    if (decorators.includes(mark)) text = `<${tag}>${text}</${tag}>`;
  });
  if (link) {
    const href = safeHref(link.href);
    // Old links (before the "open in a new tab" option existed) were always
    // external and opened in a new tab — keep that unless it's internal.
    const isInternal = /^(\/|#|mailto:|tel:)/i.test(href);
    const newTab = link.newTab === true || (link.newTab === undefined && !isInternal);
    text = `<a href="${escapeHtml(href)}"${newTab ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
  }
  return text;
}

function renderChildren(block) {
  return (Array.isArray(block.children) ? block.children : [])
    .map((span) => renderSpan(span, block.markDefs))
    .join("");
}

function renderImage(block) {
  if (!block.url) return "";
  const src = `${block.url}?w=1400&auto=format&q=82`;
  const size = block.w && block.h ? ` width="${block.w}" height="${block.h}"` : "";
  const img = `<img src="${escapeHtml(src)}" alt="${escapeHtml(block.alt || "")}"${size} loading="lazy">`;
  return block.caption
    ? `<figure class="rt-figure">${img}<figcaption>${escapeHtml(block.caption)}</figcaption></figure>`
    : `<figure class="rt-figure">${img}</figure>`;
}

// Renders a run of consecutive list items (any level / type) as properly
// nested <ul>/<ol> markup.
function renderList(items) {
  let html = "";
  const stack = []; // [{tag, level}]
  items.forEach((b) => {
    const level = b.level || 1;
    const tag = b.listItem === "number" ? "ol" : "ul";
    while (stack.length && stack[stack.length - 1].level > level) {
      html += `</li></${stack.pop().tag}>`;
    }
    const top = stack[stack.length - 1];
    if (!top || top.level < level) {
      html += `<${tag}>`;
      stack.push({ tag, level });
    } else if (top.tag !== tag) {
      html += `</li></${stack.pop().tag}><${tag}>`;
      stack.push({ tag, level });
    } else {
      html += "</li>";
    }
    html += `<li>${renderChildren(b)}`;
  });
  while (stack.length) html += `</li></${stack.pop().tag}>`;
  return html;
}

// Plain-text extract — no tags at all. Used for <meta description>s etc.
function plainText(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return "";
  return blocks
    .filter((b) => b && b._type === "block")
    .map((b) => (Array.isArray(b.children) ? b.children.map((c) => c.text || "").join("") : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function portableText(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return "";
  let html = "";
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (!block) { i++; continue; }
    if (block._type === "image") { html += renderImage(block); i++; continue; }
    if (block._type !== "block") { i++; continue; }
    if (block.listItem) {
      const items = [];
      while (i < blocks.length && blocks[i] && blocks[i]._type === "block" && blocks[i].listItem) {
        items.push(blocks[i]);
        i++;
      }
      html += renderList(items);
      continue;
    }
    const style = block.style || "normal";
    const inner = renderChildren(block);
    if (style === "h2" || style === "h3" || style === "h4") html += `<${style}>${inner}</${style}>`;
    else if (style === "blockquote") html += inner ? `<blockquote><p>${inner}</p></blockquote>` : "";
    else html += inner ? `<p>${inner}</p>` : "";
    i++;
  }
  return html;
}

module.exports = portableText;
module.exports.plainText = plainText;
