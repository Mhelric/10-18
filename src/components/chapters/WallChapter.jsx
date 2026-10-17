import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Gentle organic tilt angles for each card in the grid
const ROTATIONS = [-2.5, 1.5, -1.8, 2.2, -1.2, 2.8, -2.0, 1.2];

export default function WallChapter({ wallData, metaData }) {
  const items = wallData || [];
  const shouldReduceMotion = useReducedMotion();

  const [flippedIds, setFlippedIds] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const handleFlip = (id) => {
    if (!hasInteracted) setHasInteracted(true);
    setActiveId(id);
    setFlippedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="wall"
      className="relative min-h-[100dvh] w-full px-4 sm:px-6 py-16 select-none border-b border-blush/30 flex flex-col justify-between"
    >
      {/* Chapter Marker Header */}
      <div className="w-full flex flex-col items-center text-center mb-8">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
          {metaData?.chapterTag || "Chapter 04 • The Polaroid Wall"}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-burgundy font-normal">
          {metaData?.title || "Moments in Motion"}
        </h2>
        <p className="font-handwriting text-lg text-rose mt-1">
          {metaData?.subtitle || "Tap any memory to flip and read"}
        </p>

        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-3 inline-block bg-gold/15 border border-gold/40 rounded-full px-3 py-1 text-[11px] font-typewriter text-burgundy tracking-wide uppercase"
          >
            {metaData?.hintText || "Tap a photo to flip"}
          </motion.div>
        )}
      </div>

      {/* Responsive 2-Column Polaroid Grid (Fully Scrollable, No Overlap) */}
      <div className="relative w-full max-w-[360px] mx-auto grid grid-cols-2 gap-x-4 gap-y-6 pb-8">
        {items.map((item, index) => {
          const rotate = shouldReduceMotion ? 0 : ROTATIONS[index % ROTATIONS.length];
          const isFlipped = Boolean(flippedIds[item.id]);
          const isActive = activeId === item.id;
          const hasError = Boolean(imageErrors[item.id]);

          return (
            <motion.div
              key={item.id}
              onClick={() => handleFlip(item.id)}
              style={{
                zIndex: isActive ? 50 : 10,
              }}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: (index % 2) * 0.05 }}
              className="cursor-pointer touch-manipulation flex justify-center"
              animate={{
                rotate: isFlipped ? 0 : rotate,
                scale: isActive ? 1.05 : 1,
              }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            >
              {/* Polaroid Card Wrapper */}
              <div className="relative w-[155px] sm:w-[165px] bg-[#FAF6EE] p-2 pb-5 rounded-xs shadow-[0_4px_15px_rgba(43,18,51,0.12)] border border-blush/50">
                
                {/* Washi Masking Tape Top Pin */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-3 bg-[#EADFCA]/90 shadow-xs border-l border-r border-black/5 rotate-[1.5deg] z-20 pointer-events-none" />

                {/* 3D Flip Container */}
                <div
                  className="w-full aspect-[4/3] relative"
                  style={{ perspective: "1000px" }}
                >
                  <motion.div
                    className="w-full h-full relative preserve-3d"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Front: Photo */}
                    <div
                      className="absolute inset-0 w-full h-full bg-[#EFE8DC] overflow-hidden rounded-[2px]"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      {!hasError && item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.note}
                          loading="lazy"
                          onError={() =>
                            setImageErrors((prev) => ({ ...prev, [item.id]: true }))
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blush/30 via-cream to-rose/20 p-2 text-center">
                          <span className="text-lg mb-0.5 opacity-70">📷</span>
                          <span className="font-serif italic text-[11px] text-burgundy/80 line-clamp-2">
                            {item.note}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Back: Handwritten Note & Date */}
                    <div
                      className="absolute inset-0 w-full h-full bg-[#F5EEDD] p-2.5 flex flex-col justify-between items-center text-center rounded-[2px] border border-gold/20"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <span className="font-typewriter text-[8px] text-gold uppercase tracking-widest">
                        {item.date}
                      </span>
                      <p className="font-handwriting text-xs sm:text-sm text-burgundy leading-snug my-auto px-0.5">
                        "{item.note}"
                      </p>
                      <span className="font-serif italic text-[9px] text-rose">
                        Mhel & Jaira
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Polaroid Caption Label */}
                <div className="mt-1.5 text-center">
                  <span className="font-handwriting text-xs text-burgundy/80 block truncate px-1">
                    {isFlipped ? "Tap to flip back" : item.date}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Gentle Scroll Indicator to Letter Chapter */}
      <div className="w-full flex flex-col items-center text-center pt-6 pb-safe">
        <button
          type="button"
          onClick={() => {
            const next = document.getElementById("song") || document.getElementById("letter");
            if (next) next.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center text-gold hover:text-gold/80 transition-colors cursor-pointer group"
        >
          <span className="font-typewriter text-[10px] uppercase tracking-[0.25em]">
            to our song
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