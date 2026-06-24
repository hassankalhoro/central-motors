"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  slug: string;
  name: string;
  cat: string;
  tagline: string;
  specs: string[];
  priceLabel: string;
  image?: string | null;
  blur?: string;
};

const INTERVAL = 5500;

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const paused = useRef(false);
  const n = slides.length;

  const go = useCallback((idx: number) => setI(((idx % n) + n) % n), [n]);

  useEffect(() => {
    const t = setInterval(() => {
      if (!paused.current && document.visibilityState !== "hidden") setI((v) => (v + 1) % n);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [n]);

  const s = slides[i];

  return (
    <section
      className="relative overflow-hidden bg-suzuki-dark"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div aria-hidden className="absolute -right-36 -top-52 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(46,123,214,.5),transparent_65%)] animate-glow" />
      <div aria-hidden className="absolute -bottom-60 -left-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(225,22,34,.24),transparent_65%)] animate-glow" />
      <div aria-hidden className="absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="container-site relative grid grid-cols-1 items-center gap-11 pt-16 lg:grid-cols-[1.04fr_.96fr]">
        {/* copy */}
        <div key={`copy-${i}`} className="animate-fade-up">
          <div className="text-[13px] font-bold uppercase tracking-[0.18em] text-suzuki-sky">Suzuki {s.cat}</div>
          <h1 className="mt-1 font-display text-[clamp(40px,5.6vw,68px)] font-black leading-[.98] tracking-tight text-white">{s.name}</h1>
          <p className="mt-3.5 text-lg font-medium leading-snug text-[#D4E0F2]">{s.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {s.specs.map((sp) => (
              <span key={sp} className="rounded-full border border-white/[.14] bg-white/[.07] px-3.5 py-[7px] font-mono text-[12.5px] font-semibold text-[#CFE0F6]">{sp}</span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-[18px]">
            <div>
              <div className="text-[11px] text-[#9DB4D6]">Starting at</div>
              <div className="font-display text-[26px] font-extrabold leading-tight text-white">{s.priceLabel}</div>
            </div>
            <Link href={`/product/${s.slug}`} className="inline-flex items-center gap-2 rounded-full bg-suzuki-red px-6 py-3.5 text-[15px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk">
              View {s.name} →
            </Link>
          </div>
        </div>

        {/* visual */}
        <div className="relative hidden self-end lg:flex lg:flex-col">
          <div key={`well-${i}`} className="relative flex min-h-[330px] animate-fade-up flex-col justify-end overflow-hidden rounded-[22px] border border-white/[.12] bg-[linear-gradient(170deg,#0B2F6E,#06245C)] px-[30px] pt-8">
            <span aria-hidden className="absolute left-5 top-1.5 select-none font-display text-[170px] font-black italic leading-[.8] text-white/[.05]">{s.name[0]}</span>
            <div className="absolute right-6 top-5 font-display text-[11px] font-bold tracking-[0.14em] text-white/40">0{i + 1} / 0{n}</div>
            {s.image ? (
              <div className="relative h-[230px] w-full">
                <Image
                  src={s.image}
                  alt={s.name}
                  fill
                  priority={i === 0}
                  sizes="(max-width:1024px) 0px, 45vw"
                  quality={80}
                  placeholder={s.blur ? "blur" : "empty"}
                  blurDataURL={s.blur}
                  className="object-contain object-bottom"
                />
              </div>
            ) : (
              <div className="font-display text-[46px] font-black leading-[.95] text-white">{s.name}</div>
            )}
            <div className="flex items-end justify-between py-3.5 pb-6">
              <div>
                <div className="text-[11px] text-[#9DB4D6]">Suzuki {s.cat}</div>
                <div className="font-display text-xl font-extrabold text-white">{s.priceLabel}</div>
              </div>
              <Link href={`/product/${s.slug}`} className="rounded-full bg-white px-4 py-2.5 text-[13px] font-bold text-suzuki-dark">Details</Link>
            </div>
          </div>

          {/* slide progress indicator (below the card) */}
          <div className="z-[3] mt-3.5 flex gap-1.5 px-0.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => go(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[.16]"
              >
                <div className="h-full bg-suzuki-red transition-transform duration-300" style={{ transform: `scaleX(${idx === i ? 1 : 0})`, transformOrigin: "left" }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="container-site relative flex flex-wrap items-center gap-4 py-[22px] pb-[30px]">
        <div className="flex gap-2.5">
          <button onClick={() => go(i - 1)} aria-label="Previous" className="grid h-[46px] w-[46px] place-items-center rounded-full border border-white/[.22] bg-white/[.06] text-lg text-white transition hover:bg-white/[.16]">‹</button>
          <button onClick={() => go(i + 1)} aria-label="Next" className="grid h-[46px] w-[46px] place-items-center rounded-full border border-white/[.22] bg-white/[.06] text-lg text-white transition hover:bg-white/[.16]">›</button>
        </div>
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => go(idx)} aria-label={`Slide ${idx + 1}`}
              className={cn("h-[9px] rounded-full transition-all", idx === i ? "w-[30px] bg-suzuki-red" : "w-[9px] bg-white/30")} />
          ))}
        </div>
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          {slides.map((sl, idx) => (
            <button key={sl.slug} onClick={() => go(idx)}
              className={cn("rounded-full border px-3.5 py-2 text-[12.5px] font-bold transition",
                idx === i ? "border-transparent bg-white text-suzuki-dark" : "border-white/[.16] bg-white/[.05] text-[#C3D2EA]")}>
              {sl.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
