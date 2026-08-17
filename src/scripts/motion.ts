import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

/* ---------------------------------------------------------------------------
   Shared motion primitives, used by the global scroll animations and by the
   React islands so both speak the same language.

   "smooth" is the house curve for anything that travels: a fast start that
   spends most of its time settling. The two elastic curves overshoot and
   spring back — "elastic-out" throws to ~114% and is for playful pops,
   "elastic-out-soft" only reaches ~105% and is for text and copy.
--------------------------------------------------------------------------- */

/** The house curve, in plain CSS terms for transition-driven components. */
export const SMOOTH = "cubic-bezier(0.32, 0.72, 0, 1)";

const ELASTIC_OUT =
  "M0,0 L0.076,0.5737 L0.1187,0.8382 L0.1419,0.9463 L0.1654,1.0292 L0.1897,1.0886 L0.2153,1.1258 L0.2297,1.137 L0.2448,1.1424 L0.261,1.1423 L0.2786,1.1366 L0.3101,1.1165 L0.3862,1.0507 L0.4257,1.0219 L0.4699,0.9995 L0.5163,0.9872 L0.5877,0.9842 L0.8126,1.0011 L1,1";

const ELASTIC_OUT_SOFT =
  "M0,0 L0.017,0.029 L0.036,0.113 L0.111,0.604 L0.15,0.809 L0.191,0.949 L0.213,0.995 L0.236,1.026 L0.262,1.044 L0.293,1.049 L0.435,1.01 L0.512,1 L1,1";

let registered = false;

/**
 * Registers the named eases and makes "smooth" the default. Islands are
 * bundled separately from the page script, so each entry point calls this to
 * set up whichever GSAP instance it ends up with. Call it from the client
 * (module scope on the page script, an effect in a component).
 */
export function registerEases() {
  if (registered) return;
  registered = true;

  gsap.registerPlugin(CustomEase);
  CustomEase.create("smooth", "0.32, 0.72, 0, 1");
  CustomEase.create("elastic-out", ELASTIC_OUT);
  CustomEase.create("elastic-out-soft", ELASTIC_OUT_SOFT);
  gsap.defaults({ ease: "smooth" });
}

/** Honour the OS setting; `?noanim` forces it on for testing. SSR-safe. */
export function reducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    || new URLSearchParams(window.location.search).has("noanim");
}
