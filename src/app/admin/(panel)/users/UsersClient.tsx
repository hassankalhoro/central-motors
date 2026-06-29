"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Button, StatusPill } from "@/components/admin/ui";
import SlideOver from "@/components/admin/SlideOver";
import { PlusIcon, EditIcon } from "@/components/admin/icons";
import { initials, formatDateShort } from "@/lib/utils";
import { saveUser } from "./actions";

type Row = { id: string; name: string; email: string; role: string; isActive: boolean; lastLoginAt: string | null };
const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Super Admin", ADMIN: "Administrator", EDITOR: "Editor" };

export default function UsersClient({ users }: { users: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "EDITOR", isActive: true, password: "" });
  const [error, setError] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setForm({ name: "", email: "", role: "EDITOR", isActive: true, password: "" });
    setError(null);
    setOpen(true);
  }
  function openEdit(u: Row) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, isActive: u.isActive, password: "" });
    setError(null);
    setOpen(true);
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveUser({ id: editing?.id, ...form });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader title="Users" subtitle="Manage admin accounts and roles">
        <Button onClick={openNew}><PlusIcon className="h-4 w-4" /> Add User</Button>
      </PageHeader>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-paper text-xs font-bold uppercase tracking-wide text-ink-muted">
              <th className="px-6 py-4">User</th>
              <th className="hidden px-6 py-4 sm:table-cell">Role</th>
              <th className="hidden px-6 py-4 md:table-cell">Last login</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-paper/60">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-suzuki-dark text-sm font-bold text-white">{initials(u.name)}</span>
                    <div>
                      <p className="font-bold text-ink">{u.name}</p>
                      <p className="text-xs text-ink-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-6 py-3 text-sm font-semibold text-ink-soft sm:table-cell">{ROLE_LABEL[u.role] ?? u.role}</td>
                <td className="hidden px-6 py-3 text-sm text-ink-muted md:table-cell">{u.lastLoginAt ? formatDateShort(u.lastLoginAt) : "—"}</td>
                <td className="px-6 py-3"><StatusPill tone={u.isActive ? "green" : "slate"}>{u.isActive ? "Active" : "Inactive"}</StatusPill></td>
                <td className="px-6 py-3">
                  <div className="flex justify-end">
                    <button onClick={() => openEdit(u)} className="text-suzuki-blue hover:text-suzuki-dark" aria-label="Edit"><EditIcon className="h-5 w-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit User" : "Add User"}
        footer={
          <div className="flex flex-col gap-2">
            <Button type="submit" form="user-form" loading={pending}>{pending ? "Saving…" : "Save"}</Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        }
      >
        <form id="user-form" onSubmit={onSave} className="space-y-5">
          {error && <div className="rounded-[10px] border border-suzuki-red/20 bg-suzuki-red/5 px-4 py-3 text-sm font-medium text-suzuki-red">{error}</div>}
          <div><label className="flabel">Name</label><input className="field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
          <div><label className="flabel">Email</label><input type="email" className="field" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} disabled={!!editing} required /></div>
          <div>
            <label className="flabel">Role</label>
            <select className="field" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Administrator</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="flabel">{editing ? "New password (leave blank to keep)" : "Password"}</label>
            <input type="password" className="field" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} autoComplete="new-password" required={!editing} />
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm font-medium text-ink-soft">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 rounded border-line text-suzuki-red focus:ring-suzuki-red" />
              Active
            </label>
          )}
        </form>
      </SlideOver>
    </>
  );
}
