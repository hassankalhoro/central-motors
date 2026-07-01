import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/site/ProductGallery";
import ProductCard from "@/components/site/ProductCard";
import Reveal from "@/components/site/Reveal";
import VariantComparison from "@/components/site/VariantComparison";
import FeatureHighlights from "@/components/site/FeatureHighlights";
import TagMarquee from "@/components/site/TagMarquee";
import { formatPKR } from "@/lib/utils";
import { getProductBySlug, getRelatedProducts, getAdjacentProducts, categoryName } from "@/data/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) return { title: "Model not found" };
  return {
    title: `${p.name} Price in Pakistan`,
    description: p.desc,
    openGraph: { title: `${p.name}, Suzuki Central Motors`, description: p.desc, images: p.images?.[0] ? [p.images[0]] : [] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();
  const [catName, related, adjacent] = await Promise.all([
    categoryName(product.category),
    getRelatedProducts(product, 4),
    getAdjacentProducts(product.slug),
  ]);
  const { prev, next } = adjacent;
  const comparison = product.specs?.comparison;
  const colors = product.specs?.colors ?? [];

  return (
    <>
      <div className="container-site flex flex-wrap items-center justify-between gap-3 pt-[22px]">
        <nav className="text-[13px] text-ink-faint">
          <Link href="/products" className="font-semibold text-ink-muted">Products</Link>
          <span className="text-[#C8D0DC]"> / </span>{catName}
          <span className="text-[#C8D0DC]"> / </span><span className="font-semibold text-ink">{product.name}</span>
        </nav>
        <div className="flex items-center gap-2">
          {prev && (
            <Link href={`/product/${prev.slug}`} aria-label={`Previous: ${prev.name}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-bold text-ink-soft transition hover:border-suzuki-blue hover:text-suzuki-blue">
              ← <span className="hidden sm:inline">{prev.name}</span>
            </Link>
          )}
          {next && (
            <Link href={`/product/${next.slug}`} aria-label={`Next: ${next.name}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-bold text-ink-soft transition hover:border-suzuki-blue hover:text-suzuki-blue">
              <span className="hidden sm:inline">{next.name}</span> →
            </Link>
          )}
        </div>
      </div>

      {product.status === "DISCONTINUED" && (
        <div className="container-site pt-4">
          <div className="flex items-center gap-3 rounded-xl border border-suzuki-red/25 bg-suzuki-red/[.06] px-5 py-3.5 text-[14px] font-semibold text-suzuki-red">
            <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-suzuki-red text-[11px] font-bold text-white">!</span>
            This model has been discontinued. Contact us about remaining stock or a suitable alternative.
          </div>
        </div>
      )}

      <section className="container-site grid grid-cols-1 items-start gap-[38px] pt-[18px] lg:grid-cols-[1.1fr_.9fr]">
        <ProductGallery images={product.images ?? []} blur={product.blur ?? []} name={product.name} category={catName} colors={colors} />

        <div>
          <div className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-suzuki-blue">Suzuki {catName}</div>
          <h1 className="mt-2 font-display text-[clamp(30px,4vw,42px)] font-black tracking-tight text-ink">{product.name}</h1>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[13px] text-ink-muted">Starting at</span>
            <span className="font-display text-[28px] font-extrabold text-suzuki-red">{formatPKR(product.startPrice)}</span>
          </div>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-soft">{product.desc}</p>

          {product.specs?.tax && (
            <div className="mt-5">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                  <div className="text-[11.5px] font-bold uppercase tracking-wide text-emerald-700">Filer tax</div>
                  <div className="mt-0.5 font-display text-[17px] font-extrabold text-emerald-700">{formatPKR(product.specs.tax.filer)}</div>
                </div>
                <div className="rounded-xl border border-suzuki-red/20 bg-suzuki-red/[.05] px-4 py-3 text-center">
                  <div className="text-[11.5px] font-bold uppercase tracking-wide text-suzuki-red">Non-Filer tax</div>
                  <div className="mt-0.5 font-display text-[17px] font-extrabold text-suzuki-red">{formatPKR(product.specs.tax.nonFiler)}</div>
                </div>
              </div>
              <details className="mt-2 rounded-xl border border-line bg-paper/60 px-4 py-2.5">
                <summary className="cursor-pointer text-[13px] font-bold text-suzuki-blue">What do Filer and Non-Filer mean?</summary>
                <div className="pb-1.5 pt-2 text-[13px] leading-relaxed text-ink-muted">
                  <p>
                    This is the advance income tax (Section 231B) collected once at vehicle registration, on top of the price shown.
                    A <span className="font-bold text-ink">Filer</span> is someone on FBR&apos;s Active Taxpayer List, meaning they filed
                    their annual income tax return. A <span className="font-bold text-ink">Non-Filer</span> is not on that list and pays
                    a much higher rate. Becoming a filer before booking can save you a significant amount, and our team can guide you on both.
                  </p>
                </div>
              </details>
            </div>
          )}

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

      {/* announcement ticker, managed per car from the admin panel */}
      {(product.specs?.announcement?.enabled ?? true) && (
        <div className="mt-[54px]">
          <TagMarquee
            phrases={
              product.specs?.announcement?.phrases?.length
                ? product.specs.announcement.phrases
                : [
                    `Suzuki ${product.name}`,
                    product.tag ? `The ${product.tag}, redefined` : "Built for every road",
                    "Bold by design",
                    `Starting at ${formatPKR(product.startPrice)}`,
                    "Engineered to impress",
                    ...product.features.slice(0, 3),
                    "Book a test drive today",
                  ]
            }
          />
        </div>
      )}

      {product.features.length > 0 && (
        <section className="container-site pt-[54px]">
          <div className="eyebrow">Specifications</div>
          <h2 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink">Key features</h2>
          <div className="mt-6">
            <FeatureHighlights features={product.features} />
          </div>
          <p className="mt-3 text-xs text-ink-muted">Features vary by variant. Please confirm the exact specification with our sales team.</p>
        </section>
      )}

      {comparison && comparison.columns.length > 0 && (
        <section className="container-site pt-[54px]">
          {comparison.columns.length === 1 ? (
            <>
              <div className="eyebrow">Everything included</div>
              <h2 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink">What the {product.name} comes with</h2>
            </>
          ) : (
            <>
              <div className="eyebrow">Which one is right for you?</div>
              <h2 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink">Compare {product.name} variants</h2>
            </>
          )}
          <div className="mt-6">
            <VariantComparison columns={comparison.columns} groups={comparison.groups} note={comparison.note} />
          </div>
        </section>
      )}


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
