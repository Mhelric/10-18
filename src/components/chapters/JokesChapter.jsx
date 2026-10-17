import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function JokesChapter({ jokesData, metaData }) {
  const items = jokesData || [];
  const shouldReduceMotion = useReducedMotion();

  const [collectedIds, setCollectedIds] = useState({});
  const [activeId, setActiveId] = useState(null);

  const handleCardClick = (index) => {
    setActiveId(index);
    setCollectedIds((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  const collectedCount = Object.keys(collectedIds).length;
  const allCollected = collectedCount === items.length;

  return (
    <section
      id="jokes"
      className="relative min-h-[100dvh] w-full px-4 sm:px-6 py-16 select-none border-b border-blush/30 flex flex-col justify-between items-center"
    >
      {/* Chapter Marker Header */}
      <div className="w-full flex flex-col items-center text-center mb-6">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
          {metaData?.chapterTag || "Chapter 06 • Inside Jokes"}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-burgundy font-normal">
          {metaData?.title || "Things Only We Know"}
        </h2>
        <p className="font-handwriting text-lg text-rose mt-1">
          {metaData?.subtitle || "Tap to collect our secret memories"}
        </p>

        {/* Live Counter in Special Elite */}
        <div className="mt-3 inline-block bg-[#EFE3CF]/90 border border-gold/30 rounded-full px-4 py-1 shadow-xs">
          <span className="font-typewriter text-xs text-burgundy tracking-widest uppercase">
            Collected {collectedCount} / {items.length}
          </span>
        </div>
      </div>

      {/* Swipeable / Scrollable Card Stack or Grid */}
        <div className="w-full max-w-[365px] mx-auto my-auto grid grid-cols-1 gap-3.5 py-2 overflow-y-auto max-h-[56vh] px-1 custom-gold-scrollbar">
        {items.map((item, index) => {
          const isCollected = Boolean(collectedIds[index]);
          const isActive = activeId === index;

          return (
            <motion.div
              key={`joke-${index}`}
              onClick={() => handleCardClick(index)}
              style={{ zIndex: isActive ? 30 : 10 }}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
              className="cursor-pointer touch-manipulation"
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            >
              <div
                className={`relative w-full min-h-[85px] rounded-lg p-4 border transition-all shadow-sm flex items-center justify-between ${
                  isCollected
                    ? "bg-[#FAF6EE] border-gold/60 shadow-[0_4px_16px_rgba(201,162,75,0.2)]"
                    : "bg-[#EFE4D0] border-gold/40 hover:bg-[#F2E8D5]"
                }`}
              >
                {/* 3D Flip Container */}
                <div className="w-full relative" style={{ perspective: "1000px" }}>
                  <motion.div
                    className="w-full relative preserve-3d"
                    animate={{ rotateX: isCollected ? 0 : 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {!isCollected ? (
                      /* Face-down State */
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🎴</span>
                          <span className="font-typewriter text-xs text-burgundy/70 tracking-widest uppercase">
                            Secret Memory #{index + 1}
                          </span>
                        </div>
                        <span className="font-handwriting text-rose text-sm">Tap to flip</span>
                      </div>
                    ) : (
                      /* Face-up Collected State */
                      <div className="flex items-start gap-3 w-full">
                        <span className="text-2xl mt-0.5">{item.icon}</span>
                        <div className="flex flex-col text-left">
                          <h3 className="font-serif text-lg text-burgundy font-normal leading-tight">
                            {item.title}
                          </h3>
                          <p className="font-body text-xs text-burgundy/85 mt-1 leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Message with Soft Glow */}
      <div className="w-full flex flex-col items-center min-h-[50px] justify-center pt-2">
        {allCollected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="px-4 py-2 rounded-xl bg-gold/15 border border-gold/40 shadow-[0_0_20px_rgba(201,162,75,0.35)] text-center"
          >
            <p className="font-handwriting text-xl text-burgundy tracking-wide">
              {metaData?.completionMessage || "You found them all. Of course you did."}
            </p>
          </motion.div>
        )}
      </div>

      {/* Gentle Scroll Indicator to Letter Chapter */}
      <div className="w-full flex flex-col items-center text-center pt-4 pb-safe">
        <button
          type="button"
          onClick={() => {
            const next = document.getElementById("letter");
            if (next) next.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center text-gold hover:text-gold/80 transition-colors cursor-pointer group"
        >
          <span className="font-typewriter text-[10px] uppercase tracking-[0.25em]">
            to the letter
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