import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import NewsIndex from "@/components/site/NewsIndex";
import { getNewsPaged } from "@/data/db";

export const metadata: Metadata = {
  title: "News & Announcements",
  description: "Latest news, offers and announcements from Suzuki Central Motors, serving Rawalpindi and Islamabad.",
  alternates: { canonical: "/news" },
};

export const dynamic = "force-dynamic";

export default async function NewsListPage() {
  const news = await getNewsPaged(1, 9);
  return (
    <>
      <PageHero
        eyebrow="From the dealership"
        title="News & Announcements"
        subtitle="The latest updates, campaigns and offers from Suzuki Central Motors."
      />
      <section className="container-site pb-20 pt-10">
        <NewsIndex initialItems={news.items} initialHasMore={news.hasMore} />
      </section>
    </>
  );
}
