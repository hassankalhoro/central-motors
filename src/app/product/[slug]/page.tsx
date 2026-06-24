import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/site/ProductGallery";
import ProductCard from "@/components/site/ProductCard";
import Reveal from "@/components/site/Reveal";
import { formatPKR } from "@/lib/utils";
import { products, getProductBySlug, getRelatedProducts, categoryName } from "@/data";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProductBySlug(params.slug);
  if (!p) return { title: "Model not found" };
  return {
    title: `${p.name} Price in Pakistan`,
    description: p.desc,
    openGraph: { title: `${p.name} — Suzuki Central Motors`, description: p.desc, images: p.images?.[0] ? [p.images[0]] : [] },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();
  const catName = categoryName(product.category);
  const related = getRelatedProducts(product, 4);

  return (
    <>
      <nav className="container-site pt-[22px] text-[13px] text-ink-faint">
        <Link href="/products" className="font-semibold text-ink-muted">Products</Link>
        <span className="text-[#C8D0DC]"> / </span>{catName}
        <span className="text-[#C8D0DC]"> / </span><span className="font-semibold text-ink">{product.name}</span>
      </nav>

      <section className="container-site grid grid-cols-1 items-start gap-[38px] pt-[18px] lg:grid-cols-[1.1fr_.9fr]">
        <ProductGallery images={product.images ?? []} blur={product.blur ?? []} name={product.name} category={catName} />

        <div>
          <div className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-suzuki-blue">Suzuki {catName}</div>
          <h1 className="mt-2 font-display text-[clamp(30px,4vw,42px)] font-black tracking-tight text-ink">{product.name}</h1>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[13px] text-ink-muted">Starting at</span>
            <span className="font-display text-[28px] font-extrabold text-suzuki-red">{formatPKR(product.startPrice)}</span>
          </div>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-soft">{product.desc}</p>

          <div className="mt-[22px] overflow-hidden rounded-[14px] border border-line">
            <div className="bg-paper px-4 py-[11px] text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">Variants &amp; pricing</div>
            {product.variants.map((v) => (
              <div key={v.name} className="flex items-center justify-between border-t border-[#EEF1F5] px-4 py-3.5">
                <span className="text-[14.5px] font-semibold text-ink">{v.name}</span>
                <span className="font-display text-[15px] font-bold text-suzuki-dark">{formatPKR(v.price)}</span>
              </div>
            ))}
          </div>

          <div className="mt-[22px] flex flex-wrap gap-2.5">
            <Link href={`/online-inquiry?product=${encodeURIComponent(product.name)}`} className="btn-primary">Inquire about this model</Link>
            <Link href="/service-appointment" className="btn-ghost">Book a test drive</Link>
          </div>
          {product.brochure && (
            <a href={product.brochure} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-[13.5px] font-bold text-suzuki-blue">
              ⭳ Download brochure (PDF)
            </a>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-site pb-20 pt-[60px]">
          <h2 className="mb-[22px] font-display text-2xl font-extrabold tracking-tight text-ink">More from {catName}</h2>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, idx) => (
              <Reveal key={p.slug} delay={idx * 40}><ProductCard product={p} /></Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
