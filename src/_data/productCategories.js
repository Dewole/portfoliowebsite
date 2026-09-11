const fetchCollection = require("../../lib/fetchCollection.js");

// Distinct category values across all products, in first-seen order —
// drives the filter pills on the /products/ page.
module.exports = async function () {
  const products = await fetchCollection("products");
  const seen = [];
  products.forEach((p) => {
    if (p.category && seen.indexOf(p.category) === -1) seen.push(p.category);
  });
  return seen;
};
