import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { dragScrub } from "./marquee";
import { reducedMotion, registerEases } from "./motion";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* Timing rhythm + easing set adapted from more-nutrition.webflow.io. */
registerEases();

/** Items trail each other by roughly two frames. */
const STAGGER = 0.039;
/** Reveals fire as the element clears the fold, and only once. */
const revealTrigger = (trigger: Element, start = "top 90%") => ({
  trigger,
  start,
  once: true,
});

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

/** Infinite marquees (info ribbon + sponsor logos); ease down on hover, draggable. */
function marquees() {
  gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((wrap) => {
    const track = wrap.querySelector<HTMLElement>(".marquee-track");
    if (!track) return;

    const copies = track.querySelectorAll<HTMLElement>(":scope > *");
    if (copies.length < 2) return;

    const speed = Number(wrap.dataset.marqueeSpeed ?? 50); // px / second

    /* One loop period: the offset between the track's two identical copies.
       NOT scrollWidth / 2 — once the track overflows, Chrome leaves its
       trailing padding-right out of scrollWidth, which put the wrap point
       half that padding short of a full period: a visible jump every loop. */
    const period = () => copies[1].offsetLeft - copies[0].offsetLeft;

    /* The loop runs on a unitless 0→1 proxy and maps it to px in onUpdate,
       so the travel always spans the CURRENT period. A px distance baked
       into the tween went stale as soon as the lazy-loaded logos arrived
       and widened the track, which also made the wrap-around jump. */
    const setX = gsap.quickSetter(track, "x", "px");
    let px = period();
    const loop = { p: 0 };
    const tween = gsap.to(loop, {
      p: 1,
      duration: px / speed,
      ease: "none",
      repeat: -1,
      onUpdate: () => setX(-px * loop.p),
    });

    /* Whenever images/fonts settle or a breakpoint crossing resizes the
       copies, re-measure and re-apply at the same loop progress — with a
       matching duration so `speed` stays true px/second. */
    const resync = () => {
      px = period();
      const progress = tween.progress();
      tween.duration(px / speed).progress(progress);
      setX(-px * progress);
    };
    const sizes = new ResizeObserver(resync);
    sizes.observe(track);
    sizes.observe(copies[0]);

    // ramp the speed change instead of snapping it
    const rampTo = (scale: number, duration = 0.45) =>
      gsap.to(tween, { timeScale: scale, duration, ease: "power1.inOut", overwrite: true });

    /* Tracked so a drag released without the pointer having left can resume at
       the eased-down hover speed rather than jumping back to full. */
    let hovering = false;
    wrap.addEventListener("mouseenter", () => {
      hovering = true;
      rampTo(0.15);
    });
    wrap.addEventListener("mouseleave", () => {
      hovering = false;
      rampTo(1);
    });

    dragScrub(wrap, tween, {
      span: () => -px,
      onGrab: () => gsap.killTweensOf(tween),
      onRelease: () => rampTo(hovering ? 0.15 : 1, 0.9),
    });
  });
}

/**
 * Cloud sections (Event, Program, Directions): as a section's seam with the
 * next one crosses the fold, its content and background lag a little
 * behind the scroll — drifting down a touch — while the cloud silhouette
 * riding on top keeps pace with the page. That's the depth the Figma
 * component's separate "Foreground" cloud layer was built for.
 *
 * The cloud itself is never tweened, so it stays exactly where it always
 * sits (flush with the section's bottom edge) — the seam can't gap. The
 * lagging layers only ever drift toward the next section, and the
 * section's own overflow-hidden (Section.astro) clips whatever that
 * uncovers at the top, which is already scrolled out of view by then.
 */
function cloudParallax() {
  gsap.utils.toArray<HTMLElement>("[data-cloud-parallax]").forEach((section) => {
    const cloud = section.querySelector("[data-cloud]");
    const layers = Array.from(section.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== cloud,
    );
    if (!layers.length) return;

    gsap.fromTo(
      layers,
      { y: 0 },
      {
        y: () => Math.min(section.offsetHeight * 0.06, 80),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "center center",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
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
  scrollReveals();
  riseReveals();
  ticketReveals();
  marquees();
  cloudParallax();

  // splitting needs final line boxes, so wait for the webfont
  document.fonts.ready.then(splitHeadings);

  // recalc scroll-trigger positions after fonts/images settle
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
