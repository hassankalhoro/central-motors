import type { AppointmentStatus } from "@prisma/client";
import { listAppointments, appointmentStats, dbDateToStr } from "@/server/services/bookingService";
import { getSession } from "@/server/auth";
import { can } from "@/server/rbac";
import AppointmentsClient from "./AppointmentsClient";

const STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED", "CANCEL_REQUESTED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: { status?: string; date?: string; q?: string; page?: string };
}) {
  const status = STATUSES.includes(searchParams.status as AppointmentStatus)
    ? (searchParams.status as AppointmentStatus)
    : undefined;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date ?? "") ? searchParams.date : undefined;

  const [data, stats, session] = await Promise.all([
    listAppointments({ status, date, search: searchParams.q || undefined, page: Number(searchParams.page) || 1 }),
    appointmentStats(),
    getSession(),
  ]);

  const rows = data.items.map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    phone: a.phone,
    email: a.email,
    vehicle: a.vehicle + (a.registration ? ` (${a.registration})` : ""),
    serviceType: a.serviceType,
    date: dbDateToStr(a.date),
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status,
    notes: a.notes,
    cancelReason: a.cancelReason,
    confirmedBy: a.confirmedBy?.name ?? null,
  }));

  return (
    <AppointmentsClient
      rows={rows}
      stats={stats}
      total={data.total}
      page={data.page}
      pages={data.pages}
      status={status ?? ""}
      date={date ?? ""}
      search={searchParams.q ?? ""}
      canManage={session ? can(session.role, "inquiry.manage") : false}
      canSchedule={session ? can(session.role, "settings.manage") : false}
    />
  );
}
