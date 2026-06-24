import Link from "next/link";
import HeroCarousel, { type HeroSlide } from "@/components/site/HeroCarousel";
import ProductCard from "@/components/site/ProductCard";
import Well from "@/components/site/Well";
import Reveal from "@/components/site/Reveal";
import { formatPKR, formatDateShort } from "@/lib/utils";
import {
  getCategories, getCategoryCount, getFeaturedProducts, getProductBySlug,
  getNews, heroSlides, homeStats, valueProps,
} from "@/data";

export default function Home() {
  const slides: HeroSlide[] = heroSlides.map((h) => {
    const p = getProductBySlug(h.slug);
    return {
      slug: h.slug, name: p?.name ?? h.slug, cat: h.cat, tagline: h.tagline, specs: h.specs,
      priceLabel: formatPKR(p?.startPrice ?? 0), image: p?.images?.[0] ?? null, blur: p?.blur?.[0],
    };
  });
  const categories = getCategories();
  const featured = getFeaturedProducts(8);
  const news = getNews(2);

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

      {/* categories */}
      <section className="container-site pt-[70px]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="eyebrow">Browse by type</div>
            <h2 className="section-title mt-2.5">Find your Suzuki</h2>
          </div>
          <Link href="/products" className="text-sm font-bold text-suzuki-blue">View all models →</Link>
        </div>
        <div className="mt-[30px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, idx) => (
            <Reveal key={c.slug} delay={idx * 70}>
              <Link href={`/products/${c.slug}`} className="card card-lift block overflow-hidden hover:!shadow-liftlg">
                <Well src={null} alt={c.name} glyph={c.glyph} gradient className="h-[168px]" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-extrabold text-ink">{c.name}</h3>
                    <span className="rounded-full bg-[#EAF1FB] px-2.5 py-[5px] text-xs font-bold text-suzuki-blue">{getCategoryCount(c.slug)} models</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.blurb}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* featured */}
      <section className="container-site pt-[70px]">
        <div className="eyebrow">Showroom picks</div>
        <h2 className="section-title mt-2.5">Featured models</h2>
        <div className="mt-[30px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, idx) => (
            <Reveal key={p.slug} delay={idx * 50}><ProductCard product={p} showCategory /></Reveal>
          ))}
        </div>
      </section>

      {/* value props */}
      <section className="mt-[70px] border-y border-[#E9EDF3] bg-paper">
        <div className="container-site py-[60px]">
          <div className="mx-auto max-w-[620px] text-center">
            <div className="eyebrow">Value for money</div>
            <h2 className="section-title mt-2.5">More than a showroom</h2>
            <p className="mt-3 leading-relaxed text-ink-muted">Everything that keeps your Suzuki on the road — from genuine parts to insurance and finance.</p>
          </div>
          <div className="mt-[38px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((v, idx) => (
              <Reveal key={v.title} delay={idx * 40}>
                <div className="card card-lift h-full p-5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-suzuki-dark font-display text-base font-extrabold text-white">{v.mark}</div>
                  <h3 className="mt-3.5 font-display text-base font-bold text-ink">{v.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* news */}
      {news.length > 0 && (
        <section className="container-site pt-[70px]">
          <div className="eyebrow">From the dealership</div>
          <h2 className="section-title mt-2.5">Latest news</h2>
          <div className="mt-7 grid grid-cols-1 gap-[18px] lg:grid-cols-2">
            {news.map((post) => (
              <Link key={post.slug} href={`/news/${post.slug}`} className="card card-lift grid grid-cols-[130px_1fr] overflow-hidden hover:!shadow-lift">
                <Well src={post.image} alt={post.title} glyph="S" gradient className="h-full" />
                <div className="p-5">
                  <div className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-suzuki-red">{formatDateShort(post.date)}</div>
                  <h3 className="mt-1.5 font-display text-[17px] font-bold leading-tight text-ink">{post.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{post.excerpt}</p>
                </div>
              </Link>
            ))}
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
