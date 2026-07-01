"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, LinkButton, StatusPill, EmptyState, Spinner } from "@/components/admin/ui";
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from "@/components/admin/icons";
import { formatPKR } from "@/lib/utils";
import { removeProduct, reorderProduct } from "./actions";

type Row = {
  id: string;
  name: string;
  categoryName: string;
  startPrice: number;
  status: "IN_STOCK" | "COMING_SOON" | "DISCONTINUED";
  image: string | null;
};

const STATUS = {
  IN_STOCK: { tone: "green", label: "In Stock" },
  COMING_SOON: { tone: "amber", label: "Coming Soon" },
  DISCONTINUED: { tone: "slate", label: "Discontinued" },
} as const;

export default function ProductsClient({
  rows,
  categories,
  total,
  page,
  pages,
  categoryId,
  search,
  canEdit,
  canDelete,
}: {
  rows: Row[];
  categories: { id: string; name: string }[];
  total: number;
  page: number;
  pages: number;
  categoryId: string;
  search: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  // Reordering acts on the full sequence, so it's only offered on the unfiltered list.
  const canReorder = canEdit && !search && !categoryId;

  function onMove(id: string, dir: "up" | "down") {
    setMovingId(id);
    start(async () => {
      const res = await reorderProduct(id, dir);
      setMovingId(null);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  function navigate(next: { category?: string; q?: string; page?: number }) {
    const params = new URLSearchParams();
    const cat = next.category ?? categoryId;
    const q = next.q ?? search;
    const p = next.page ?? 1;
    if (cat) params.set("category", cat);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    router.push(`/admin/products${params.toString() ? `?${params}` : ""}`);
  }

  function onDelete(r: Row) {
    if (!confirm(`Delete "${r.name}"? It will be removed from the site.`)) return;
    setDeletingId(r.id);
    start(async () => {
      const res = await removeProduct(r.id);
      setDeletingId(null);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader title="Products" subtitle="Manage all Suzuki vehicles">
        {canEdit && (
          <LinkButton href="/admin/products/new">
            <PlusIcon className="h-4 w-4" /> Add Product
          </LinkButton>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={categoryId}
          onChange={(e) => navigate({ category: e.target.value, page: 1 })}
          className="h-11 rounded-[10px] border border-line bg-white px-4 text-sm font-semibold text-ink outline-none focus:border-suzuki-accent"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = (new FormData(e.currentTarget).get("q") as string) || "";
            navigate({ q, page: 1 });
          }}
          className="relative flex-1 sm:max-w-sm"
        >
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
          <input
            name="q"
            defaultValue={search}
            placeholder="Search model…"
            className="h-11 w-full rounded-[10px] border border-line bg-white pl-12 pr-4 text-sm outline-none focus:border-suzuki-accent"
          />
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No products found" hint="Try a different filter, or add a new product." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line bg-paper text-xs font-bold uppercase tracking-wide text-ink-muted">
                {canReorder && <th className="py-4 pl-5 pr-1">Order</th>}
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Model</th>
                <th className="hidden px-6 py-4 md:table-cell">Category</th>
                <th className="px-6 py-4">Price in PKR</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r, idx) => {
                const s = STATUS[r.status];
                const isFirst = page === 1 && idx === 0;
                const isLast = page === pages && idx === rows.length - 1;
                const arrowCls =
                  "grid h-6 w-7 place-items-center rounded-md border border-line bg-white text-ink-muted transition hover:border-suzuki-blue hover:text-suzuki-blue disabled:pointer-events-none disabled:opacity-30";
                return (
                  <tr key={r.id} className="hover:bg-paper/60">
                    {canReorder && (
                      <td className="py-3 pl-5 pr-1">
                        {movingId === r.id ? (
                          <Spinner className="h-5 w-5 text-ink-muted" />
                        ) : (
                          <div className="flex flex-col gap-1">
                            <button type="button" onClick={() => onMove(r.id, "up")} disabled={pending || isFirst} aria-label={`Move ${r.name} up`} className={arrowCls}>
                              <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3"><path d="M4 12.5L10 6.5l6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                            <button type="button" onClick={() => onMove(r.id, "down")} disabled={pending || isLast} aria-label={`Move ${r.name} down`} className={arrowCls}>
                              <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3"><path d="M4 7.5l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-3">
                      <div className="relative h-12 w-20 overflow-hidden rounded-lg bg-paper">
                        {r.image && <Image src={r.image} alt={r.name} fill sizes="80px" className="object-contain" />}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-bold text-ink">{r.name}</td>
                    <td className="hidden px-6 py-3 text-sm text-ink-muted md:table-cell">{r.categoryName}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-ink">{formatPKR(r.startPrice)}</td>
                    <td className="px-6 py-3"><StatusPill tone={s.tone}>{s.label}</StatusPill></td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {canEdit && (
                          <Link href={`/admin/products/${r.id}`} className="text-suzuki-blue hover:text-suzuki-dark" aria-label="Edit">
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer / pagination */}
      <div className="mt-5 flex items-center justify-between text-sm text-ink-muted">
        <span>Showing {rows.length} of {total} products</span>
        {pages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => navigate({ page: page - 1 })}
              className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => navigate({ page: p })}
                className={`rounded-lg border px-3 py-1.5 font-semibold ${
                  p === page ? "border-suzuki-red bg-suzuki-red text-white" : "border-line bg-white text-ink"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= pages}
              onClick={() => navigate({ page: page + 1 })}
              className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </>
  );
}
