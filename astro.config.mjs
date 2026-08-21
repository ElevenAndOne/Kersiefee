// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  /* Canonical origin. Astro builds the sitemap from it, and Layout.astro reads
     it via `Astro.site` for the canonical link and the og:/twitter: URLs — so
     every absolute URL on the site follows from this one value. */
  site: "https://kersiefees.co.za",

  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
