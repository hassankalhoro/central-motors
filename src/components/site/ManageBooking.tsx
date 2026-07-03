"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────
   Customer self-service: look up a booking by reference + phone,
   then request a cancellation or move it to another available
   slot. Nothing is final without the dealership's confirmation:
   cancellations wait for approval, moved slots for re-confirmation.
   Every action notifies both the customer and the dealership.
   ──────────────────────────────────────────────────────────────── */

type Lookup = {
  code: string;
  name: string;
  vehicle: string;
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCEL_REQUESTED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  canModify: boolean;
  reason: string | null;
};
type Day = { date: string; weekday: number; isOpen: boolean; hasSpace: boolean; reason?: string };
type Slot = { start: string; end: string; remaining: number; available: boolean };

const STATUS_LABEL: Record<Lookup["status"], string> = {
  PENDING: "Awaiting confirmation",
  CONFIRMED: "Confirmed",
  CANCEL_REQUESTED: "Cancellation requested",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "Missed",
};

function prettyFull(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

const inputCls =
  "h-12 w-full rounded-xl border border-line bg-paper px-4 text-[14.5px] font-medium text-ink placeholder:text-ink-faint focus:border-suzuki-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-suzuki-red/15";

export default function ManageBooking({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Lookup | null>(null);
  const [mode, setMode] = useState<"view" | "reschedule">("view");
  const [days, setDays] = useState<Day[] | null>(null);
  const [newDate, setNewDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/appointments/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setBooking(data.appointment);
      setMode("view");
      setDone(null);
    } catch {
      setError("Network problem, please try again.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (mode !== "reschedule" || days) return;
    fetch("/api/appointments/days")
      .then((r) => r.json())
      .then((d) => setDays(d.days ?? []))
      .catch(() => setDays([]));
  }, [mode, days]);

  function loadSlots(d: string) {
    setNewDate(d);
    setSlots(null);
    fetch(`/api/appointments/availability?date=${d}`)
      .then((r) => r.json())
      .then((res) => setSlots(res.slots ?? []))
      .catch(() => setSlots([]));
  }

  async function doCancel() {
    if (!booking) return;
    if (!confirm(`Request cancellation of booking ${booking.code} on ${prettyFull(booking.date)} at ${booking.startTime}?\n\nThe booking stays in place until our team confirms the cancellation.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments/manage/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send the cancellation request.");
        return;
      }
      setDone(
        `We've received your cancellation request for booking ${booking.code}. It stays in place until our team confirms the cancellation, you'll get an email as soon as it's processed.`,
      );
      setBooking(null);
    } catch {
      setError("Network problem, please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function doReschedule(slot: Slot) {
    if (!booking || !newDate) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments/manage/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, phone, date: newDate, startTime: slot.start }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not move the booking.");
        if (res.status === 409) loadSlots(newDate);
        return;
      }
      setDone(
        `Booking ${booking.code} moved to ${prettyFull(data.date)}, ${data.startTime} – ${data.endTime}. Our team will confirm the new slot shortly.`,
      );
      setBooking(null);
    } catch {
      setError("Network problem, please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold text-ink">All done</h2>
        <p className="mx-auto mt-2 max-w-[440px] text-[14.5px] leading-relaxed text-ink-muted">{done}</p>
      </div>
    );
  }

  return (
    <div className="card p-6 sm:p-8">
      {!booking ? (
        <form onSubmit={lookup}>
          <h2 className="font-display text-[17px] font-bold text-ink">Find your booking</h2>
          <p className="mt-1 text-[13.5px] text-ink-muted">Enter the reference from your booking (e.g. SCM-4F7K2A) and the phone number you booked with.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted">Booking reference *</span>
              <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SCM-XXXXXX" className={cn(inputCls, "font-mono uppercase")} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted">Phone number *</span>
              <input required type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xx xxxxxxx" className={inputCls} />
            </label>
          </div>
          {error && <p className="mt-4 rounded-xl bg-suzuki-red/[.06] px-4 py-3 text-[13px] font-semibold text-suzuki-red">{error}</p>}
          <button type="submit" disabled={busy} className="mt-5 h-12 rounded-xl bg-suzuki-red px-7 text-[14.5px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk disabled:opacity-60">
            {busy ? "Searching…" : "Find my booking"}
          </button>
        </form>
      ) : (
        <div>
          {/* booking card */}
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-suzuki-dark px-5 py-4 text-white">
            <div>
              <div className="font-mono text-[13px] font-bold text-[#9DB4D6]">{booking.code}</div>
              <div className="mt-0.5 font-display text-[17px] font-extrabold">{prettyFull(booking.date)}</div>
              <div className="text-[13.5px] font-semibold text-[#C3D2EA]">{booking.startTime} – {booking.endTime} · {booking.serviceType}</div>
              <div className="mt-1 text-[12.5px] text-[#9DB4D6]">{booking.vehicle}</div>
            </div>
            <span className={cn(
              "rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide",
              booking.status === "CONFIRMED" ? "bg-emerald-500/20 text-emerald-300" : booking.status === "PENDING" || booking.status === "CANCEL_REQUESTED" ? "bg-amber-500/20 text-amber-300" : "bg-white/15 text-white/80",
            )}>
              {STATUS_LABEL[booking.status]}
            </span>
          </div>

          {!booking.canModify ? (
            <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-[13.5px] text-ink-muted">{booking.reason ?? "This booking can no longer be changed online."}</p>
          ) : mode === "view" ? (
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <button onClick={() => setMode("reschedule")} disabled={busy} className="h-12 flex-1 rounded-xl bg-suzuki-red text-[14px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk disabled:opacity-60">
                Move to another slot
              </button>
              <button onClick={doCancel} disabled={busy} className="h-12 flex-1 rounded-xl border border-line bg-white text-[14px] font-bold text-ink transition hover:border-suzuki-red hover:text-suzuki-red disabled:opacity-60">
                Request cancellation
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <h3 className="font-display text-[16px] font-bold text-ink">Pick a new day</h3>
              {!days ? (
                <p className="mt-3 text-[13.5px] text-ink-muted">Loading available days…</p>
              ) : (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {days.map((d) => {
                    const enabled = d.isOpen && d.hasSpace;
                    const p = new Date(`${d.date}T00:00:00Z`);
                    return (
                      <button
                        key={d.date}
                        type="button"
                        disabled={!enabled}
                        onClick={() => loadSlots(d.date)}
                        className={cn(
                          "w-[68px] flex-shrink-0 rounded-xl border px-2 py-2 text-center transition",
                          newDate === d.date ? "border-suzuki-red bg-suzuki-red text-white" : "border-line bg-white text-ink hover:border-suzuki-red/50",
                          !enabled && "pointer-events-none opacity-40",
                        )}
                      >
                        <div className="text-[10px] font-bold uppercase opacity-70">{p.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })}</div>
                        <div className="font-display text-[18px] font-extrabold leading-tight">{p.getUTCDate()}</div>
                        <div className="text-[10px] font-semibold opacity-70">{p.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {newDate && (
                <>
                  <h3 className="mt-4 font-display text-[16px] font-bold text-ink">
                    New time <span className="font-body text-[13px] font-semibold text-ink-muted">· {prettyFull(newDate)}</span>
                  </h3>
                  {!slots ? (
                    <p className="mt-3 text-[13.5px] text-ink-muted">Checking slots…</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {slots.map((s) => (
                        <button
                          key={s.start}
                          type="button"
                          disabled={!s.available || busy}
                          onClick={() => doReschedule(s)}
                          className={cn(
                            "rounded-xl border border-line bg-white px-2 py-2.5 text-center transition hover:border-suzuki-red/60",
                            (!s.available || busy) && "pointer-events-none opacity-40",
                          )}
                        >
                          <div className="font-display text-[14px] font-extrabold text-ink">{s.start}</div>
                          <div className="text-[10.5px] font-semibold text-ink-muted">{!s.available ? "Full" : `${s.remaining} spot${s.remaining > 1 ? "s" : ""}`}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <button onClick={() => setMode("view")} className="mt-4 text-[13px] font-bold text-suzuki-blue">← Back</button>
            </div>
          )}

          {error && <p className="mt-4 rounded-xl bg-suzuki-red/[.06] px-4 py-3 text-[13px] font-semibold text-suzuki-red">{error}</p>}
        </div>
      )}
    </div>
  );
}
