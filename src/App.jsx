import { useRef } from "react";
import { content } from "./data/content";
import BackgroundAmbience from "./components/common/BackgroundAmbience";
import MusicPlayer from "./components/common/MusicPlayer";
import GateChapter from "./components/chapters/GateChapter";
import PrologueChapter from "./components/chapters/PrologueChapter";
import MemoriesChapter from "./components/chapters/MemoriesChapter";
import LetterChapter from "./components/chapters/LetterChapter";

export default function App() {
  const musicPlayerRef = useRef(null);

  const handleGateUnlock = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.play();
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
        <PrologueChapter data={content.chapters[0]} />
        <MemoriesChapter data={content.chapters[1]} />
        <LetterChapter data={content.chapters[2]} />
      </main>
    </div>
  );
}