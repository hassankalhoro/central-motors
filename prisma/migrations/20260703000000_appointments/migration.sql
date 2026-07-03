-- Workshop scheduling: weekly hours, holiday blackouts, and slot-based appointments.

CREATE TABLE "ScheduleDay" (
    "weekday" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '17:00',
    "breakStart" TEXT,
    "breakEnd" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScheduleDay_pkey" PRIMARY KEY ("weekday")
);

CREATE TABLE "BlackoutDate" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlackoutDate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BlackoutDate_date_key" ON "BlackoutDate"("date");

CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "vehicle" TEXT NOT NULL,
    "registration" TEXT,
    "serviceType" TEXT NOT NULL,
    "notes" TEXT,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "cancelReason" TEXT,
    "confirmedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Appointment_code_key" ON "Appointment"("code");
CREATE INDEX "Appointment_date_startTime_status_idx" ON "Appointment"("date", "startTime", "status");
CREATE INDEX "Appointment_status_date_idx" ON "Appointment"("status", "date");

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_confirmedById_fkey"
    FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
