import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import IconCard from "@/components/site/IconCard";
import Reveal from "@/components/site/Reveal";
import { telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Suzuki Genuine Parts",
  description:
    "100% authentic Suzuki Genuine Parts, Accessories and ECSTAR oils. Engineered to fit, built to last, and available straight from our parts counter, serving Rawalpindi and Islamabad.",
  keywords: ["Suzuki genuine parts Pakistan", "Suzuki parts Rawalpindi", "Suzuki parts Islamabad", "ECSTAR oil Suzuki", "Suzuki accessories"],
  alternates: { canonical: "/genuine-parts" },
};

const PARTS_PHONE = "+92 308 2010254";

const BADGES = [
  { src: "/brand/suzuki-genuine-parts.png", alt: "Suzuki Genuine Parts", w: 984, h: 337 },
  { src: "/brand/suzuki-genuine-accessories.png", alt: "Suzuki Genuine Accessories", w: 966, h: 336 },
  { src: "/brand/ecstar.png", alt: "Suzuki ECSTAR", w: 788, h: 350 },
];

const WHY = [
  { icon: "quality", title: "Engineered to fit", body: "Made to the exact factory specification for your model, so every part fits first time." },
  { icon: "certified", title: "Safety & performance", body: "Tested to strict Suzuki standards to keep your car performing exactly as intended." },
  { icon: "warranty", title: "Protects your warranty", body: "Fitting genuine parts keeps your manufacturer warranty valid and intact." },
  { icon: "finance", title: "Holds resale value", body: "A genuine-parts service history reassures buyers and protects what your car is worth." },
];

const CATEGORIES = [
  { icon: "diagnostics", title: "Engine Parts", body: "Filters, belts, plugs and components built to precise Suzuki specifications." },
  { icon: "bodyshop", title: "Body Parts", body: "Panels, bumpers and lights that fit precisely and preserve your vehicle's value." },
  { icon: "parts", title: "Service Kits", body: "Complete maintenance kits for scheduled services, everything in one box." },
  { icon: "care", title: "Accessories", body: "Genuine Suzuki accessories to personalise and protect your vehicle." },
  { icon: "warranty", title: "Parts Warranty", body: "Selected genuine parts carry a 6-month over-the-counter warranty." },
  { icon: "roadside", title: "Fast Availability", body: "A well-stocked counter with quick ordering for anything not in stock." },
];

const GENUINE = ["Exact factory fit, every time", "Tested to Suzuki quality standards", "Keeps your warranty valid", "Backed by a genuine parts warranty", "Protects your resale value"];
const IMITATION = ["Approximate, inconsistent fit", "Unverified materials and quality", "Can void your warranty", "No guarantee and no recourse", "Lowers your resale value"];

export default function GenuinePartsPage() {
  return (
    <>
      <PageHero eyebrow="100% Authentic" title="Suzuki Genuine Parts" subtitle="Engineered to fit, built to last. Insist on genuine Suzuki parts to protect your warranty, safety and resale value." />

      {/* authorised programme logos */}
      <section className="border-b border-line bg-paper">
        <div className="container-site flex flex-col items-center gap-5 py-7 sm:flex-row sm:justify-between">
          <p className="text-center text-[14px] font-medium text-ink-muted sm:text-left">
            An <span className="font-bold text-ink">authorised</span> source for Suzuki Genuine Parts, Accessories &amp; ECSTAR oils.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-4">
            {BADGES.map((b) => (
              <Image key={b.src} src={b.src} alt={b.alt} width={b.w} height={b.h} className="h-9 w-auto object-contain" />
            ))}
          </div>
        </div>
      </section>

      {/* why genuine */}
      <section className="container-site pt-[50px]">
        <div className="max-w-[640px]">
          <div className="eyebrow">Why genuine</div>
          <h2 className="section-title mt-2.5">A copy is never a match</h2>
          <p className="mt-3 leading-relaxed text-ink-muted">
            Imitation parts can look the same and cost less, but the difference shows in fit, safety and how long they last. Genuine Suzuki parts are made for your car and nothing else.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w, idx) => (
            <Reveal key={w.title} delay={idx * 40}>
              <IconCard {...w} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* categories */}
      <section className="container-site pt-14">
        <h2 className="section-title">What&apos;s at our parts counter</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, idx) => (
            <Reveal key={c.title} delay={idx * 40}>
              <IconCard {...c} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* genuine vs imitation */}
      <section className="container-site pt-14">
        <h2 className="section-title">Genuine vs imitation</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border-2 border-suzuki-red/25 bg-white shadow-card">
            <div className="flex items-center gap-2 bg-suzuki-red px-6 py-4 font-display text-[15px] font-extrabold text-white">Suzuki Genuine Parts</div>
            <ul className="space-y-3 p-6">
              {GENUINE.map((g) => (
                <li key={g} className="flex items-start gap-3 text-[14px] text-ink-soft">
                  <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-suzuki-red/10 text-suzuki-red">
                    <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3"><path d="M4 10.5l3.5 3.5L16 5.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-paper">
            <div className="flex items-center gap-2 bg-ink/[0.06] px-6 py-4 font-display text-[15px] font-extrabold text-ink-muted">Imitation Parts</div>
            <ul className="space-y-3 p-6">
              {IMITATION.map((g) => (
                <li key={g} className="flex items-start gap-3 text-[14px] text-ink-muted">
                  <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-ink/10 text-ink-faint">
                    <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                  </span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-site pt-12">
        <div className="flex flex-col items-center justify-between gap-5 rounded-[18px] bg-suzuki-dark px-8 py-8 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-xl font-extrabold text-white">Looking for a specific part?</h2>
            <p className="mt-1.5 max-w-[460px] leading-relaxed text-[#C3D2EA]">Send us your model and part details, or call the counter, and we&apos;ll confirm availability and pricing.</p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap justify-center gap-3">
            <Link href="/online-inquiry" className="btn-light">Send a parts inquiry</Link>
            <a href={telHref(PARTS_PHONE)} className="btn-outline-light">Call the counter</a>
          </div>
        </div>
      </section>
      <div className="h-[70px]" />
    </>
  );
}
