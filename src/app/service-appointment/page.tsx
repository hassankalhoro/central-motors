import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import SubmitForm, { type Field } from "@/components/site/SubmitForm";
import { settings } from "@/data";

export const metadata: Metadata = {
  title: "Book a Service",
  description: "Schedule a workshop slot for your Suzuki at Central Motors, Rawalpindi.",
};

const fields: Field[] = [
  { name: "name", label: "Full name", required: true, placeholder: "Your name" },
  { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "03XX-XXXXXXX" },
  { name: "email", label: "Email", type: "email", placeholder: "you@email.com" },
  { name: "model", label: "Vehicle / model", required: true, placeholder: "e.g. Swift 2018" },
  { name: "registration", label: "Registration no.", placeholder: "RIK-XXX" },
  { name: "date", label: "Preferred date", type: "date" },
  { name: "serviceType", label: "Service type", type: "select", options: ["General service", "Oil change", "Body & paint", "Electrical / diagnostics", "Warranty claim"] },
  { name: "notes", label: "Notes", type: "textarea", full: true, placeholder: "Describe the issue or request" },
];

export default function ServiceAppointmentPage() {
  return (
    <>
      <PageHero
        eyebrow="Workshop"
        title="Book a Service"
        subtitle={`Schedule a workshop slot for your Suzuki. Service: ${settings.servicePhone} · Warranty: ${settings.warrantyPhone}`}
      />
      <section className="mx-auto max-w-[820px] px-5 py-[46px] pb-20 sm:px-8">
        <div className="card p-[30px]">
          <SubmitForm
            endpoint="/api/appointment"
            fields={fields}
            submitLabel="Request appointment"
            successTitle="Appointment requested"
            successMessage="We've received your booking request and will confirm your slot by phone shortly."
            resetLabel="Book another"
          />
        </div>
      </section>
    </>
  );
}
