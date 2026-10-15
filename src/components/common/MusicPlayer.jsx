import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, useReducedMotion } from "framer-motion";

const MusicPlayer = forwardRef(function MusicPlayer({ audioSrc }, ref) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Audio playback error:", err);
      });
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  useImperativeHandle(ref, () => ({
    play: playAudio,
    pause: pauseAudio,
  }));

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
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
});

export default MusicPlayer;