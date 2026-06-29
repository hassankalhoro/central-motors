import { listNews } from "@/server/services/newsService";
import { getSession } from "@/server/auth";
import { can } from "@/server/rbac";
import NewsClient from "./NewsClient";

export default async function NewsPage({ searchParams }: { searchParams: { filter?: string; q?: string } }) {
  const filter = (["all", "published", "drafts"].includes(searchParams.filter || "") ? searchParams.filter : "all") as
    | "all"
    | "published"
    | "drafts";
  const search = searchParams.q || "";
  const [posts, session] = await Promise.all([listNews(filter, search || undefined), getSession()]);

  const rows = posts.map((p) => ({
    id: p.id,
    title: p.title,
    author: p.author?.name ?? "Admin",
    imageUrl: p.imageUrl ?? null,
    published: p.published,
    publishedAt: (p.publishedAt ?? p.createdAt).toISOString(),
  }));

  return (
    <NewsClient
      rows={rows}
      filter={filter}
      search={search}
      canEdit={session ? can(session.role, "content.edit") : false}
      canDelete={session ? can(session.role, "content.delete") : false}
    />
  );
}
