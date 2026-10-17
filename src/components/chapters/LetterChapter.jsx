import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function LetterChapter({ letterData, onVoicePlay, onVoicePause }) {
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [voiceError, setVoiceError] = useState(false);

  const voiceAudioRef = useRef(null);

  const data = letterData || {};
  const paragraphs = data.paragraphs || [];
  const signature = data.signature || ["YOUR SCRUMPTIOUS DORKY BF", "MELTOT"];

  const handleOpenEnvelope = () => {
    if (isOpen) return;
    setIsOpen(true);
  };

  const toggleVoicePlayback = () => {
    if (!voiceAudioRef.current) return;
    const audio = voiceAudioRef.current;

    if (isVoicePlaying) {
      audio.pause();
      setIsVoicePlaying(false);
      if (onVoicePause) onVoicePause();
    } else {
      audio
        .play()
        .then(() => {
          setIsVoicePlaying(true);
          if (onVoicePlay) onVoicePlay();
        })
        .catch(() => {
          setVoiceError(true);
          setIsVoicePlaying(false);
        });
    }
  };

  const handleVoiceEnded = () => {
    setIsVoicePlaying(false);
    if (onVoicePause) onVoicePause();
  };

  const handleScrollToOpenWhen = () => {
    const nextSection = document.getElementById("open-when");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="letter"
      className="relative min-h-[100dvh] w-full px-4 sm:px-6 py-16 flex flex-col items-center select-none overflow-hidden pb-safe"
    >
      {/* Optional voice note audio */}
      {data.voice && (
        <audio
          ref={voiceAudioRef}
          src={data.voice}
          preload="metadata"
          onEnded={handleVoiceEnded}
          onError={() => setVoiceError(true)}
        />
      )}

      {/* Header Tag */}
      <div className="w-full flex flex-col items-center text-center mb-6">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
          Chapter 08 • The Letter
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-burgundy font-normal">
          {data.title || "The Letter"}
        </h2>
        <span className="font-typewriter text-[11px] text-rose tracking-wider uppercase mt-1">
          {data.dateStamp} · {data.subtitle}
        </span>
      </div>

      {/* Closed Envelope Stage */}
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope-closed"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[340px] my-auto flex flex-col items-center cursor-pointer"
            onClick={handleOpenEnvelope}
          >
            {/* Envelope Body */}
            <div
              className="relative w-[300px] h-[190px] bg-[#EFE3CF] rounded-md shadow-xl border border-blush/60 flex items-center justify-center overflow-hidden group"
              style={{ perspective: "1000px" }}
            >
              <div className="absolute inset-0 bg-[#E8DBC3]" />
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
                className="absolute inset-0"
                style={{
                  clipPath: "polygon(0 100%, 100% 100%, 50% 48%)",
                  backgroundColor: "#EFE2C9",
                }}
              />
              <div
                className="absolute top-0 left-0 w-full h-[95px] filter drop-shadow-[0_2px_4px_rgba(43,18,51,0.12)]"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  backgroundColor: "#E2D3B8",
                }}
              />

              {/* Wax Seal */}
              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
                className="absolute top-[95px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-[#5E1A2F] via-burgundy to-[#300B17] border-2 border-gold/80 shadow-[0_4px_14px_rgba(74,20,36,0.4)] flex items-center justify-center text-gold cursor-pointer"
              >
                <div className="absolute inset-[3px] rounded-full border border-gold/30 pointer-events-none" />
                <span className="font-serif italic font-bold text-base tracking-wider drop-shadow-sm">
                  {data.sealInitials || "M&J"}
                </span>
              </motion.div>
            </div>

            <motion.p
              animate={shouldReduceMotion ? {} : { opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="font-handwriting text-lg text-rose mt-5"
            >
              {data.envelopeHint || "Tap to open my letter for you"}
            </motion.p>
          </motion.div>
        ) : (
          /* Unfolded Cream Lined Stationery Sheet */
          <motion.div
            key="envelope-opened"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-[370px] relative rounded-lg p-5 sm:p-7 shadow-[0_12px_36px_rgba(43,18,51,0.08)] border border-gold/35"
            style={{
              backgroundColor: "#FAF6EE",
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(201, 120, 138, 0.14) 31px, rgba(201, 120, 138, 0.14) 32px)",
            }}
          >
            {/* Top Washi Tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#EADFCA]/90 shadow-xs border-l border-r border-black/5 rotate-[-1deg] pointer-events-none z-10" />

            {/* Voice Message Button */}
            {data.voice && (
              <div className="mb-6 flex flex-col items-center text-center">
                <motion.button
                  type="button"
                  onClick={toggleVoicePlayback}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all shadow-xs cursor-pointer ${
                    isVoicePlaying
                      ? "bg-rose text-cream border-rose shadow-md animate-pulse"
                      : "bg-[#EFE3CF]/90 hover:bg-[#FAF6EE] text-burgundy border-gold/50"
                  }`}
                >
                  <span className="text-sm">{isVoicePlaying ? "❚❚" : "🎙️"}</span>
                  <span className="font-handwriting text-base font-semibold">
                    {isVoicePlaying
                      ? data.voicePlayingLabel || "Listening to my voice..."
                      : data.voiceButtonLabel || "Hear it in my voice"}
                  </span>
                </motion.button>

                {voiceError && (
                  <div className="mt-2 px-3 py-1 rounded bg-blush/40 border border-rose/30">
                    <span className="font-typewriter text-[10px] text-burgundy/80">
                      Voice note placeholder: place audio at /audio/voice-message.mp3
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Paragraphs Stream */}
            <div className="space-y-6">
              {paragraphs.map((p, idx) => (
                <div key={`paragraph-block-${idx}`}>
                  <motion.p
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="font-handwriting text-[19px] sm:text-[21px] text-burgundy leading-[1.7] whitespace-pre-line tracking-wide"
                  >
                    {p}
                  </motion.p>

                  {/* Rose Heart Divider */}
                  {idx < paragraphs.length - 1 && (
                    <div className="my-6 flex items-center justify-center gap-2 text-rose select-none opacity-85">
                      <span className="text-xs">♡</span>
                      <span className="tracking-[0.4em] text-xs font-serif">- - - - - - - -</span>
                      <span className="text-xs">♡</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Handwritten Signature with Hand-Drawn Heart */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mt-10 pt-4 flex flex-col items-center text-center border-t border-gold/30"
            >
              {signature.map((sigLine, sIdx) => (
                <span
                  key={`sig-${sIdx}`}
                  className="font-handwriting text-xl sm:text-2xl text-burgundy font-bold tracking-wider leading-snug"
                >
                  {sigLine}
                </span>
              ))}

              {/* Hand-Drawn Heart SVG */}
              <div className="mt-2 text-rose">
                <svg
                  className="w-7 h-7 filter drop-shadow-xs"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

              {/* Navigation button to Chapter 9 (Open When) */}
              <div className="mt-8 pt-4 border-t border-gold/20 w-full flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleScrollToOpenWhen}
                  className="flex flex-col items-center text-gold hover:text-gold/80 transition-colors cursor-pointer group"
                >
                  <span className="font-typewriter text-[10px] uppercase tracking-[0.25em]">
                    {data.continueCue || "to open when"}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}