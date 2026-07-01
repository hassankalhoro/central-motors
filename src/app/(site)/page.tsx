import Link from "next/link";
import HeroCarousel, { type HeroSlide } from "@/components/site/HeroCarousel";
import ProductCard from "@/components/site/ProductCard";
import Reveal from "@/components/site/Reveal";
import ValueProps from "@/components/site/ValueProps";
import AfterSales from "@/components/site/AfterSales";
import NewsSlider from "@/components/site/NewsSlider";
import { formatPKR } from "@/lib/utils";
import { fronxHero, homeStats, valueProps, afterSales } from "@/data";
import { getFeaturedProducts, getProductBySlug, getNewsPaged } from "@/data/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Full-bleed cinematic hero, Fronx only, rotating through creative headlines.
  const fronx = await getProductBySlug("fronx");
  const price = formatPKR(fronx?.startPrice ?? 0);
  const slides: HeroSlide[] = fronxHero.map((c) => ({
    slug: c.slug,
    name: fronx?.name ?? "Fronx",
    kicker: c.kicker,
    lead: c.lead,
    big: c.big,
    sub: c.sub,
    price,
    image: fronx?.images?.[c.imageIndex] ?? fronx?.images?.[0] ?? null,
    blur: fronx?.blur?.[c.imageIndex] ?? fronx?.blur?.[0],
    tone: c.tone,
  }));
  // Lineup order is managed from the admin panel (Products → Order arrows).
  const [featured, news] = await Promise.all([getFeaturedProducts(8), getNewsPaged(1, 6)]);

  return (
    <>
      <HeroCarousel slides={slides} />

      {/* stats strip */}
      <section className="border-b border-line bg-paper">
        <div className="container-site grid grid-cols-3 gap-4 py-7">
          {homeStats.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <div className="font-display text-3xl font-black text-suzuki-dark sm:text-4xl">{s.num}</div>
              <div className="mt-1 text-[12px] text-ink-muted sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* lineup */}
      <section className="container-site pt-[70px]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="eyebrow">Showroom</div>
            <h2 className="section-title mt-2.5">The Suzuki lineup</h2>
          </div>
          <Link href="/products" className="text-sm font-bold text-suzuki-blue">View all models →</Link>
        </div>
        <div className="mt-[30px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, idx) => (
            <Reveal key={p.slug} delay={idx * 50}><ProductCard product={p} /></Reveal>
          ))}
        </div>
      </section>

      {/* after-sales */}
      <section className="container-site pt-[70px]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="eyebrow">After-Sales</div>
            <h2 className="section-title mt-2.5">Care that lasts beyond the sale</h2>
          </div>
          <Link href="/services" className="text-sm font-bold text-suzuki-blue">All services →</Link>
        </div>
        <p className="mt-3 max-w-[640px] leading-relaxed text-ink-muted">
          A complete 7S facility covering service, spare-parts and body shop, staffed by certified Suzuki technicians and backed by genuine parts and warranty.
        </p>
        <Reveal className="mt-[30px] block">
          <AfterSales items={afterSales} />
        </Reveal>
      </section>

      {/* value props */}
      <section className="mt-[70px] border-y border-[#E9EDF3] bg-paper">
        <div className="container-site py-[60px]">
          <div className="mx-auto max-w-[620px] text-center">
            <div className="eyebrow">Value for money</div>
            <h2 className="section-title mt-2.5">More than a showroom</h2>
            <p className="mt-3 leading-relaxed text-ink-muted">Everything that keeps your Suzuki on the road, from genuine parts to insurance and finance. Tap a card for more.</p>
          </div>
          <Reveal className="mt-[38px] block">
            <ValueProps items={valueProps} />
          </Reveal>
        </div>
      </section>

      {/* news */}
      {news.items.length > 0 && (
        <section className="container-site pt-[70px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">From the dealership</div>
              <h2 className="section-title mt-2.5">Latest news</h2>
            </div>
            <Link href="/news" className="text-sm font-bold text-suzuki-blue">View all news →</Link>
          </div>
          <div className="mt-7">
            <NewsSlider initialItems={news.items} initialHasMore={news.hasMore} />
          </div>
        </section>
      )}

      {/* closing CTA */}
      <section className="container-site pb-20 pt-[70px]">
        <div className="relative overflow-hidden rounded-3xl bg-suzuki-dark px-10 py-14 text-center">
          <div aria-hidden className="absolute -right-20 -top-44 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(225,22,34,.3),transparent_65%)]" />
          <div className="relative">
            <h2 className="text-balance font-display text-[clamp(26px,3.6vw,40px)] font-black tracking-tight text-white">Ready to take the next step?</h2>
            <p className="mx-auto mt-3.5 max-w-[520px] leading-relaxed text-[#C3D2EA]">Send an inquiry about any model, or get in touch with our team directly.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/online-inquiry" className="btn-light">Send an inquiry</Link>
              <Link href="/contact" className="btn-outline-light">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
