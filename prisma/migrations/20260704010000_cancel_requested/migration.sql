-- Customer cancellations now need dealership approval before taking effect.
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'CANCEL_REQUESTED';
