import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/server/auth";
import { PageHeader, StatCard, StatusPill, LinkButton } from "@/components/admin/ui";
import { InquiriesIcon, CalendarIcon, PlusIcon } from "@/components/admin/icons";
import { initials, formatDateShort } from "@/lib/utils";

const STATUS_TONE = { NEW: "red", IN_PROGRESS: "amber", RESOLVED: "green" } as const;
const STATUS_LABEL = { NEW: "New", IN_PROGRESS: "In Progress", RESOLVED: "Resolved" } as const;
const APPT_TONE = { PENDING: "amber", CONFIRMED: "green" } as const;

function prettyModel(s: string): string {
  return s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** DATE value for "today" in Asia/Karachi (UTC+5, matches the booking engine). */
function todayPKT(): Date {
  const shifted = new Date(Date.now() + 5 * 60 * 60_000);
  return new Date(`${shifted.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

export default async function DashboardPage() {
  const session = await getSession();
  const now = Date.now();
  const weekAgo = new Date(now - 7 * 86_400_000);
  const twoWeeksAgo = new Date(now - 14 * 86_400_000);
  const today = todayPKT();

  const [
    leadsThisWeek,
    leadsLastWeek,
    newInquiries,
    pendingAppts,
    todayAppts,
    productCount,
    recent,
    popular,
    upcoming,
  ] = await Promise.all([
    db.submission.count({ where: { createdAt: { gte: weekAgo } } }),
    db.submission.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    db.submission.count({ where: { status: "NEW" } }),
    db.appointment.count({ where: { status: "PENDING" } }),
    db.appointment.count({ where: { date: today, status: { in: ["PENDING", "CONFIRMED"] } } }),
    db.product.count({ where: { deletedAt: null, published: true } }),
    db.submission.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.submission.groupBy({
      by: ["productSlug"],
      where: { productSlug: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { productSlug: "desc" } },
      take: 5,
    }),
    db.appointment.findMany({
      where: { date: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
    }),
  ]);

  const weekDelta = leadsLastWeek === 0 ? null : Math.round(((leadsThisWeek - leadsLastWeek) / leadsLastWeek) * 100);
  const weekSub =
    weekDelta === null
      ? `${leadsLastWeek} last week`
      : `${weekDelta >= 0 ? "▲" : "▼"} ${Math.abs(weekDelta)}% vs last week`;
  const maxPopular = Math.max(1, ...popular.map((p) => p._count._all));
  const firstName = session?.name?.split(" ")[0] ?? "there";

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName}`} subtitle="Here's what's happening at the dealership today.">
        <LinkButton href="/admin/products/new"><PlusIcon className="h-4 w-4" /> Add Product</LinkButton>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Leads this week" value={leadsThisWeek} sub={weekSub} tone="blue" icon={<InquiriesIcon />} />
        <StatCard label="New inquiries" value={newInquiries} sub="Awaiting response" tone="red" icon={<InquiriesIcon />} />
        <StatCard label="Bookings to confirm" value={pendingAppts} sub="Pending appointments" tone="amber" icon={<CalendarIcon />} />
        <StatCard label="Today's workshop" value={todayAppts} sub={`${productCount} models live on site`} tone="green" icon={<CalendarIcon />} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* recent inquiries */}
        <div className="rounded-2xl border border-line bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-lg font-bold text-suzuki-dark">Recent Inquiries</h2>
            <LinkButton href="/admin/inquiries" variant="secondary" className="px-4 py-2 text-xs">View all</LinkButton>
          </div>
          {recent.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-ink-muted">No inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-suzuki-blue/10 text-sm font-bold text-suzuki-blue">
                    {initials(s.name || "Visitor")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{s.name || "Website visitor"}</p>
                    <p className="truncate text-xs text-ink-muted">{cap(s.kind)}{s.productSlug ? ` · ${prettyModel(s.productSlug)}` : ""}</p>
                  </div>
                  <span className="hidden text-xs text-ink-faint sm:block">{formatDateShort(s.createdAt.toISOString())}</span>
                  <StatusPill tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</StatusPill>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          {/* popular cars */}
          <div className="rounded-2xl border border-line bg-white shadow-card">
            <div className="border-b border-line px-6 py-4">
              <h2 className="font-display text-lg font-bold text-suzuki-dark">Popular cars</h2>
              <p className="text-xs text-ink-muted">By customer inquiries, all time</p>
            </div>
            {popular.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-ink-muted">No model inquiries yet.</p>
            ) : (
              <ul className="space-y-3.5 px-6 py-5">
                {popular.map((p) => (
                  <li key={p.productSlug}>
                    <div className="mb-1 flex items-center justify-between text-[13px]">
                      <span className="font-bold text-ink">{prettyModel(p.productSlug ?? "")}</span>
                      <span className="font-semibold text-ink-muted">{p._count._all}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-paper">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-suzuki-red to-suzuki-red-dk"
                        style={{ width: `${Math.round((p._count._all / maxPopular) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* upcoming appointments */}
          <div className="rounded-2xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-display text-lg font-bold text-suzuki-dark">Upcoming bookings</h2>
              <LinkButton href="/admin/appointments" variant="secondary" className="px-4 py-2 text-xs">View all</LinkButton>
            </div>
            {upcoming.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-ink-muted">No upcoming bookings.</p>
            ) : (
              <ul className="divide-y divide-line">
                {upcoming.map((a) => (
                  <li key={a.id}>
                    <Link href={`/admin/appointments?q=${a.code}`} className="flex items-center gap-3 px-6 py-3 transition hover:bg-paper/60">
                      <div className="w-[52px] shrink-0 rounded-lg bg-paper px-2 py-1.5 text-center">
                        <div className="text-[10px] font-bold uppercase text-ink-faint">
                          {a.date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}
                        </div>
                        <div className="font-display text-[17px] font-extrabold leading-tight text-suzuki-dark">{a.date.getUTCDate()}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">{a.name}</p>
                        <p className="truncate text-xs text-ink-muted">{a.startTime} · {a.vehicle}</p>
                      </div>
                      <StatusPill tone={APPT_TONE[a.status as "PENDING" | "CONFIRMED"]}>{a.status === "PENDING" ? "Pending" : "Confirmed"}</StatusPill>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
