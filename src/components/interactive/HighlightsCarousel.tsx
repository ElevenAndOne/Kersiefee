import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { reducedMotion, registerEases } from "../../scripts/motion";

interface Slide {
  title: string;
  body: string;
}

/**
 * Depth per line: the title is the near layer and travels furthest, the body
 * trails behind it. The same numbers drive the exit and the entrance, so a
 * slide leaves along the axis the next one arrives on.
 */
const LAYERS = [
  { shift: 26, rotate: 4, blur: 10, scale: 0.9 }, // title
  { shift: 17, rotate: 2.5, blur: 7, scale: 0.94 }, // body
];

const layer = (key: keyof (typeof LAYERS)[number]) => (i: number) => LAYERS[i][key];

/**
 * White "3D box" card on the grass banner. Slides come from the Figma
 * annotation on the highlights card.
 *
 * The card holds one fixed height — the tallest slide's — so stepping through
 * never resizes the box or nudges the section below it; every slide is centred
 * in that space however short its copy is.
 */
export default function HighlightsCarousel({ slides }: { slides: Slide[]; }) {
  const [active, setActive] = useState(3); // "Vier die mense agter die oes" first, as in Figma
  const direction = useRef<1 | -1>(1);
  const busy = useRef(false);
  const lines = useRef<HTMLElement[]>([]);

  const collect = (i: number) => (el: HTMLElement | null) => {
    if (el) lines.current[i] = el;
  };

  const go = (dir: 1 | -1) => {
    if (busy.current) return;
    const next = () => setActive((i) => (i + dir + slides.length) % slides.length);

    if (reducedMotion()) {
      next();
      return;
    }

    busy.current = true;
    direction.current = dir;

    // out: each line tips, shrinks and blurs away along the travel direction
    gsap.to(lines.current, {
      yPercent: (i: number) => -layer("shift")(i) * dir,
      rotate: (i: number) => -layer("rotate")(i) * dir,
      scale: layer("scale"),
      filter: (i: number) => `blur(${layer("blur")(i)}px)`,
      opacity: 0,
      duration: 0.34,
      ease: "power2.in",
      stagger: 0.045,
      onComplete: next,
    });
  };

  // in: the same layers, arriving from the far side and settling with a spring
  useEffect(() => {
    if (reducedMotion()) return;
    registerEases();

    const dir = direction.current;
    const tween = gsap.fromTo(
      lines.current,
      {
        yPercent: (i: number) => layer("shift")(i) * dir,
        rotate: (i: number) => layer("rotate")(i) * dir,
        scale: layer("scale"),
        filter: (i: number) => `blur(${layer("blur")(i)}px)`,
        opacity: 0,
      },
      {
        yPercent: 0,
        rotate: 0,
        scale: 1,
        filter: "blur(0px)",
        opacity: 1,
        duration: 0.8,
        ease: "elastic-out-soft",
        stagger: 0.06,
        clearProps: "filter",
        onComplete: () => {
          busy.current = false;
        },
      },
    );

    return () => {
      tween.kill();
    };
  }, [active]);

  const slide = slides[active];

  return (
    <div
      className="flex w-full items-center justify-center"
      role="region"
      aria-roledescription="karousel"
      aria-label="Hoogtepunte van die fees"
    >
      <div className="box-shadow bg-white relative flex min-h-56 w-full max-w-286 items-center justify-between gap-2 px-10 py-8 landscape:px-8 portrait:px-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Vorige hoogtepunt"
          className="shrink-0 cursor-pointer p-2 text-cherry transition-transform hover:scale-125 portrait:p-1"
        >
          <Chevron className="size-7 rotate-180 landscape:size-5" />
        </button>

        <div className="grid flex-1 place-items-center">
          {
            /* Sizers: every slide stacked in the same grid cell but invisible,
              so the cell is always as tall as the longest one. */
          }
          {slides.map((s, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="invisible col-start-1 row-start-1 flex max-w-190 flex-col items-center gap-5 text-center"
            >
              <h2 className="h1">{s.title}</h2>
              <p className="body-lg">{s.body}</p>
            </div>
          ))}

          <div
            className="col-start-1 row-start-1 flex max-w-190 flex-col items-center gap-5 text-center text-cherry"
            aria-live="polite"
          >
            <h2 ref={collect(0)} className="h1 will-change-transform">{slide.title}</h2>
            <p ref={collect(1)} className="body-lg will-change-transform">{slide.body}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Volgende hoogtepunt"
          className="shrink-0 cursor-pointer p-2 text-cherry transition-transform hover:scale-125 portrait:p-1"
        >
          <Chevron className="size-7 landscape:size-5" />
        </button>
      </div>
    </div>
  );
}

function Chevron({ className = "" }: { className?: string; }) {
  return (
    <svg viewBox="0 0 30 30" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 1.5 L26.4 15 L10 28.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
