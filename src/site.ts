/**
 * Site-wide constants: the metadata and event facts that feed <head> and the
 * JSON-LD structured data in `layouts/Layout.astro`.
 *
 * Everything here is asserted to search engines and to social scrapers, so it
 * has to stay in step with what the page actually says. The values below are
 * taken from the copy in `components/sections/` — the programme times from
 * ProgramSection/FAQSection, the prices from TicketSection, the venue from
 * DirectionsSection — rather than being typed in a second time from the brief.
 *
 * The canonical origin is NOT here: it comes from `site` in astro.config.mjs,
 * which is where Astro itself reads it for the sitemap.
 */

export const SITE_NAME = "Ceres Kersiefees";

export const DEFAULT_TITLE = "Ceres Kersiefees 2026";

export const DEFAULT_DESCRIPTION =
  "Vier die kersieseisoen saam met ons by die Ceres Kersiefees – sport, musiek, kos en kersies vir die hele gesin. Saterdag, 5 Desember 2026, Rugbyklub, Ceres.";

/** Afrikaans, South Africa — matches <html lang> and og:locale. */
export const LOCALE = "af_ZA";

/** Cherry Red (`--color-cherry`), used for the browser/OS UI chrome. */
export const THEME_COLOR = "#ec1848";

/**
 * Social share card, 1200×630, exported from the Figma frame (node 893-1463).
 * Deliberately left as a PNG: scraper support for AVIF is still patchy, and a
 * share card that silently fails to render costs more than the bytes save.
 */
export const OG_IMAGE = "/og-image.png";

export const OG_IMAGE_ALT = "Ceres Kersiefees 2026 – Saterdag 5 Desember, Rugbyklub, Ceres";

/** Profiles that belong to the festival, for `sameAs` and social discovery. */
export const SOCIALS = [
  "https://www.instagram.com/ceres_kersiefees/",
  "https://www.facebook.com/profile.php?id=61580597143920",
];

export const TICKETS_URL = "https://www.quicket.co.za/events/389341-ceres-kersiefees/";

/** One festival day: gates 09:00, music until 22:00 (sport starts 06:00). */
export const EVENT = {
  startDate: "2026-12-05T09:00:00+02:00",
  endDate: "2026-12-05T22:00:00+02:00",
  venue: {
    name: "Ceres Rugbyklub",
    street: "Phillip Straat",
    locality: "Ceres",
    region: "Wes-Kaap",
    postalCode: "6835",
    country: "ZA",
    /* Same coordinates the Google Map centres on (interactive/GoogleMap.tsx). */
    latitude: -33.3689,
    longitude: 19.3111,
  },
  /** Headline acts from the programme, in stage order. */
  performers: ["Riaan Benadé", "Bok van Blerk"],
  /** Mirrors TicketSection; `price` is in ZAR. */
  offers: [
    { name: "Standaardkaartjie", price: "250" },
    { name: "Kinderkaartjie", price: "150" },
    { name: "Opelug Preek", price: "0" },
  ],
} as const;
