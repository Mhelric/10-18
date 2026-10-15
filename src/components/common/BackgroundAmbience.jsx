export default function BackgroundAmbience() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none">
      <div className="absolute inset-0 soft-vignette" />
      <div className="absolute inset-0 film-grain opacity-60 mix-blend-multiply" />
    </div>
  );
}