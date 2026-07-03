"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import NewsCover from "./NewsCover";
import { formatDateShort } from "@/lib/utils";

export type NewsItem = { slug: string; title: string; date: string; excerpt: string; image?: string | null };

export default function NewsSlider({
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

  const trackRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/news?page=${page + 1}`);
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
  }, [loading, hasMore, page]);

  // Load more when the end sentinel scrolls into view horizontally.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), {
      root: trackRef.current,
      rootMargin: "0px 300px 0px 0px",
    });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [loadMore]);

  function scrollByCards(dir: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * Math.min(track.clientWidth * 0.9, 380), behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end gap-2">
        <button onClick={() => scrollByCards(-1)} aria-label="Previous" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink-soft transition hover:border-suzuki-blue hover:text-suzuki-blue">←</button>
        <button onClick={() => scrollByCards(1)} aria-label="Next" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink-soft transition hover:border-suzuki-blue hover:text-suzuki-blue">→</button>
      </div>

      <div
        ref={trackRef}
        data-testid="news-track"
        className="flex snap-x snap-mandatory gap-[18px] overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((post) => (
          <Link
            key={post.slug}
            href={`/news/${post.slug}`}
            className="group card card-lift flex w-[300px] shrink-0 snap-start flex-col overflow-hidden hover:!shadow-lift sm:w-[360px]"
          >
            <NewsCover src={post.image} alt={post.title} className="h-[180px]" />
            <div className="flex flex-1 flex-col p-5">
              <div className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-suzuki-red">{formatDateShort(post.date)}</div>
              <h3 className="mt-1.5 font-display text-[17px] font-bold leading-tight text-ink">{post.title}</h3>
              {post.excerpt && <p className="mt-1.5 line-clamp-3 text-[13.5px] leading-relaxed text-ink-muted">{post.excerpt}</p>}
              <span className="mt-auto pt-3 text-[12.5px] font-bold text-suzuki-blue">Read more →</span>
            </div>
          </Link>
        ))}

        {/* horizontal load-more sentinel */}
        <div ref={sentinelRef} className="w-px shrink-0" />
        {loading && (
          <div className="flex w-[120px] shrink-0 items-center justify-center text-xs text-ink-faint">Loading…</div>
        )}
      </div>
    </div>
  );
}
