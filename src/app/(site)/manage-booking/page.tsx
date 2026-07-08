import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import ManageBooking from "@/components/site/ManageBooking";

export const metadata: Metadata = {
  title: "Manage Your Booking",
  description: "Request a cancellation or reschedule your workshop appointment using your booking reference. Changes are confirmed by our team.",
  alternates: { canonical: "/manage-booking" },
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default function ManageBookingPage({ searchParams }: { searchParams: { code?: string } }) {
  return (
    <>
      <PageHero
        eyebrow="Workshop"
        title="Manage Your Booking"
        subtitle="Request a cancellation or move your appointment in a few taps, our team confirms every change by email."
      />
      <section className="mx-auto max-w-[720px] px-5 py-[46px] pb-20 sm:px-8">
        <ManageBooking initialCode={searchParams.code ?? ""} />
      </section>
    </>
  );
}
