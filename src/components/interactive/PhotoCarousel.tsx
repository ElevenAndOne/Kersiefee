import { type CSSProperties, useState } from "react";
import { SMOOTH } from "../../scripts/motion";

export interface CarouselPhoto {
  src: string;
  alt: string;
}

interface PhotoCarouselProps {
  photos: CarouselPhoto[];
}

/**
 * Where a photo sits, by its distance from the centre. `x` is in steps (one
 * step = centre circle to side circle), `scale` is relative to the centre
 * size. Slots past the flanking pair are transparent: they're the runway new
 * photos accelerate in from, so nothing ever pops into existence mid-row.
 */
const SLOTS = [
  { x: 0, scale: 1, opacity: 1, z: 30 },
  { x: 1, scale: 0.75, opacity: 1, z: 20 },
  { x: 1.7, scale: 0.5, opacity: 0, z: 10 },
  { x: 2.2, scale: 0.35, opacity: 0, z: 0 },
];

/** Rendered slots either side of centre — two of them are off-stage. */
const WINDOW = [-3, -2, -1, 0, 1, 2, 3];

/**
 * Circular photo carousel from the welcome section.
 *
 * Every photo is one absolutely-centred box of `--big`, moved and shrunk with
 * a transform — never with width/height. Layout therefore never changes, so a
 * step is pure compositing: no reflow, no gap arithmetic, and the row can't
 * lurch when React swaps the photo that just left the window.
 */
export default function PhotoCarousel({ photos }: PhotoCarouselProps) {
  // virtual position, increments/decrements without bounds
  const [pos, setPos] = useState(0);

  const count = photos.length;
  const photoAt = (v: number) => photos[((v % count) + count) % count];

  return (
    <div
      className="relative h-[var(--big)] [--big:min(27vw,29.5rem)] [--gap:2rem] tablet:[--big:20rem] tablet:[--gap:1.5rem] landscape:[--big:16rem] portrait:[--big:14rem] portrait:[--gap:1rem]"
      style={{ "--step": "calc(var(--big) * 0.875 + var(--gap))" } as CSSProperties}
      role="region"
      aria-roledescription="karousel"
      aria-label="Foto's van die fees"
    >
      {WINDOW.map((offset) => {
        const v = pos + offset;
        const photo = photoAt(v);
        const slot = SLOTS[Math.abs(offset)];
        const direction = Math.sign(offset);

        return (
          <div
            key={v}
            data-carousel-slide
            className="absolute top-1/2 left-1/2 size-[var(--big)] overflow-hidden rounded-full will-change-transform"
            style={{
              transform: `translate(-50%, -50%) translateX(calc(var(--step) * ${direction * slot.x})) scale(${slot.scale})`,
              opacity: slot.opacity,
              zIndex: slot.z,
              // kept out of a JS branch so server and client render alike;
              // prefers-reduced-motion switches it off in global.css
              transition: `transform 700ms ${SMOOTH}, opacity 700ms ${SMOOTH}`,
            }}
            aria-hidden={offset !== 0}
          >
            <img
              src={photo.src}
              alt={offset === 0 ? photo.alt : ""}
              loading="lazy"
              className="size-full object-cover"
            />
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => setPos((p) => p - 1)}
        aria-label="Vorige foto"
        className={ARROW + " left-0"}
      >
        <Chevron className="size-8 rotate-180 landscape:size-6" />
      </button>
      <button
        type="button"
        onClick={() => setPos((p) => p + 1)}
        aria-label="Volgende foto"
        className={ARROW + " right-0"}
      >
        <Chevron className="size-8 landscape:size-6" />
      </button>
    </div>
  );
}

/**
 * The chevrons hold the edges of the content column. Below 1280px the side
 * photos bleed past those edges, so the buttons get a translucent disc to stay
 * legible where they overlap a photo.
 */
const ARROW = "absolute top-1/2 z-40 -translate-y-1/2 cursor-pointer p-2 text-cherry "
  + "transition-transform hover:scale-125 tablet:rounded-full tablet:bg-white/75 tablet:p-1.5";

function Chevron({ className = "" }: { className?: string; }) {
  return (
    <svg
      viewBox="0 0 30 30"
      fill="none"
      className={className}
      aria-hidden="true"
    >
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
