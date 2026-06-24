import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Well from "@/components/site/Well";
import { news, getNewsBySlug } from "@/data";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const n = getNewsBySlug(params.slug);
  if (!n) return { title: "Article not found" };
  return { title: n.title, description: n.excerpt };
}

export default function NewsPage({ params }: { params: { slug: string } }) {
  const post = getNewsBySlug(params.slug);
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-[800px] px-5 py-[34px] pb-20 sm:px-8">
      <Link href="/" className="text-[13px] font-semibold text-ink-muted">← Home</Link>
      <div className="mt-[18px] text-[12.5px] font-bold uppercase tracking-[0.06em] text-suzuki-red">{formatDate(post.date)}</div>
      <h1 className="mt-2 font-display text-[clamp(28px,4vw,42px)] font-black leading-tight tracking-tight text-ink">{post.title}</h1>
      <Well src={post.image} alt={post.title} glyph="S" gradient className="mt-6 h-[280px] rounded-[18px] border border-line" />
      <p className="mt-[26px] text-[16.5px] leading-[1.8] text-ink-soft">{post.body}</p>
    </article>
  );
}
