import type { StructureResolver } from "sanity/structure";

// Custom desk structure: "Home page" and "About page" are singletons (one document, no
// list view / no delete), everything else is a normal collection list.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Home page")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
        ),
      S.listItem()
        .title("About page")
        .id("aboutPage")
        .child(
          S.document()
            .schemaType("aboutPage")
            .documentId("aboutPage")
        ),
      S.divider(),
      S.documentTypeListItem("caseStudy").title("Case Studies (Portfolio)"),
      S.documentTypeListItem("product").title("Products (Projects)"),
      S.documentTypeListItem("service").title("Services"),
      S.documentTypeListItem("skill").title("Skills & Tools"),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("experience").title("Experience"),
    ]);
