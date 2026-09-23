import localeString from "./objects/localeString";
import localeText from "./objects/localeText";
import localeRichText from "./objects/localeRichText";
import attachment from "./objects/attachment";
import pageSection from "./objects/pageSection";

import siteSettings from "./documents/siteSettings";
import caseStudy from "./documents/caseStudy";
import product from "./documents/product";
import testimonial from "./documents/testimonial";
import experience from "./documents/experience";
import service from "./documents/service";
import skill from "./documents/skill";

export const schemaTypes = [
  // shared objects first
  localeString,
  localeText,
  localeRichText,
  attachment,
  pageSection,
  // documents
  siteSettings,
  caseStudy,
  product,
  testimonial,
  experience,
  service,
  skill,
];
