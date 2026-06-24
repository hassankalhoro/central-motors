import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Branded image "well": shows a real product image (object-contain on a light
 * surface) or falls back to a large italic glyph watermark when no image exists.
 * Uses a base64 blur placeholder for a smooth blur-up load when provided.
 */
export default function Well({
  src,
  alt,
  glyph,
  blurDataURL,
  className,
  sizes = "(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw",
  priority = false,
  gradient = false,
}: {
  src?: string | null;
  alt: string;
  glyph: string;
  blurDataURL?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  gradient?: boolean;
}) {
  return (
    <div
      className={cn(
        "well-stripe relative flex items-center justify-center overflow-hidden",
        gradient ? "bg-gradient-to-br from-[#EEF2F8] to-[#E2E9F3]" : "bg-paper",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          quality={72}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          className="object-contain p-2"
        />
      ) : (
        <span aria-hidden className="select-none font-display text-[64px] font-black italic text-[rgba(6,36,92,.07)]">
          {glyph}
        </span>
      )}
    </div>
  );
}
