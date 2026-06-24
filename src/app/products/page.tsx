import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/site/ProductCard";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import { getProductGroups } from "@/data";

export const metadata: Metadata = {
  title: "All Suzuki Models",
  description: "Browse the full Suzuki Central Motors lineup — automobiles, heavy bikes and motorcycles with starting prices.",
};

export default function ProductsPage() {
  const groups = getProductGroups();
  return (
    <>
      <PageHero
        eyebrow="Our lineup"
        title="All Suzuki models"
        subtitle="Nineteen vehicles across automobiles, heavy bikes and motorcycles. Prices shown are starting figures, pending verification."
      />
      {groups.map((g) => (
        <section key={g.slug} className="container-site pt-[54px]">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
            <h2 className="font-display text-[26px] font-extrabold tracking-tight text-ink">
              {g.name} <span className="text-[15px] font-semibold text-ink-faint">· {g.count} models</span>
            </h2>
            <Link href={`/products/${g.slug}`} className="text-[13.5px] font-bold text-suzuki-blue">View category →</Link>
          </div>
          <div className="mt-[26px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {g.products.map((p, idx) => (
              <Reveal key={p.slug} delay={idx * 40}><ProductCard product={p} /></Reveal>
            ))}
          </div>
        </section>
      ))}
      <div className="h-[70px]" />
    </>
  );
}
