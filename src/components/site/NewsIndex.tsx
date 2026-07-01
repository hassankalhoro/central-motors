"use client";

import { useState } from "react";
import Link from "next/link";
import Well from "./Well";
import { formatDateShort } from "@/lib/utils";
import type { NewsItem } from "./NewsSlider";

export default function NewsIndex({
  initialItems,
  initialHasMore,
}: {
  initialItems: NewsItem[];
  initialHasMore: boolean;
}) {
  const [items, setItems] = useState<NewsItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/news?page=${page + 1}&pageSize=9`);
      const data = await res.json();
      if (res.ok) {
        setItems((prev) => {
          const seen = new Set(prev.map((p) => p.slug));
          return [...prev, ...data.items.filter((i: NewsItem) => !seen.has(i.slug))];
        });
        setHasMore(data.hasMore);
        setPage(data.page);
      }
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <p className="py-16 text-center text-ink-muted">No news yet, check back soon.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {items.map((post) => (
          <Link
            key={post.slug}
            href={`/news/${post.slug}`}
            className="card card-lift flex flex-col overflow-hidden hover:!shadow-lift"
          >
            <Well src={post.image} alt={post.title} glyph="S" gradient className="h-[190px]" />
            <div className="flex flex-1 flex-col p-5">
              <div className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-suzuki-red">{formatDateShort(post.date)}</div>
              <h3 className="mt-1.5 font-display text-[17px] font-bold leading-tight text-ink">{post.title}</h3>
              {post.excerpt && <p className="mt-1.5 line-clamp-3 text-[13.5px] leading-relaxed text-ink-muted">{post.excerpt}</p>}
              <span className="mt-auto pt-3 text-[12.5px] font-bold text-suzuki-blue">Read more →</span>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-full bg-suzuki-red px-7 py-3.5 text-sm font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more news"}
          </button>
        </div>
      )}
    </>
  );
}
