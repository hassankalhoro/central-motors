"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, LinkButton, Button } from "@/components/admin/ui";
import { TrashIcon, PlusIcon } from "@/components/admin/icons";
import { cn } from "@/lib/utils";
import { saveScheduleAction, saveConfigAction, addBlackoutAction, removeBlackoutAction } from "../actions";

type Day = { weekday: number; isOpen: boolean; startTime: string; endTime: string; breakStart: string | null; breakEnd: string | null };
type Config = { slotMinutes: number; gapMinutes: number; capacity: number; windowDays: number; minNoticeHours: number };
type Blackout = { id: string; date: string; reason: string | null };

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const timeCls =
  "h-10 rounded-lg border border-line bg-white px-2.5 text-[13.5px] font-semibold text-ink focus:border-suzuki-blue focus:outline-none disabled:bg-paper disabled:text-ink-faint";

/** Mirrors the server's slot generation so the admin sees exactly what customers will get. */
function previewSlots(d: Day, slotMinutes: number, gapMinutes = 0): string[] {
  if (!d.isOpen || !slotMinutes || slotMinutes < 5) return [];
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const toT = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const open = toMin(d.startTime);
  const close = toMin(d.endTime);
  const bs = d.breakStart ? toMin(d.breakStart) : null;
  const be = d.breakEnd ? toMin(d.breakEnd) : null;
  const out: string[] = [];
  for (let s = open; s + slotMinutes <= close; s += slotMinutes + gapMinutes) {
    const e = s + slotMinutes;
    if (bs != null && be != null && s < be && e > bs) continue; // overlaps break
    out.push(toT(s));
  }
  return out;
}

export default function ScheduleClient({
  schedule: initialSchedule,
  config: initialConfig,
  blackouts,
}: {
  schedule: Day[];
  config: Config;
  blackouts: Blackout[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [schedule, setSchedule] = useState<Day[]>(initialSchedule);
  const [config, setConfig] = useState<Config>(initialConfig);
  const [newBlackout, setNewBlackout] = useState({ date: "", reason: "" });
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function setDay(w: number, patch: Partial<Day>) {
    setSchedule((s) => s.map((d) => (d.weekday === w ? { ...d, ...patch } : d)));
  }

  function flash(kind: "ok" | "err", text: string) {
    setMessage({ kind, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function saveAll() {
    start(async () => {
      const s = await saveScheduleAction(schedule);
      if (!s.ok) return flash("err", s.error ?? "Could not save the weekly schedule.");
      const c = await saveConfigAction(config);
      if (!c.ok) return flash("err", c.error ?? "Could not save the slot rules.");
      flash("ok", "Schedule saved. The booking page now uses the new hours.");
      router.refresh();
    });
  }

  function addBlackout(e: React.FormEvent) {
    e.preventDefault();
    if (!newBlackout.date) return;
    start(async () => {
      const res = await addBlackoutAction(newBlackout);
      if (!res.ok) return flash("err", res.error ?? "Could not add the holiday.");
      setNewBlackout({ date: "", reason: "" });
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader title="Schedule & slots" subtitle="Working hours, slot rules and holidays for the booking page">
        <LinkButton href="/admin/appointments" variant="secondary">← Back to appointments</LinkButton>
      </PageHeader>

      {message && (
        <div className={cn("mb-5 rounded-xl px-4 py-3 text-sm font-semibold", message.kind === "ok" ? "bg-green-100 text-green-700" : "bg-suzuki-red/10 text-suzuki-red")}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* weekly hours */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-suzuki-dark">Weekly hours</h2>
            <p className="mt-1 text-[13px] text-ink-muted">Slots are offered between opening and closing, skipping the break.</p>
            <div className="mt-4 space-y-2.5">
              {schedule.map((d) => (
                <div key={d.weekday} className={cn("flex flex-wrap items-center gap-3 rounded-xl border border-line px-4 py-3", d.isOpen ? "bg-white" : "bg-paper/70")}>
                  <label className="flex w-[130px] cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={d.isOpen}
                      onChange={(e) => setDay(d.weekday, { isOpen: e.target.checked })}
                      className="h-4 w-4 rounded border-line text-suzuki-red focus:ring-suzuki-red"
                    />
                    <span className={cn("text-sm font-bold", d.isOpen ? "text-ink" : "text-ink-faint")}>{WEEKDAYS[d.weekday]}</span>
                  </label>
                  <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-muted">
                    <input type="time" disabled={!d.isOpen} value={d.startTime} onChange={(e) => setDay(d.weekday, { startTime: e.target.value })} className={timeCls} />
                    –
                    <input type="time" disabled={!d.isOpen} value={d.endTime} onChange={(e) => setDay(d.weekday, { endTime: e.target.value })} className={timeCls} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-muted">
                    <span className="text-ink-faint">Break</span>
                    <input type="time" disabled={!d.isOpen} value={d.breakStart ?? ""} onChange={(e) => setDay(d.weekday, { breakStart: e.target.value || null })} className={timeCls} />
                    –
                    <input type="time" disabled={!d.isOpen} value={d.breakEnd ?? ""} onChange={(e) => setDay(d.weekday, { breakEnd: e.target.value || null })} className={timeCls} />
                  </div>
                  {!d.isOpen && <span className="ml-auto rounded-full bg-ink/[.06] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Closed</span>}
                  {d.isOpen && (
                    <div className="w-full text-[11.5px] leading-relaxed text-ink-faint">
                      {(() => {
                        const slots = previewSlots(d, config.slotMinutes, config.gapMinutes);
                        return slots.length
                          ? <>Customers will see <span className="font-bold text-suzuki-blue">{slots.length} slot{slots.length > 1 ? "s" : ""}</span>: {slots.join(" · ")}</>
                          : <span className="font-semibold text-suzuki-red">No slots fit these hours, check the times and slot duration.</span>;
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* slot rules */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-suzuki-dark">Slot rules</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="flabel">Slot duration (minutes)</span>
                <input type="number" min={15} max={240} step={5} value={config.slotMinutes} onChange={(e) => setConfig((c) => ({ ...c, slotMinutes: Number(e.target.value) }))} className="field" />
                <span className="mt-1 block text-[12px] text-ink-faint">Length of each bookable slot, e.g. 60 = hourly slots.</span>
              </label>
              <label className="block">
                <span className="flabel">Gap between slots (minutes)</span>
                <input type="number" min={0} max={120} step={5} value={config.gapMinutes} onChange={(e) => setConfig((c) => ({ ...c, gapMinutes: Number(e.target.value) }))} className="field" />
                <span className="mt-1 block text-[12px] text-ink-faint">Buffer after each slot, e.g. 15 = 09:00 then 10:15.</span>
              </label>
              <label className="block">
                <span className="flabel">Bookings per slot (capacity)</span>
                <input type="number" min={1} max={50} value={config.capacity} onChange={(e) => setConfig((c) => ({ ...c, capacity: Number(e.target.value) }))} className="field" />
                <span className="mt-1 block text-[12px] text-ink-faint">How many cars the workshop can take in the same slot.</span>
              </label>
              <label className="block">
                <span className="flabel">Booking window (days ahead)</span>
                <input type="number" min={1} max={90} value={config.windowDays} onChange={(e) => setConfig((c) => ({ ...c, windowDays: Number(e.target.value) }))} className="field" />
                <span className="mt-1 block text-[12px] text-ink-faint">How far into the future customers can book.</span>
              </label>
              <label className="block">
                <span className="flabel">Minimum notice (hours)</span>
                <input type="number" min={0} max={72} value={config.minNoticeHours} onChange={(e) => setConfig((c) => ({ ...c, minNoticeHours: Number(e.target.value) }))} className="field" />
                <span className="mt-1 block text-[12px] text-ink-faint">Same-day slots starting sooner than this are hidden.</span>
              </label>
            </div>
          </section>

          <Button onClick={saveAll} loading={pending}>Save schedule &amp; rules</Button>
        </div>

        {/* holidays */}
        <section className="h-fit rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-suzuki-dark">Holidays / closed dates</h2>
          <p className="mt-1 text-[13px] text-ink-muted">Block specific dates (Eid, public holidays). Customers see them as closed.</p>

          <form onSubmit={addBlackout} className="mt-4 space-y-2.5">
            <input type="date" required value={newBlackout.date} onChange={(e) => setNewBlackout((b) => ({ ...b, date: e.target.value }))} className="field" />
            <input value={newBlackout.reason} onChange={(e) => setNewBlackout((b) => ({ ...b, reason: e.target.value }))} placeholder="Reason (optional, e.g. Eid holiday)" className="field" />
            <Button type="submit" variant="secondary" loading={pending} className="w-full">
              <PlusIcon className="h-4 w-4" /> Add closed date
            </Button>
          </form>

          <div className="mt-5 space-y-2">
            {blackouts.length === 0 && <p className="text-[13px] text-ink-faint">No upcoming closed dates.</p>}
            {blackouts.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-line bg-paper/60 px-4 py-3">
                <div>
                  <div className="text-sm font-bold text-ink">
                    {new Date(`${b.date}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
                  </div>
                  {b.reason && <div className="text-[12.5px] text-ink-muted">{b.reason}</div>}
                </div>
                <button
                  onClick={() => start(async () => { const r = await removeBlackoutAction(b.id); if (r.ok) router.refresh(); })}
                  disabled={pending}
                  aria-label="Remove closed date"
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-suzuki-red/10 hover:text-suzuki-red"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
