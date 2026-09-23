// Given a list of items loaded by fetchCollection, returns a copy where any
// "<field>_pl" value overwrites its base "<field>" — so Polish pages can
// reuse the exact same content as the English ones, just switching in a
// translated string wherever one has been filled in. Fields left blank in
// the CMS's Polish field simply fall back to the English text.
//
// This applies recursively (not just to each item's top-level fields),
// because some fields are themselves arrays of bilingual objects — a case
// study/product's "sections", for instance, where each section carries its
// own title_pl/description_pl. Recursing into every nested object/array is
// harmless for fields that have no _pl variants (images, attachments, etc.)
// since localizing them just produces an identical shallow copy.
function localizeItem(item) {
  const copy = { ...item };
  Object.keys(item).forEach((key) => {
    if (key.endsWith("_pl") && item[key]) {
      const baseKey = key.slice(0, -3);
      copy[baseKey] = item[key];
    }
  });
  Object.keys(copy).forEach((key) => {
    const value = copy[key];
    if (Array.isArray(value)) {
      copy[key] = value.map((entry) =>
        entry && typeof entry === "object" ? localizeItem(entry) : entry
      );
    } else if (value && typeof value === "object") {
      copy[key] = localizeItem(value);
    }
  });
  return copy;
}

module.exports = function localize(items) {
  return items.map(localizeItem);
};
