import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJobBySlug } from "@/data/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const j = await getJobBySlug(params.slug);
  if (!j) return { title: "Vacancy not found" };
  return {
    title: j.title,
    description: j.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
    alternates: { canonical: `/careers/${j.slug}` },
  };
}

export default async function JobPage({ params }: { params: { slug: string } }) {
  const job = await getJobBySlug(params.slug);
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
        {/* Sanitised server-side (DOMPurify) before storage. */}
        <div
          className="text-[15px] leading-[1.7] text-ink-soft [&_h2]:mt-5 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2.5 [&_a]:text-suzuki-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:italic"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      </div>
      <Link href="/contact" className="btn-primary mt-6">Apply for this role</Link>
    </section>
  );
}
