import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

function computeDaysRemainingManila(unlockAt) {
  if (!unlockAt) return 0;
  const now = new Date();

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
  const [activeCardIndex, setActiveCardIndex] = useState(0);

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

  const handleTrackScroll = (e) => {
    const el = e.currentTarget;
    const cardWidth = 286; // Card width + gap
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveCardIndex(Math.min(Math.max(0, index), openWhenData.length - 1));
  };

  return (
    <section
      id="open-when"
      className="relative min-h-[100dvh] w-full px-4 sm:px-6 py-12 flex flex-col justify-between items-center select-none border-b border-blush/30 overflow-hidden"
    >
      {/* Chapter Marker Header */}
      <div className="w-full flex flex-col items-center text-center mt-2">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
          {metaData.chapterTag || "Chapter 09 • Open When"}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-burgundy font-normal tracking-wide">
          {metaData.title || "Letters for Later"}
        </h2>
        <p className="font-handwriting text-lg text-rose mt-1 max-w-[320px]">
          {metaData.subtitle || "Swipe through and open whenever you need me"}
        </p>

        <span className="font-typewriter text-[9px] text-gold/80 tracking-[0.25em] uppercase mt-2">
          {metaData.swipeCue || "← Swipe across envelopes →"}
        </span>
      </div>

      {/* Main Envelope Carousel Stage */}
      <div className="w-full max-w-[390px] flex flex-col items-center my-auto">
        <div
          onScroll={handleTrackScroll}
          className="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-6 no-scrollbar"
        >
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
                className="flex-shrink-0 w-[270px] sm:w-[280px] snap-center cursor-pointer touch-manipulation"
              >
                {/* Physical Envelope Card */}
                <div
                  className={`relative w-full h-[185px] rounded-xl shadow-[0_8px_25px_rgba(43,18,51,0.08)] border transition-all flex flex-col justify-between p-4 overflow-hidden ${
                    isLocked
                      ? "bg-[#E6DAC3] border-[#CBB998]"
                      : "bg-[#EFE4D0] hover:bg-[#F3E8D5] border-gold/45"
                  }`}
                >
                  {/* Natural Top Triangular Flap */}
                  <div
                    className="absolute top-0 left-0 w-full h-[65px] bg-[#E4D5BC] border-b border-black/5 filter drop-shadow-[0_2px_4px_rgba(43,18,51,0.08)] pointer-events-none"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    }}
                  />

                  {/* Centered Wax Seal at the point of the flap */}
                  <div className="absolute top-[65px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    {isLocked ? (
                      <div className="w-8 h-8 rounded-full bg-burgundy/85 border border-gold/80 flex items-center justify-center text-gold text-xs shadow-md">
                        🔒
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5E1A2F] via-burgundy to-[#300B17] border-2 border-gold/80 flex items-center justify-center text-gold text-[9px] font-serif italic font-bold shadow-md">
                        {metaData.sealInitials || "M&J"}
                      </div>
                    )}
                  </div>

                  {/* Envelope Header: Badge & Status */}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <span className="font-typewriter text-[9px] text-burgundy/60 uppercase tracking-widest bg-cream/70 px-2 py-0.5 rounded-full border border-gold/30">
                      NO. 0{index + 1}
                    </span>

                    {isOpened ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 bg-[#FAF6EE] text-burgundy border border-gold/50 rounded-full px-2 py-0.5 shadow-xs"
                      >
                        <span className="text-[10px] text-rose font-bold">✓</span>
                        <span className="font-typewriter text-[8px] uppercase tracking-wider text-burgundy/80">
                          {metaData.openedBadge || "Opened"}
                        </span>
                      </motion.div>
                    ) : isLocked ? (
                      <span className="text-xs bg-burgundy/10 px-2 py-0.5 rounded-full border border-burgundy/20 font-typewriter text-[8px] text-burgundy/70 uppercase">
                        Locked
                      </span>
                    ) : (
                      <span className="font-typewriter text-[8px] uppercase tracking-widest text-gold/80">
                        sealed
                      </span>
                    )}
                  </div>

                  {/* Envelope Prompt Label */}
                  <div className="relative z-10 my-auto text-center px-2 pt-6">
                    <h3 className="font-serif text-[19px] sm:text-[20px] text-burgundy font-normal leading-snug tracking-wide">
                      "{item.label}"
                    </h3>
                  </div>

                  {/* Bottom Row: Interaction Hint or Locked Countdown */}
                  <div className="relative z-10 flex items-center justify-center w-full pt-2 border-t border-gold/25">
                    {isLocked ? (
                      <span className="font-typewriter text-[10px] text-burgundy/85 font-semibold tracking-wider">
                        {countdownString}
                      </span>
                    ) : (
                      <span className="font-handwriting text-rose text-base hover:text-burgundy transition-colors">
                        {isOpened ? "read again" : "tap to open"}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {openWhenData.map((_, dotIdx) => (
            <span
              key={`dot-${dotIdx}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeCardIndex === dotIdx
                  ? "w-4 bg-gold shadow-xs"
                  : "w-1.5 bg-gold/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Unfolded Note Modal Popup */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-50 bg-[#2B1233]/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[340px] bg-[#FAF6EE] rounded-xl p-6 shadow-2xl border border-gold/40 text-center"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(201, 120, 138, 0.12) 27px, rgba(201, 120, 138, 0.12) 28px)",
              }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#EADFCA]/90 shadow-xs border-l border-r border-black/5 rotate-[-1.5deg] pointer-events-none" />

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

      {/* Gentle Scroll Indicator to Finale Chapter (Raised with comfortable spacing) */}
      <div className="w-full flex flex-col items-center text-center pb-2">
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