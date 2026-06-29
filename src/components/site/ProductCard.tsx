import Link from "next/link";
import Well from "./Well";
import { formatPKR } from "@/lib/utils";
import type { Product } from "@/data";

/** Reusable product card used across home, products, category and related rails. */
export default function ProductCard({ product, showCategory = false }: { product: Product; showCategory?: boolean }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="card card-lift flex flex-col overflow-hidden hover:!shadow-lift"
    >
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
