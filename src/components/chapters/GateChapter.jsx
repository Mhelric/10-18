import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function GateChapter({ gateData, targetDate, onUnlockSuccess }) {
  const shouldReduceMotion = useReducedMotion();

  const [inputVal, setInputVal] = useState("");
  const [isLockedByTime, setIsLockedByTime] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFlapOpen, setIsFlapOpen] = useState(false);
  const [errorState, setErrorState] = useState({ active: false, message: "" });
  const [errorIndex, setErrorIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPreview = params.get("preview") === "1";
    const targetTime = new Date(targetDate).getTime();

    const checkTime = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (isPreview || difference <= 0) {
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
    if (!isPast && !isPreview) {
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
    const cleanedSecret = gateData.secretWord.trim().toLowerCase();

    if (cleanedInput === cleanedSecret) {
      setErrorState({ active: false, message: "" });
      setIsUnlocked(true);

      setTimeout(() => {
        setIsFlapOpen(true);
      }, 600);

      if (onUnlockSuccess) {
        onUnlockSuccess();
      }

      setTimeout(() => {
        const nextSection = document.getElementById("prologue");
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 2200);
    } else {
      const nextMsg = gateData.errorMessages[errorIndex % gateData.errorMessages.length];
      setErrorIndex((prev) => prev + 1);
      setErrorState({ active: true, message: nextMsg });
    }
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center items-center px-6 py-12 text-center select-none overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mb-8"
      >
        <span className="font-typewriter text-xs tracking-[0.25em] text-gold uppercase">
          For Jaira • Our First Year
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-burgundy mt-1 tracking-wide font-normal">
          The Anniversary Gate
        </h1>
      </motion.div>

      <div className="relative w-full max-w-[340px] aspect-[4/3] bg-[#EFE3CF] rounded-lg shadow-xl border border-blush/60 flex flex-col items-center justify-center p-6 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 right-0 h-1/2 origin-top z-20 pointer-events-none"
          initial={false}
          animate={isFlapOpen ? { rotateX: 180, opacity: 0 } : { rotateX: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <svg viewBox="0 0 340 120" className="w-full h-full drop-shadow-md">
            <polygon points="0,0 340,0 170,120" fill="#E8DBC4" stroke="#DCCBB0" strokeWidth="1" />
          </svg>
        </motion.div>

        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <motion.div
            initial={false}
            animate={
              isUnlocked
                ? { scale: [1, 1.15, 0], opacity: [1, 1, 0], filter: "blur(2px)" }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-14 h-14 rounded-full bg-burgundy border-2 border-gold/70 shadow-lg flex items-center justify-center text-gold font-serif font-bold text-lg select-none"
          >
            <span className="drop-shadow-sm font-serif italic">M&J</span>
          </motion.div>
        </div>

        <div className="relative z-10 w-full flex flex-col items-center pt-8">
          {isLockedByTime ? (
            <div className="flex flex-col items-center space-y-3">
              <span className="font-typewriter text-[11px] uppercase tracking-wider text-burgundy/70">
                Opening in Manila on Oct 18
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
              <p className="font-body text-xs italic text-burgundy/80 leading-relaxed px-2 mb-4">
                "{gateData.riddleClue}"
              </p>

              {!isUnlocked ? (
                <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-3">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={gateData.placeholder}
                    autoComplete="off"
                    className="w-full text-center bg-cream/90 border border-gold/50 rounded-md py-2 px-3 text-burgundy font-body text-sm focus:outline-none focus:ring-1 focus:ring-rose/80 placeholder:text-burgundy/40 shadow-inner"
                  />
                  <motion.button
                    type="submit"
                    whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
                    className="w-full py-2 bg-burgundy text-cream font-serif text-sm tracking-wider uppercase rounded-md shadow hover:bg-burgundy/95 transition-all"
                  >
                    Break the Seal
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="font-handwriting text-2xl text-rose"
                >
                  {gateData.successMessage}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center min-h-[140px] justify-start">
        <AnimatePresence mode="wait">
          {errorState.active && !isUnlocked && (
            <motion.div
              key="error-mascot"
              initial={{ opacity: 0, y: 8 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, y: 0, x: [-3, 3, -2, 2, 0] }
              }
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <img
                src={gateData.errorMascot}
                alt="Thinking mascot"
                className="w-16 h-16 object-contain drop-shadow"
                loading="lazy"
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
              key="success-mascot"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <img
                src={gateData.successMascot}
                alt="Celebration mascot"
                className="w-16 h-16 object-contain drop-shadow"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <p className="font-typewriter text-xs text-gold uppercase tracking-widest mt-2">
                Unfolding Chapter 1...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}