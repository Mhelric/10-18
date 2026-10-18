import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { scrollToSection } from "../../utils/scrollToSection";

export default function ReasonsChapter({
  reasonsData = [],
  finaleText = "",
  loveNotes = [],
  metaData = {},
}) {
  const shouldReduceMotion = useReducedMotion();

  // Track drawn indices without repeats
  const [drawnIndices, setDrawnIndices] = useState([]);
  const [currentReason, setCurrentReason] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const totalReasons = reasonsData.length;
  const isFinished = drawnIndices.length === totalReasons && totalReasons > 0;

  // Draw note handler
  const handleDrawNote = () => {
    if (isDrawing) return;

    setIsDrawing(true);

    setTimeout(() => {
      if (drawnIndices.length >= totalReasons) {
        // Reshuffle if she continues tapping after finishing
        const firstIdx = Math.floor(Math.random() * totalReasons);
        setDrawnIndices([firstIdx]);
        setCurrentReason({ text: reasonsData[firstIdx], isFinale: false, index: 1 });
      } else {
        // Pick an undrawn index
        const remaining = reasonsData
          .map((_, i) => i)
          .filter((i) => !drawnIndices.includes(i));
        const nextIdx = remaining[Math.floor(Math.random() * remaining.length)];

        const newDrawn = [...drawnIndices, nextIdx];
        setDrawnIndices(newDrawn);

        if (newDrawn.length === totalReasons) {
          setCurrentReason({ text: finaleText, isFinale: true, index: totalReasons });
        } else {
          setCurrentReason({ text: reasonsData[nextIdx], isFinale: false, index: newDrawn.length });
        }
      }
      setIsDrawing(false);
    }, 450);
  };

  const allNotesList = useMemo(() => {
    return loveNotes && loveNotes.length > 0 ? loveNotes : reasonsData;
  }, [loveNotes, reasonsData]);

  return (
    <section
      id="reasons"
      className="relative min-h-[100dvh] w-full px-4 sm:px-6 py-16 select-none border-b border-blush/30 flex flex-col justify-between items-center overflow-hidden"
    >
      {/* Chapter Marker Header */}
      <div className="w-full flex flex-col items-center text-center mb-4">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
          {metaData?.chapterTag || "Chapter 07 • Reasons Jar"}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-burgundy font-normal">
          {metaData?.title || "Reasons Why I Love You"}
        </h2>
        <p className="font-handwriting text-lg text-rose mt-1">
          {metaData?.subtitle || "Tap the jar to draw a little folded note"}
        </p>

        {/* Counter in Special Elite */}
        <div className="mt-3 inline-block bg-[#EFE3CF]/90 border border-gold/30 rounded-full px-4 py-1 shadow-xs">
          <span className="font-typewriter text-xs text-burgundy tracking-widest uppercase">
            {metaData?.drawnCounterPrefix || "Reasons drawn:"} {drawnIndices.length} / {totalReasons}
          </span>
        </div>
      </div>

      {/* Interactive Glass Jar SVG */}
      <div className="relative w-full max-w-[280px] my-auto flex flex-col items-center">
        <motion.div
          onClick={handleDrawNote}
          whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
          animate={isDrawing ? { rotate: [-2, 2, -2, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="relative cursor-pointer group flex flex-col items-center"
        >
          {/* Subtle Glow Behind Jar */}
          <div className="absolute inset-0 bg-gold/10 rounded-full filter blur-xl group-hover:bg-gold/20 transition-all pointer-events-none" />

          {/* Inline SVG Glass Jar */}
          <svg
            className="w-40 h-52 sm:w-44 sm:h-56 filter drop-shadow-[0_8px_16px_rgba(43,18,51,0.15)] transition-transform duration-300 group-hover:scale-[1.02]"
            viewBox="0 0 160 210"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Wooden/Cork Lid */}
            <rect x="42" y="10" width="76" height="18" rx="4" fill="#8B5A2B" stroke="#4A1424" strokeWidth="2" />
            <rect x="48" y="6" width="64" height="6" rx="2" fill="#A76D38" />

            {/* Jar Neck */}
            <path d="M46 28 H114 V38 H46 Z" fill="rgba(251, 243, 230, 0.4)" stroke="#C9A24B" strokeWidth="1.5" />
            {/* Twine Bow */}
            <line x1="42" y1="34" x2="118" y2="34" stroke="#4A1424" strokeWidth="2.5" strokeDasharray="3 2" />
            <circle cx="80" cy="34" r="3.5" fill="#C9A24B" />

            {/* Glass Jar Body */}
            <path
              d="M38 38 C38 38, 20 48, 20 72 V182 C20 196, 34 204, 52 204 H108 C126 204, 140 196, 140 182 V72 C140 48, 122 38, 122 38 Z"
              fill="rgba(251, 243, 230, 0.28)"
              stroke="#C9A24B"
              strokeWidth="2.5"
            />

            {/* Glass Reflection Highlight */}
            <path
              d="M32 68 C32 58, 40 48, 46 45 V175 C40 170, 32 165, 32 150 Z"
              fill="rgba(255, 255, 255, 0.4)"
            />

            {/* Folded Paper Notes inside the jar */}
            <g opacity={Math.max(0.3, 1 - drawnIndices.length / totalReasons)}>
              {/* Paper 1: Blush */}
              <rect x="44" y="155" width="34" height="22" rx="3" fill="#F4D6D0" stroke="#C9788A" strokeWidth="1" transform="rotate(-15 44 155)" />
              {/* Paper 2: Cream */}
              <rect x="80" y="158" width="32" height="20" rx="3" fill="#FAF6EE" stroke="#C9A24B" strokeWidth="1" transform="rotate(12 80 158)" />
              {/* Paper 3: Rose */}
              <rect x="52" y="130" width="30" height="22" rx="3" fill="#E8B4B8" stroke="#4A1424" strokeWidth="1" transform="rotate(25 52 130)" />
              {/* Paper 4: Gold */}
              <rect x="85" y="132" width="28" height="20" rx="3" fill="#F3E5AB" stroke="#C9A24B" strokeWidth="1" transform="rotate(-20 85 132)" />
              {/* Paper 5: Center Fold */}
              <rect x="62" y="165" width="36" height="22" rx="3" fill="#FAF6EE" stroke="#C9788A" strokeWidth="1" transform="rotate(4 62 165)" />
              {/* Paper 6: Top tilt */}
              <rect x="66" y="112" width="28" height="18" rx="2" fill="#F4D6D0" stroke="#4A1424" strokeWidth="1" transform="rotate(-8 66 112)" />
            </g>
          </svg>

          {/* Little Floating Note emerging during draw */}
          <AnimatePresence>
            {isDrawing && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.4, rotate: -15 }}
                animate={{ opacity: 1, y: -70, scale: 1.1, rotate: 10 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute top-10 w-16 h-10 bg-[#FAF6EE] border border-gold rounded-md shadow-lg flex items-center justify-center text-xs pointer-events-none"
              >
                💌
              </motion.div>
            )}
          </AnimatePresence>

          <span className="font-handwriting text-rose text-base mt-2 group-hover:text-burgundy transition-colors">
            {isFinished ? "Tap to shuffle again" : "Tap the jar to draw"}
          </span>
        </motion.div>

        {/* Drawn Unfolded Reason Card */}
        <div className="w-full min-h-[140px] mt-4 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentReason && (
              <motion.div
                key={`reason-${currentReason.index}-${currentReason.text}`}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={`relative w-full p-4 rounded-xl shadow-md border text-center ${
                  currentReason.isFinale
                    ? "bg-gradient-to-br from-[#FAF0D7] via-cream to-[#FDF3D8] border-gold shadow-[0_0_24px_rgba(201,162,75,0.4)]"
                    : "bg-[#FAF6EE] border-gold/40 shadow-[0_4px_16px_rgba(43,18,51,0.08)]"
                }`}
              >
                <span className="font-typewriter text-[9px] text-gold uppercase tracking-widest block mb-1">
                  {currentReason.isFinale ? "Final Reason" : `Reason #${currentReason.index}`}
                </span>
                <p
                  className={`font-handwriting leading-snug px-1 ${
                    currentReason.isFinale
                      ? "text-xl sm:text-2xl text-burgundy font-bold"
                      : "text-lg sm:text-xl text-burgundy"
                  }`}
                >
                  "{currentReason.text}"
                </p>
                {currentReason.isFinale && (
                  <span className="font-serif italic text-xs text-rose mt-2 block">
                    Forever & Always, Mhel
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* "Read all 365" Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowOverlay(true)}
            className="px-4 py-1.5 rounded-full border border-gold/50 bg-[#EFE3CF]/90 hover:bg-[#FAF6EE] text-burgundy font-typewriter text-xs tracking-wider uppercase shadow-xs transition-colors cursor-pointer"
          >
            {metaData?.readAllButtonText || "Read all 362 reasons"}
          </button>
        </div>
      </div>

      {/* Full-Screen Scrolling List Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-[#FAF6EE]/98 backdrop-blur-md flex flex-col justify-between items-center p-6 select-none"
          >
            {/* Header */}
            <div className="w-full max-w-[390px] flex items-center justify-between pb-3 border-b border-gold/30">
              <div className="flex flex-col text-left">
                <h3 className="font-serif text-2xl text-burgundy font-normal">
                  {metaData?.overlayTitle || "365 Little Truths"}
                </h3>
                <span className="font-handwriting text-xs text-rose">
                  {metaData?.overlaySubtitle || "Every reason why it will always be you"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowOverlay(false)}
                className="w-8 h-8 rounded-full border border-gold/40 flex items-center justify-center text-burgundy hover:bg-gold/10 transition-colors text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable List */}
            <div className="w-full max-w-[390px] my-auto flex-1 overflow-y-auto no-scrollbar py-4 space-y-3">
              {allNotesList.map((note, idx) => (
                <div
                  key={`full-note-${idx}`}
                  className="p-3 bg-white/70 rounded-lg border border-gold/20 shadow-xs text-left"
                >
                  <span className="font-typewriter text-[9px] text-gold uppercase tracking-widest block">
                    #{idx + 1}
                  </span>
                  <p className="font-handwriting text-base text-burgundy leading-snug mt-0.5">
                    {note}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Close Bar */}
            <div className="w-full max-w-[390px] pt-3 border-t border-gold/20 text-center">
              <button
                type="button"
                onClick={() => setShowOverlay(false)}
                className="w-full py-2 rounded-lg bg-burgundy text-cream font-typewriter text-xs uppercase tracking-widest"
              >
                Close Jar Archive
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gentle Scroll Indicator to Letter Chapter */}
      <div className="w-full flex flex-col items-center text-center pt-6 pb-safe">
        <button
          type="button"
          onClick={() => scrollToSection("letter")}
          className="flex flex-col items-center text-gold hover:text-gold/80 transition-colors cursor-pointer group"
        >
          <span className="font-typewriter text-[10px] uppercase tracking-[0.25em]">
            {metaData?.continueCue || "to the letter"}
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