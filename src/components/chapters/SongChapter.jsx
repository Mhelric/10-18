import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function SongChapter({ songData, metaData, onVideoPlay, onVideoPause }) {
  const shouldReduceMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const playerRef = useRef(null);

  const youtubeId = songData?.youtubeId || "hJVt_uPjCYI";
  const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  // Use songData.poster; fallback to YouTube HQ thumbnail if poster is not found
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
              if (onVideoPlay) onVideoPlay();
            } else if (event.data === 2 || event.data === 0) {
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

  return (
    <section
      id="song"
      className="relative min-h-[100dvh] w-full px-4 sm:px-6 py-16 select-none border-b border-blush/30 flex flex-col justify-between items-center overflow-hidden"
    >
      {/* Chapter Marker Header */}
      <div className="w-full flex flex-col items-center text-center mb-6">
        <span className="font-typewriter text-[10px] tracking-[0.3em] uppercase text-gold/80 mb-1">
          {metaData?.chapterTag || "Chapter 05 • Harana"}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-burgundy font-normal">
          {metaData?.title || songData?.title || "A Melody for Loveyyy"}
        </h2>
        <p className="font-handwriting text-lg text-rose mt-1">
          {metaData?.subtitle || "Turn up your volume and press play"}
        </p>
      </div>

      {/* Film-Strip Frame Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-[360px] my-auto flex flex-col items-center">
        {/* Outer Dark Film Casing */}
        <div className="w-full bg-[#1A0E1D] rounded-lg p-3 sm:p-3.5 shadow-[0_12px_36px_rgba(43,18,51,0.35)] border border-gold/30">
          
          {/* Top Sprocket Perforations */}
          <div className="flex justify-between items-center px-1 pb-2.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={`sprocket-top-${i}`}
                className="w-4 h-2.5 bg-[#FAF6EE]/20 rounded-xs border border-black/30"
              />
            ))}
          </div>

          {/* 16:9 Screen Viewport */}
          <div className="relative w-full aspect-video bg-[#0E0610] overflow-hidden rounded-[2px] shadow-inner">
            {!isLoaded ? (
              /* Facade: Clickable poster */
              <div
                onClick={handleStartPlay}
                className="relative w-full h-full cursor-pointer group block overflow-hidden"
              >
                {/* Poster / Thumbnail image */}
                <img
                  src={posterSrc}
                  alt={songData?.title || "Harana"}
                  onError={() => setPosterError(true)}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-[0.88]"
                />

                {/* Ambient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                {/* Upper Left Play Button */}
                <div className="absolute top-3 left-3 pointer-events-none z-10">
                  <motion.div
                    animate={
                      shouldReduceMotion
                        ? {}
                        : { scale: [1, 1.06, 1] }
                    }
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-full bg-burgundy/90 border-2 border-gold/90 flex items-center justify-center text-gold shadow-[0_4px_16px_rgba(201,162,75,0.45)] group-hover:scale-105 transition-transform"
                  >
                    <svg
                      className="w-5 h-5 ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            ) : (
              /* YouTube IFrame Mount */
              <div id="youtube-player-frame" className="w-full h-full" />
            )}
          </div>

          {/* Bottom Sprocket Perforations */}
          <div className="flex justify-between items-center px-1 pt-2.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={`sprocket-bot-${i}`}
                className="w-4 h-2.5 bg-[#FAF6EE]/20 rounded-xs border border-black/30"
              />
            ))}
          </div>
        </div>

        {/* Fallback YouTube External Link */}
        <div className="mt-3 text-center">
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-typewriter text-[11px] text-gold/80 hover:text-gold transition-colors underline decoration-gold/40 underline-offset-4"
          >
            <span>{metaData?.watchOnYoutubeText || "Watch on YouTube"}</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </div>

      {/* Scroll indicator to Inside Jokes */}
      {/* Scroll indicator to Chapter 6 (Inside Jokes) */}
      <div className="w-full flex flex-col items-center text-center pt-6 pb-safe">
        <button
          type="button"
          onClick={() => {
            const next = document.getElementById("jokes") || document.getElementById("letter");
            if (next) next.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center text-gold hover:text-gold/80 transition-colors cursor-pointer group"
        >
          <span className="font-typewriter text-[10px] uppercase tracking-[0.25em]">
            {metaData?.continueCue || "to our inside jokes"}
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
    </section>
  );
}