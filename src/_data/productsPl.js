const fetchCollection = require("../../lib/fetchCollection.js");
const localize = require("../../lib/localize.js");
module.exports = async function () {
  return localize(await fetchCollection("products"));
};
