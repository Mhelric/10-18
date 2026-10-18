// One reliable "go to next chapter" scroller for the whole site.
//
// Why buttons were only moving the screen a little:
//  - sections use min-h-[100dvh], and on phones the browser toolbar collapses
//    while you scroll, so every section above the target changes height
//    mid-scroll and the destination moves away from under the animation.
//  - some buttons also fired two smooth scrolls at once (scrollTo + scrollIntoView),
//    which cancel each other.
//
// Fix: do ONE smooth scroll, wait until it settles, then re-aim if we're still off.
export function scrollToSection(id, { instant = false } = {}) {
  const target = document.getElementById(id);
  if (!target) return;

  // Long trips (like finale -> back to the start) jump straight there.
  // A smooth scroll across the whole site gets interrupted by layout changes
  // (dvh sections, images, animations) and stops partway.
  if (instant) {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto"; // beat the global `scroll-behavior: smooth`

    const jump = () =>
      window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);

    jump();
    requestAnimationFrame(jump);
    setTimeout(() => {
      jump(); // re-aim once the layout has settled
      root.style.scrollBehavior = previous;
    }, 150);
    return;
  }

  const reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = () => {
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };

  go();

  let lastY = -1;
  let stableFrames = 0;
  let corrections = 0;
  let frames = 0;

  const watch = () => {
    frames += 1;
    const y = window.scrollY;
    stableFrames = Math.abs(y - lastY) < 1 ? stableFrames + 1 : 0;
    lastY = y;

    if (stableFrames >= 8) {
      // Scrolling has stopped. Are we actually at the section?
      const offBy = target.getBoundingClientRect().top;
      if (Math.abs(offBy) > 4 && corrections < 3) {
        corrections += 1;
        stableFrames = 0;
        lastY = -1;
        go();
      } else {
        return; // landed
      }
    }

    if (frames < 300) requestAnimationFrame(watch);
  };

  requestAnimationFrame(watch);
}
