import { useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function MusicPlayer({ audioSrc }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Playback failed:", err);
      });
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <audio ref={audioRef} src={audioSrc} loop preload="none" />
      
      <motion.button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Mute music" : "Play music"}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/40 bg-cream/80 backdrop-blur-md shadow-sm text-burgundy active:scale-95 transition-all"
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
      >
        <span className="font-handwriting text-sm text-rose">
          {isPlaying ? "playing" : "our song"}
        </span>
        <span className="text-xs">
          {isPlaying ? "🔊" : "🔇"}
        </span>
      </motion.button>
    </div>
  );
}