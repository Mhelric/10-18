import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { scrollToSection } from "../../utils/scrollToSection";

function computeDaysRemainingManila(unlockAt) {
  if (!unlockAt) return 0;
  const now = new Date();

  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const [y1, m1, d1] = fmt.format(now).split("-").map(Number);
  const [y2, m2, d2] = fmt.format(new Date(unlockAt)).split("-").map(Number);

  const utcNow = Date.UTC(y1, m1 - 1, d1);
  const utcTarget = Date.UTC(y2, m2 - 1, d2);

  const diffDays = Math.ceil((utcTarget - utcNow) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export default function OpenWhenChapter({ openWhenData = [], metaData = {} }) {
  const shouldReduceMotion = useReducedMotion();

  const [openedIds, setOpenedIds] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [shakeId, setShakeId] = useState(null);
  const [showLockedNotice, setShowLockedNotice] = useState(false);
  const noticeTimer = useRef(null);

  const items = openWhenData.map((item) => {
    const daysLeft = item.unlockAt ? computeDaysRemainingManila(item.unlockAt) : 0;
    return { ...item, daysLeft, isLocked: Boolean(item.unlockAt && daysLeft > 0) };
  });

  const openableCount = items.filter((i) => !i.isLocked).length;
  const openedCount = Object.keys(openedIds).length;

  const handleEnvelopeTap = (item, index) => {
    if (item.isLocked) {
      setShakeId(index);
      setShowLockedNotice(true);
      setTimeout(() => setShakeId(null), 600);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setShowLockedNotice(false), 3200);
      return;
    }

    setOpenedIds((prev) => ({ ...prev, [index]: true }));
    setSelectedItem({ ...item, index });
  };

  return (
    <section
      id="open-when"
      className="relative w-full min-h-[100dvh] px-4 sm:px-6 pt-16 pb-10 select-none border-b border-blush/30 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Chapter header */}
      <div className="w-full flex flex-col items-center text-center mb-6">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
          {metaData.chapterTag || "Chapter 09 • Open When"}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-burgundy font-normal tracking-wide">
          {metaData.title || "Letters for Later"}
        </h2>
        <p className="font-handwriting text-lg text-rose mt-1 max-w-[320px]">
          {metaData.subtitle || "Open whenever you need me"}
        </p>

        <div className="mt-3 inline-flex items-center rounded-full px-4 py-1 border border-gold/30 bg-[#EFE3CF]/90">
          <span className="font-typewriter text-xs text-burgundy tracking-widest uppercase">
            Opened {openedCount} / {openableCount}
          </span>
        </div>
      </div>

      {/* Envelope list: everything visible, no sideways swiping */}
      <div className="w-full max-w-[380px] flex flex-col gap-3">
        {items.map((item, index) => {
          const isOpened = Boolean(openedIds[index]);
          const isShaking = shakeId === index;

          const countdownString =
            item.daysLeft === 1
              ? metaData.countdownSingular || "Opens in 1 day"
              : (metaData.countdownText || "Opens in {days} days").replace(
                  "{days}",
                  item.daysLeft
                );

          return (
            <motion.button
              key={`open-when-${index}`}
              type="button"
              onClick={() => handleEnvelopeTap(item, index)}
              aria-label={
                item.isLocked
                  ? `Letter ${index + 1}, locked. ${countdownString}`
                  : `Letter ${index + 1}: ${item.label}`
              }
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              style={{ x: 0 }}
              {...(isShaking && !shouldReduceMotion
                ? { animate: { x: [-6, 6, -4, 4, -2, 2, 0], opacity: 1, y: 0 } }
                : {})}
              className={`relative w-full text-left rounded-xl border overflow-hidden cursor-pointer touch-manipulation shadow-[0_6px_18px_rgba(43,18,51,0.07)] ${
                item.isLocked
                  ? "bg-[#E6DAC3] border-[#CBB998]"
                  : isOpened
                  ? "bg-[#FAF6EE] border-gold/60"
                  : "bg-[#EFE4D0] border-gold/45"
              }`}
            >
              {/* Envelope flap lines across the card */}
              <svg
                aria-hidden="true"
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 0 L50 62 L100 0"
                  fill="none"
                  stroke="rgba(201,162,75,0.35)"
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div className="relative z-10 flex items-center gap-3.5 px-4 py-4">
                {/* Wax seal */}
                <div
                  className={`shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-md ${
                    item.isLocked
                      ? "bg-burgundy/80 border-gold/60 text-gold text-base"
                      : "bg-gradient-to-br from-[#5E1A2F] via-burgundy to-[#300B17] border-gold/80 text-gold font-serif italic font-bold text-[11px]"
                  }`}
                >
                  {item.isLocked ? "🔒" : metaData.sealInitials || "M&J"}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <span className="font-typewriter text-[9px] tracking-[0.2em] uppercase text-burgundy/55">
                    Letter {index + 1}
                  </span>
                  <h3 className="font-serif text-[18px] text-burgundy font-normal leading-snug">
                    {item.label}
                  </h3>
                </div>
              </div>

              {/* Status strip */}
              <div
                className={`relative z-10 flex items-center justify-between px-4 py-2 border-t ${
                  item.isLocked ? "border-[#CBB998] bg-black/[0.03]" : "border-gold/25"
                }`}
              >
                {item.isLocked ? (
                  <>
                    <span className="font-typewriter text-[10px] tracking-wider text-burgundy/80">
                      {countdownString}
                    </span>
                    <span className="font-typewriter text-[9px] uppercase tracking-widest text-burgundy/60">
                      Locked
                    </span>
                  </>
                ) : isOpened ? (
                  <>
                    <span className="font-handwriting text-base text-rose">read again</span>
                    <span className="font-typewriter text-[9px] uppercase tracking-widest text-burgundy/70">
                      ✓ {metaData.openedBadge || "Opened"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-handwriting text-base text-rose">tap to open</span>
                    <span className="font-typewriter text-[9px] uppercase tracking-widest text-gold">
                      Sealed
                    </span>
                  </>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Locked-letter message (space is reserved so nothing jumps) */}
      <div className="h-8 mt-3 flex items-center justify-center text-center">
        <AnimatePresence>
          {showLockedNotice && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-handwriting text-lg text-rose"
            >
              {metaData.lockedNotice || "Locked for now. Be patient, Loveyyy..."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Next chapter */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          scrollToSection("finale");
        }}
        className="relative z-30 mt-4 flex flex-col items-center text-gold hover:text-gold/80 active:scale-95 transition-transform cursor-pointer group py-3 px-6 touch-manipulation"
      >
        <span className="font-typewriter text-[11px] uppercase tracking-[0.25em]">
          {metaData.continueCue || "to our finale"}
        </span>
        <svg
          className="w-4 h-4 mt-1.5 group-hover:translate-y-0.5 transition-transform"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Unfolded note popup */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-50 bg-[#2B1233]/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[340px] max-h-[85dvh] overflow-y-auto bg-[#FAF6EE] rounded-xl p-6 shadow-2xl border border-gold/40 text-center"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(201, 120, 138, 0.12) 27px, rgba(201, 120, 138, 0.12) 28px)",
              }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#EADFCA]/90 border-l border-r border-black/5 rotate-[-1.5deg] pointer-events-none" />

              <span className="font-typewriter text-[9px] text-gold uppercase tracking-widest block mb-1">
                {selectedItem.label}
              </span>

              <p className="font-handwriting text-2xl text-burgundy leading-relaxed my-4 px-2">
                "{selectedItem.text}"
              </p>

              <div className="flex flex-col items-center mt-3 pt-2 border-t border-gold/20">
                <span className="font-serif italic text-xs text-rose">
                  Always choosing you, Mhel
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="mt-5 w-full py-2.5 rounded-lg bg-burgundy text-cream font-typewriter text-xs uppercase tracking-widest hover:bg-burgundy/95 transition-colors cursor-pointer"
              >
                {metaData.closeButtonText || "Fold & Keep Safe"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
