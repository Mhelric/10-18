import { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// Deterministic rotation per item so tilt stays stable on re-renders
const TILT_ANGLES = [-1.5, 1.8, -2.1, 1.6, -1.2, 2.0, -1.9, 1.4, -2.2, 0];

function PolaroidImage({ src, alt, fallbackTitle, shouldReduceMotion }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full aspect-[4/3] bg-[#EFE8DC] overflow-hidden rounded-[2px] shadow-inner">
      {!hasError && src ? (
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setHasError(true)}
          initial={
            shouldReduceMotion
              ? { filter: "sepia(0%)", opacity: 1 }
              : { filter: "sepia(100%) contrast(90%) brightness(92%)", opacity: 0.85 }
          }
          whileInView={{
            filter: "sepia(0%) contrast(100%) brightness(100%)",
            opacity: 1,
          }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full h-full object-cover"
        />
      ) : (
        /* Tasteful Romantic Gradient Placeholder */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blush/40 via-cream to-rose/20 p-4 text-center">
          <span className="text-2xl mb-1 opacity-70">📷</span>
          <p className="font-serif italic text-sm text-burgundy/80">
            {fallbackTitle}
          </p>
          <span className="font-typewriter text-[9px] text-rose uppercase tracking-widest mt-1 opacity-75">
            Memory captured
          </span>
        </div>
      )}
    </div>
  );
}

function StormToDawnCard({ item, shouldReduceMotion }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.35, once: false });
  const canvasRef = useRef(null);

  // Soft falling rain simulation that eases out
  useEffect(() => {
    if (shouldReduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drops = Array.from({ length: 28 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      l: Math.random() * 12 + 8,
      speed: Math.random() * 4 + 3,
      alpha: Math.random() * 0.35 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(244, 214, 208, 0.4)";
      ctx.lineWidth = 1;

      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 0.5, d.y + d.l);
        ctx.stroke();

        d.y += d.speed;
        if (d.y > canvas.height) {
          d.y = -d.l;
          d.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [shouldReduceMotion]);

  return (
    <motion.div
      ref={containerRef}
      initial={false}
      animate={
        isInView
          ? {
              backgroundColor: "rgba(251, 243, 230, 0.95)",
              color: "#4A1424",
              borderColor: "rgba(201, 162, 75, 0.5)",
              boxShadow: "0 10px 30px rgba(201, 162, 75, 0.15)",
            }
          : {
              backgroundColor: "rgba(54, 66, 83, 0.92)",
              color: "#FBF3E6",
              borderColor: "rgba(100, 116, 139, 0.4)",
              boxShadow: "0 8px 25px rgba(30, 41, 59, 0.3)",
            }
      }
      transition={{ duration: 1.8, ease: "easeInOut" }}
      className="relative p-5 rounded-lg border backdrop-blur-md overflow-hidden transition-colors"
    >
      {/* Rain canvas overlay that fades out as dawn arrives */}
      <motion.div
        animate={{ opacity: isInView ? 0 : 0.7 }}
        transition={{ duration: 1.5 }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </motion.div>

      {/* Dawn glow bloom */}
      <motion.div
        animate={{ opacity: isInView ? 0.3 : 0 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute inset-0 bg-radial from-gold/30 via-transparent to-transparent z-0"
      />

      <div className="relative z-10 flex flex-col">
        <span
          className={`font-typewriter text-[10px] tracking-widest uppercase transition-colors duration-1000 ${
            isInView ? "text-gold" : "text-blush/80"
          }`}
        >
          {item.stamp}
        </span>
        <h3 className="font-serif text-2xl mt-1 tracking-wide font-normal">
          {item.title}
        </h3>
        <p className="font-body text-xs sm:text-[13px] leading-relaxed mt-2 opacity-90">
          {item.caption}
        </p>
      </div>
    </motion.div>
  );
}

export default function MemoriesChapter({ timelineData, metaData }) {
  const items = timelineData || [];
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="memories"
      className="relative min-h-[100dvh] w-full px-4 sm:px-6 py-16 select-none border-b border-blush/30 overflow-hidden"
    >
      {/* Chapter Marker Header */}
      <div className="w-full flex flex-col items-center text-center mb-12">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
          {metaData?.chapterTag || "Chapter 03 • The Timeline"}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-burgundy font-normal">
          {metaData?.title || "Pieces of Our Year"}
        </h2>
        <p className="font-handwriting text-lg text-rose mt-1">
          {metaData?.subtitle || "Ten chapters of us, frame by frame"}
        </p>
      </div>

      {/* Vertical Timeline Container */}
      <div className="relative w-full max-w-[370px] mx-auto">
        {/* Left Vertical Gold Guide Line */}
        <div className="absolute top-2 bottom-6 left-3 w-[1px] bg-gradient-to-b from-gold/10 via-gold/50 to-gold/20" />

        <div className="space-y-12 pl-8">
          {items.map((item, index) => {
            const tilt = shouldReduceMotion
              ? 0
              : TILT_ANGLES[index % TILT_ANGLES.length];
            const isStormMood = item.mood === "storm-to-dawn";

            return (
              <motion.article
                key={item.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative flex flex-col"
              >
                {/* Timeline node pin on gold line */}
                <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full bg-cream border-2 border-gold shadow-xs z-10" />

                {/* Storm to dawn specialized card */}
                {isStormMood ? (
                  <StormToDawnCard item={item} shouldReduceMotion={shouldReduceMotion} />
                ) : (
                  <div className="flex flex-col">
                    {/* Date Stamp */}
                    <span className="font-typewriter text-[11px] tracking-wider text-gold uppercase">
                      {item.stamp}
                    </span>

                    {/* Title */}
                    <h3 className="font-serif text-2xl sm:text-3xl text-burgundy font-normal mt-0.5 tracking-tight">
                      {item.title}
                    </h3>

                    {/* Polaroid Frame */}
                    {item.photo && (
                      <div
                        className="relative mt-4 mb-3 self-center w-full max-w-[310px] transition-transform duration-300"
                        style={{ transform: `rotate(${tilt}deg)` }}
                      >
                        {/* Washi Masking Tape Top Pin */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#EADFCA]/85 shadow-xs border-l border-r border-black/5 rotate-[-2deg] z-20 pointer-events-none" />

                        {/* Polaroid Body */}
                        <div className="relative bg-[#FAF6EE] p-3 pb-6 rounded-xs shadow-md border border-blush/40 flex flex-col">
                          <PolaroidImage
                            src={item.photo}
                            alt={item.title}
                            fallbackTitle={item.title}
                            shouldReduceMotion={shouldReduceMotion}
                          />

                          {/* Hand-sketched Doodle Corner Overlay */}
                          {item.doodle && (
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 pointer-events-none z-20">
                              <img
                                src={item.doodle}
                                alt="Sketch doodle"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                                className="w-full h-full object-contain filter drop-shadow-xs opacity-85 rotate-6"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Caption */}
                    <p className="font-body text-xs sm:text-[13px] text-burgundy/85 leading-relaxed mt-1">
                      {item.caption}
                    </p>

                    {/* External or Past Site Link */}
                    {item.link && (
                      <div className="mt-2">
                        <a
                          href={item.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-handwriting text-base text-rose underline decoration-rose/60 underline-offset-2 hover:text-burgundy transition-colors"
                        >
                          <span>{item.link.label}</span>
                          <span className="text-xs">↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Gentle Scroll Indicator to Letter */}
      <div className="w-full flex flex-col items-center text-center mt-16 pb-safe">
        <button
          type="button"
          onClick={() => {
            const next = document.getElementById("letter");
            if (next) next.scrollIntoView({ behavior: "smooth" });
          }}
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