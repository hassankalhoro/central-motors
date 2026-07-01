/* ────────────────────────────────────────────────────────────────
   Announcement marquee, an infinite ticker of punchy tag words
   that runs across the page. Content is duplicated so the CSS
   loop is seamless; hover pauses it for readability.
   ──────────────────────────────────────────────────────────────── */

function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3z" />
    </svg>
  );
}

export default function TagMarquee({ phrases }: { phrases: string[] }) {
  if (!phrases.length) return null;
  const strip = (key: string) => (
    <div key={key} aria-hidden={key === "b"} className="flex w-max flex-shrink-0 items-center">
      {phrases.map((p, i) => (
        <span key={`${p}-${i}`} className="flex items-center">
          <span
            className={
              i % 3 === 2
                ? "font-display text-[19px] font-black uppercase italic tracking-wide text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.75)] sm:text-[23px]"
                : "font-display text-[19px] font-black uppercase italic tracking-wide text-white sm:text-[23px]"
            }
          >
            {p}
          </span>
          <Spark className="mx-6 h-4 w-4 flex-shrink-0 text-suzuki-red sm:mx-8" />
        </span>
      ))}
    </div>
  );

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-suzuki-darker py-5">
      {/* subtle brand glows */}
      <div aria-hidden className="pointer-events-none absolute -left-24 top-1/2 h-40 w-64 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(225,22,34,.25),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 top-1/2 h-40 w-64 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(46,123,214,.3),transparent_70%)]" />
      {/* edge fade */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 bg-gradient-to-r from-suzuki-darker to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 bg-gradient-to-l from-suzuki-darker to-transparent" />

      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        {strip("a")}
        {strip("b")}
      </div>
    </section>
  );
}
