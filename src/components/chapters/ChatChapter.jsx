import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { scrollToSection } from "../../utils/scrollToSection";

export default function ChatChapter({ chatData }) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef(null);

  const messages = chatData?.messages || [];

  const [hasStarted, setHasStarted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(shouldReduceMotion ? messages.length : 0);
  const [isTyping, setIsTyping] = useState(false);
  const [showClosing, setShowClosing] = useState(Boolean(shouldReduceMotion));

  const typingTimerRef = useRef(null);
  const intervalTimerRef = useRef(null);
  const closingTimerRef = useRef(null);

  // 1. Intersection Observer that triggers reliably on mobile viewports
  useEffect(() => {
    if (shouldReduceMotion) return;

    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2, // Triggers as soon as 20% of Chapter 2 enters the screen
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [shouldReduceMotion]);

  // 2. Start the first typing animation once in view
  useEffect(() => {
    if (hasStarted && visibleCount === 0 && !isTyping && !shouldReduceMotion) {
      const timer = setTimeout(() => {
        setIsTyping(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, visibleCount, isTyping, shouldReduceMotion]);

  // 3. Typing and message reveal sequence
  useEffect(() => {
    if (shouldReduceMotion || !hasStarted) return;

    if (isTyping && visibleCount < messages.length) {
      typingTimerRef.current = setTimeout(() => {
        setIsTyping(false);
        setVisibleCount((prev) => prev + 1);
      }, 1000);
    } else if (!isTyping && visibleCount < messages.length && visibleCount > 0) {
      intervalTimerRef.current = setTimeout(() => {
        setIsTyping(true);
      }, 450);
    } else if (visibleCount === messages.length && !showClosing) {
      closingTimerRef.current = setTimeout(() => {
        setShowClosing(true);
      }, 1800);
    }

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (intervalTimerRef.current) clearTimeout(intervalTimerRef.current);
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current);
    };
  }, [isTyping, visibleCount, messages.length, hasStarted, showClosing, shouldReduceMotion]);

  // 4. Tap anywhere to skip waiting
  const handleTapToSkip = () => {
    if (shouldReduceMotion || showClosing) return;

    if (!hasStarted) {
      setHasStarted(true);
      setIsTyping(true);
      return;
    }

    if (isTyping) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setIsTyping(false);
      setVisibleCount((prev) => Math.min(prev + 1, messages.length));
    } else if (visibleCount < messages.length) {
      if (intervalTimerRef.current) clearTimeout(intervalTimerRef.current);
      setIsTyping(true);
    } else if (visibleCount === messages.length && !showClosing) {
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current);
      setShowClosing(true);
    }
  };

  const currentTypingSender = messages[visibleCount]?.from || "her";

  return (
    <section
      id="chat"
      ref={sectionRef}
      onClick={handleTapToSkip}
      className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-4 sm:px-6 py-12 select-none border-b border-blush/30 cursor-pointer overflow-hidden"
    >
      {/* Top Header & Date Stamp */}
      <div className="w-full flex flex-col items-center">
        <span className="font-typewriter text-[10px] tracking-[0.28em] uppercase text-gold/80 mb-2">
          Chapter 02 • How It Began
        </span>
        <div className="inline-block bg-[#EFE3CF]/90 border border-gold/30 rounded-full px-4 py-1 shadow-xs">
          <span className="font-typewriter text-xs text-burgundy tracking-widest uppercase">
            {chatData?.dateLabel || "OCT 18, 2025"}
          </span>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="w-full max-w-[360px] my-auto flex flex-col pt-6 pb-2">
        <AnimatePresence>
          {messages.slice(0, visibleCount).map((msg, idx) => {
            const isMe = msg.from === "me";

            return (
              <motion.div
                key={`msg-${idx}`}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`w-full flex mb-2.5 ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[82%] px-3.5 py-2 shadow-sm ${
                    isMe
                      ? "bg-burgundy text-cream rounded-2xl rounded-tr-xs"
                      : "bg-blush text-burgundy rounded-2xl rounded-tl-xs"
                  }`}
                >
                  {/* Quoted replyTo snippet */}
                  {msg.replyTo && (
                    <div
                      className={`mb-1.5 text-xs italic border-l-2 pl-2 py-0.5 opacity-80 ${
                        isMe ? "border-rose text-cream/90" : "border-rose text-burgundy/80"
                      }`}
                    >
                      <p className="line-clamp-2">{msg.replyTo}</p>
                    </div>
                  )}

                  {/* Message Body */}
                  <p className="font-body text-[14px] leading-relaxed break-words">
                    {msg.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Dots Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              key="typing-indicator"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`w-full flex mb-2.5 ${
                currentTypingSender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-center gap-1 px-3 py-2.5 rounded-2xl ${
                  currentTypingSender === "me"
                    ? "bg-burgundy/70 text-cream rounded-tr-xs"
                    : "bg-blush/80 text-burgundy rounded-tl-xs"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
                  style={{ animationDelay: "200ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
                  style={{ animationDelay: "400ms" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Post-Chat Closing Note & Continue Indicator */}
      <div className="w-full flex flex-col items-center min-h-[100px] justify-end pb-safe">
        <AnimatePresence>
          {showClosing && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center text-center px-4"
            >
              <p className="font-handwriting text-xl sm:text-2xl text-rose leading-snug max-w-[320px]">
                {chatData?.closing}
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSection("memories");
                }}
                className="mt-5 flex flex-col items-center text-gold hover:text-gold/80 transition-colors cursor-pointer group"
              >
                <span className="font-typewriter text-[10px] uppercase tracking-[0.25em]">
                  Continue
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}