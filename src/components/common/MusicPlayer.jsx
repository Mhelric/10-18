import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, useReducedMotion } from "framer-motion";

const MusicPlayer = forwardRef(function MusicPlayer({ audioSrc }, ref) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const playAudio = () => {
    if (audioRef.current) {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      audioRef.current.volume = 0.75;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Audio playback error:", err));
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Ducks background volume down to 12% without pausing
  const duckVolume = (targetVolume = 0.12, duration = 600) => {
    if (!audioRef.current) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const audio = audioRef.current;
    const step = 0.05;
    const intervalTime = Math.max(20, duration / ((audio.volume - targetVolume) / step || 10));

    fadeIntervalRef.current = setInterval(() => {
      if (audio.volume > targetVolume + step) {
        audio.volume = Math.max(targetVolume, audio.volume - step);
      } else {
        audio.volume = targetVolume;
        clearInterval(fadeIntervalRef.current);
      }
    }, intervalTime);
  };

  // Restores background volume back up to 75%
  const unduckVolume = (targetVolume = 0.75, duration = 700) => {
    if (!audioRef.current) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const audio = audioRef.current;
    const step = 0.05;
    const intervalTime = Math.max(20, duration / ((targetVolume - audio.volume) / step || 10));

    fadeIntervalRef.current = setInterval(() => {
      if (audio.volume < targetVolume - step) {
        audio.volume = Math.min(targetVolume, audio.volume + step);
      } else {
        audio.volume = targetVolume;
        clearInterval(fadeIntervalRef.current);
      }
    }, intervalTime);
  };

  useImperativeHandle(ref, () => ({
    play: playAudio,
    pause: pauseAudio,
    duck: duckVolume,
    unduck: unduckVolume,
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/40 bg-cream/80 backdrop-blur-md shadow-sm text-burgundy active:scale-95 transition-all cursor-pointer"
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
      >
        <span className="font-handwriting text-sm text-rose">
          {isPlaying ? "playing" : "our song"}
        </span>
        <span className="text-xs">{isPlaying ? "🔊" : "🔇"}</span>
      </motion.button>
    </div>
  );
});

export default MusicPlayer;