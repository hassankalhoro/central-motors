import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import { getTeamGrouped } from "@/data";
import { initials, telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Management",
  description: "The team behind Suzuki Central Motors — reachable, accountable and here to help.",
};

export default function ManagementPage() {
  const groups = getTeamGrouped();
  return (
    <>
      <PageHero eyebrow="Our team" title="Management" subtitle="The people behind Central Motors — reachable, accountable and here to help." />
      {groups.map((g) => (
        <section key={g.group} className="container-site pt-12">
          <h2 className="mb-5 flex items-center gap-3 font-display text-[22px] font-extrabold text-ink">
            {g.group}<span className="h-px flex-1 bg-line" />
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {g.members.map((m, idx) => (
              <Reveal key={m.name} delay={idx * 40} className="card card-lift p-[22px]">
                <div className="grid h-14 w-14 place-items-center rounded-[14px] bg-gradient-to-br from-suzuki-blue to-suzuki-dark font-display text-[19px] font-extrabold text-white">{initials(m.name)}</div>
                <h3 className="mt-3.5 font-display text-[16.5px] font-bold text-ink">{m.name}</h3>
                <div className="mt-1 text-[13px] leading-snug text-ink-muted">{m.title}</div>
                {m.phone && (
                  <a href={telHref(m.phone)} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-suzuki-blue">☏ {m.phone}</a>
                )}
              </Reveal>
            ))}
          </div>
        </section>
      ))}
      <div className="h-[70px]" />
    </>
  );
}
