import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import { serviceSections } from "@/data";

export const metadata: Metadata = {
  title: "Services",
  description: "Everything beyond the sale — exchange, certified used cars, extended warranty and car insurance.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="After-sales" title="Services" subtitle="Everything beyond the sale — exchange, certified used cars, warranty and insurance." />
      <section className="mx-auto flex max-w-[1100px] flex-col gap-[18px] px-5 py-14 sm:px-8">
        {serviceSections.map((sv, idx) => (
          <Reveal key={sv.title} delay={idx * 50} className="card card-lift grid grid-cols-1 items-center gap-6 p-7 sm:grid-cols-[120px_1fr]">
            <div className="well-stripe grid h-[120px] w-[120px] place-items-center rounded-2xl bg-gradient-to-br from-suzuki-blue to-suzuki-dark font-display text-[30px] font-black text-white">{sv.mark}</div>
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">{sv.title}</h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">{sv.body}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </>
  );
}
