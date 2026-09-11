// Given a list of items loaded by loadCollection, returns a copy where any
// "<field>_pl" value overwrites its base "<field>" — so Polish pages can
// reuse the exact same content files as the English ones, just switching in
// a translated string wherever one has been filled in. Fields left blank in
// the CMS's Polish field simply fall back to the English text.
module.exports = function localize(items) {
  return items.map((item) => {
    const copy = { ...item };
    Object.keys(item).forEach((key) => {
      if (key.endsWith("_pl") && item[key]) {
        const baseKey = key.slice(0, -3);
        copy[baseKey] = item[key];
      }
    });
    return copy;
  });
};
