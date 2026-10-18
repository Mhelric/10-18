import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { scrollToSection } from "../../utils/scrollToSection";

export default function PrologueChapter({ data, prologueData }) {
  const config = prologueData || data;
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef(null);

  // Trigger typewriter only when section is scrolled into view
  const isInView = useInView(sectionRef, { once: true, amount: 0.4 });

  // Typewriter state
  const lines = config?.lines || [];
  const [displayedLines, setDisplayedLines] = useState(
    shouldReduceMotion ? lines : ["", "", ""]
  );
  const [currentLineIndex, setCurrentLineIndex] = useState(
    shouldReduceMotion ? lines.length : 0
  );
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(Boolean(shouldReduceMotion));

  // Live Counter state
  const [metTimer, setMetTimer] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [togetherDays, setTogetherDays] = useState(0);

  // Canvas ref for fireflies
  const canvasRef = useRef(null);
  const isVisibleRef = useRef(true);

  // 1. Fireflies / Dust Particle Canvas with IntersectionObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const setCanvasDimensions = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    const isMobile = window.innerWidth < 640;
    const particleCount = isMobile ? 24 : 45;

    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.4 + 0.15),
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.02 + 0.008,
      pulseDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const render = () => {
      if (!isVisibleRef.current || shouldReduceMotion) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        p.alpha += p.pulse * p.pulseDir;
        if (p.alpha >= 0.85) p.pulseDir = -1;
        if (p.alpha <= 0.15) p.pulseDir = 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 162, 75, ${Math.max(0, p.alpha)})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(244, 214, 208, 0.6)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", setCanvasDimensions);
      observer.disconnect();
    };
  }, [shouldReduceMotion]);

  // 2. Sequential Typewriter Effect (Starts when in view)
  useEffect(() => {
    if (shouldReduceMotion || !isInView) return;
    if (currentLineIndex >= lines.length) {
      setIsTypingComplete(true);
      return;
    }

    const targetLine = lines[currentLineIndex];

    if (currentCharIndex < targetLine.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          updated[currentLineIndex] = targetLine.slice(0, currentCharIndex + 1);
          return updated;
        });
        setCurrentCharIndex((prev) => prev + 1);
      }, 55);

      return () => clearTimeout(timer);
    } else {
      const pauseTimer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, 500);

      return () => clearTimeout(pauseTimer);
    }
  }, [currentCharIndex, currentLineIndex, lines, shouldReduceMotion, isInView]);

  // 3. Live Ticking Timers
  useEffect(() => {
    const metTime = new Date(config.metSince).getTime();
    const togetherTime = new Date(config.togetherSince).getTime();

    const updateCounters = () => {
      const now = Date.now();

      const metDiff = Math.max(0, now - metTime);
      const days = Math.floor(metDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((metDiff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((metDiff / (1000 * 60)) % 60);
      const seconds = Math.floor((metDiff / 1000) % 60);
      setMetTimer({ days, hours, minutes, seconds });

      const togetherDiff = Math.max(0, now - togetherTime);
      const tDays = Math.floor(togetherDiff / (1000 * 60 * 60 * 24));
      setTogetherDays(tDays);
    };

    updateCounters();
    const interval = setInterval(updateCounters, 1000);
    return () => clearInterval(interval);
  }, [config.metSince, config.togetherSince]);

  const togetherText = (config?.togetherLabel || "and {days} days of being yours").replace(
    "{days}",
    togetherDays
  );

  return (
    <section
      id="prologue"
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-6 py-12 text-center overflow-hidden bg-gradient-to-b from-dusk-plum via-[#38132B] to-burgundy select-none"
    >
      {/* Interactive Firefly Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      />

      {/* Chapter Marker Header */}
      <div className="relative z-10 pt-4">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80">
          Chapter 01 • The Beginning
        </span>
      </div>

      {/* Central Story Prose & Counter */}
      <div className="relative z-10 flex flex-col items-center max-w-[340px] my-auto space-y-6">
        <div className="flex flex-col space-y-3 min-h-[140px] justify-center items-center">
          <p className="font-typewriter text-sm sm:text-base tracking-widest text-gold uppercase min-h-[1.5rem]">
            {displayedLines[0]}
            {currentLineIndex === 0 && !isTypingComplete && (
              <span className="animate-pulse text-gold">_</span>
            )}
          </p>

          <p className="font-serif italic text-2xl sm:text-3xl text-cream/90 font-light min-h-[2rem]">
            {displayedLines[1]}
            {currentLineIndex === 1 && !isTypingComplete && (
              <span className="animate-pulse text-cream font-normal">|</span>
            )}
          </p>

          <p className="font-serif text-3xl sm:text-4xl text-blush tracking-wide min-h-[2.5rem]">
            {displayedLines[2]}
            {currentLineIndex === 2 && !isTypingComplete && (
              <span className="animate-pulse text-blush font-normal">|</span>
            )}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={
            isTypingComplete
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 14 }
          }
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center pt-4"
        >
          <div className="bg-cream/10 backdrop-blur-md border border-gold/30 rounded-xl px-5 py-3 shadow-lg flex items-center justify-center gap-2.5 text-cream font-serif text-2xl sm:text-3xl">
            <div className="flex flex-col items-center">
              <span className="leading-none">{metTimer.days}</span>
              <span className="text-[8px] font-typewriter tracking-widest text-gold uppercase mt-1">days</span>
            </div>
            <span className="text-gold/70 pb-3">:</span>
            <div className="flex flex-col items-center">
              <span className="leading-none">{String(metTimer.hours).padStart(2, "0")}</span>
              <span className="text-[8px] font-typewriter tracking-widest text-gold uppercase mt-1">hrs</span>
            </div>
            <span className="text-gold/70 pb-3">:</span>
            <div className="flex flex-col items-center">
              <span className="leading-none">{String(metTimer.minutes).padStart(2, "0")}</span>
              <span className="text-[8px] font-typewriter tracking-widest text-gold uppercase mt-1">min</span>
            </div>
            <span className="text-gold/70 pb-3">:</span>
            <div className="flex flex-col items-center">
              <span className="leading-none">{String(metTimer.seconds).padStart(2, "0")}</span>
              <span className="text-[8px] font-typewriter tracking-widest text-gold uppercase mt-1">sec</span>
            </div>
          </div>

          <span className="font-handwriting text-lg text-rose tracking-wide mt-2">
            {config.counterLabel}
          </span>

          <p className="font-body italic text-xs text-cream/70 mt-1">
            {togetherText}
          </p>
        </motion.div>
      </div>

      {/* Gentle Scroll Cue -> Directs to Chapter 2 (#chat) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 flex flex-col items-center pb-safe pt-4 cursor-pointer"
        onClick={() => scrollToSection("chat")}
      >
        <span className="font-typewriter text-[10px] uppercase tracking-[0.25em] text-gold/80">
          {config?.scrollCue || "scroll"}
        </span>
        <svg
          className="w-4 h-4 text-gold/80 mt-1 transform"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </section>
  );
}