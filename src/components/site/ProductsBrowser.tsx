"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { cn, formatPKR } from "@/lib/utils";
import type { Product } from "@/data";

type Sort = "featured" | "low" | "high";

export default function ProductsBrowser({ products, types }: { products: Product[]; types: string[] }) {
  const [type, setType] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("featured");

  const count = (t: string) => (t === "all" ? products.length : products.filter((p) => p.tag === t).length);

  const filtered = useMemo(() => {
    let list = type === "all" ? products : products.filter((p) => p.tag === type);
    if (sort === "low") list = [...list].sort((a, b) => a.startPrice - b.startPrice);
    else if (sort === "high") list = [...list].sort((a, b) => b.startPrice - a.startPrice);
    return list;
  }, [type, sort, products]);

  const typeOptions = [{ key: "all", label: "All models" }, ...types.map((t) => ({ key: t, label: t }))];
  const sortOptions: { key: Sort; label: string }[] = [
    { key: "featured", label: "Featured" },
    { key: "low", label: "Price: low to high" },
    { key: "high", label: "Price: high to low" },
  ];

  return (
    <div className="container-site grid grid-cols-1 gap-8 pb-20 lg:grid-cols-[1fr_250px]">
      {/* Filter sidebar, right on desktop, top on mobile; sticky on scroll */}
      <aside className="lg:order-2">
        <div className="lg:sticky lg:top-[88px]">
          <div className="card p-5">
            <div className="eyebrow">Filter</div>
            <h2 className="mt-1.5 font-display text-lg font-extrabold text-ink">Body type</h2>
            <div className="mt-3 flex flex-col gap-2">
              {typeOptions.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setType(o.key)}
                  aria-pressed={type === o.key}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm font-semibold transition",
                    type === o.key ? "border-suzuki-dark bg-suzuki-dark text-white" : "border-line bg-white text-ink-soft hover:border-suzuki-blue hover:text-suzuki-blue"
                  )}
                >
                  <span>{o.label}</span>
                  <span className={cn("text-xs", type === o.key ? "text-white/70" : "text-ink-faint")}>{count(o.key)}</span>
                </button>
              ))}
            </div>

            <h2 className="mt-5 font-display text-lg font-extrabold text-ink">Sort by</h2>
            <div className="mt-3 flex flex-col gap-2">
              {sortOptions.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  aria-pressed={sort === s.key}
                  className={cn(
                    "rounded-lg border px-3.5 py-2.5 text-left text-sm font-semibold transition",
                    sort === s.key ? "border-suzuki-blue bg-[#EAF1FB] text-suzuki-blue" : "border-line bg-white text-ink-soft hover:border-suzuki-blue"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-lg bg-paper p-3 text-center text-xs text-ink-muted">
              From <span className="font-bold text-suzuki-dark">{formatPKR(Math.min(...products.map((p) => p.startPrice)))}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Grid */}
      <div className="lg:order-1">
        <div className="mb-4 text-sm font-semibold text-ink-muted">
          Showing {filtered.length} {filtered.length === 1 ? "model" : "models"}
        </div>
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-ink-muted">No models match this filter.</p>
        ) : (
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
