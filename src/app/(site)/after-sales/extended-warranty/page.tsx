import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import IconCard from "@/components/site/IconCard";
import Reveal from "@/components/site/Reveal";
import { warrantyRows } from "@/data";
import { telHref, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Extended Warranty",
  description:
    "Extend your Suzuki's cover beyond the standard 2 years / 30,000 km. Plans tailored to your usage, serviced and honoured at our authorised 7S workshop.",
};

const WARRANTY_PHONE = "0315-8709631";

const BENEFITS = [
  { icon: "warranty", title: "Beyond standard cover", body: "Protection that continues after the manufacturer's 2 years / 30,000 km period ends." },
  { icon: "workshop", title: "Honoured at our workshop", body: "Claims handled in-house by certified Suzuki technicians using genuine parts." },
  { icon: "finance", title: "Plans to suit your usage", body: "Pick a term that matches how far and how often you actually drive." },
  { icon: "certified", title: "Stronger at resale", body: "A documented, transferable warranty adds buyer confidence and resale value." },
];

const STEPS = [
  { n: "01", title: "Choose your plan", body: "Tell us your model and how you drive. We recommend a term and cover level that fits." },
  { n: "02", title: "Drive with cover", body: "Enjoy your Suzuki knowing the important components are protected against surprises." },
  { n: "03", title: "Claim at our workshop", body: "If anything's needed, bring it in. We handle the claim and repair with genuine parts." },
];

export default function ExtendedWarrantyPage() {
  return (
    <>
      <PageHero
        eyebrow="After-Sales · Warranty"
        title="Extended Warranty"
        subtitle="Keep your Suzuki protected well beyond the standard cover, on terms that suit how you drive."
      />

      {/* intro + highlight */}
      <section className="container-site grid items-center gap-8 pt-[50px] lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <p className="max-w-[600px] text-[15.5px] leading-relaxed text-ink-muted">
            Your Suzuki arrives with a solid factory warranty. An extended plan simply carries that
            peace of mind further. Cover stays with the car, claims are handled at our own workshop,
            and every repair uses genuine Suzuki parts.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <div className="rounded-2xl bg-suzuki-dark px-7 py-6 text-white">
            <div className="font-display text-[40px] font-black leading-none">2 yrs+</div>
            <div className="mt-2 text-[13.5px] leading-relaxed text-[#C3D2EA]">
              Extend beyond the standard <span className="font-bold text-white">2 years / 30,000 km</span> with a plan built around your driving.
            </div>
          </div>
        </Reveal>
      </section>

      {/* benefits */}
      <section className="container-site pt-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, idx) => (
            <Reveal key={b.title} delay={idx * 40}>
              <IconCard {...b} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="container-site pt-14">
        <h2 className="section-title">How it works</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((s, idx) => (
            <Reveal key={s.n} delay={idx * 60}>
              <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-card">
                <span aria-hidden className="absolute -right-3 -top-4 font-display text-[76px] font-black leading-none text-suzuki-dark/[0.05]">{s.n}</span>
                <div className="relative">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-suzuki-red font-display text-[13px] font-extrabold text-white">{s.n}</div>
                  <h3 className="mt-3.5 font-display text-[17px] font-bold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* coverage table */}
      <section className="container-site pt-14">
        <h2 className="section-title">What&apos;s covered</h2>
        <p className="mt-3 max-w-[620px] leading-relaxed text-ink-muted">A quick look at how cover is structured. Final terms are confirmed on your chosen plan.</p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-line shadow-card">
          <div className="flex items-center justify-between bg-suzuki-dark px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white/80">
            <span>Cover</span>
            <span>Term</span>
          </div>
          {warrantyRows.map((r, i) => (
            <div
              key={r.item}
              className={cn(
                "flex flex-col gap-1 border-t border-line px-6 py-4 sm:flex-row sm:items-center sm:justify-between",
                i % 2 === 1 ? "bg-paper" : "bg-white",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-suzuki-red" />
                <span className="font-display text-[15px] font-bold text-ink">{r.item}</span>
              </div>
              <div className="pl-5 text-[13.5px] text-ink-muted sm:pl-0 sm:text-right">{r.term}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] text-ink-faint">Coverage terms are indicative and subject to the policy of your selected warranty plan.</p>
      </section>

      {/* CTA */}
      <section className="container-site pt-12">
        <div className="flex flex-col items-center justify-between gap-5 rounded-[18px] bg-suzuki-dark px-8 py-8 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-xl font-extrabold text-white">Talk to our warranty desk</h2>
            <p className="mt-1.5 max-w-[460px] leading-relaxed text-[#C3D2EA]">Our team will walk you through the plans and find the right cover for your Suzuki.</p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap justify-center gap-3">
            <a href={telHref(WARRANTY_PHONE)} className="btn-light">Call {WARRANTY_PHONE}</a>
            <Link href="/customer-care" className="btn-outline-light">Customer care</Link>
          </div>
        </div>
      </section>
      <div className="h-[70px]" />
    </>
  );
}
