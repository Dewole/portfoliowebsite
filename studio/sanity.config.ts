import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { media } from "sanity-plugin-media";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "default",
  title: "Dewole Portfolio CMS",

  projectId,
  dataset,

  plugins: [structureTool({ structure }), visionTool(), media()],

  schema: {
    types: schemaTypes,
  },
});
