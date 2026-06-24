import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/site/ProductCard";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import { categories, getCategoryBySlug, getProductsByCategory } from "@/data";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const c = getCategoryBySlug(params.category);
  if (!c) return { title: "Category not found" };
  return { title: c.name, description: c.blurb };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = getCategoryBySlug(params.category);
  if (!category) notFound();
  const products = getProductsByCategory(category.slug);

  return (
    <>
      <PageHero eyebrow="Category" title={category.name} subtitle={category.blurb} back={{ href: "/products", label: "All models" }} />

      <div className="container-site flex flex-wrap gap-2.5 pt-6">
        {categories.map((c) => (
          <Link key={c.slug} href={`/products/${c.slug}`} className={cn("chip", c.slug === category.slug && "chip-active")}>
            {c.name}
          </Link>
        ))}
      </div>

      <section className="container-site pb-20 pt-6">
        {products.length === 0 ? (
          <p className="py-16 text-center text-ink-muted">No models listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, idx) => (
              <Reveal key={p.slug} delay={idx * 40}><ProductCard product={p} /></Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
