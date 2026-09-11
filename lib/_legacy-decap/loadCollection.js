const fs = require("fs");
const path = require("path");

// Reads every *.json file in /content/<folderName> and returns them as an
// array, sorted by an optional numeric "order" field (falling back to
// filename) so editors can control display order from the CMS.
module.exports = function loadCollection(folderName) {
  const dir = path.join(__dirname, "..", "content", folderName);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

  const items = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const data = JSON.parse(raw);
    data.slug = file.replace(/\.json$/, "");
    return data;
  });

  items.sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : Infinity;
    const orderB = typeof b.order === "number" ? b.order : Infinity;
    if (orderA !== orderB) return orderA - orderB;
    return a.slug.localeCompare(b.slug);
  });

  return items;
};
