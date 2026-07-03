import { redirect } from "next/navigation";
import { getSchedule, getBookingConfig, listBlackouts, dbDateToStr } from "@/server/services/bookingService";
import { getSession } from "@/server/auth";
import { can } from "@/server/rbac";
import ScheduleClient from "./ScheduleClient";

export default async function SchedulePage() {
  const session = await getSession();
  if (!session || !can(session.role, "settings.manage")) redirect("/admin/appointments");

  const [schedule, config, blackouts] = await Promise.all([getSchedule(), getBookingConfig(), listBlackouts()]);

  return (
    <ScheduleClient
      schedule={schedule.map((d) => ({
        weekday: d.weekday,
        isOpen: d.isOpen,
        startTime: d.startTime,
        endTime: d.endTime,
        breakStart: d.breakStart ?? null,
        breakEnd: d.breakEnd ?? null,
      }))}
      config={config}
      blackouts={blackouts.map((b) => ({ id: b.id, date: dbDateToStr(b.date), reason: b.reason }))}
    />
  );
}
