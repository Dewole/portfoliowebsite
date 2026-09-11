const fetchSiteSettings = require("../../lib/fetchSiteSettings.js");
module.exports = async function () {
  return fetchSiteSettings("en");
};
