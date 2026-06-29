"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, LinkButton, StatusPill, EmptyState, Spinner } from "@/components/admin/ui";
import { PlusIcon, EditIcon, TrashIcon, NewsIcon } from "@/components/admin/icons";
import { formatDateShort } from "@/lib/utils";
import { removeNews } from "./actions";

type Row = { id: string; title: string; author: string; imageUrl: string | null; published: boolean; publishedAt: string };
const TABS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "drafts", label: "Drafts" },
] as const;

export default function NewsClient({
  rows,
  filter,
  search,
  canEdit,
  canDelete,
}: {
  rows: Row[];
  filter: string;
  search: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function go(nextFilter: string, q = search) {
    const params = new URLSearchParams();
    if (nextFilter !== "all") params.set("filter", nextFilter);
    if (q) params.set("q", q);
    router.push(`/admin/news${params.toString() ? `?${params}` : ""}`);
  }

  function onDelete(r: Row) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    setDeletingId(r.id);
    start(async () => {
      const res = await removeNews(r.id);
      setDeletingId(null);
      if (!res.ok) alert(res.error);
      else router.refresh();
    });
  }

  return (
    <>
      <PageHeader title="News & Announcements" subtitle="Share updates and offers with customers">
        {canEdit && (
          <LinkButton href="/admin/news/new">
            <PlusIcon className="h-4 w-4" /> New Post
          </LinkButton>
        )}
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-[10px] border border-line bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => go(t.key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${filter === t.key ? "bg-suzuki-red text-white" : "text-ink-soft hover:bg-paper"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(filter, (new FormData(e.currentTarget).get("q") as string) || "");
          }}
          className="flex-1 sm:max-w-xs"
        >
          <input name="q" defaultValue={search} placeholder="Search news…" className="h-10 w-full rounded-[10px] border border-line bg-white px-4 text-sm outline-none focus:border-suzuki-accent" />
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No posts here" hint="Create a post to share news and offers." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line bg-paper text-xs font-bold uppercase tracking-wide text-ink-muted">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Title</th>
                <th className="hidden px-6 py-4 md:table-cell">Author</th>
                <th className="hidden px-6 py-4 sm:table-cell">Published On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-paper/60">
                  <td className="px-6 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-paper">
                      {r.imageUrl ? (
                        <Image src={r.imageUrl} alt={r.title} fill sizes="64px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-ink-faint"><NewsIcon className="h-5 w-5" /></span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 font-bold text-ink">{r.title}</td>
                  <td className="hidden px-6 py-3 text-sm text-ink-muted md:table-cell">{r.author}</td>
                  <td className="hidden px-6 py-3 text-sm text-ink-muted sm:table-cell">{formatDateShort(r.publishedAt)}</td>
                  <td className="px-6 py-3">
                    <StatusPill tone={r.published ? "green" : "slate"}>{r.published ? "Published" : "Draft"}</StatusPill>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {canEdit && (
                        <Link href={`/admin/news/${r.id}`} className="text-suzuki-blue hover:text-suzuki-dark" aria-label="Edit">
                          <EditIcon className="h-5 w-5" />
                        </Link>
                      )}
                      {canDelete && (
                        <button onClick={() => onDelete(r)} disabled={pending} className="text-suzuki-red hover:text-suzuki-red-dk disabled:opacity-50" aria-label="Delete">
                          {deletingId === r.id ? <Spinner className="h-5 w-5" /> : <TrashIcon className="h-5 w-5" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
