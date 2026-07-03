"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { SERVICE_TYPES } from "@/server/validators/appointment";

/* ────────────────────────────────────────────────────────────────
   Slot-based booking wizard: pick a day → pick a time → your
   details → review everything in a modal → request lands as
   PENDING and the team confirms it. Availability is live from
   the admin-managed schedule.
   ──────────────────────────────────────────────────────────────── */

type Day = { date: string; weekday: number; isOpen: boolean; hasSpace: boolean; reason?: string };
type Slot = { start: string; end: string; remaining: number; available: boolean };
type Booked = { code: string; date: string; startTime: string; endTime: string };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Popular older Suzukis the workshop still services every day. */
const LEGACY_MODELS = ["WagonR", "Mehran", "Bolan", "Ravi", "Baleno", "Liana", "Ciaz", "Vitara", "Jimny", "APV", "Khyber", "Margalla"];
const OTHER = "__other__";

function prettyDay(date: string): { top: string; big: string; month: string; monthFull: string } {
  const d = new Date(`${date}T00:00:00Z`);
  return { top: WEEKDAYS[d.getUTCDay()], big: String(d.getUTCDate()), month: MONTHS[d.getUTCMonth()], monthFull: MONTHS_FULL[d.getUTCMonth()] };
}

function prettyFull(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

const inputCls =
  "h-12 w-full rounded-xl border border-line bg-paper px-4 text-[14.5px] font-medium text-ink placeholder:text-ink-faint focus:border-suzuki-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-suzuki-red/15";

export default function BookingWizard({ models = [] }: { models?: string[] }) {
  const [days, setDays] = useState<Day[] | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [values, setValues] = useState({
    name: "", phone: "", email: "", vehicle: "", vehicleOther: "", registration: "",
    serviceType: SERVICE_TYPES[0] as string, notes: "", company: "",
  });
  const [review, setReview] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<Booked | null>(null);

  const slotsRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/appointments/days")
      .then((r) => r.json())
      .then((d) => setDays(d.days ?? []))
      .catch(() => setDays([]));
  }, []);

  const scrollTo = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: "smooth", block: "start" });

  const loadSlots = useCallback((d: string) => {
    setDate(d);
    setSlot(null);
    setSlots(null);
    setError(null);
    fetch(`/api/appointments/availability?date=${d}`)
      .then((r) => r.json())
      .then((res) => setSlots(res.slots ?? []))
      .catch(() => setSlots([]));
    // step 2 renders right away, guide the eye to it
    requestAnimationFrame(() => requestAnimationFrame(() => scrollTo(slotsRef.current)));
  }, []);

  const pickSlot = useCallback((s: Slot) => {
    setSlot(s);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        scrollTo(detailsRef.current);
        nameRef.current?.focus({ preventScroll: true });
      }),
    );
  }, []);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const finalVehicle = values.vehicle === OTHER ? values.vehicleOther.trim() : values.vehicle;

  function openReview(e: React.FormEvent) {
    e.preventDefault(); // native `required` validation ran before this
    setError(null);
    setReview(true);
  }

  async function confirmRequest() {
    if (!date || !slot) return;
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, vehicle: finalVehicle, date, startTime: slot.start }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReview(false);
        setError(data.error || "Something went wrong, please try again.");
        if (res.status === 409) loadSlots(date); // slot just filled → refresh
        setStatus("idle");
        return;
      }
      setBooked(data);
    } catch {
      setReview(false);
      setError("Network problem, please try again.");
      setStatus("idle");
    }
  }

  /* ── success ─────────────────────────────────────────────── */
  if (booked) {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h2 className="mt-4 font-display text-2xl font-extrabold text-ink">Request received!</h2>
        <p className="mx-auto mt-2 max-w-[420px] text-[14.5px] leading-relaxed text-ink-muted">
          Your slot is reserved pending confirmation. Our team will confirm shortly
          {values.email ? ", you'll get an email the moment it's locked in." : " by phone."}
        </p>
        <div className="mx-auto mt-6 max-w-[360px] rounded-2xl border border-line bg-paper p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">Your reference</div>
          <div className="mt-1 font-display text-[26px] font-black tracking-wide text-suzuki-dark">{booked.code}</div>
          <div className="mt-2 text-[13.5px] font-semibold text-ink-soft">
            {prettyFull(booked.date)} · {booked.startTime} – {booked.endTime}
          </div>
        </div>
        <p className="mt-4 text-[12.5px] text-ink-faint">
          Save this reference. Need a change? You can{" "}
          <a href={`/manage-booking?code=${booked.code}`} className="font-bold text-suzuki-blue">cancel or reschedule online</a>.
        </p>
      </div>
    );
  }

  const step = !date ? 1 : !slot ? 2 : 3;

  return (
    <div className="card overflow-hidden">
      {/* progress */}
      <div className="flex border-b border-line bg-paper text-center text-[12px] font-bold uppercase tracking-wide">
        {["Pick a day", "Pick a time", "Your details"].map((label, i) => (
          <div key={label} className={cn("flex-1 border-b-2 px-2 py-3", step >= i + 1 ? "border-suzuki-red text-suzuki-dark" : "border-transparent text-ink-faint")}>
            <span className="mr-1.5 inline-grid h-5 w-5 place-items-center rounded-full text-[11px] font-black text-white" style={{ background: step >= i + 1 ? "#E11622" : "#C2CBD8" }}>{i + 1}</span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>

      <div className="p-5 sm:p-7">
        {/* ── step 1: day (grouped by month) ────────────────── */}
        <div>
          <h2 className="font-display text-[17px] font-bold text-ink">Choose a day</h2>
          {!days ? (
            <p className="mt-3 text-[13.5px] text-ink-muted">Loading available days…</p>
          ) : (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {days.map((d, i) => {
                const p = prettyDay(d.date);
                const prev = i > 0 ? prettyDay(days[i - 1].date) : null;
                const newMonth = !prev || prev.month !== p.month;
                const enabled = d.isOpen && d.hasSpace;
                return (
                  <Fragment key={d.date}>
                    {newMonth && (
                      <div className="flex w-[34px] flex-shrink-0 items-center justify-center rounded-xl bg-suzuki-dark/[.05]">
                        <span className="rotate-180 font-display text-[12px] font-black uppercase tracking-[0.2em] text-suzuki-dark/60 [writing-mode:vertical-rl]">
                          {p.monthFull}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={!enabled}
                      onClick={() => loadSlots(d.date)}
                      title={!d.isOpen ? (d.reason === "closed" ? "Closed" : d.reason) : !d.hasSpace ? "Fully booked" : undefined}
                      className={cn(
                        "w-[72px] flex-shrink-0 rounded-xl border px-2 py-2.5 text-center transition",
                        date === d.date ? "border-suzuki-red bg-suzuki-red text-white shadow-cta" : "border-line bg-white text-ink hover:border-suzuki-red/50",
                        !enabled && "pointer-events-none opacity-40",
                      )}
                    >
                      <div className={cn("text-[10.5px] font-bold uppercase", date === d.date ? "text-white/85" : "text-ink-faint")}>{p.top}</div>
                      <div className="font-display text-[20px] font-extrabold leading-tight">{p.big}</div>
                      <div className={cn("text-[10.5px] font-semibold", date === d.date ? "text-white/85" : "text-ink-muted")}>{!d.isOpen ? "Closed" : !d.hasSpace ? "Full" : p.month}</div>
                    </button>
                  </Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* ── step 2: slot ──────────────────────────────────── */}
        {date && (
          <div ref={slotsRef} className="mt-6 scroll-mt-24">
            <h2 className="font-display text-[17px] font-bold text-ink">
              Available times <span className="font-body text-[13px] font-semibold text-ink-muted">· {prettyFull(date)}</span>
            </h2>
            {!slots ? (
              <p className="mt-3 text-[13.5px] text-ink-muted">Checking slots…</p>
            ) : slots.length === 0 ? (
              <p className="mt-3 text-[13.5px] text-ink-muted">No slots on this day, please pick another.</p>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {slots.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    disabled={!s.available}
                    onClick={() => pickSlot(s)}
                    className={cn(
                      "rounded-xl border px-2 py-2.5 text-center transition",
                      slot?.start === s.start ? "border-suzuki-red bg-suzuki-red text-white shadow-cta" : "border-line bg-white text-ink hover:border-suzuki-red/50",
                      !s.available && "pointer-events-none opacity-40",
                    )}
                  >
                    <div className="font-display text-[14.5px] font-extrabold">{s.start}</div>
                    <div className={cn("text-[10.5px] font-semibold", slot?.start === s.start ? "text-white/85" : "text-ink-muted")}>
                      {!s.available ? "Full" : s.remaining === 1 ? "1 spot left" : `${s.remaining} spots`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── step 3: details ───────────────────────────────── */}
        {date && slot && (
          <form onSubmit={openReview} ref={detailsRef} className="mt-7 scroll-mt-24 border-t border-line pt-6">
            <h2 className="font-display text-[17px] font-bold text-ink">Your details</h2>
            <input type="text" value={values.company} onChange={set("company")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted">Full name *</span>
                <input ref={nameRef} required value={values.name} onChange={set("name")} placeholder="e.g. Ahmed Khan" autoComplete="name" className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted">Mobile number *</span>
                <input required type="tel" inputMode="tel" value={values.phone} onChange={set("phone")} placeholder="03xx xxxxxxx" autoComplete="tel" className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted">Email <span className="normal-case text-ink-faint">(for confirmation)</span></span>
                <input type="email" value={values.email} onChange={set("email")} placeholder="you@email.com" autoComplete="email" className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted">Service type *</span>
                <select required value={values.serviceType} onChange={set("serviceType")} className={inputCls}>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted">Vehicle / model *</span>
                <select required value={values.vehicle} onChange={set("vehicle")} className={inputCls}>
                  <option value="" disabled>Select your vehicle…</option>
                  {models.length > 0 && (
                    <optgroup label="Current lineup">
                      {models.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Other Suzuki models">
                    {LEGACY_MODELS.filter((m) => !models.includes(m)).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </optgroup>
                  <option value={OTHER}>Other / not listed</option>
                </select>
              </label>
              {values.vehicle === OTHER ? (
                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted">Which vehicle? *</span>
                  <input required value={values.vehicleOther} onChange={set("vehicleOther")} placeholder="e.g. Swift 2018" className={inputCls} />
                </label>
              ) : (
                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted">Registration no.</span>
                  <input value={values.registration} onChange={set("registration")} placeholder="e.g. RIK-1234" className={inputCls} />
                </label>
              )}
              {values.vehicle === OTHER && (
                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted">Registration no.</span>
                  <input value={values.registration} onChange={set("registration")} placeholder="e.g. RIK-1234" className={inputCls} />
                </label>
              )}
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted">Notes</span>
                <textarea value={values.notes} onChange={set("notes")} rows={3} placeholder="Describe the issue or request" className={cn(inputCls, "h-auto resize-none py-3")} />
              </label>
            </div>

            {error && <p className="mt-4 rounded-xl bg-suzuki-red/[.06] px-4 py-3 text-[13px] font-semibold text-suzuki-red">{error}</p>}

            <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-xl bg-paper px-4 py-2.5 text-center text-[13px] font-semibold text-ink-soft sm:text-left">
                {prettyFull(date)} · <span className="font-display font-extrabold text-suzuki-dark">{slot.start} – {slot.end}</span>
              </div>
              <button type="submit" className="h-12 rounded-xl bg-suzuki-red px-7 text-[14.5px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk">
                Review &amp; request slot
              </button>
            </div>
            <p className="mt-3 text-[12px] text-ink-faint">Your slot is held as pending, our team confirms it and you&apos;ll be notified right away.</p>
          </form>
        )}

        {error && !slot && <p className="mt-4 rounded-xl bg-suzuki-red/[.06] px-4 py-3 text-[13px] font-semibold text-suzuki-red">{error}</p>}
      </div>

      {/* ── review modal ─────────────────────────────────────── */}
      {review && date && slot &&
        createPortal(
          <div className="fixed inset-0 z-[300] flex items-end justify-center bg-[#040c20]/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => status !== "sending" && setReview(false)}>
            <div
              className="max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl sm:p-7"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Review your booking"
            >
              <h3 className="font-display text-[20px] font-extrabold text-ink">Review your booking</h3>
              <p className="mt-1 text-[13px] text-ink-muted">Please double-check everything before sending the request.</p>

              {/* slot summary */}
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-suzuki-dark px-5 py-4 text-white">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9DB4D6]">Appointment</div>
                  <div className="mt-0.5 font-display text-[16px] font-extrabold">{prettyFull(date)}</div>
                  <div className="text-[13.5px] font-semibold text-[#C3D2EA]">{slot.start} – {slot.end}</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setReview(false); requestAnimationFrame(() => scrollTo(slotsRef.current)); }}
                  className="rounded-full border border-white/25 px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-white/10"
                >
                  Edit
                </button>
              </div>

              {/* details summary */}
              <div className="mt-3 rounded-2xl border border-line">
                {[
                  ["Name", values.name],
                  ["Phone", values.phone],
                  ["Email", values.email || "—"],
                  ["Vehicle", finalVehicle + (values.registration ? ` (${values.registration})` : "")],
                  ["Service", values.serviceType],
                  ["Notes", values.notes || "—"],
                ].map(([k, v], i) => (
                  <div key={k} className={cn("flex items-start justify-between gap-4 px-5 py-3", i > 0 && "border-t border-[#EEF1F5]")}>
                    <span className="w-[74px] flex-shrink-0 text-[12.5px] font-bold text-ink-muted">{k}</span>
                    <span className="flex-1 text-right text-[13.5px] font-semibold text-ink">{v}</span>
                  </div>
                ))}
                <div className="border-t border-[#EEF1F5] px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => { setReview(false); requestAnimationFrame(() => { scrollTo(detailsRef.current); nameRef.current?.focus({ preventScroll: true }); }); }}
                    className="text-[12.5px] font-bold text-suzuki-blue transition hover:text-suzuki-dark"
                  >
                    Edit details
                  </button>
                </div>
              </div>

              {error && <p className="mt-3 rounded-xl bg-suzuki-red/[.06] px-4 py-3 text-[13px] font-semibold text-suzuki-red">{error}</p>}

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  disabled={status === "sending"}
                  onClick={() => setReview(false)}
                  className="h-12 flex-1 rounded-xl border border-line bg-white text-[14px] font-bold text-ink transition hover:border-ink/25 disabled:opacity-50"
                >
                  Go back &amp; edit
                </button>
                <button
                  type="button"
                  disabled={status === "sending"}
                  onClick={confirmRequest}
                  className="h-12 flex-1 rounded-xl bg-suzuki-red text-[14px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Confirm request"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
