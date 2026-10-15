export default function PrologueChapter({ data }) {
  return (
    <section id={data.id} className="min-h-screen w-full flex flex-col justify-center items-center px-6 py-16 text-center border-b border-blush/40">
      <span className="font-typewriter text-xs tracking-widest text-gold uppercase">{data.dateStamp}</span>
      <h2 className="font-serif text-3xl sm:text-4xl text-burgundy mt-2 font-normal">{data.title}</h2>
      <p className="font-body italic text-sm text-rose mt-2">{data.subtitle}</p>
    </section>
  );
}