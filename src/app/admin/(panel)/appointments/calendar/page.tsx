import Link from "next/link";
import { PageHeader, LinkButton } from "@/components/admin/ui";
import {
  appointmentsBetween,
  getSchedule,
  getBookingConfig,
  slotsForDay,
  dbDateToStr,
} from "@/server/services/bookingService";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────
   Workshop calendar, week and month views. Server-rendered; all
   navigation is plain links so it stays fast and stateless.
   ──────────────────────────────────────────────────────────────── */

const DAY_MS = 86_400_000;
const WEEKDAYS_MON = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-green-100 text-green-800 border-green-200",
  CANCEL_REQUESTED: "bg-purple-100 text-purple-800 border-purple-200",
  COMPLETED: "bg-suzuki-blue/10 text-suzuki-blue border-suzuki-blue/20",
  NO_SHOW: "bg-suzuki-red/10 text-suzuki-red border-suzuki-red/20",
};
const DOT: Record<string, string> = {
  PENDING: "bg-amber-500",
  CONFIRMED: "bg-green-500",
  CANCEL_REQUESTED: "bg-purple-500",
  COMPLETED: "bg-suzuki-blue",
  NO_SHOW: "bg-suzuki-red",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCEL_REQUESTED: "Cancel requested",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
};

function todayPKTStr(): string {
  return new Date(Date.now() + 5 * 60 * 60_000).toISOString().slice(0, 10);
}
const parse = (s: string) => Date.parse(`${s}T00:00:00Z`);
const fmt = (abs: number) => new Date(abs).toISOString().slice(0, 10);
/** Monday of the week containing dateStr. */
function mondayOf(dateStr: string): string {
  const d = new Date(parse(dateStr));
  const shift = (d.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  return fmt(parse(dateStr) - shift * DAY_MS);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { view?: string; start?: string };
}) {
  const view = searchParams.view === "month" ? "month" : "week";
  const today = todayPKTStr();
  const anchor = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.start ?? "") ? searchParams.start! : today;

  const [schedule, config, blackouts] = await Promise.all([getSchedule(), getBookingConfig(), db.blackoutDate.findMany()]);
  const blackoutMap = new Map(blackouts.map((b) => [dbDateToStr(b.date), b.reason || "Holiday"]));

  /* ── build the visible range ── */
  let rangeStart: string, rangeEnd: string;
  let monthMeta: { year: number; month: number } | null = null;
  if (view === "week") {
    rangeStart = mondayOf(anchor);
    rangeEnd = fmt(parse(rangeStart) + 6 * DAY_MS);
  } else {
    const d = new Date(parse(anchor));
    monthMeta = { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    const first = `${monthMeta.year}-${String(monthMeta.month + 1).padStart(2, "0")}-01`;
    rangeStart = mondayOf(first);
    const daysInMonth = new Date(Date.UTC(monthMeta.year, monthMeta.month + 1, 0)).getUTCDate();
    const last = `${monthMeta.year}-${String(monthMeta.month + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    rangeEnd = fmt(parse(mondayOf(last)) + 6 * DAY_MS);
  }

  const appts = await appointmentsBetween(rangeStart, rangeEnd);
  const byDay = new Map<string, typeof appts>();
  for (const a of appts) {
    const key = dbDateToStr(a.date);
    byDay.set(key, [...(byDay.get(key) ?? []), a]);
  }

  /* ── navigation targets ── */
  const step = view === "week" ? 7 * DAY_MS : 0;
  const prev =
    view === "week"
      ? fmt(parse(rangeStart) - step)
      : fmt(Date.UTC(monthMeta!.year, monthMeta!.month - 1, 1));
  const next =
    view === "week"
      ? fmt(parse(rangeStart) + step)
      : fmt(Date.UTC(monthMeta!.year, monthMeta!.month + 1, 1));
  const href = (v: string, s: string) => `/admin/appointments/calendar?view=${v}&start=${s}`;

  const title =
    view === "week"
      ? `${new Date(parse(rangeStart)).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })} – ${new Date(parse(rangeEnd)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`
      : new Date(Date.UTC(monthMeta!.year, monthMeta!.month, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

  /* ── week view scaffolding ── */
  const weekDays = Array.from({ length: 7 }, (_, i) => fmt(parse(rangeStart) + i * DAY_MS));
  const slotStarts = Array.from(
    new Set(
      weekDays.flatMap((d) => {
        const wd = new Date(parse(d)).getUTCDay();
        return slotsForDay(schedule[wd], config.slotMinutes, config.gapMinutes).map((s) => s.start);
      }),
    ),
  ).sort();

  return (
    <>
      <PageHeader title="Workshop calendar" subtitle="Bookings at a glance, plan the day and the week">
        <LinkButton href="/admin/appointments" variant="secondary">List view</LinkButton>
      </PageHeader>

      {/* controls */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-line bg-paper p-1">
          {(["week", "month"] as const).map((v) => (
            <Link
              key={v}
              href={href(v, anchor)}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-bold capitalize transition",
                view === v ? "bg-suzuki-dark text-white shadow-card" : "text-ink-muted hover:text-ink",
              )}
            >
              {v}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link href={href(view, prev)} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-lg text-ink transition hover:border-suzuki-blue">‹</Link>
          <Link href={href(view, today)} className="rounded-lg border border-line bg-white px-4 py-2.5 text-[13px] font-bold text-ink transition hover:border-suzuki-blue">Today</Link>
          <Link href={href(view, next)} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-lg text-ink transition hover:border-suzuki-blue">›</Link>
          <span className="ml-2 font-display text-[16px] font-extrabold text-ink">{title}</span>
        </div>
      </div>

      {/* legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-[12px] font-semibold text-ink-muted">
        {(["PENDING", "CONFIRMED", "CANCEL_REQUESTED", "COMPLETED", "NO_SHOW"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", DOT[s])} /> {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      {view === "week" ? (
        /* ── WEEK ─────────────────────────────────────────────── */
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <div className="min-w-[900px]">
            {/* header row */}
            <div className="grid border-b border-line bg-paper" style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}>
              <div className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Slot</div>
              {weekDays.map((d, i) => {
                const isToday = d === today;
                const wd = new Date(parse(d)).getUTCDay();
                const closed = !schedule[wd].isOpen || blackoutMap.has(d);
                return (
                  <div key={d} className={cn("border-l border-line px-3 py-2 text-center", isToday && "bg-suzuki-blue/[.06]")}>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">{WEEKDAYS_MON[i]}</div>
                    <div className={cn("font-display text-[17px] font-extrabold", isToday ? "text-suzuki-blue" : "text-ink")}>
                      {new Date(parse(d)).getUTCDate()}
                    </div>
                    {closed && <div className="text-[10px] font-bold uppercase text-suzuki-red/70">{blackoutMap.get(d) ?? "Closed"}</div>}
                  </div>
                );
              })}
            </div>
            {/* slot rows */}
            {slotStarts.map((start) => (
              <div key={start} className="grid border-b border-[#EEF1F5] last:border-b-0" style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}>
                <div className="px-3 py-2.5 font-mono text-[12px] font-bold text-ink-muted">{start}</div>
                {weekDays.map((d) => {
                  const wd = new Date(parse(d)).getUTCDay();
                  const daySlots = slotsForDay(schedule[wd], config.slotMinutes, config.gapMinutes);
                  const slotExists = daySlots.some((s) => s.start === start);
                  const closed = !schedule[wd].isOpen || blackoutMap.has(d);
                  const cellAppts = (byDay.get(d) ?? []).filter((a) => a.startTime === start);
                  return (
                    <div key={d} className={cn("min-h-[52px] space-y-1 border-l border-[#EEF1F5] p-1.5", (closed || !slotExists) && "bg-paper/70")}>
                      {cellAppts.map((a) => (
                        <Link
                          key={a.id}
                          href={`/admin/appointments?q=${a.code}`}
                          title={`${a.code} · ${a.name} · ${a.vehicle} (${a.status})`}
                          className={cn("block truncate rounded-md border px-1.5 py-1 text-[11px] font-bold leading-tight transition hover:brightness-95", STATUS_STYLE[a.status])}
                        >
                          {a.name.split(" ")[0]} · {a.vehicle.split(" ")[0]}
                        </Link>
                      ))}
                      {slotExists && !closed && cellAppts.length < config.capacity && (
                        <div className="px-1 text-[10px] font-semibold text-ink-faint">{config.capacity - cellAppts.length} free</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── MONTH ────────────────────────────────────────────── */
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-7 border-b border-line bg-paper">
              {WEEKDAYS_MON.map((w) => (
                <div key={w} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-ink-faint">{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: (parse(rangeEnd) - parse(rangeStart)) / DAY_MS + 1 }, (_, i) => {
                const d = fmt(parse(rangeStart) + i * DAY_MS);
                const dt = new Date(parse(d));
                const inMonth = dt.getUTCMonth() === monthMeta!.month;
                const wd = dt.getUTCDay();
                const closed = !schedule[wd].isOpen || blackoutMap.has(d);
                const isToday = d === today;
                const dayAppts = byDay.get(d) ?? [];
                const counts = dayAppts.reduce<Record<string, number>>((acc, a) => ((acc[a.status] = (acc[a.status] ?? 0) + 1), acc), {});
                return (
                  <Link
                    key={d}
                    href={`/admin/appointments?date=${d}`}
                    className={cn(
                      "min-h-[92px] border-b border-r border-[#EEF1F5] p-2 transition hover:bg-suzuki-blue/[.04]",
                      !inMonth && "opacity-35",
                      closed && "bg-paper/70",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "grid h-6 w-6 place-items-center rounded-full text-[12.5px] font-extrabold",
                        isToday ? "bg-suzuki-red text-white" : "text-ink",
                      )}>
                        {dt.getUTCDate()}
                      </span>
                      {closed && inMonth && <span className="text-[9.5px] font-bold uppercase text-suzuki-red/60">{blackoutMap.get(d) ? "Holiday" : "Closed"}</span>}
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {(["PENDING", "CONFIRMED", "CANCEL_REQUESTED", "COMPLETED", "NO_SHOW"] as const).map(
                        (s) =>
                          counts[s] ? (
                            <div key={s} className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
                              <span className={cn("h-2 w-2 flex-shrink-0 rounded-full", DOT[s])} />
                              {counts[s]} {STATUS_LABEL[s].toLowerCase()}
                            </div>
                          ) : null,
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
