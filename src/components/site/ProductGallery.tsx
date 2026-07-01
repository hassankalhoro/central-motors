"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { ProductColor } from "@/data/types";

function Swatch({ c, className }: { c: ProductColor; className?: string }) {
  const style = c.roofHex
    ? { background: `linear-gradient(to bottom, ${c.roofHex} 0 38%, ${c.hex} 38%)` }
    : { background: c.hex };
  return (
    <span
      className={cn("relative block rounded-full border border-black/10 shadow-[inset_0_2px_5px_rgba(255,255,255,.35),inset_0_-2px_5px_rgba(0,0,0,.15)]", className)}
      style={style}
    >
      {c.discontinued && (
        <span aria-hidden className="absolute inset-0 grid place-items-center">
          <span className="h-px w-[130%] rotate-[-38deg] bg-suzuki-red/80" />
        </span>
      )}
    </span>
  );
}

export default function ProductGallery({
  images,
  blur = [],
  name,
  category,
  colors = [],
}: {
  images: string[];
  blur?: string[];
  name: string;
  category: string;
  colors?: ProductColor[];
}) {
  const [colorIdx, setColorIdx] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const [full, setFull] = useState(false);

  const sel = colorIdx != null ? colors[colorIdx] : undefined;
  const usingColorPhotos = !!sel?.images?.length;
  const shown = usingColorPhotos ? sel!.images! : images;
  const shownBlur = usingColorPhotos ? [] : blur;
  const n = shown.length;
  const hasImages = n > 0;
  const glyph = name[0];

  const go = useCallback((d: number) => setActive((a) => (n ? (a + d + n) % n : 0)), [n]);

  function pickColor(i: number) {
    setColorIdx((cur) => (cur === i ? null : i));
    setActive(0);
  }

  // touch swipe (mobile)
  const [touchX, setTouchX] = useState<number | null>(null);
  const swipe = {
    onTouchStart: (e: React.TouchEvent) => setTouchX(e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX == null || n < 2) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      setTouchX(null);
    },
  };

  // lightbox keyboard controls
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [full, go]);

  const arrowCls =
    "grid h-10 w-10 place-items-center rounded-full border border-line bg-white/90 text-lg text-ink shadow-card backdrop-blur-sm transition hover:bg-white hover:text-suzuki-red";

  return (
    <div>
      {/* main stage */}
      <div {...swipe} className="well-stripe group relative flex h-[280px] items-center justify-center overflow-hidden rounded-[20px] border border-line bg-gradient-to-br from-[#F4F6F9] to-[#E7EDF5] sm:h-[360px]">
        <span aria-hidden className="absolute select-none font-display text-[150px] font-black italic leading-[.8] text-[rgba(6,36,92,.06)]">{glyph}</span>
        {hasImages ? (
          <Image
            key={`${colorIdx ?? "all"}-${active}`}
            src={shown[active]}
            alt={`${name}${sel ? ` in ${sel.name}` : ""}, photo ${active + 1}`}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 55vw"
            quality={78}
            placeholder={shownBlur[active] ? "blur" : "empty"}
            blurDataURL={shownBlur[active]}
            className="object-contain p-3"
          />
        ) : (
          <div className="relative text-center">
            <div className="font-display text-[34px] font-black text-suzuki-dark">{name}</div>
          </div>
        )}
        <span className="absolute left-4 top-3.5 rounded-full bg-suzuki-red px-3 py-[5px] text-[11px] font-bold text-white">{category}</span>

        {hasImages && (
          <>
            {/* fullscreen */}
            <button
              type="button"
              onClick={() => setFull(true)}
              aria-label="View fullscreen"
              className="absolute right-3.5 top-3.5 grid h-9 w-9 place-items-center rounded-full border border-line bg-white/90 text-ink shadow-card backdrop-blur-sm transition hover:text-suzuki-red"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {/* arrows */}
            {n > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={cn(arrowCls, "absolute left-3.5 top-1/2 -translate-y-1/2")}>‹</button>
                <button type="button" onClick={() => go(1)} aria-label="Next photo" className={cn(arrowCls, "absolute right-3.5 top-1/2 -translate-y-1/2")}>›</button>
              </>
            )}
            {/* counter */}
            {n > 1 && (
              <span className="absolute bottom-3.5 right-4 rounded-full bg-suzuki-dark/70 px-2.5 py-1 font-mono text-[11px] font-bold text-white backdrop-blur-sm">
                {active + 1} / {n}
              </span>
            )}
          </>
        )}
      </div>

      {/* thumbnails */}
      {hasImages && n > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-6">
          {shown.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              className={cn(
                "well-stripe relative h-[62px] overflow-hidden rounded-[11px] border-[1.5px] transition",
                i === active ? "border-suzuki-dark bg-white" : "border-line bg-paper hover:border-suzuki-blue"
              )}
            >
              <Image src={src} alt="" fill sizes="120px" quality={60} placeholder={shownBlur[i] ? "blur" : "empty"} blurDataURL={shownBlur[i]} className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {/* colours */}
      {colors.length > 0 && (
        <div className="mt-4 rounded-[16px] border border-line bg-white px-4 py-3.5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-muted">
              Colour{sel ? ":" : "s"}{" "}
              {sel && <span className="normal-case tracking-normal text-ink">{sel.name}</span>}
            </div>
            <div className="flex items-center gap-1.5">
              {sel?.roofHex && <span className="rounded-full bg-suzuki-dark/[.07] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-suzuki-dark">Two-Tone</span>}
              {sel?.discontinued && <span className="rounded-full bg-suzuki-red/10 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-suzuki-red">Discontinued</span>}
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {colors.map((c, i) => (
              <button
                key={c.name}
                type="button"
                onClick={() => pickColor(i)}
                title={c.name}
                aria-pressed={colorIdx === i}
                className={cn(
                  "rounded-full p-[3px] transition",
                  colorIdx === i ? "ring-2 ring-suzuki-red ring-offset-1" : "hover:ring-2 hover:ring-ink/20 hover:ring-offset-1",
                  c.discontinued && "opacity-55"
                )}
              >
                <Swatch c={c} className="h-8 w-8" />
              </button>
            ))}
          </div>
          {sel && !usingColorPhotos && (
            <p className="mt-2 text-[12px] leading-snug text-ink-faint">Showing standard photos. Ask our team to see {sel.name} in person.</p>
          )}
        </div>
      )}

      {/* fullscreen lightbox — a light studio stage so cut-out renders look natural */}
      {full && hasImages && createPortal(
        <div className="fixed inset-0 z-[300] flex flex-col bg-gradient-to-br from-[#F6F8FB] to-[#E3EAF3]" onClick={() => setFull(false)}>
          {/* subtle stage texture */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(6,36,92,.05)_1px,transparent_1px)] [background-size:26px_26px]" />
          <span aria-hidden className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 select-none font-display text-[260px] font-black italic leading-none text-[rgba(6,36,92,.05)] lg:block">{glyph}</span>

          {/* close, pinned to the overlay corner so it is always visible */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFull(false);
            }}
            aria-label="Close fullscreen"
            className="absolute right-4 top-4 z-[30] inline-flex items-center gap-2 rounded-full bg-suzuki-red px-4 py-2.5 text-[13px] font-bold text-white shadow-lift transition hover:bg-suzuki-red-dk sm:right-6 sm:top-5"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
            Close
          </button>

          {/* top bar */}
          <div className="relative z-[2] flex items-center justify-between px-5 py-4 pr-28 sm:px-8">
            <div>
              <div className="font-display text-[17px] font-extrabold text-ink">{name}</div>
              {sel && (
                <div className="mt-0.5 flex items-center gap-2 text-[12.5px] font-semibold text-ink-muted">
                  <Swatch c={sel} className="h-3.5 w-3.5" /> {sel.name}
                </div>
              )}
            </div>
          </div>

          {/* stage */}
          <div {...swipe} className="relative z-[1] mx-4 mb-3 flex-1 sm:mx-10" onClick={(e) => e.stopPropagation()}>
            {/* ground shadow */}
            <div aria-hidden className="pointer-events-none absolute bottom-[8%] left-1/2 h-[30px] w-[56%] -translate-x-1/2 rounded-[100%] bg-suzuki-dark/20 blur-2xl" />
            <Image
              key={`fs-${colorIdx ?? "all"}-${active}`}
              src={shown[active]}
              alt={`${name}, photo ${active + 1}`}
              fill
              sizes="100vw"
              quality={90}
              className="object-contain drop-shadow-[0_30px_35px_rgba(6,36,92,.22)]"
            />
            {n > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-0 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-2xl text-ink shadow-card transition hover:text-suzuki-red sm:-left-2">‹</button>
                <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-0 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-2xl text-ink shadow-card transition hover:text-suzuki-red sm:-right-2">›</button>
              </>
            )}
          </div>

          {/* colour selector, switch colours without leaving fullscreen */}
          {colors.length > 0 && (
            <div className="relative z-[2] flex justify-center px-5 pb-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-line bg-white/85 px-3 py-2 shadow-card backdrop-blur-sm">
                <span className="pl-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">Colour</span>
                {colors.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => pickColor(i)}
                    title={c.name}
                    aria-pressed={colorIdx === i}
                    className={cn(
                      "flex-shrink-0 rounded-full p-[3px] transition",
                      colorIdx === i ? "ring-2 ring-suzuki-red ring-offset-1" : "hover:ring-2 hover:ring-ink/20 hover:ring-offset-1",
                      c.discontinued && "opacity-55"
                    )}
                  >
                    <Swatch c={c} className="h-7 w-7" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* bottom bar: thumbnails + counter */}
          <div className="relative z-[2] flex items-center justify-center gap-3 px-5 pb-5" onClick={(e) => e.stopPropagation()}>
            {n > 1 && (
              <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-line bg-white/80 p-2 shadow-card backdrop-blur-sm">
                {shown.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActive(i)}
                    aria-label={`View photo ${i + 1}`}
                    className={cn(
                      "relative h-[52px] w-[76px] flex-shrink-0 overflow-hidden rounded-[9px] border-[1.5px] transition",
                      i === active ? "border-suzuki-red" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image src={src} alt="" fill sizes="100px" quality={55} className="object-contain p-0.5" />
                  </button>
                ))}
              </div>
            )}
            <span className="rounded-full bg-suzuki-dark px-3 py-1.5 font-mono text-[12px] font-bold text-white">
              {active + 1} / {n}
            </span>
            {/* second close, lives in the bottom bar so it can never be missed */}
            <button
              type="button"
              onClick={() => setFull(false)}
              aria-label="Close fullscreen"
              className="inline-flex items-center gap-1.5 rounded-full bg-suzuki-red px-4 py-1.5 text-[12.5px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
              Close
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
