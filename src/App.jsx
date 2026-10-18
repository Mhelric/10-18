import { useState, useRef } from "react";
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
import ReasonsChapter from "./components/chapters/ReasonsChapter";
import LetterChapter from "./components/chapters/LetterChapter";
import OpenWhenChapter from "./components/chapters/OpenWhenChapter";
import FinaleChapter from "./components/chapters/FinaleChapter";
import AnoTaraChapter from "./components/chapters/AnoTaraChapter";

export default function App() {
  const musicPlayerRef = useRef(null);
  
  // Set to true so you can scroll and test everything immediately.
  // Set back to false right before you send her the link!
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleGateUnlock = () => {
    setIsUnlocked(true);
    if (musicPlayerRef.current) {
      musicPlayerRef.current.play();
    }
  };

  const handleScrollToPrologue = () => {
    const prologueSection = document.getElementById("prologue");
    if (prologueSection) {
      prologueSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleVideoPlay = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.pause();
    }
  };

  const handleVideoPause = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.play();
    }
  };

  const handleVoicePlay = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.duck(0.12);
    }
  };

  const handleVoicePause = () => {
    if (musicPlayerRef.current) {
      musicPlayerRef.current.unduck(0.75);
    }
  };

  return (
    <div
      className={`bg-cream selection:bg-blush selection:text-burgundy ${
        isUnlocked
          ? "relative min-h-screen overflow-x-hidden"
          : "fixed inset-0 h-[100dvh] overflow-hidden"
      }`}
    >
      <BackgroundAmbience />
      <MusicPlayer
      ref={musicPlayerRef}
      audioSrc={content.meta.audioTrack}
      visible={isUnlocked}
    />

      <main className="relative z-10 mx-auto w-full max-w-[420px] min-h-screen flex flex-col bg-cream/40 shadow-[0_0_50px_rgba(43,18,51,0.04)]">
        <GateChapter
          gateData={content.gate}
          targetDate={content.meta.targetUnlockDate}
          onUnlockSuccess={handleGateUnlock}
        />

        {isUnlocked && (
          <>
            <PrologueChapter data={content.chapters[0]} prologueData={content.prologue} />
            <ChatChapter chatData={content.firstChat} />
            <MemoriesChapter timelineData={content.timeline} metaData={content.timelineMeta} />
            <WallChapter wallData={content.wall} metaData={content.wallMeta} />
            <SongChapter songData={content.song} metaData={content.songMeta} onVideoPlay={handleVideoPlay} onVideoPause={handleVideoPause} />
            <JokesChapter jokesData={content.insideJokes} metaData={content.jokesMeta} />
            <ReasonsChapter reasonsData={content.reasons} finaleText={content.reasonsFinale} loveNotes={content.loveNotes} metaData={content.reasonsMeta} />
            <AnoTaraChapter data={content.anoTara} />
            <LetterChapter letterData={content.letter} onVoicePlay={handleVoicePlay} onVoicePause={handleVoicePause} />
            <OpenWhenChapter openWhenData={content.openWhen} metaData={content.openWhenMeta} />
            <FinaleChapter finaleData={content.finale} onReset={handleScrollToPrologue} />
          </>
        )}
      </main>
    </div>
  );
}