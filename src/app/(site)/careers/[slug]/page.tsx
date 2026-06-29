import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jobs, getJobBySlug } from "@/data";

export function generateStaticParams() {
  return jobs.map((j) => ({ slug: j.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const j = getJobBySlug(params.slug);
  if (!j) return { title: "Vacancy not found" };
  return { title: j.title, description: j.description };
}

export default function JobPage({ params }: { params: { slug: string } }) {
  const job = getJobBySlug(params.slug);
  if (!job) notFound();
  return (
    <section className="mx-auto max-w-[840px] px-5 py-[34px] pb-20 sm:px-8">
      <Link href="/careers" className="text-[13px] font-semibold text-ink-muted">← All vacancies</Link>
      <h1 className="mt-4 font-display text-[clamp(28px,3.6vw,40px)] font-black tracking-tight text-ink">{job.title}</h1>
      <div className="mt-3 flex flex-wrap gap-2.5">
        <span className="rounded-full bg-[#EAF1FB] px-3.5 py-1.5 text-[12.5px] font-semibold text-suzuki-blue">● {job.location}</span>
        <span className="rounded-full bg-paper px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-soft">{job.type}</span>
      </div>
      <div className="mt-6 card p-7">
        <h2 className="mb-2.5 font-display text-lg font-bold text-ink">Role overview</h2>
        <p className="text-[15px] leading-[1.7] text-ink-soft">{job.description}</p>
      </div>
      <Link href="/contact" className="btn-primary mt-6">Apply for this role</Link>
    </section>
  );
}
