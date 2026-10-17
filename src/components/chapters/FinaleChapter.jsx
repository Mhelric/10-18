import { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

export default function FinaleChapter({ finaleData = {}, onReset }) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const isVisibleRef = useRef(false);
  const [hasImageError, setHasImageError] = useState(false);

  const isInView = useInView(sectionRef, { amount: 0.25, once: false });
  const data = finaleData;

  // Gentle heart & petal bloom animation on canvas
  useEffect(() => {
    isVisibleRef.current = isInView;
    if (shouldReduceMotion || !isInView) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const setCanvasSize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const isMobile = window.innerWidth < 640;
    const particleCount = isMobile ? 18 : 28;

    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 80,
      size: Math.random() * 7 + 6,
      vx: (Math.random() - 0.5) * 0.45,
      vy: -(Math.random() * 0.55 + 0.35),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      alpha: Math.random() * 0.6 + 0.25,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.01,
      type: Math.random() > 0.45 ? "petal" : "heart",
      color:
        Math.random() > 0.5
          ? "rgba(201, 120, 138, "
          : Math.random() > 0.5
          ? "rgba(244, 214, 208, "
          : "rgba(201, 162, 75, ",
    }));

    const drawHeart = (c, x, y, size, color, alpha, rot) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.scale(size / 14, size / 14);
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(-6, -7, -12, 1, 0, 11);
      c.bezierCurveTo(12, 1, 6, -7, 0, 0);
      c.fillStyle = `${color}${alpha})`;
      c.shadowBlur = 4;
      c.shadowColor = "rgba(201, 162, 75, 0.3)";
      c.fill();
      c.restore();
    };

    const drawPetal = (c, x, y, size, color, alpha, rot) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.beginPath();
      c.ellipse(0, 0, size * 0.8, size * 0.45, 0, 0, Math.PI * 2);
      c.fillStyle = `${color}${alpha})`;
      c.fill();
      c.restore();
    };

    const render = () => {
      if (!isVisibleRef.current) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.45;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y < -30) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -30) p.x = canvas.width + 20;
        if (p.x > canvas.width + 30) p.x = -20;

        if (p.type === "heart") {
          drawHeart(ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
        } else {
          drawPetal(ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [isInView, shouldReduceMotion]);

  // Direct smooth scroll to Chapter 1: The Beginning (#prologue)
  const handleReadAgain = () => {
    if (onReset) {
      onReset();
    }
    const prologueSection = document.getElementById("prologue");
    if (prologueSection) {
      prologueSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section
      id="finale"
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full flex flex-col justify-end items-center px-6 py-12 select-none overflow-hidden pb-safe"
    >
      {/* Full-bleed background photo / fallback */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {!hasImageError && data.photo ? (
          <img
            src={data.photo}
            alt={data.title}
            width="1080"
            height="1920"
            loading="lazy"
            decoding="async"
            onError={() => setHasImageError(true)}
            className="w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.05]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#2B1233] via-burgundy to-[#1C0812] text-center p-6">
            <span className="text-3xl mb-2 opacity-60">✨</span>
            <span className="font-serif italic text-base text-cream/70">
              {data.photoPlaceholder || "Our Forever Picture"}
            </span>
          </div>
        )}

        {/* Readability Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy via-burgundy/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent z-10 pointer-events-none" />
      </div>

      {/* Floating Canvas Hearts & Rose Petals */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      />

      {/* Content Stack */}
      <div className="relative z-30 w-full max-w-[360px] flex flex-col items-center text-center mt-auto space-y-4">
        {/* Subtitle in Special Elite */}
        <motion.span
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="font-typewriter text-[11px] sm:text-xs text-gold tracking-[0.25em] uppercase drop-shadow-sm"
        >
          {data.subtitle}
        </motion.span>

        {/* Title in Caveat Script */}
        <motion.h1
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 14 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="font-handwriting text-4xl sm:text-5xl text-cream font-normal leading-tight drop-shadow-[0_4px_12px_rgba(43,18,51,0.5)]"
        >
          {data.title}
        </motion.h1>

        {/* Final Line */}
        <motion.p
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="font-handwriting text-2xl sm:text-3xl text-blush tracking-wide pt-1 drop-shadow-sm"
        >
          {data.finalLine}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="w-full flex flex-col items-center pt-6 space-y-3"
        >
          <button
            type="button"
            onClick={handleReadAgain}
            className="w-full max-w-[280px] py-3 rounded-full bg-[#FAF6EE]/90 hover:bg-[#FAF6EE] text-burgundy font-typewriter text-xs uppercase tracking-[0.2em] shadow-lg border border-gold/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            {data.readAgainButtonText || "Read it again from the start"}
          </button>

          {data.oldSite && (
            <a
              href={data.oldSite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-handwriting text-base sm:text-lg text-cream/80 hover:text-gold transition-colors underline decoration-gold/40 underline-offset-4"
            >
              <span>{data.oldSiteLinkText || "Chapter 0: where it began"}</span>
              <span className="text-xs">↗</span>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}