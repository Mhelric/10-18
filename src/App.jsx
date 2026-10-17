import { useRef } from "react";
import { content } from "./data/content";
import BackgroundAmbience from "./components/common/BackgroundAmbience";
import MusicPlayer from "./components/common/MusicPlayer";
import GateChapter from "./components/chapters/GateChapter";
import PrologueChapter from "./components/chapters/PrologueChapter";
import ChatChapter from "./components/chapters/ChatChapter";
import MemoriesChapter from "./components/chapters/MemoriesChapter";
import WallChapter from "./components/chapters/WallChapter";
import SongChapter from "./components/chapters/SongChapter";
import JokesChapter from "./components/chapters/JokesChapter";
import LetterChapter from "./components/chapters/LetterChapter";

export default function App() {
  const musicPlayerRef = useRef(null);

  const handleGateUnlock = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.play();
    }
  };

  const handleVideoPlay = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.fadeOut(600);
    }
  };

  const handleVideoPause = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.fadeIn(800);
    }
  };

  return (
    <div className="relative min-h-screen bg-cream overflow-x-hidden selection:bg-blush selection:text-burgundy">
      <BackgroundAmbience />
      <MusicPlayer ref={musicPlayerRef} audioSrc={content.meta.audioTrack} />

      {/* Mobile-first centered column constraint */}
      <main className="relative z-10 mx-auto max-w-[420px] min-h-screen flex flex-col bg-cream/40 shadow-[0_0_50px_rgba(43,18,51,0.04)]">
        <GateChapter
          gateData={content.gate}
          targetDate={content.meta.targetUnlockDate}
          onUnlockSuccess={handleGateUnlock}
        />
        <PrologueChapter
          data={content.chapters[0]}
          prologueData={content.prologue}
        />
        <ChatChapter chatData={content.firstChat} />
        <MemoriesChapter
          timelineData={content.timeline}
          metaData={content.timelineMeta}
        />
        <WallChapter
          wallData={content.wall}
          metaData={content.wallMeta}
        />
        <SongChapter
          songData={content.song}
          metaData={content.songMeta}
          onVideoPlay={handleVideoPlay}
          onVideoPause={handleVideoPause}
        />
        <JokesChapter
          jokesData={content.insideJokes}
          metaData={content.jokesMeta}
        />
        <LetterChapter data={content.chapters[6]} />
      </main>
    </div>
  );
}