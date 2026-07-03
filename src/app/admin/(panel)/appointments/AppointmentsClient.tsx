"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@prisma/client";
import { PageHeader, LinkButton, StatCard, StatusPill, EmptyState, Spinner } from "@/components/admin/ui";
import { CalendarIcon, SearchIcon, SettingsIcon } from "@/components/admin/icons";
import { cn } from "@/lib/utils";
import { confirm as confirmAction, cancel as cancelAction, complete as completeAction, noShow as noShowAction } from "./actions";

type Row = {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle: string;
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  cancelReason: string | null;
  confirmedBy: string | null;
};

const STATUS_META: Record<AppointmentStatus, { tone: "amber" | "green" | "blue" | "slate" | "red"; label: string }> = {
  PENDING: { tone: "amber", label: "Pending" },
  CONFIRMED: { tone: "green", label: "Confirmed" },
  COMPLETED: { tone: "blue", label: "Completed" },
  CANCELLED: { tone: "slate", label: "Cancelled" },
  NO_SHOW: { tone: "red", label: "No-show" },
};

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No-show" },
];

function prettyDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export default function AppointmentsClient({
  rows,
  stats,
  total,
  page,
  pages,
  status,
  date,
  search,
  canManage,
  canSchedule,
}: {
  rows: Row[];
  stats: { pending: number; confirmedUpcoming: number; todayCount: number };
  total: number;
  page: number;
  pages: number;
  status: string;
  date: string;
  search: string;
  canManage: boolean;
  canSchedule: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  function navigate(next: { status?: string; date?: string; q?: string; page?: number }) {
    const params = new URLSearchParams();
    const s = next.status ?? status;
    const d = next.date ?? date;
    const q = next.q ?? search;
    const p = next.page ?? 1;
    if (s) params.set("status", s);
    if (d) params.set("date", d);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    router.push(`/admin/appointments${params.toString() ? `?${params}` : ""}`);
  }

  function run(id: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
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

  function onCancel(r: Row) {
    const reason = prompt(`Cancel ${r.code} for ${r.name}?\n\nOptional reason (sent to the customer):`);
    if (reason === null) return; // dismissed
    run(r.id, () => cancelAction(r.id, reason.trim() || undefined));
  }

  const btn = "rounded-full px-3 py-1.5 text-[12px] font-bold transition disabled:opacity-40";

  return (
    <>
      <PageHeader title="Appointments" subtitle="Workshop bookings, confirm a slot to lock it in">
        <LinkButton href="/admin/appointments/calendar" variant="secondary">
          <CalendarIcon className="h-4 w-4" /> Calendar
        </LinkButton>
        {canSchedule && (
          <LinkButton href="/admin/appointments/schedule" variant="secondary">
            <SettingsIcon className="h-4 w-4" /> Schedule &amp; slots
          </LinkButton>
        )}
      </PageHeader>

      {/* stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting confirmation" value={stats.pending} tone="red" icon={<CalendarIcon />} sub="Pending requests" />
        <StatCard label="Confirmed upcoming" value={stats.confirmedUpcoming} tone="green" icon={<CalendarIcon />} sub="From today onwards" />
        <StatCard label="Today's bookings" value={stats.todayCount} tone="blue" icon={<CalendarIcon />} sub="Pending + confirmed" />
      </div>

      {/* filters */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => navigate({ status: f.value, page: 1 })}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[12.5px] font-bold transition",
                status === f.value ? "border-transparent bg-suzuki-dark text-white" : "border-line bg-white text-ink-soft hover:border-ink/25",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-1 gap-3 lg:justify-end">
          <input
            type="date"
            value={date}
            onChange={(e) => navigate({ date: e.target.value, page: 1 })}
            className="h-11 rounded-[10px] border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-suzuki-accent"
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ q: (new FormData(e.currentTarget).get("q") as string) || "", page: 1 });
            }}
            className="relative w-full max-w-xs"
          >
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
            <input name="q" defaultValue={search} placeholder="Name, phone, code…" className="h-11 w-full rounded-[10px] border border-line bg-white pl-12 pr-4 text-sm outline-none focus:border-suzuki-accent" />
          </form>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No appointments found" hint="New booking requests from the website will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-line bg-paper text-xs font-bold uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-4">Ref</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Vehicle · Service</th>
                <th className="px-5 py-4">Slot</th>
                <th className="px-5 py-4">Status</th>
                {canManage && <th className="px-5 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => {
                const meta = STATUS_META[r.status];
                return (
                  <tr key={r.id} className="align-top hover:bg-paper/60">
                    <td className="px-5 py-4 font-mono text-[13px] font-bold text-suzuki-dark">{r.code}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-ink">{r.name}</div>
                      <div className="text-[12.5px] text-ink-muted">{r.phone}{r.email ? ` · ${r.email}` : ""}</div>
                      {r.notes && <div className="mt-1 max-w-[260px] text-[12px] italic text-ink-faint">&ldquo;{r.notes}&rdquo;</div>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-ink">{r.vehicle}</div>
                      <div className="text-[12.5px] text-ink-muted">{r.serviceType}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold text-ink">{prettyDate(r.date)}</div>
                      <div className="text-[12.5px] font-semibold text-ink-muted">{r.startTime} – {r.endTime}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                      {r.status === "CONFIRMED" && r.confirmedBy && <div className="mt-1 text-[11.5px] text-ink-faint">by {r.confirmedBy}</div>}
                      {r.status === "CANCELLED" && r.cancelReason && <div className="mt-1 max-w-[160px] text-[11.5px] text-ink-faint">{r.cancelReason}</div>}
                    </td>
                    {canManage && (
                      <td className="px-5 py-4">
                        {busyId === r.id ? (
                          <div className="flex justify-end"><Spinner className="h-5 w-5 text-ink-muted" /></div>
                        ) : (
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {r.status === "PENDING" && (
                              <>
                                <button disabled={pending} onClick={() => run(r.id, () => confirmAction(r.id))} className={cn(btn, "bg-emerald-600 text-white hover:bg-emerald-700")}>
                                  Confirm
                                </button>
                                <button disabled={pending} onClick={() => onCancel(r)} className={cn(btn, "border border-line bg-white text-ink-soft hover:border-suzuki-red hover:text-suzuki-red")}>
                                  Cancel
                                </button>
                              </>
                            )}
                            {r.status === "CONFIRMED" && (
                              <>
                                <button disabled={pending} onClick={() => run(r.id, () => completeAction(r.id))} className={cn(btn, "bg-suzuki-dark text-white hover:bg-[#04193f]")}>
                                  Complete
                                </button>
                                <button disabled={pending} onClick={() => run(r.id, () => noShowAction(r.id))} className={cn(btn, "border border-line bg-white text-ink-soft hover:border-amber-500 hover:text-amber-600")}>
                                  No-show
                                </button>
                                <button disabled={pending} onClick={() => onCancel(r)} className={cn(btn, "border border-line bg-white text-ink-soft hover:border-suzuki-red hover:text-suzuki-red")}>
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* pagination */}
      <div className="mt-5 flex items-center justify-between text-sm text-ink-muted">
        <span>Showing {rows.length} of {total} appointments</span>
        {pages > 1 && (
          <div className="flex items-center gap-1.5">
            <button disabled={page <= 1} onClick={() => navigate({ page: page - 1 })} className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40">‹</button>
            <span className="px-2 font-semibold text-ink">{page} / {pages}</span>
            <button disabled={page >= pages} onClick={() => navigate({ page: page + 1 })} className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40">›</button>
          </div>
        )}
      </div>
    </>
  );
}
