const fetchCollection = require("../../lib/fetchCollection.js");
const localize = require("../../lib/localize.js");

// Same as productCategories.js, but reads the Polish (localize()'d) fields
// so the /pl/products/ filter pills show translated category names.
module.exports = async function () {
  const products = localize(await fetchCollection("products"));
  const seen = [];
  products.forEach((p) => {
    if (p.category && seen.indexOf(p.category) === -1) seen.push(p.category);
  });
  return seen;
};
