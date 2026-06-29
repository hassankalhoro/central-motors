"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Button, EmptyState, Spinner } from "@/components/admin/ui";
import SlideOver from "@/components/admin/SlideOver";
import { PlusIcon, EditIcon, TrashIcon, CategoriesIcon } from "@/components/admin/icons";
import { saveCategory, removeCategory } from "./actions";

type Cat = { id: string; slug: string; name: string; blurb: string; productCount: number };

export default function CategoriesClient({
  categories,
  canEdit,
  canDelete,
}: {
  categories: Cat[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setName("");
    setBlurb("");
    setError(null);
    setOpen(true);
  }
  function openEdit(c: Cat) {
    setEditing(c);
    setName(c.name);
    setBlurb(c.blurb);
    setError(null);
    setOpen(true);
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveCategory({ id: editing?.id, name, blurb });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function onDelete(c: Cat) {
    if (!confirm(`Delete category "${c.name}"? This cannot be undone.`)) return;
    setDeletingId(c.id);
    start(async () => {
      const res = await removeCategory(c.id);
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
      <PageHeader title="Categories" subtitle="Manage vehicle categories">
        {canEdit && (
          <Button onClick={openNew}>
            <PlusIcon className="h-4 w-4" /> Add Category
          </Button>
        )}
      </PageHeader>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" hint="Add your first category to organise the lineup." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line bg-paper text-xs font-bold uppercase tracking-wide text-ink-muted">
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Models</th>
                <th className="hidden px-6 py-4 sm:table-cell">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-paper/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-suzuki-red/10 text-suzuki-red">
                        <CategoriesIcon className="h-5 w-5" />
                      </span>
                      <span className="font-bold text-ink">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-suzuki-blue/10 px-2.5 py-1 text-sm font-bold text-suzuki-blue">
                      {c.productCount}
                    </span>
                  </td>
                  <td className="hidden max-w-md px-6 py-4 text-sm text-ink-muted sm:table-cell">{c.blurb || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      {canEdit && (
                        <button onClick={() => openEdit(c)} className="text-suzuki-blue hover:text-suzuki-dark" aria-label="Edit">
                          <EditIcon className="h-5 w-5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => onDelete(c)} disabled={pending} className="text-suzuki-red hover:text-suzuki-red-dk disabled:opacity-50" aria-label="Delete">
                          {deletingId === c.id ? <Spinner className="h-5 w-5" /> : <TrashIcon className="h-5 w-5" />}
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

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
        footer={
          <div className="flex flex-col gap-2">
            <Button type="submit" form="category-form" loading={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <form id="category-form" onSubmit={onSave} className="space-y-5">
          {error && (
            <div className="rounded-[10px] border border-suzuki-red/20 bg-suzuki-red/5 px-4 py-3 text-sm font-medium text-suzuki-red">
              {error}
            </div>
          )}
          <div>
            <label className="flabel" htmlFor="cat-name">Name</label>
            <input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} className="field" required />
          </div>
          <div>
            <label className="flabel" htmlFor="cat-blurb">Description</label>
            <textarea
              id="cat-blurb"
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              rows={5}
              className="field resize-none"
            />
          </div>
        </form>
      </SlideOver>
    </>
  );
}
