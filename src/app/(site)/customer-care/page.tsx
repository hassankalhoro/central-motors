import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import IconCard from "@/components/site/IconCard";
import Reveal from "@/components/site/Reveal";
import { WarrantyShieldIcon, CheckIcon } from "@/components/site/ServiceIcons";
import { cn } from "@/lib/utils";
import { facilities, warrantyRows } from "@/data";
import { getSettings } from "@/data/db";

export const metadata: Metadata = {
  title: "Customer Care",
  description: "A modern 7S Suzuki workshop, genuine parts and a dedicated care desk in Rawalpindi, serving Islamabad too, we keep your Suzuki at its best.",
  keywords: ["Suzuki customer care Rawalpindi", "Suzuki customer care Islamabad", "Suzuki workshop Rawalpindi", "Suzuki service Islamabad"],
  alternates: { canonical: "/customer-care" },
};

export const dynamic = "force-dynamic";

export default async function CustomerCarePage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero eyebrow="7S Workshop" title="Customer Care" subtitle="A modern workshop, genuine parts and a dedicated care desk, we keep your Suzuki at its best." />

      <section className="container-site pt-[50px]">
        <Reveal>
          <div className="eyebrow">What we offer</div>
          <h2 className="section-title mt-2.5">Workshop facilities</h2>
        </Reveal>
        <div className="mt-[26px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f, idx) => (
            <Reveal key={f.title} delay={idx * 40}>
              <IconCard icon={f.icon} title={f.title} body={f.body} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-site pt-[60px]">
        <Reveal>
          <div className="eyebrow">Peace of mind</div>
          <h2 className="section-title mt-2.5">Warranty terms</h2>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-[26px] overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            {/* header */}
            <div className="grid grid-cols-[1.1fr_1.5fr] bg-gradient-to-r from-suzuki-dark to-suzuki-darker">
              <div className="flex items-center gap-2.5 px-5 py-4 text-white sm:px-7">
                <WarrantyShieldIcon className="h-[18px] w-[18px] text-suzuki-sky" />
                <span className="text-[12.5px] font-bold uppercase tracking-[0.07em]">Coverage</span>
              </div>
              <div className="flex items-center px-5 py-4 sm:px-7">
                <span className="text-[12.5px] font-bold uppercase tracking-[0.07em] text-suzuki-sky">Terms</span>
              </div>
            </div>
            {/* rows */}
            {warrantyRows.map((w, i) => (
              <div
                key={w.item}
                className={cn(
                  "group grid grid-cols-[1.1fr_1.5fr] items-center border-t border-line transition-colors duration-200 hover:bg-paper",
                  i % 2 === 1 && "bg-paper/40",
                )}
              >
                <div className="flex items-start gap-3 px-5 py-[18px] sm:px-7">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-suzuki-red/10 text-suzuki-red transition-colors duration-200 group-hover:bg-suzuki-red group-hover:text-white">
                    <CheckIcon className="h-2.5 w-2.5" />
                  </span>
                  <span className="text-[14.5px] font-semibold leading-snug text-ink">{w.item}</span>
                </div>
                <div className="px-5 py-[18px] text-[13.5px] leading-relaxed text-ink-soft sm:px-7">{w.term}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* support strip */}
        <Reveal delay={120}>
          <div className="mt-5 flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-suzuki-dark to-suzuki-darker px-6 py-5 text-white">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
              <WarrantyShieldIcon className="h-6 w-6" />
            </div>
            <div className="min-w-[200px] flex-1">
              <div className="font-display text-[17px] font-bold">Need service support?</div>
              <div className="mt-0.5 text-[13.5px] text-[#C3D2EA]">
                Service: {settings.servicePhone} · Warranty: {settings.warrantyPhone}
              </div>
            </div>
            <Link
              href="/service-appointment"
              className="rounded-full bg-suzuki-red px-6 py-3 text-sm font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk"
            >
              Book a service
            </Link>
          </div>
        </Reveal>
      </section>
      <div className="h-[70px]" />
    </>
  );
}
