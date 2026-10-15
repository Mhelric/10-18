import { content } from "./data/content";
import BackgroundAmbience from "./components/common/BackgroundAmbience";
import MusicPlayer from "./components/common/MusicPlayer";
import PrologueChapter from "./components/chapters/PrologueChapter";
import MemoriesChapter from "./components/chapters/MemoriesChapter";
import LetterChapter from "./components/chapters/LetterChapter";

export default function App() {
  return (
    <div className="relative min-h-screen bg-cream overflow-x-hidden selection:bg-blush selection:text-burgundy">
      <BackgroundAmbience />
      <MusicPlayer audioSrc={content.meta.audioTrack} />

      {/* Mobile-first centered column constraint */}
      <main className="relative z-10 mx-auto max-w-[420px] min-h-screen flex flex-col bg-cream/40 shadow-[0_0_50px_rgba(43,18,51,0.04)]">
        <PrologueChapter data={content.chapters[0]} />
        <MemoriesChapter data={content.chapters[1]} />
        <LetterChapter data={content.chapters[2]} />
      </main>
    </div>
  );
}