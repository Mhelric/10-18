import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { scrollToSection } from "../../utils/scrollToSection";

export default function SongChapter({ songData, metaData, onVideoPlay, onVideoPause }) {
  const shouldReduceMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const playerRef = useRef(null);

  const youtubeId = songData?.youtubeId || "hJVt_uPjCYI";
  const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  const posterSrc =
    !posterError && songData?.poster
      ? songData.poster
      : `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

  const handleStartPlay = () => {
    setIsLoaded(true);

    // Pause site background music immediately on tap
    if (onVideoPlay) onVideoPlay();

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      playerRef.current = new window.YT.Player("youtube-player-frame", {
        videoId: youtubeId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === 1) {
              setIsPlaying(true);
              if (onVideoPlay) onVideoPlay();
            } else if (event.data === 2 || event.data === 0) {
              setIsPlaying(false);
              if (onVideoPause) onVideoPause();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("yt-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      const existingCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (existingCallback) existingCallback();
        initPlayer();
      };
    }
  };

  useEffect(() => {
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          // cleanup
        }
      }
    };
  }, []);

  const eqHeights = [
    [6, 16, 8, 14, 6],
    [14, 6, 16, 8, 14],
    [8, 14, 6, 16, 8],
    [16, 8, 14, 6, 16],
  ];

  return (
    <section
      id="song"
      className="relative w-full min-h-[100dvh] px-4 sm:px-6 pt-16 pb-10 select-none border-b border-blush/30 flex flex-col items-center justify-center gap-7 overflow-hidden"
    >
      {/* Soft glow behind the frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-gold/15 blur-3xl"
      />

      {/* Chapter header */}
      <div className="relative w-full flex flex-col items-center text-center">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
          {metaData?.chapterTag || "Chapter 05 • Harana"}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-burgundy font-normal">
          {metaData?.title || "A Melody for Loveyyy"}
        </h2>
        <p className="font-handwriting text-lg text-rose mt-1">
          {metaData?.subtitle || "Turn up your volume and press play"}
        </p>
      </div>

      {/* Film-strip frame */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] flex flex-col items-center">
        <div className="w-full bg-[#1A0E1D] rounded-lg p-3 sm:p-3.5 shadow-[0_14px_40px_rgba(43,18,51,0.38)] border border-gold/30">
          <div className="flex justify-between items-center px-1 pb-2.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={`sprocket-top-${i}`}
                className="w-4 h-2.5 bg-[#FAF6EE]/20 rounded-sm border border-black/30"
              />
            ))}
          </div>

          <div className="relative w-full aspect-video bg-[#0E0610] overflow-hidden rounded-[2px] shadow-inner">
            {!isLoaded ? (
              <button
                type="button"
                onClick={handleStartPlay}
                aria-label={`Play ${songData?.title || "our song"}`}
                className="relative w-full h-full cursor-pointer group block overflow-hidden touch-manipulation"
              >
                <img
                  src={posterSrc}
                  alt={songData?.title || "Harana"}
                  onError={() => setPosterError(true)}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-[0.9]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                {/* Play pill sits bottom-left so it never covers your face */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2.5 pr-3.5 rounded-full bg-burgundy/90 border border-gold/80 shadow-[0_4px_16px_rgba(201,162,75,0.4)]">
                  <motion.span
                    animate={shouldReduceMotion ? {} : { scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-10 h-10 rounded-full bg-gold text-burgundy flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.span>
                  <span className="font-typewriter text-[11px] tracking-widest text-cream uppercase">
                    Play
                  </span>
                </div>
              </button>
            ) : (
              <div id="youtube-player-frame" className="w-full h-full" />
            )}
          </div>

          <div className="flex justify-between items-center px-1 pt-2.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={`sprocket-bot-${i}`}
                className="w-4 h-2.5 bg-[#FAF6EE]/20 rounded-sm border border-black/30"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Now-playing card: vinyl + song title + equalizer */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] flex items-center gap-4 rounded-2xl border border-gold/40 bg-cream/70 backdrop-blur-sm px-4 py-3 shadow-[0_6px_20px_rgba(74,20,36,0.08)]">
        {/* Vinyl record */}
        <div className="relative shrink-0 w-14 h-14">
          <div
            className="w-full h-full rounded-full animate-spin shadow-md"
            style={{
              animationDuration: "6s",
              animationPlayState: isPlaying ? "running" : "paused",
              background:
                "radial-gradient(circle at center, #C9A24B 0 13%, #4A1424 14% 24%, transparent 25%), repeating-radial-gradient(circle at center, #1A0E1D 0 2px, #2B1233 2px 3px)",
            }}
          />
          <span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-cream" />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p className="font-serif text-xl text-burgundy leading-tight truncate">
            {songData?.title || "Palagi"}
          </p>
          <p className="font-handwriting text-base text-rose leading-tight">
            {songData?.subtitle || "Our Theme Song"}
          </p>
        </div>

        {/* Equalizer bars: dance only while the video is playing */}
        <div className="flex items-end gap-[3px] h-5 shrink-0" aria-hidden="true">
          {eqHeights.map((heights, i) => (
            <motion.span
              key={`eq-${i}`}
              className="w-[3px] rounded-full bg-gold"
              style={{ height: 6 }}
              animate={isPlaying && !shouldReduceMotion ? { height: heights } : { height: 6 }}
              transition={
                isPlaying && !shouldReduceMotion
                  ? { duration: 1.1 + i * 0.12, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.2 }
              }
            />
          ))}
        </div>
      </div>

      {/* External fallback */}
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="-mt-3 inline-flex items-center gap-1 font-typewriter text-[11px] text-gold/80 hover:text-gold transition-colors underline decoration-gold/40 underline-offset-4"
      >
        <span>{metaData?.watchOnYoutubeText || "Watch on YouTube"}</span>
        <span className="text-[10px]">↗</span>
      </a>

      {/* Next chapter */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          scrollToSection("jokes");
        }}
        className="relative z-30 flex flex-col items-center text-gold hover:text-gold/80 active:scale-95 transition-transform cursor-pointer group py-3 px-6 touch-manipulation"
      >
        <span className="font-typewriter text-[11px] uppercase tracking-[0.25em]">
          {metaData?.continueCue || "to our inside jokes"}
        </span>
        <svg
          className="w-4 h-4 mt-1.5 group-hover:translate-y-0.5 transition-transform"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </section>
  );
}
