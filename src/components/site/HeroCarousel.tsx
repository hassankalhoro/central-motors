"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  slug: string;
  name: string;
  kicker: string;
  lead: string;
  big: string;
  sub: string;
  price: string;
  image?: string | null;
  blur?: string;
  tone: string;
};

const INTERVAL = 6000;

const TONES: Record<string, { glow: string; accent: string; rim: string }> = {
  warm: { glow: "rgba(255,150,64,.32)", accent: "#FFB068", rim: "rgba(255,196,140,.5)" },
  cool: { glow: "rgba(52,131,224,.40)", accent: "#8FBEF7", rim: "rgba(150,196,255,.55)" },
  green: { glow: "rgba(60,200,150,.30)", accent: "#83E6BC", rim: "rgba(150,240,205,.5)" },
};

// Subtle film grain, kills the flat "digital paste" look.
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = back
  const paused = useRef(false);
  const n = slides.length;
  const many = n > 1;

  const go = useCallback(
    (idx: number, d = 1) => {
      setDir(d);
      setI(((idx % n) + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (!many) return; // single creative → static, no auto-scroll
    const t = setInterval(() => {
      if (!paused.current && document.visibilityState !== "hidden") {
        setDir(1);
        setI((v) => (v + 1) % n);
      }
    }, INTERVAL);
    return () => clearInterval(t);
  }, [many, n]);

  if (!n) return null;

  return (
    <section
      className="relative isolate min-h-[580px] overflow-hidden bg-[#040f28] text-white sm:min-h-[700px] lg:min-h-[760px]"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      {/* ── shared base backdrop (never changes) ─────────────── */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(130%_120%_at_74%_20%,#0a2c70_0%,#061844_48%,#040e26_100%)]" />
        <div className="absolute -bottom-56 -left-40 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(225,22,34,.16),transparent_65%)] animate-glow" />
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:30px_30px]" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_42%,transparent_52%,rgba(2,7,20,.8)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,rgba(1,6,20,.9),transparent)]" />
        <div className="absolute inset-0 opacity-[.06] mix-blend-overlay" style={{ backgroundImage: NOISE }} />
      </div>

      {/* ── slide layers (crossfade + cinematic zoom) ────────── */}
      {slides.map((s, idx) => {
        const active = idx === i;
        const tone = TONES[s.tone] ?? TONES.cool;
        return (
          <div
            key={idx}
            aria-hidden={!active}
            className={cn(
              "absolute inset-0 transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] will-change-[opacity,transform]",
              active ? "z-[1] opacity-100 blur-0" : "z-0 opacity-0 blur-[6px]",
            )}
            style={{ transform: active ? "scale(1)" : `scale(1.05) translateX(${dir * 3}%)` }}
          >
            {/* ambient: blown-up, blurred car → scene shares the car's colour + light */}
            {s.image && (
              <Image
                src={s.image}
                alt=""
                fill
                priority={idx === 0}
                sizes="100vw"
                quality={20}
                aria-hidden
                className="scale-[1.7] object-cover object-[70%_40%] opacity-40 blur-[70px] saturate-150"
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(130%_120%_at_74%_20%,rgba(10,44,112,.5)_0%,rgba(6,24,68,.84)_48%,#040e26_100%)]" />
            {/* tone spotlight */}
            <div
              className="absolute right-[4%] top-[2%] h-[600px] w-[600px] rounded-full blur-[8px] animate-glow"
              style={{ background: `radial-gradient(circle, ${tone.glow}, transparent 66%)` }}
            />

            {/* the car */}
            {s.image && (
              <div className="pointer-events-none absolute z-[1] bottom-[58px] left-0 right-0 top-auto h-[216px] sm:h-[300px] lg:bottom-[9%] lg:left-[36%] lg:right-[-2%] lg:top-[3%] lg:h-auto">
                <div
                  className="absolute left-1/2 top-1/2 h-[64%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
                  style={{ background: `radial-gradient(ellipse at center, ${tone.rim}, transparent 62%)` }}
                />
                <div className={cn("relative h-full w-full", active && "animate-hero-zoom")}>
                  {/* floor reflection (desktop) */}
                  <div
                    aria-hidden
                    className="absolute inset-0 hidden translate-y-[99%] scale-y-[-1] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,.5),transparent_52%)] lg:block"
                  >
                    <Image src={s.image} alt="" fill sizes="66vw" className="object-contain object-bottom opacity-35 blur-[1.5px]" />
                  </div>
                  {/* contact shadow */}
                  <div aria-hidden className="absolute bottom-[3%] left-1/2 h-[30px] w-[66%] -translate-x-1/2 rounded-[100%] bg-black/60 blur-2xl lg:left-[54%] lg:w-[56%]" />
                  {/* car */}
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    priority={idx === 0}
                    sizes="(max-width:1024px) 100vw, 66vw"
                    quality={92}
                    placeholder={s.blur ? "blur" : "empty"}
                    blurDataURL={s.blur}
                    className="object-contain object-bottom drop-shadow-[0_30px_38px_rgba(0,0,0,.5)] lg:object-right"
                  />
                </div>
              </div>
            )}

            {/* legibility scrim */}
            <div className="absolute inset-0 z-[2] bg-[linear-gradient(to_bottom,rgba(4,15,40,.5),rgba(4,15,40,.15)_42%,transparent_60%)] lg:bg-[linear-gradient(to_right,#040f28_9%,rgba(4,15,40,.42)_30%,transparent_54%)]" />

            {/* content */}
            <div className="relative z-[3] mx-auto flex w-full max-w-[1500px] flex-col justify-start px-6 pb-[300px] pt-7 sm:px-8 sm:pb-[390px] lg:min-h-[760px] lg:justify-center lg:px-14 lg:pb-24 lg:pt-24">
              <div className={cn("max-w-[300px] sm:max-w-[460px]", active ? "pointer-events-auto" : "pointer-events-none")}>
                <div className={cn("text-[12.5px] font-bold uppercase tracking-[0.22em]", active && "animate-hero-reveal")} style={{ color: tone.accent, animationDelay: "120ms" }}>
                  {s.kicker}
                </div>
                <h1 className="mt-3 font-display font-black uppercase leading-[.92] tracking-tight">
                  <span className="sr-only">Suzuki {s.name} price in Pakistan, new Suzuki cars at Central Motors Rawalpindi</span>
                  <span className={cn("block text-[clamp(20px,2.4vw,30px)] text-white/65", active && "animate-hero-reveal")} style={{ animationDelay: "220ms" }}>
                    {s.lead}
                  </span>
                  <span className={cn("mt-0.5 block text-[clamp(38px,4.8vw,64px)] text-white [text-shadow:0_14px_50px_rgba(0,0,0,.5)]", active && "animate-hero-rise")} style={{ animationDelay: "320ms" }}>
                    {s.big}
                  </span>
                </h1>
                <p className={cn("mt-3 line-clamp-2 max-w-[400px] text-[14px] leading-relaxed text-[#C6D4EC] [text-shadow:0_2px_10px_rgba(0,0,0,.5)] sm:text-[15px] lg:mt-4 lg:line-clamp-none", active && "animate-hero-reveal")} style={{ animationDelay: "430ms" }}>
                  {s.sub}
                </p>
                <div className={cn("mt-5 flex flex-wrap items-center gap-3 lg:mt-7", active && "animate-hero-reveal")} style={{ animationDelay: "530ms" }}>
                  <Link
                    href={`/product/${s.slug}`}
                    tabIndex={active ? undefined : -1}
                    className="inline-flex items-center gap-2 rounded-full bg-suzuki-red px-7 py-3.5 text-[15px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk"
                  >
                    Explore {s.name} →
                  </Link>
                  <span className="text-[13px] text-[#9DB4D6]">
                    Starting at <span className="font-display text-[15px] font-bold text-white">{s.price}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── controls (only when >1 creative) ─────────────────── */}
      {many && (
        <>
          <button onClick={() => go(i - 1, -1)} aria-label="Previous" className="absolute left-4 top-1/2 z-[5] hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/5 text-lg text-white backdrop-blur-sm transition hover:bg-white/15 lg:grid">‹</button>
          <button onClick={() => go(i + 1, 1)} aria-label="Next" className="absolute right-4 top-1/2 z-[5] hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/5 text-lg text-white backdrop-blur-sm transition hover:bg-white/15 lg:grid">›</button>
          <div className="absolute inset-x-0 bottom-7 z-[5] flex items-center justify-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => go(idx, idx > i ? 1 : -1)}
                aria-label={`Slide ${idx + 1}`}
                className="group grid h-6 w-6 place-items-center"
              >
                <span className={cn("h-[7px] rounded-full transition-all duration-300", idx === i ? "w-8 bg-suzuki-red" : "w-[7px] bg-white/35 group-hover:bg-white/60")} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
