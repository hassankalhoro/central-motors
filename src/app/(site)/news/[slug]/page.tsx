import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsCover from "@/components/site/NewsCover";
import JsonLd from "@/components/site/JsonLd";
import { getNewsBySlug } from "@/data/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const n = await getNewsBySlug(params.slug);
  if (!n) return { title: "Article not found" };
  return {
    title: n.title,
    description: n.excerpt,
    alternates: { canonical: `/news/${n.slug}` },
    openGraph: n.image ? { images: [{ url: n.image }] } : undefined,
  };
}

export default async function NewsPage({ params }: { params: { slug: string } }) {
  const post = await getNewsBySlug(params.slug);
  if (!post) notFound();
  const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://centralmotors.com.pk").replace(/\/$/, "");
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: post.image ? [`${SITE_URL}${post.image}`] : undefined,
    url: `${SITE_URL}/news/${post.slug}`,
    publisher: { "@type": "Organization", name: "Suzuki Central Motors", logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/suzuki-wordmark.png` } },
  };
  return (
    <article className="mx-auto max-w-[800px] px-5 py-[34px] pb-20 sm:px-8">
      <JsonLd data={articleLd} />
      <Link href="/" className="text-[13px] font-semibold text-ink-muted">← Home</Link>
      <div className="mt-[18px] text-[12.5px] font-bold uppercase tracking-[0.06em] text-suzuki-red">{formatDate(post.date)}</div>
      <h1 className="mt-2 font-display text-[clamp(28px,4vw,42px)] font-black leading-tight tracking-tight text-ink">{post.title}</h1>
      <div className="group"><NewsCover src={post.image} alt={post.title} className="mt-6 h-[280px] rounded-[18px] border border-line" /></div>
      {/* Body is sanitised server-side (DOMPurify) before storage. */}
      <div
        className="mt-[26px] text-[16.5px] leading-[1.8] text-ink-soft [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_a]:text-suzuki-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:italic"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />
    </article>
  );
}
