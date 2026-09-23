// Serializes a Sanity "portable text" block array (what a localeRichText
// field stores) into safe HTML at Eleventy build time. Handwritten instead
// of pulling in @portabletext/to-html or @sanity/block-content-to-html —
// it's a small, well-documented format, and this keeps the dependency list
// unchanged. Supports what the localeRichText schema actually offers:
// paragraphs, h3/h4 sub-headers, bullet/numbered lists, bold/italic/
// underline, and links.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSpan(span, markDefs) {
  if (!span || typeof span.text !== "string") return "";
  let text = escapeHtml(span.text).replace(/\n/g, "<br>");
  const marks = Array.isArray(span.marks) ? span.marks : [];
  let linkHref = null;
  const decorators = [];
  marks.forEach((mark) => {
    const def = (markDefs || []).find((d) => d._key === mark);
    if (def && def._type === "link" && def.href) {
      linkHref = def.href;
    } else if (!def) {
      // A plain decorator (strong/em/underline) has no matching markDef.
      decorators.push(mark);
    }
  });
  if (decorators.includes("strong")) text = `<strong>${text}</strong>`;
  if (decorators.includes("em")) text = `<em>${text}</em>`;
  if (decorators.includes("underline")) text = `<u>${text}</u>`;
  if (linkHref) {
    const safeHref = escapeHtml(linkHref);
    text = `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  }
  return text;
}

function renderChildren(block) {
  return (Array.isArray(block.children) ? block.children : [])
    .map((span) => renderSpan(span, block.markDefs))
    .join("");
}

// Plain-text extract of a portable-text array — no tags at all. Used
// anywhere the formatted version isn't appropriate, like an SEO
// <meta description> or a card blurb.
function plainText(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return "";
  return blocks
    .filter((b) => b && b._type === "block")
    .map((b) => (Array.isArray(b.children) ? b.children.map((c) => c.text || "").join("") : ""))
    .join(" ")
    .trim();
}

function portableText(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return "";
  let html = "";
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (!block || block._type !== "block") {
      i++;
      continue;
    }
    if (block.listItem) {
      const listType = block.listItem;
      const tag = listType === "number" ? "ol" : "ul";
      let items = "";
      while (
        i < blocks.length &&
        blocks[i] &&
        blocks[i]._type === "block" &&
        blocks[i].listItem === listType
      ) {
        items += `<li>${renderChildren(blocks[i])}</li>`;
        i++;
      }
      html += `<${tag}>${items}</${tag}>`;
      continue;
    }
    const style = block.style || "normal";
    const inner = renderChildren(block);
    if (style === "h3" || style === "h4") {
      html += `<${style}>${inner}</${style}>`;
    } else {
      html += inner ? `<p>${inner}</p>` : "";
    }
    i++;
  }
  return html;
}

module.exports = portableText;
module.exports.plainText = plainText;
