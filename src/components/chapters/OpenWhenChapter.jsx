import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

function computeDaysRemainingManila(unlockAt) {
  if (!unlockAt) return 0;
  const now = new Date();

  // Convert device clock to Asia/Manila calendar date
  const manilaNowStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const targetDate = new Date(unlockAt);
  const targetManilaStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(targetDate);

  const [y1, m1, d1] = manilaNowStr.split("-").map(Number);
  const [y2, m2, d2] = targetManilaStr.split("-").map(Number);

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

  const handleEnvelopeTap = (item, index, isLocked) => {
    if (isLocked) {
      setShakeId(index);
      setTimeout(() => setShakeId(null), 600);
      return;
    }

    setOpenedIds((prev) => ({ ...prev, [index]: true }));
    setSelectedItem({ ...item, index });
  };

  const handleScrollToFinale = () => {
    const nextSection = document.getElementById("finale");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="open-when"
      className="relative min-h-[100dvh] w-full px-4 sm:px-6 py-16 flex flex-col justify-between items-center select-none border-b border-blush/30 overflow-hidden pb-safe"
    >
      {/* Chapter Marker Header */}
      <div className="w-full flex flex-col items-center text-center mb-6">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
          {metaData.chapterTag || "Chapter 09 • Open When"}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-burgundy font-normal">
          {metaData.title || "Letters for Later"}
        </h2>
        <p className="font-handwriting text-lg text-rose mt-1 max-w-[320px]">
          {metaData.subtitle || "Swipe through and open whenever you need me"}
        </p>

        <span className="font-typewriter text-[10px] text-gold/75 tracking-widest uppercase mt-2">
          {metaData.swipeCue || "← Swipe across envelopes →"}
        </span>
      </div>

      {/* Horizontal Swipeable Envelope Row */}
      <div className="w-full max-w-[390px] my-auto flex gap-4 overflow-x-auto snap-x snap-mandatory py-6 px-4 no-scrollbar">
        {openWhenData.map((item, index) => {
          const daysLeft = item.unlockAt ? computeDaysRemainingManila(item.unlockAt) : 0;
          const isLocked = Boolean(item.unlockAt && daysLeft > 0);
          const isOpened = Boolean(openedIds[index]);
          const isShaking = shakeId === index;

          const countdownString =
            daysLeft === 1
              ? metaData.countdownSingular || "Opens in 1 day"
              : (metaData.countdownText || "Opens in {days} days").replace("{days}", daysLeft);

          return (
            <motion.div
              key={`open-when-${index}`}
              onClick={() => handleEnvelopeTap(item, index, isLocked)}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              animate={
                isShaking && !shouldReduceMotion
                  ? { x: [-6, 6, -4, 4, -2, 2, 0] }
                  : {}
              }
              transition={{ duration: 0.5 }}
              className="flex-shrink-0 w-[240px] sm:w-[250px] snap-center cursor-pointer touch-manipulation"
            >
              <div
                className={`relative w-full h-[165px] rounded-lg p-4 shadow-md border transition-all flex flex-col justify-between overflow-hidden ${
                  isLocked
                    ? "bg-[#E6DAC3] border-[#CBB998] opacity-90"
                    : "bg-[#EFE3CF] hover:bg-[#FAF0DE] border-gold/45 shadow-[0_4px_16px_rgba(43,18,51,0.08)]"
                }`}
                style={{ perspective: "1000px" }}
              >
                {/* Envelope Flap Lines (Stylized Creases) */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    background:
                      "linear-gradient(135deg, transparent 49.5%, rgba(201,162,75,0.4) 50%, transparent 50.5%), linear-gradient(-135deg, transparent 49.5%, rgba(201,162,75,0.4) 50%, transparent 50.5%)",
                  }}
                />

                {/* Top Corner Badge */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  {isOpened ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-1 bg-[#FAF6EE] text-burgundy border border-gold/50 rounded-full px-2 py-0.5 shadow-xs"
                    >
                      <span className="text-xs text-rose font-bold">✓</span>
                      <span className="font-typewriter text-[9px] uppercase tracking-wider">
                        {metaData.openedBadge || "Opened"}
                      </span>
                    </motion.div>
                  ) : isLocked ? (
                    <span className="text-sm">🔒</span>
                  ) : null}
                </div>

                {/* Envelope Label */}
                <div className="relative z-10 pr-6">
                  <span className="font-typewriter text-[9px] text-gold uppercase tracking-widest block mb-1">
                    Envelope #{index + 1}
                  </span>
                  <h3 className="font-serif text-lg text-burgundy font-normal leading-snug">
                    {item.label}
                  </h3>
                </div>

                {/* Center / Bottom Wax Seal */}
                <div className="relative z-10 flex items-center justify-between mt-auto pt-2 border-t border-gold/20">
                  {isLocked ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-burgundy/80 border border-gold/70 flex items-center justify-center text-gold text-xs shadow-xs">
                        🔒
                      </div>
                      <span className="font-typewriter text-[10px] text-burgundy/80 font-semibold tracking-wider">
                        {countdownString}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5E1A2F] via-burgundy to-[#300B17] border border-gold/80 flex items-center justify-center text-gold text-[10px] font-serif italic font-bold shadow-xs">
                        {metaData.sealInitials || "M&J"}
                      </div>
                      <span className="font-handwriting text-rose text-sm">
                        {isOpened ? "Tap to re-read" : "Tap to open"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Unfolded Note Modal Popup */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-50 bg-[#2B1233]/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[340px] bg-[#FAF6EE] rounded-lg p-6 shadow-2xl border border-gold/40 text-center"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(201, 120, 138, 0.12) 27px, rgba(201, 120, 138, 0.12) 28px)",
              }}
            >
              {/* Top Washi Tape Pin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#EADFCA]/90 shadow-xs border-l border-r border-black/5 rotate-[-1.5deg] pointer-events-none" />

              {/* Envelope Header Prompt */}
              <span className="font-typewriter text-[9px] text-gold uppercase tracking-widest block mb-1">
                {selectedItem.label}
              </span>

              {/* Note Content */}
              <p className="font-handwriting text-2xl text-burgundy leading-relaxed my-4 px-2">
                "{selectedItem.text}"
              </p>

              {/* Signature Stamp */}
              <div className="flex flex-col items-center mt-3 pt-2 border-t border-gold/20">
                <span className="font-serif italic text-xs text-rose">
                  Always choosing you, Mhel
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="mt-5 w-full py-2 rounded-lg bg-burgundy text-cream font-typewriter text-xs uppercase tracking-widest hover:bg-burgundy/95 transition-colors cursor-pointer"
              >
                {metaData.closeButtonText || "Fold & Keep Safe"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gentle Scroll Indicator to Finale Chapter */}
      <div className="w-full flex flex-col items-center text-center pt-4 pb-safe">
        <button
          type="button"
          onClick={handleScrollToFinale}
          className="flex flex-col items-center text-gold hover:text-gold/80 transition-colors cursor-pointer group"
        >
          <span className="font-typewriter text-[10px] uppercase tracking-[0.25em]">
            {metaData.continueCue || "to our finale"}
          </span>
          <svg
            className="w-4 h-4 mt-1 group-hover:translate-y-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </section>
  );
}