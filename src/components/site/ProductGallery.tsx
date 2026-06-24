"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProductGallery({
  images,
  blur = [],
  name,
  category,
}: {
  images: string[];
  blur?: string[];
  name: string;
  category: string;
}) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;
  const glyph = name[0];

  return (
    <div>
      <div className="well-stripe relative flex h-[360px] items-center justify-center overflow-hidden rounded-[20px] border border-line bg-gradient-to-br from-[#F4F6F9] to-[#E7EDF5]">
        <span aria-hidden className="absolute select-none font-display text-[150px] font-black italic leading-[.8] text-[rgba(6,36,92,.06)]">{glyph}</span>
        {hasImages ? (
          <Image
            src={images[active]}
            alt={`${name} — image ${active + 1}`}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 55vw"
            quality={78}
            placeholder={blur[active] ? "blur" : "empty"}
            blurDataURL={blur[active]}
            className="object-contain p-3"
          />
        ) : (
          <div className="relative text-center">
            <div className="font-display text-[34px] font-black text-suzuki-dark">{name}</div>
          </div>
        )}
        <span className="absolute left-4 top-3.5 rounded-full bg-suzuki-red px-3 py-[5px] text-[11px] font-bold text-white">{category}</span>
      </div>

      {hasImages && images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-6">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "well-stripe relative h-[62px] overflow-hidden rounded-[11px] border-[1.5px] transition",
                i === active ? "border-suzuki-dark bg-white" : "border-line bg-paper hover:border-suzuki-blue"
              )}
            >
              <Image src={src} alt="" fill sizes="120px" quality={60} placeholder={blur[i] ? "blur" : "empty"} blurDataURL={blur[i]} className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
