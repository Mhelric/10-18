import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function GateChapter({ gateData, targetDate, onUnlockSuccess }) {
  const shouldReduceMotion = useReducedMotion();

  const [inputVal, setInputVal] = useState("");
  const [isLockedByTime, setIsLockedByTime] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFlapOpen, setIsFlapOpen] = useState(false);
  const [isLetterRevealed, setIsLetterRevealed] = useState(false);
  const [errorState, setErrorState] = useState({ active: false, message: "" });
  const [errorIndex, setErrorIndex] = useState(0);

  useEffect(() => {
    const targetTime = new Date(targetDate).getTime();

    const checkTime = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsLockedByTime(false);
        return true;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
      return false;
    };

    const isPast = checkTime();
    if (!isPast) {
      const timer = setInterval(() => {
        const passed = checkTime();
        if (passed) clearInterval(timer);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [targetDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUnlocked) return;

    const cleanedInput = inputVal.trim().toLowerCase();
    const secret = (gateData.password || gateData.secretWord || "").trim().toLowerCase();

    if (cleanedInput === secret) {
      // 1. Immediately dismiss the mobile keyboard
      if (document.activeElement && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
      }

      // 2. Instantly snap viewport to the top so Chapter 1 cannot peek through
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = "";

      // 3. Re-snap in case the keyboard dismissal animation tries to alter scroll offset
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 80);
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 300);

      setErrorState({ active: false, message: "" });
      setIsUnlocked(true);

      setTimeout(() => {
        setIsFlapOpen(true);
      }, 400);

      setTimeout(() => {
        setIsLetterRevealed(true);
      }, 1000);

      if (onUnlockSuccess) {
        onUnlockSuccess();
      }

      setTimeout(() => {
        const nextSection = document.getElementById("prologue");
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 2600);
    } else {
      const messages = gateData.errorMessages || ["Not quite, try again Loveyyy..."];
      const nextMsg = messages[errorIndex % messages.length];
      setErrorIndex((prev) => prev + 1);
      setErrorState({ active: true, message: nextMsg });
    }
  };

  const clueText = gateData.clue || gateData.riddleClue || "";

  return (
    <section className="relative min-h-[100dvh] w-full flex flex-col justify-center items-center px-6 py-12 text-center select-none overflow-hidden">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mb-8"
      >
        <span className="font-typewriter text-xs tracking-[0.28em] text-gold uppercase">
          For Jaira • Our First Year
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-burgundy mt-1.5 tracking-wide font-normal">
          The Anniversary Gate
        </h1>
      </motion.div>

      {/* ENVELOPE STAGE */}
      <div 
        className="relative w-[310px] h-[190px] mb-8"
        style={{ perspective: "1200px" }}
      >
        <div className="absolute inset-0 w-full h-full bg-[#D4C3A6] rounded-md shadow-lg z-0" />

        <motion.div
          className="absolute top-0 left-0 w-full h-[95px] origin-top pointer-events-none"
          initial={false}
          animate={{
            rotateX: isFlapOpen ? 180 : 0,
            zIndex: isFlapOpen ? 5 : 30,
          }}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 w-full h-full filter drop-shadow-[0_3px_5px_rgba(43,18,51,0.12)]"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              backgroundColor: "#E8DBC3",
              backfaceVisibility: "hidden",
            }}
          />
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              backgroundColor: "#D6C4A6",
              transform: "rotateX(180deg)",
              backfaceVisibility: "hidden",
            }}
          />
        </motion.div>

        <motion.div
          initial={{ y: 0, opacity: 0 }}
          animate={
            isLetterRevealed
              ? { y: -65, opacity: 1 }
              : { y: 0, opacity: 0 }
          }
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-3.5 top-2.5 h-[165px] bg-[#FAF6EE] rounded-t-sm shadow-md z-10 flex flex-col items-center justify-start pt-4 border border-blush/40 pointer-events-none"
        >
          <span className="font-typewriter text-[9px] text-gold uppercase tracking-[0.25em]">
            October 18, 2026
          </span>
          <p className="font-handwriting text-xl text-burgundy mt-1.5">
            To my Loveyyy,
          </p>
          <span className="font-body italic text-[11px] text-rose mt-1 px-4">
            "One year of ordinary magic..."
          </span>
        </motion.div>

        <div className="absolute inset-0 w-full h-full z-20 pointer-events-none rounded-md overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 0 100%, 50% 50%)",
              backgroundColor: "#DFD0B5",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(100% 0, 100% 100%, 50% 50%)",
              backgroundColor: "#D7C7AB",
            }}
          />
          <div
            className="absolute inset-0 filter drop-shadow-[0_-2px_4px_rgba(43,18,51,0.06)]"
            style={{
              clipPath: "polygon(0 100%, 100% 100%, 50% 48%)",
              backgroundColor: "#EFE2C9",
            }}
          />
        </div>

        <div className="absolute top-[95px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <motion.div
            initial={false}
            animate={
              isUnlocked
                ? {
                    scale: [1, 1.25, 0],
                    opacity: [1, 1, 0],
                    filter: "blur(2px)",
                  }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-[50px] h-[50px] rounded-full bg-gradient-to-br from-[#5E1A2F] via-burgundy to-[#300B17] border-2 border-gold/75 shadow-[0_4px_12px_rgba(74,20,36,0.35)] flex items-center justify-center text-gold"
          >
            <div className="absolute inset-[3px] rounded-full border border-gold/30 pointer-events-none" />
            <span className="font-serif italic font-bold text-base tracking-wider drop-shadow-sm select-none">
              M&J
            </span>
          </motion.div>
        </div>
      </div>

      {/* INPUT / COUNTDOWN SECTION */}
      <div className="w-full max-w-[320px] flex flex-col items-center">
        {isLockedByTime ? (
          <div className="flex flex-col items-center space-y-3 bg-[#FAF6EE]/85 border border-gold/30 rounded-xl p-5 shadow-sm w-full">
            <span className="font-typewriter text-[11px] uppercase tracking-wider text-burgundy/70">
              {gateData.locationLabel || "Opening in Romblon on Oct 18"}
            </span>
            <div className="flex items-center gap-2 font-serif text-2xl text-burgundy">
              <div className="flex flex-col items-center">
                <span>{String(timeLeft.days).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase font-typewriter text-rose">days</span>
              </div>
              <span>:</span>
              <div className="flex flex-col items-center">
                <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase font-typewriter text-rose">hrs</span>
              </div>
              <span>:</span>
              <div className="flex flex-col items-center">
                <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase font-typewriter text-rose">min</span>
              </div>
              <span>:</span>
              <div className="flex flex-col items-center">
                <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase font-typewriter text-rose">sec</span>
              </div>
            </div>
            <p className="font-handwriting text-base text-rose/90 pt-1">
              Patience, Loveyyy... almost time.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <p className="font-serif italic text-base text-burgundy/90 mb-3 px-2">
              "{clueText}"
            </p>

            {!isUnlocked ? (
              <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-3">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={gateData.placeholder || "Type the password..."}
                  autoComplete="off"
                  className="w-full text-center bg-cream/90 border border-gold/50 rounded-lg py-2.5 px-3 text-burgundy font-body text-sm focus:outline-none focus:ring-1 focus:ring-rose/80 placeholder:text-burgundy/40 shadow-inner"
                />
                <motion.button
                  type="submit"
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  className="w-full py-2.5 bg-burgundy text-cream font-serif text-xs tracking-[0.2em] uppercase rounded-lg shadow-sm hover:bg-burgundy/95 transition-all"
                >
                  Break the Seal
                </motion.button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-handwriting text-2xl text-rose py-2"
              >
                {gateData.successMessage || "Opening our world..."}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Mascot / Error Feedback */}
      <div className="mt-5 flex flex-col items-center min-h-[90px] justify-start">
        <AnimatePresence mode="wait">
          {errorState.active && !isUnlocked && (
            <motion.div
              key="error-feedback"
              initial={{ opacity: 0, y: 8 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, y: 0, x: [-4, 4, -2, 2, 0] }
              }
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <img
                src={gateData.errorMascot}
                alt="Thinking mascot"
                width="56"
                height="56"
                className="w-14 h-14 object-contain drop-shadow"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <p className="font-handwriting text-base text-rose mt-2 max-w-[280px]">
                {errorState.message}
              </p>
            </motion.div>
          )}

          {isUnlocked && (
            <motion.div
              key="success-feedback"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <img
                src={gateData.successMascot}
                alt="Celebration mascot"
                width="56"
                height="56"
                className="w-14 h-14 object-contain drop-shadow"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <p className="font-typewriter text-xs text-gold uppercase tracking-widest mt-2">
                Unfolding our story...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}