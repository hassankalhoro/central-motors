"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductColor } from "@/data/types";

function Swatch({ c, size = "h-12 w-12" }: { c: ProductColor; size?: string }) {
  const style = c.roofHex
    ? { background: `linear-gradient(to bottom, ${c.roofHex} 0 38%, ${c.hex} 38%)` }
    : { background: c.hex };
  return (
    <span className={cn("relative block rounded-full border border-black/10 shadow-[inset_0_2px_6px_rgba(255,255,255,.35),inset_0_-2px_6px_rgba(0,0,0,.15)]", size)} style={style}>
      {c.discontinued && (
        <span aria-hidden className="absolute inset-0 grid place-items-center">
          <span className="h-px w-[130%] rotate-[-38deg] bg-suzuki-red/80" />
        </span>
      )}
    </span>
  );
}

export default function ColorOptions({ colors, carName }: { colors: ProductColor[]; carName: string }) {
  const [i, setI] = useState(0);
  const sel = colors[i];
  if (!sel) return null;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
      {/* selected colour details */}
      <div>
        <div className="flex items-center gap-4">
          <Swatch c={sel} size="h-16 w-16" />
          <div>
            <div className="font-display text-[19px] font-extrabold text-ink">{sel.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-suzuki-dark/[.06] px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wide text-suzuki-dark">
                {sel.roofHex ? "Two-Tone" : "Mono-Tone"}
              </span>
              {sel.discontinued && (
                <span className="rounded-full bg-suzuki-red/10 px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wide text-suzuki-red">Discontinued</span>
              )}
            </div>
          </div>
        </div>

        {sel.image ? (
          <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-paper">
            <Image src={sel.image} alt={`${carName} in ${sel.name}`} fill sizes="(max-width:1024px) 92vw, 44vw" className="object-contain p-4" />
          </div>
        ) : (
          <p className="mt-4 max-w-[380px] text-[13.5px] leading-relaxed text-ink-muted">
            {sel.discontinued
              ? "This colour is no longer available for new orders. Ask our team about remaining stock."
              : "Ask our sales team to see this colour in person or in the latest catalogue."}
          </p>
        )}
      </div>

      {/* swatch grid */}
      <div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {colors.map((c, idx) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setI(idx)}
              aria-pressed={idx === i}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border bg-white p-3.5 text-center transition-all",
                idx === i ? "border-suzuki-red shadow-card" : "border-line hover:border-ink/20 hover:shadow-card",
                c.discontinued && "opacity-60",
              )}
            >
              <Swatch c={c} />
              <span className="text-[11.5px] font-semibold leading-tight text-ink-soft">{c.name}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] text-ink-faint">Two-Tone colours pair the body colour with a contrast roof. Availability can vary by variant.</p>
      </div>
    </div>
  );
}
