import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import ManageBooking from "@/components/site/ManageBooking";

export const metadata: Metadata = {
  title: "Manage Your Booking",
  description: "Cancel or reschedule your workshop appointment using your booking reference.",
};

export const dynamic = "force-dynamic";

export default function ManageBookingPage({ searchParams }: { searchParams: { code?: string } }) {
  return (
    <>
      <PageHero
        eyebrow="Workshop"
        title="Manage Your Booking"
        subtitle="Cancel or move your appointment in a few taps, all you need is your booking reference."
      />
      <section className="mx-auto max-w-[720px] px-5 py-[46px] pb-20 sm:px-8">
        <ManageBooking initialCode={searchParams.code ?? ""} />
      </section>
    </>
  );
}
