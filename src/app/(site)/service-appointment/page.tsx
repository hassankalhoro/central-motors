import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import BookingWizard from "@/components/site/BookingWizard";
import GoogleMap from "@/components/site/GoogleMap";
import { getSettings, getProductNames } from "@/data/db";

export const metadata: Metadata = {
  title: "Book a Service",
  description: "Pick a day and time slot for your Suzuki's workshop visit at Central Motors, Rawalpindi, serving Islamabad too.",
  keywords: ["Suzuki service booking", "Suzuki workshop appointment Rawalpindi", "Suzuki service Islamabad"],
  alternates: { canonical: "/service-appointment" },
};

export const dynamic = "force-dynamic";

export default async function ServiceAppointmentPage() {
  const [settings, models] = await Promise.all([getSettings(), getProductNames()]);
  return (
    <>
      <PageHero
        eyebrow="Workshop"
        title="Book a Service"
        subtitle={`Open 7 days a week, including Sundays. Pick a day and time that suits you, we'll confirm your slot right away. Service: ${settings.servicePhone} · Warranty: ${settings.warrantyPhone}`}
      />
      <section className="mx-auto max-w-[860px] px-5 py-[46px] sm:px-8">
        <BookingWizard models={models} />
      </section>

      {/* workshop location, so customers know exactly where to come */}
      <section className="mx-auto max-w-[860px] px-5 pb-20 pt-2 sm:px-8">
        <h2 className="font-display text-[17px] font-bold text-ink">Where to find the workshop</h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">Main G.T. Road, Soan Camp, Opposite Toyota Rawal, Rawalpindi. Please arrive 10 minutes before your slot.</p>
        <GoogleMap className="mt-4 h-[300px]" />
      </section>
    </>
  );
}
