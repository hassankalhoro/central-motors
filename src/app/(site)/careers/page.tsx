import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import { recruitProcess } from "@/data";
import { getJobs } from "@/data/db";

export const metadata: Metadata = {
  title: "Careers",
  description: "Build your career with Rawalpindi's trusted Suzuki dealership. View current vacancies and our recruitment process.",
};

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const jobs = await getJobs();
  return (
    <>
      <PageHero eyebrow="Join us" title="Careers" subtitle="Build your career with Rawalpindi's trusted Suzuki dealership." />

      <section className="container-site pt-[50px]">
        <h2 className="mb-5 font-display text-2xl font-extrabold text-ink">Current vacancies</h2>
        {jobs.length === 0 && (
          <p className="text-[14.5px] leading-relaxed text-ink-muted">
            We don&apos;t have any open positions right now. Check back soon, or send us your CV for future opportunities.
          </p>
        )}
        <div className="flex flex-col gap-3.5">
          {jobs.map((j, idx) => (
            <Reveal key={j.slug} delay={idx * 40}>
              <Link href={`/careers/${j.slug}`} className="card card-lift flex items-center gap-[18px] p-[22px] px-6">
                <div className="flex-1">
                  <h3 className="font-display text-[19px] font-extrabold text-ink">{j.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2.5">
                    <span className="rounded-full bg-[#EAF1FB] px-2.5 py-[5px] text-xs font-semibold text-suzuki-blue">● {j.location}</span>
                    <span className="rounded-full bg-paper px-2.5 py-[5px] text-xs font-semibold text-ink-soft">{j.type}</span>
                  </div>
                </div>
                <span className="whitespace-nowrap text-[13.5px] font-bold text-suzuki-red">View role →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-site pt-14">
        <h2 className="mb-[22px] font-display text-2xl font-extrabold text-ink">Our recruitment process</h2>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {recruitProcess.map((r, idx) => (
            <Reveal key={r.n} delay={idx * 40} className="card p-5">
              <div className="font-display text-[26px] font-black text-suzuki-red">{r.n}</div>
              <h3 className="mt-2 font-display text-[15px] font-bold text-ink">{r.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{r.body}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <div className="h-[70px]" />
    </>
  );
}
