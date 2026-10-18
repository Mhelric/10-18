import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { scrollToSection } from "../../utils/scrollToSection";

const MAX_YES_SCALE = 1.3; // Yes never grows past this
const EDGE = 10; // No stays this far inside the play area
const YES_GAP = 14; // breathing room kept around Yes
const DODGE_COOLDOWN_MS = 220; // one tap fires several events; count it once

const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

/* A small burst of hearts (14 particles) when she says yes. */
function HeartBurst() {
  const [particles] = useState(() =>
    Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 70 + Math.random() * 70;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 24,
        size: 11 + Math.random() * 9,
        delay: Math.random() * 0.15,
        duration: 1.2 + Math.random() * 0.5,
        color: ["#C9788A", "#C9A24B", "#F4D6D0"][i % 3],
      };
    })
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 w-0 h-0"
    >
      {particles.map((p) => (
        <motion.svg
          key={p.id}
          viewBox="0 0 24 24"
          width={p.size}
          height={p.size}
          className="absolute"
          style={{ left: -p.size / 2, top: -p.size / 2 }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{ x: p.x, y: p.y, scale: [0, 1.1, 0.9], opacity: [0, 1, 0] }}
          transition={{
            x: { duration: p.duration, delay: p.delay, ease: "easeOut" },
            y: { duration: p.duration, delay: p.delay, ease: "easeOut" },
            scale: { duration: p.duration, delay: p.delay, times: [0, 0.25, 1], ease: "easeOut" },
            opacity: { duration: p.duration, delay: p.delay, times: [0, 0.25, 1], ease: "easeOut" },
          }}
        >
          <path d={HEART_PATH} fill={p.color} />
        </motion.svg>
      ))}
    </div>
  );
}

/* What shows after she taps Yes. Timers start when this mounts. */
function YesReveal({ message, continueCue, reduce }) {
  const [showCue, setShowCue] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowCue(true), 1800); // soft cue after the message lands
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      key="answer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-[380px] flex flex-col items-center"
    >
      {/* Message + hearts */}
      <div className="relative py-6">
        {!reduce && <HeartBurst />}
        <motion.p
          className="relative font-handwriting text-4xl sm:text-5xl text-cream leading-snug"
          style={{
            textShadow:
              "0 0 24px rgba(201,120,138,0.55), 0 0 48px rgba(201,162,75,0.25)",
          }}
          initial={reduce ? false : { scale: 0.94 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {message}
        </motion.p>
      </div>

      {/* Scroll cue (slot is reserved too) */}
      <div className="mt-8 min-h-[64px] flex items-center justify-center">
        {showCue && (
          <motion.button
            type="button"
            onClick={() => scrollToSection("letter")}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-30 flex flex-col items-center text-gold hover:text-gold/80 active:scale-95 transition-transform cursor-pointer py-3 px-6 touch-manipulation"
          >
            <span className="font-typewriter text-[11px] uppercase tracking-[0.25em]">
              {continueCue}
            </span>
            <motion.svg
              className="w-4 h-4 mt-1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              animate={reduce ? {} : { y: [0, 4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default function AnoTaraChapter({ data = {} }) {
  const {
    question = "Ano Tara??? 😏",
    yesLabel = "Yes",
    noLabel = "No",
    yesMessage = "Yeyyyy mamaya lovey tara, putukan na hehe",
    dodgeLines = [],
    continueCue = "to the letter",
  } = data;

  const shouldReduceMotion = useReducedMotion();

  const [answered, setAnswered] = useState(false); // React state only, no storage
  const [dodgeCount, setDodgeCount] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  const areaRef = useRef(null);
  const yesRef = useRef(null);
  const noRef = useRef(null);
  const noPosRef = useRef(null);
  const lastDodgeAt = useRef(0);
  const hasDodged = useRef(false);

  /* Pick a spot for No: fully inside the play area, never on top of Yes. */
  const pickNoPosition = useCallback((from) => {
    const area = areaRef.current;
    const yes = yesRef.current;
    const no = noRef.current;
    if (!area || !yes || !no) return null;

    const W = area.clientWidth;
    const H = area.clientHeight;
    const nw = no.offsetWidth;
    const nh = no.offsetHeight;
    const minX = EDGE;
    const minY = EDGE;
    const maxX = Math.max(minX, W - nw - EDGE);
    const maxY = Math.max(minY, H - nh - EDGE);

    // Yes scales around its centre, so keep out of its biggest possible box.
    const areaRect = area.getBoundingClientRect();
    const yesRect = yes.getBoundingClientRect();
    const cx = yesRect.left - areaRect.left + yesRect.width / 2;
    const cy = yesRect.top - areaRect.top + yesRect.height / 2;
    const hw = (yes.offsetWidth * MAX_YES_SCALE) / 2 + YES_GAP;
    const hh = (yes.offsetHeight * MAX_YES_SCALE) / 2 + YES_GAP;
    const box = { l: cx - hw, r: cx + hw, t: cy - hh, b: cy + hh };

    const hitsYes = (x, y) =>
      x < box.r && x + nw > box.l && y < box.b && y + nh > box.t;

    let fallback = null;
    for (let i = 0; i < 60; i += 1) {
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);
      if (hitsYes(x, y)) continue;
      if (!fallback) fallback = { x, y };
      // Prefer a spot that's clearly far from where No was
      if (!from || Math.hypot(x - from.x, y - from.y) > 80) return { x, y };
    }
    if (fallback) return fallback;

    const corners = [
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
      { x: maxX, y: minY },
      { x: minX, y: minY },
    ];
    return corners.find((c) => !hitsYes(c.x, c.y)) || corners[0];
  }, []);

  /* Starting spot: right next to Yes, same row. */
  const sideBySideStart = useCallback(() => {
    const area = areaRef.current;
    const yes = yesRef.current;
    const no = noRef.current;
    if (!area || !yes || !no) return null;
    const areaRect = area.getBoundingClientRect();
    const yesRect = yes.getBoundingClientRect();
    const yesCx = yesRect.left - areaRect.left + yesRect.width / 2;
    const yesCy = yesRect.top - areaRect.top + yesRect.height / 2;
    return {
      x: yesCx + yes.offsetWidth / 2 + 14,
      y: yesCy - no.offsetHeight / 2,
    };
  }, []);

  /* Dodge: runs on hover, touch, focus and click. It never lets a click through. */
  const dodge = useCallback(
    (e) => {
      if (e) {
        if (e.cancelable) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
      }
      const now = performance.now();
      if (now - lastDodgeAt.current < DODGE_COOLDOWN_MS) return;
      lastDodgeAt.current = now;
      hasDodged.current = true;

      const next = pickNoPosition(noPosRef.current);
      if (next) {
        noPosRef.current = next;
        setNoPos(next);
      }
      setDodgeCount((c) => c + 1);
    },
    [pickNoPosition]
  );

  /* First placement (beside Yes) + re-place if the play area resizes. */
  useLayoutEffect(() => {
    if (answered) return undefined;
    const area = areaRef.current;
    if (!area) return undefined;

    const place = () => {
      const no = noRef.current;
      if (!no) return;

      if (!hasDodged.current) {
        // Before any dodging, No always sits right beside Yes
        const start = sideBySideStart();
        if (!start) return;
        const firstTime = !noPosRef.current;
        noPosRef.current = start;
        setNoPos(start);
        if (firstTime) requestAnimationFrame(() => setReady(true));
      } else {
        const next = pickNoPosition(noPosRef.current);
        if (next) {
          noPosRef.current = next;
          setNoPos(next);
        }
      }
    };

    place();
    let first = true;
    const observer = new ResizeObserver(() => {
      if (first) {
        first = false; // the initial callback just reports the starting size
        return;
      }
      place();
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, [answered, pickNoPosition, sideBySideStart]);

  /* touchstart has to be non-passive to be allowed to preventDefault. */
  useEffect(() => {
    const el = noRef.current;
    if (!el) return undefined;
    const onTouch = (e) => dodge(e);
    el.addEventListener("touchstart", onTouch, { passive: false });
    return () => el.removeEventListener("touchstart", onTouch);
  }, [dodge, answered]);

  const yesScale = Math.min(MAX_YES_SCALE, 1 + dodgeCount * 0.06);
  const dodgeLine =
    dodgeCount > 0 && dodgeLines.length > 0
      ? dodgeLines[(dodgeCount - 1) % dodgeLines.length]
      : "";

  return (
    <section
      id="ano-tara"
      className="relative w-full min-h-[100dvh] px-4 py-16 flex flex-col items-center justify-center text-center overflow-hidden select-none bg-gradient-to-b from-[#2B1233] via-burgundy to-[#1C0812]"
    >
      {/* Soft warm glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(201,162,75,0.14), transparent 60%)",
        }}
      />

      <AnimatePresence mode="wait">
        {!answered ? (
          <motion.div
            key="ask"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-[380px] flex flex-col items-center"
          >
            <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-3">
              A little question
            </span>

            <h2 className="font-serif text-5xl sm:text-6xl text-cream font-normal leading-tight">
              {question}
            </h2>

            {/* Play area: the No button lives (and runs) in here */}
            <div
              ref={areaRef}
              className="relative mt-8 w-full h-[280px] rounded-2xl border border-dashed border-gold/20 bg-white/[0.03]"
            >
              {/* Yes comes first in the DOM so keyboard users reach it right away */}
              <motion.button
                ref={yesRef}
                type="button"
                onClick={() => setAnswered(true)}
                animate={{ scale: yesScale }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 300, damping: 18 }
                }
                style={{ left: "calc(50% - 44px)", top: "38%", x: "-50%", y: "-50%" }}
                className="absolute z-10 px-10 py-3.5 rounded-full bg-gradient-to-br from-rose to-[#B24D63] border border-gold/70 text-cream font-serif text-2xl tracking-wide shadow-[0_8px_28px_rgba(201,120,138,0.45)] cursor-pointer touch-manipulation"
              >
                {yesLabel}
              </motion.button>

              {/* No can never be clicked. It's hidden from screen readers
                  and skipped by Tab; every way of reaching it makes it run. */}
              <motion.button
                ref={noRef}
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onPointerEnter={dodge}
                onPointerDown={dodge}
                onMouseDown={(e) => e.preventDefault()}
                onFocus={dodge}
                onClick={dodge}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") dodge(e);
                }}
                initial={false}
                animate={{ x: noPos.x, y: noPos.y }}
                transition={
                  shouldReduceMotion || !ready
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 700, damping: 36, mass: 0.6 }
                }
                style={{ left: 0, top: 0, visibility: ready ? "visible" : "hidden" }}
                className="absolute z-20 px-5 py-2 rounded-full border border-blush/60 text-blush/90 font-typewriter text-xs tracking-widest uppercase bg-transparent touch-none cursor-default"
              >
                {noLabel}
              </motion.button>
            </div>

            {/* Dodge lines */}
            <div
              aria-live="polite"
              className="mt-4 min-h-[2.5rem] flex items-center justify-center"
            >
              {dodgeLine && (
                <motion.p
                  key={dodgeCount}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                  className="font-handwriting text-2xl text-blush"
                >
                  {dodgeLine}
                </motion.p>
              )}
            </div>
          </motion.div>
        ) : (
          <YesReveal
            key="answer"
            message={yesMessage}
            continueCue={continueCue}
            reduce={shouldReduceMotion}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
