import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { scrollToSection } from "../../utils/scrollToSection";

export default function JokesChapter({ jokesData, metaData }) {
  const items = jokesData || [];
  const shouldReduceMotion = useReducedMotion();

  const [collectedIds, setCollectedIds] = useState({});

  const handleCardClick = (index) => {
    setCollectedIds((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
  };

  const collectedCount = Object.keys(collectedIds).length;
  const allCollected = items.length > 0 && collectedCount === items.length;
  const progress = items.length ? (collectedCount / items.length) * 100 : 0;

  const faceStyle = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  return (
    <section
      id="jokes"
      className="relative w-full min-h-[100dvh] px-4 sm:px-6 pt-16 pb-10 select-none border-b border-blush/30 flex flex-col items-center justify-center"
    >
      {/* Chapter header */}
      <div className="w-full flex flex-col items-center text-center mb-6">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
          {metaData?.chapterTag || "Chapter 06 • Inside Jokes"}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-burgundy font-normal">
          {metaData?.title || "Things Only We Know"}
        </h2>

        {/* Subtitle swaps to the completion message in place (no layout jump) */}
        <p className="font-handwriting text-lg text-rose mt-1 min-h-[1.75rem]">
          {allCollected
            ? metaData?.completionMessage || "You found them all. Of course you did."
            : metaData?.subtitle || "Tap to collect our secret memories"}
        </p>

        {/* Counter + progress */}
        <div className="mt-3 flex flex-col items-center gap-2">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1 border transition-colors duration-500 ${
              allCollected
                ? "bg-gold/20 border-gold/60 shadow-[0_0_18px_rgba(201,162,75,0.35)]"
                : "bg-[#EFE3CF]/90 border-gold/30"
            }`}
          >
            <span className="font-typewriter text-xs text-burgundy tracking-widest uppercase">
              {metaData?.counterLabel || "Collected"} {collectedCount} / {items.length}
            </span>
            {allCollected && <span className="text-rose text-xs">♥</span>}
          </div>
          <div className="w-28 h-1 rounded-full bg-gold/20 overflow-hidden">
            <motion.div
              className="h-full bg-gold"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Two-column flip-card grid. Everything is visible, no inner scrolling. */}
      <div className="w-full max-w-[380px] grid grid-cols-2 gap-3">
        {items.map((item, index) => {
          const isCollected = Boolean(collectedIds[index]);

          return (
            <motion.button
              key={`joke-${index}`}
              type="button"
              onClick={() => handleCardClick(index)}
              aria-label={
                isCollected ? `${item.title}. ${item.text}` : `Secret memory ${index + 1}, tap to flip`
              }
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: (index % 2) * 0.05 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              className="relative h-[172px] text-left cursor-pointer touch-manipulation"
              style={{ perspective: "900px" }}
            >
              <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: isCollected ? 180 : 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: "easeInOut" }}
              >
                {/* Front: face-down card */}
                <div
                  style={faceStyle}
                  className="absolute inset-0 rounded-xl border border-gold/50 bg-[#EFE4D0] shadow-sm flex flex-col items-center justify-center gap-2 p-3"
                >
                  <div className="absolute inset-1.5 rounded-lg border border-dashed border-gold/40 pointer-events-none" />
                  <span className="font-serif text-4xl text-gold/70 leading-none">
                    {index + 1}
                  </span>
                  <span className="font-typewriter text-[10px] tracking-[0.2em] uppercase text-burgundy/60">
                    Secret memory
                  </span>
                  <span className="font-handwriting text-rose text-base">tap to flip</span>
                </div>

                {/* Back: revealed joke */}
                <div
                  style={{ ...faceStyle, transform: "rotateY(180deg)" }}
                  className="absolute inset-0 rounded-xl border border-gold/60 bg-[#FAF6EE] shadow-[0_4px_16px_rgba(201,162,75,0.25)] flex flex-col items-start justify-start gap-1.5 p-3.5 overflow-hidden"
                >
                  <span className="text-2xl leading-none">{item.icon}</span>
                  <h3 className="font-serif text-[17px] text-burgundy font-normal leading-tight">
                    {item.title}
                  </h3>
                  <p className="font-body text-[11.5px] text-burgundy/85 leading-snug">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {/* Next chapter: sits right under the cards now */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          scrollToSection("reasons");
        }}
        className="relative z-30 mt-10 flex flex-col items-center text-gold hover:text-gold/80 active:scale-95 transition-transform cursor-pointer group py-3 px-6 touch-manipulation"
      >
        <span className="font-typewriter text-[11px] uppercase tracking-[0.25em]">
          {metaData?.continueCue || "to the reasons jar"}
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
    </section>
  );
}
