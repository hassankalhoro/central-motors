import Link from "next/link";
import Well from "./Well";
import { cn, formatPKR } from "@/lib/utils";
import type { Product } from "@/data";

/** Reusable product card used across home, products, category and related rails. */
export default function ProductCard({ product, showCategory = false }: { product: Product; showCategory?: boolean }) {
  // Spotlight treatment (badge + accent ring), toggled per car from the admin panel.
  const spotlight = product.specs?.highlight?.enabled ? product.specs.highlight : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "card card-lift relative flex flex-col overflow-hidden hover:!shadow-lift",
        spotlight && "shadow-lift ring-2 ring-suzuki-red/70 hover:ring-suzuki-red",
      )}
    >
      {spotlight && (
        <span className="absolute left-3 top-3 z-[2] inline-flex items-center gap-1.5 rounded-full bg-suzuki-red px-3 py-1 text-[10.5px] font-black uppercase tracking-[0.1em] text-white shadow-cta">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          {spotlight.label}
        </span>
      )}
      <div className="relative">
        <Well
          src={product.images?.[0]}
          blurDataURL={product.blur?.[0]}
          alt={product.name}
          glyph={product.name[0]}
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
          className="h-[150px] border-b border-[#EEF1F5]"
        />
        <span className="absolute bottom-2 right-2.5 font-mono text-[9.5px] text-ink-faint">{product.tag}</span>
      </div>
      <div className="flex flex-1 flex-col p-4 pb-[17px]">
        {showCategory && (
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">{product.category}</div>
        )}
        <h3 className="mt-0.5 font-display text-lg font-extrabold text-ink">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between pt-3.5">
          <div>
            <div className="text-[10.5px] text-ink-faint">Starting</div>
            <div className="font-display text-[15px] font-bold text-suzuki-dark">{formatPKR(product.startPrice)}</div>
          </div>
          <span className="text-[12.5px] font-bold text-suzuki-red">Details →</span>
        </div>
      </div>
    </Link>
  );
}
