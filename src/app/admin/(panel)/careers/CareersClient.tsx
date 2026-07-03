"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Button, StatusPill, EmptyState } from "@/components/admin/ui";
import { PlusIcon, EditIcon, TrashIcon, CloseIcon } from "@/components/admin/icons";
import { JOB_TYPES } from "@/server/validators/job";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { saveJob, removeJob } from "./actions";

type Row = {
  id: string;
  slug: string;
  title: string;
  location: string;
  type: string;
  description: string;
  published: boolean;
};

const EMPTY = { title: "", location: "Rawalpindi", type: JOB_TYPES[0] as string, description: "", published: true };

export default function CareersClient({ rows, canEdit, canDelete }: { rows: Row[]; canEdit: boolean; canDelete: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    start(async () => {
      const res = await saveJob(editing);
      if (!res.ok) {
        setError(res.error ?? "Could not save.");
        return;
      }
      setEditing(null);
      router.refresh();
    });
  }

  function onDelete(r: Row) {
    if (!confirm(`Delete the vacancy "${r.title}"?`)) return;
    start(async () => {
      const res = await removeJob(r.id);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader title="Careers" subtitle="Vacancies shown on the public Careers page">
        {canEdit && (
          <Button onClick={() => { setError(null); setEditing({ ...EMPTY }); }}>
            <PlusIcon className="h-4 w-4" /> Add vacancy
          </Button>
        )}
      </PageHeader>

      {rows.length === 0 ? (
        <EmptyState title="No vacancies yet" hint="Add a vacancy and it appears instantly on the Careers page." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="border-b border-line bg-paper text-xs font-bold uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-paper/60">
                  <td className="px-5 py-3">
                    <div className="font-bold text-ink">{r.title}</div>
                    <div className="mt-0.5 max-w-[380px] truncate text-[12.5px] text-ink-muted">{r.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}</div>
                  </td>
                  <td className="px-5 py-3 text-sm text-ink-soft">{r.location}</td>
                  <td className="px-5 py-3 text-sm text-ink-soft">{r.type}</td>
                  <td className="px-5 py-3">
                    <StatusPill tone={r.published ? "green" : "slate"}>{r.published ? "Published" : "Hidden"}</StatusPill>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {canEdit && (
                        <button onClick={() => { setError(null); setEditing({ ...r }); }} className="text-suzuki-blue hover:text-suzuki-dark" aria-label="Edit">
                          <EditIcon className="h-5 w-5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => onDelete(r)} disabled={pending} className="text-suzuki-red hover:text-suzuki-red-dk disabled:opacity-50" aria-label="Delete">
                          <TrashIcon className="h-5 w-5" />
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

      {editing && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#040c20]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => !pending && setEditing(null)}>
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-[640px] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-suzuki-dark">{editing.id ? "Edit vacancy" : "Add vacancy"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="text-ink-faint hover:text-ink">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flabel">Job title</label>
                <input value={editing.title} onChange={(e) => setEditing((s) => s && { ...s, title: e.target.value })} className="field" placeholder="e.g. Service Advisor" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flabel">Location</label>
                  <input value={editing.location} onChange={(e) => setEditing((s) => s && { ...s, location: e.target.value })} className="field" placeholder="e.g. Rawalpindi" />
                </div>
                <div>
                  <label className="flabel">Type</label>
                  <select value={editing.type} onChange={(e) => setEditing((s) => s && { ...s, type: e.target.value })} className="field">
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="flabel">Role description</label>
                <RichTextEditor
                  value={editing.description}
                  onChange={(html) => setEditing((s) => s && { ...s, description: html })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) => setEditing((s) => s && { ...s, published: e.target.checked })}
                  className="h-4 w-4 rounded border-line text-suzuki-red focus:ring-suzuki-red"
                />
                Published (visible on the website)
              </label>
            </div>

            {error && <p className="mt-4 rounded-xl bg-suzuki-red/[.06] px-4 py-3 text-[13px] font-semibold text-suzuki-red">{error}</p>}

            <div className="mt-5 flex gap-3">
              <Button type="submit" loading={pending}>{editing.id ? "Save changes" : "Publish vacancy"}</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
