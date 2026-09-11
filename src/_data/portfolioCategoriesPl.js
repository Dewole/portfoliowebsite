const fetchCollection = require("../../lib/fetchCollection.js");
const localize = require("../../lib/localize.js");

// Same as portfolioCategories.js, but reads the Polish (localize()'d) fields
// so the /pl/portfolio/ filter pills show translated category names.
module.exports = async function () {
  const caseStudies = localize(await fetchCollection("case-studies"));
  const seen = [];
  caseStudies.forEach((cs) => {
    const cat = cs.category || cs.tag;
    if (cat && seen.indexOf(cat) === -1) seen.push(cat);
  });
  return seen;
};
