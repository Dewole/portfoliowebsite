const fetchCollection = require("../../lib/fetchCollection.js");

// Distinct category values across all case studies, in first-seen order —
// drives the filter pills on the /portfolio/ page. Add a new category to any
// case study in the Studio and a matching pill appears here automatically.
module.exports = async function () {
  const caseStudies = await fetchCollection("case-studies");
  const seen = [];
  caseStudies.forEach((cs) => {
    const cat = cs.category || cs.tag;
    if (cat && seen.indexOf(cat) === -1) seen.push(cat);
  });
  return seen;
};
