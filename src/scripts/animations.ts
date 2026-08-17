import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { reducedMotion, registerEases } from "./motion";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* Timing rhythm + easing set adapted from more-nutrition.webflow.io. */
registerEases();

/** Items trail each other by roughly two frames. */
const STAGGER = 0.039;
/** Negative stagger: the last item leads and the row unfolds backwards. */
const STAGGER_BACK = -0.048;
/** Reveals fire as the element clears the fold, and only once. */
const revealTrigger = (trigger: Element, start = "top 90%") => ({
  trigger,
  start,
  once: true,
});

/** Decorative leaves & cherries drift and sway forever. */
function floatDecorations() {
  gsap.utils.toArray<HTMLElement>("[data-float]").forEach((el, i) => {
    gsap.to(el, {
      y: () => gsap.utils.random(-22, 22),
      rotation: () => gsap.utils.random(-8, 8),
      duration: gsap.utils.random(3, 5),
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: i * 0.35,
    });
  });
}

/** Sections and blocks rise softly into view on the house curve. */
function scrollReveals() {
  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        scrollTrigger: revealTrigger(el),
      },
    );
  });
}

/**
 * Headings reveal line by line: each line sits below a mask and springs up,
 * overshooting a little before it settles. `autoSplit` re-splits on resize
 * and after the webfont loads, so the line boxes always match the layout.
 */
function splitHeadings() {
  gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) => {
        gsap.set(el, { opacity: 1 });
        return gsap.from(self.lines, {
          yPercent: 130,
          duration: 0.95,
          ease: "elastic-out-soft",
          stagger: STAGGER,
          scrollTrigger: revealTrigger(el),
        });
      },
    });
  });
}

/**
 * Cards that rise straight up and settle — no tilt, no swing. Used where a
 * grid of cards would look chaotic if every one of them tumbled in.
 */
function riseReveals() {
  gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "elastic-out-soft",
        scrollTrigger: revealTrigger(el, "top 95%"),
      },
    );
  });
}

/** Cards and badges tumble in and spring upright. */
function popReveals() {
  const pop = {
    opacity: 1,
    y: 0,
    x: 0,
    rotation: 0,
    scale: 1,
    duration: 0.8,
    ease: "elastic-out",
  };
  const from = { opacity: 0, y: 100, x: -40, rotation: -35, scale: 0.6 };

  gsap.utils.toArray<HTMLElement>("[data-pop]").forEach((el) => {
    gsap.fromTo(el, from, { ...pop, scrollTrigger: revealTrigger(el, "top 95%") });
  });

  // A group shares one trigger so its items unfold as a run, last one leading.
  gsap.utils.toArray<HTMLElement>("[data-pop-group]").forEach((group) => {
    const items = group.children;
    if (!items.length) return;
    gsap.fromTo(items, from, {
      ...pop,
      stagger: STAGGER_BACK,
      scrollTrigger: revealTrigger(group, "top 95%"),
    });
  });
}

/** Tickets wobble in with an exaggerated tilt before springing flat. */
function ticketReveals() {
  gsap.utils.toArray<HTMLElement>("[data-ticket]").forEach((el, i) => {
    const settled = gsap.getProperty(el, "rotation") as number;
    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: 120,
        rotation: settled + (i % 2 === 0 ? 7 : -7),
        scale: 0.94,
      },
      {
        opacity: 1,
        y: 0,
        rotation: settled,
        scale: 1,
        duration: 0.85,
        ease: "elastic-out",
        scrollTrigger: revealTrigger(el, "top 88%"),
      },
    );
  });
}

/** Infinite marquees (info ribbon + sponsor logos); ease down on hover. */
function marquees() {
  gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((wrap) => {
    const track = wrap.querySelector<HTMLElement>(".marquee-track");
    if (!track) return;

    const speed = Number(wrap.dataset.marqueeSpeed ?? 50); // px / second
    const distance = track.scrollWidth / 2;
    const tween = gsap.to(track, {
      x: -distance,
      duration: distance / speed,
      ease: "none",
      repeat: -1,
    });

    // ramp the speed change instead of snapping it
    const rampTo = (scale: number) => gsap.to(tween, { timeScale: scale, duration: 0.45, ease: "power1.inOut" });
    wrap.addEventListener("mouseenter", () => rampTo(0.15));
    wrap.addEventListener("mouseleave", () => rampTo(1));
  });
}

/** Lenis inertia scrolling, driven by the GSAP ticker so ScrollTrigger stays in sync. */
function smoothScroll() {
  const lenis = new Lenis({ lerp: 0.18, anchors: { offset: -130 } });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function initAnimations() {
  if (reducedMotion()) return;
  document.documentElement.classList.add("gsap-ready");

  smoothScroll();
  floatDecorations();
  scrollReveals();
  riseReveals();
  popReveals();
  ticketReveals();
  marquees();

  // splitting needs final line boxes, so wait for the webfont
  document.fonts.ready.then(splitHeadings);

  // recalc marquee distances after fonts/images settle
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
