"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TeamGroup } from "@prisma/client";
import { PageHeader, Button, StatusPill, EmptyState, Spinner } from "@/components/admin/ui";
import { PlusIcon, EditIcon, TrashIcon, CloseIcon } from "@/components/admin/icons";
import { cn } from "@/lib/utils";
import { saveTeamMember, removeTeamMember, reorderTeamMember } from "./actions";

type Row = {
  id: string;
  name: string;
  title: string;
  group: TeamGroup;
  phone: string;
  photoUrl: string;
  published: boolean;
};

const GROUPS: { value: TeamGroup; label: string }[] = [
  { value: "TOP_MANAGEMENT", label: "Top Management" },
  { value: "GENERAL_MANAGERS", label: "General Managers" },
  { value: "MANAGERS", label: "Managers" },
];

const groupLabel = (g: TeamGroup) => GROUPS.find((x) => x.value === g)?.label ?? g;

const EMPTY = { name: "", title: "", group: "MANAGERS" as TeamGroup, phone: "", photoUrl: "", published: true };

export default function TeamClient({ rows, canEdit, canDelete }: { rows: Row[]; canEdit: boolean; canDelete: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(id: string | null, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusyId(id);
    start(async () => {
      const res = await fn();
      setBusyId(null);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    start(async () => {
      const res = await saveTeamMember(editing);
      if (!res.ok) {
        setError(res.error ?? "Could not save.");
        return;
      }
      setEditing(null);
      router.refresh();
    });
  }

  const arrowCls =
    "grid h-6 w-7 place-items-center rounded-md border border-line bg-white text-ink-muted transition hover:border-suzuki-blue hover:text-suzuki-blue disabled:pointer-events-none disabled:opacity-30";

  return (
    <>
      <PageHeader title="Team / Management" subtitle="The people shown on the public Management page">
        {canEdit && (
          <Button onClick={() => { setError(null); setEditing({ ...EMPTY }); }}>
            <PlusIcon className="h-4 w-4" /> Add member
          </Button>
        )}
      </PageHeader>

      {rows.length === 0 ? (
        <EmptyState title="No team members yet" hint="Add the first member to populate the Management page." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line bg-paper text-xs font-bold uppercase tracking-wide text-ink-muted">
                {canEdit && <th className="py-4 pl-5 pr-1">Order</th>}
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Group</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r, idx) => (
                <tr key={r.id} className="hover:bg-paper/60">
                  {canEdit && (
                    <td className="py-3 pl-5 pr-1">
                      {busyId === r.id ? (
                        <Spinner className="h-5 w-5 text-ink-muted" />
                      ) : (
                        <div className="flex flex-col gap-1">
                          <button type="button" disabled={pending || idx === 0} onClick={() => run(r.id, () => reorderTeamMember(r.id, "up"))} aria-label="Move up" className={arrowCls}>
                            <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3"><path d="M4 12.5L10 6.5l6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                          <button type="button" disabled={pending || idx === rows.length - 1} onClick={() => run(r.id, () => reorderTeamMember(r.id, "down"))} aria-label="Move down" className={arrowCls}>
                            <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3"><path d="M4 7.5l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                  <td className="px-5 py-3">
                    <div className="font-bold text-ink">{r.name}</div>
                    <div className="text-[12.5px] text-ink-muted">{r.title}</div>
                  </td>
                  <td className="px-5 py-3 text-sm text-ink-soft">{groupLabel(r.group)}</td>
                  <td className="px-5 py-3 text-sm text-ink-soft">{r.phone || "—"}</td>
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
                        <button
                          onClick={() => confirm(`Remove "${r.name}" from the Management page?`) && run(r.id, () => removeTeamMember(r.id))}
                          disabled={pending}
                          className="text-suzuki-red hover:text-suzuki-red-dk disabled:opacity-50"
                          aria-label="Delete"
                        >
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

      {/* add / edit drawer-style modal */}
      {editing && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#040c20]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => !pending && setEditing(null)}>
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-suzuki-dark">{editing.id ? "Edit member" : "Add member"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="text-ink-faint hover:text-ink">
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flabel">Full name</label>
                <input value={editing.name} onChange={(e) => setEditing((s) => s && { ...s, name: e.target.value })} className="field" placeholder="e.g. Ali Altaf" />
              </div>
              <div>
                <label className="flabel">Title / designation</label>
                <input value={editing.title} onChange={(e) => setEditing((s) => s && { ...s, title: e.target.value })} className="field" placeholder="e.g. General Manager, Sales" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flabel">Group</label>
                  <select value={editing.group} onChange={(e) => setEditing((s) => s && { ...s, group: e.target.value as TeamGroup })} className="field">
                    {GROUPS.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flabel">Phone <span className="text-ink-faint">(optional)</span></label>
                  <input value={editing.phone} onChange={(e) => setEditing((s) => s && { ...s, phone: e.target.value })} className="field" placeholder="03xx-xxxxxxx" />
                </div>
              </div>
              <label className={cn("flex items-center gap-2 text-sm font-medium text-ink-soft")}>
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
              <Button type="submit" loading={pending}>{editing.id ? "Save changes" : "Add member"}</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
