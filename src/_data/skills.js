const fetchCollection = require("../../lib/fetchCollection.js");
module.exports = async function () {
  return fetchCollection("skills");
};
