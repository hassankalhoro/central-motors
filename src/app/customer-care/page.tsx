import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import MarkCard from "@/components/site/MarkCard";
import Reveal from "@/components/site/Reveal";
import { facilities, warrantyRows, settings } from "@/data";

export const metadata: Metadata = {
  title: "Customer Care",
  description: "A modern 3S workshop, genuine parts and a dedicated care desk — we keep your Suzuki at its best.",
};

export default function CustomerCarePage() {
  return (
    <>
      <PageHero eyebrow="3S Workshop" title="Customer Care" subtitle="A modern workshop, genuine parts and a dedicated care desk — we keep your Suzuki at its best." />

      <section className="container-site pt-[50px]">
        <h2 className="mb-[22px] font-display text-2xl font-extrabold text-ink">Workshop facilities</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f, idx) => (
            <Reveal key={f.title} delay={idx * 40}><MarkCard {...f} /></Reveal>
          ))}
        </div>
      </section>

      <section className="container-site pt-[54px]">
        <h2 className="mb-[18px] font-display text-2xl font-extrabold text-ink">Warranty terms</h2>
        <div className="overflow-hidden rounded-2xl border border-line">
          <div className="grid grid-cols-[1fr_1.4fr] bg-suzuki-dark text-[12.5px] font-bold uppercase tracking-[0.04em] text-white">
            <div className="px-[18px] py-3.5">Coverage</div><div className="px-[18px] py-3.5">Terms</div>
          </div>
          {warrantyRows.map((w) => (
            <div key={w.item} className="grid grid-cols-[1fr_1.4fr] border-t border-[#EEF1F5]">
              <div className="px-[18px] py-[15px] text-[14.5px] font-semibold text-ink">{w.item}</div>
              <div className="px-[18px] py-[15px] text-sm text-ink-soft">{w.term}</div>
            </div>
          ))}
        </div>
        <div className="mt-[22px] flex flex-wrap items-center gap-3 rounded-2xl border border-[#E9EDF3] bg-paper px-[22px] py-[18px]">
          <div className="min-w-[200px] flex-1">
            <div className="font-bold text-ink">Need service support?</div>
            <div className="mt-0.5 text-[13.5px] text-ink-muted">Service: {settings.servicePhone} · Warranty: {settings.warrantyPhone}</div>
          </div>
          <Link href="/service-appointment" className="rounded-full bg-suzuki-red px-[22px] py-3 text-sm font-bold text-white">Book a service</Link>
        </div>
      </section>
      <div className="h-[70px]" />
    </>
  );
}
