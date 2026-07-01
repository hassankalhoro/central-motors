import type { Metadata } from "next";
import Reveal from "@/components/site/Reveal";
import { aboutStats, ceo, mission, vision } from "@/data";

export const metadata: Metadata = {
  title: "About Us",
  description: "Rawalpindi's trusted Suzuki 7S dealership, honest sales, expert service and genuine parts under one roof.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div aria-hidden className="absolute -right-28 -top-52 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(46,123,214,.4),transparent_65%)]" />
        <div className="container-site relative">
          <div className="eyebrow-light">Who we are</div>
          <h1 className="mt-2.5 max-w-[760px] font-display text-[clamp(30px,4.4vw,50px)] font-black leading-[1.05] tracking-tight text-white">
            Rawalpindi&apos;s trusted Suzuki 7S dealership.
          </h1>
          <p className="mt-4 max-w-[620px] text-[17px] leading-relaxed text-[#C3D2EA]">
            For over a decade, Central Motors has put Suzuki families first, combining honest sales, expert service and genuine parts under one roof on Grand Trunk Road.
          </p>
        </div>
      </section>

      <section className="container-site grid grid-cols-1 items-center gap-10 pt-[60px] lg:grid-cols-2">
        <Reveal>
          <div className="eyebrow">CEO&apos;s message</div>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink">A commitment to every customer.</h2>
          <p className="mt-4 text-[15.5px] leading-[1.7] text-ink-soft">&ldquo;{ceo.message}&rdquo;</p>
          <div className="mt-[18px] flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-suzuki-dark font-display font-extrabold text-white">{ceo.initials}</div>
            <div>
              <div className="font-bold text-ink">{ceo.name}</div>
              <div className="text-[13px] text-ink-muted">{ceo.role}</div>
            </div>
          </div>
        </Reveal>
        <Reveal className="well-stripe flex min-h-[300px] items-center justify-center rounded-[20px] border border-line bg-gradient-to-br from-[#EEF2F8] to-[#E2E9F3]">
          <span aria-hidden className="font-display text-[120px] font-black italic text-[rgba(6,36,92,.08)]">S</span>
        </Reveal>
      </section>

      <section className="container-site grid grid-cols-1 gap-[18px] pt-[60px] lg:grid-cols-2">
        {[{ k: "Our Mission", v: mission }, { k: "Our Vision", v: vision }].map((m, i) => (
          <Reveal key={m.k} delay={i * 80} className="card p-7">
            <div className="text-[12.5px] font-bold uppercase tracking-[0.12em] text-suzuki-red">{m.k}</div>
            <p className="mt-3 text-base font-medium leading-relaxed text-ink">{m.v}</p>
          </Reveal>
        ))}
      </section>

      <section className="mt-16 bg-suzuki-dark">
        <div className="container-site grid grid-cols-2 gap-5 py-12 lg:grid-cols-4">
          {aboutStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <div className="font-display text-[40px] font-black leading-none text-white">{s.num}</div>
              <div className="mt-1.5 text-[13.5px] font-medium text-[#9DB4D6]">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>
      <div className="h-[70px]" />
    </>
  );
}
