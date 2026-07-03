import Image from "next/image";
import Well from "./Well";
import { cn } from "@/lib/utils";

/** News card cover: full-bleed photo with a modern navy/blue duotone
    treatment and a soft hover zoom. Falls back to the branded well
    when a post has no image. */
export default function NewsCover({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) return <Well alt={alt} glyph="S" gradient className={className} />;
  return (
    <div className={cn("relative overflow-hidden border-b border-[#EEF1F5]", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
      />
      {/* blue duotone wash + legibility gradient, keeps every photo on-brand */}
      <div aria-hidden className="absolute inset-0 bg-suzuki-blue/25 mix-blend-multiply" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-suzuki-dark/55 via-suzuki-dark/5 to-transparent" />
      {/* subtle red accent */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-suzuki-red transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}
