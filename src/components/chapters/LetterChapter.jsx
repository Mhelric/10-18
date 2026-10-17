export default function LetterChapter({ data }) {
  const chapterData = data || {
    id: "letter",
    dateStamp: "OCTOBER 18, 2026",
    title: "For My Loveyyy",
    subtitle: "A letter from my heart to yours",
  };

  return (
    <section
      id={chapterData.id || "letter"}
      className="min-h-screen w-full flex flex-col justify-center items-center px-6 py-16 text-center pb-safe"
    >
      <span className="font-typewriter text-xs tracking-widest text-gold uppercase">
        {chapterData.dateStamp}
      </span>
      <h2 className="font-serif text-3xl sm:text-4xl text-burgundy mt-2 font-normal">
        {chapterData.title}
      </h2>
      <p className="font-body italic text-sm text-rose mt-2">
        {chapterData.subtitle}
      </p>
    </section>
  );
}