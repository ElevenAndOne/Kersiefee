import { gsap } from "gsap";

/* ---------------------------------------------------------------------------
   Pointer-drag scrubbing for the marquees.

   Every marquee on the site is the same shape: a `.marquee-track` holding two
   identical copies of its content, moved by one linear `repeat: -1` tween. So
   dragging is a matter of nudging that tween's progress rather than fighting
   it for control of `x` — on release the auto-scroll carries on from wherever
   the pointer left it, and the seam stays invisible because progress wraps.

   What the three call sites keep for themselves is their hover behaviour (the
   ribbon eases down to 15%, the card carousels stop dead), so this helper only
   owns the gesture and hands control back through `onRelease`.
--------------------------------------------------------------------------- */

/** Past this many px the gesture is a drag, not a click on a card. */
const DRAG_THRESHOLD = 6;

/** How long a flick keeps coasting after release. */
const THROW_MS = 140;
const THROW_EASE_DURATION = 0.7;

/** Below this (px/ms) a release is a plain let-go rather than a throw. */
const MIN_THROW_VELOCITY = 0.05;

interface Options {
  /**
   * Signed pixels the track travels over one repeat — negative for a row
   * running left, positive for one running right. Dividing a pointer delta by
   * it converts px of drag into tween progress, direction included. A getter
   * suits a track whose width is still settling (lazy images, breakpoint
   * changes); a plain number suits one measured once.
   */
  span: number | (() => number);
  /** Fired when a drag takes hold, to cancel any ramp the caller had running. */
  onGrab: () => void;
  /** Fired when the gesture (and any throw) ends, to resume the caller's tween. */
  onRelease: () => void;
}

export function dragScrub(
  wrap: HTMLElement,
  tween: gsap.core.Tween,
  { span, onGrab, onRelease }: Options,
) {
  const wrapProgress = gsap.utils.wrap(0, 1);
  const spanPx = typeof span === "function" ? span : () => span;

  let pointerId: number | null = null;
  /* Touch has to commit to an axis: a mostly-vertical first move is the page
     being scrolled and must be left alone. A mouse drag is unambiguous. */
  let axis: "unknown" | "x" | "y" = "unknown";
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startProgress = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0; // px/ms
  let throwTween: gsap.core.Tween | null = null;
  /* A drag that ends over a card must not also count as a click on it. */
  let justDragged = false;

  wrap.classList.add("marquee-drag");

  const beginDrag = (event: PointerEvent) => {
    dragging = true;
    /* Capture keeps the gesture alive past the row's edges. It throws if the
       pointer went away between down and move, which must not take the rest
       of the drag with it. */
    try {
      wrap.setPointerCapture(event.pointerId);
    } catch {
      /* not fatal — the drag just ends when the pointer leaves */
    }
    wrap.classList.add("is-dragging");
    // A mouse drag across copy would otherwise select it.
    window.getSelection()?.removeAllRanges();
    tween.pause();
    onGrab();
  };

  const finish = (throwIt: boolean) => {
    if (pointerId === null) return;
    if (wrap.hasPointerCapture(pointerId)) wrap.releasePointerCapture(pointerId);

    const wasDragging = dragging;
    pointerId = null;
    axis = "unknown";
    dragging = false;
    wrap.classList.remove("is-dragging");

    if (!wasDragging) return; // a click, not a drag — nothing to hand back

    justDragged = true;
    // Cleared on the next task, once the click this gesture generates is past.
    setTimeout(() => { justDragged = false; }, 0);

    const resume = () => { tween.play(); onRelease(); };

    if (throwIt && Math.abs(velocity) > MIN_THROW_VELOCITY) {
      /* Coast on, then hand back. Scrubbing a proxy rather than the tween
         itself keeps this independent of the tween's own playhead. */
      const proxy = { p: tween.progress() };
      throwTween = gsap.to(proxy, {
        p: proxy.p + (velocity * THROW_MS) / spanPx(),
        duration: THROW_EASE_DURATION,
        ease: "power2.out",
        onUpdate: () => tween.progress(wrapProgress(proxy.p)),
        onComplete: resume,
      });
    } else {
      resume();
    }
  };

  wrap.addEventListener("pointerdown", (event) => {
    // Left button only; ignore secondary clicks and extra touches mid-drag.
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (pointerId !== null) return;

    throwTween?.kill();
    pointerId = event.pointerId;
    axis = event.pointerType === "mouse" ? "x" : "unknown";
    startX = lastX = event.clientX;
    startY = event.clientY;
    startProgress = tween.progress();
    lastTime = event.timeStamp;
    velocity = 0;
  });

  wrap.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (axis === "unknown") {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (axis === "y") {
        pointerId = null; // hand the gesture back to the page
        return;
      }
    }

    if (!dragging) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      beginDrag(event);
    }

    tween.progress(wrapProgress(startProgress + dx / spanPx()));

    const dt = event.timeStamp - lastTime;
    if (dt > 0) {
      velocity = (event.clientX - lastX) / dt;
      lastX = event.clientX;
      lastTime = event.timeStamp;
    }
  });

  wrap.addEventListener("pointerup", () => finish(true));
  wrap.addEventListener("pointercancel", () => finish(false));

  /* Capture phase, so a card's own click handler never sees the click that
     ends a drag. */
  wrap.addEventListener("click", (event) => {
    if (!justDragged) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  /* Native image/link dragging would otherwise pre-empt the gesture. */
  wrap.addEventListener("dragstart", (event) => event.preventDefault());
}
