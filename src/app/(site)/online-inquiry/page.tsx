import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import SubmitForm, { type Field } from "@/components/site/SubmitForm";
import { getProductNames } from "@/data/db";

export const metadata: Metadata = {
  title: "Online Inquiry",
  description: "Tell us which Suzuki model you're interested in and our sales team will reach out with details and pricing.",
  alternates: { canonical: "/online-inquiry" },
};

export const dynamic = "force-dynamic";

export default async function OnlineInquiryPage({ searchParams }: { searchParams: { product?: string } }) {
  const names = await getProductNames();
  const preselect = searchParams.product && names.includes(searchParams.product) ? searchParams.product : "";

  const fields: Field[] = [
    { name: "product", label: "Interested model", type: "select", required: true, options: names, full: true },
    { name: "name", label: "Full name", required: true, placeholder: "Your name" },
    { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "03XX-XXXXXXX" },
    { name: "email", label: "Email", type: "email", placeholder: "you@email.com" },
    { name: "cnic", label: "CNIC", placeholder: "XXXXX-XXXXXXX-X" },
    { name: "ntn", label: "NTN (optional)", placeholder: "NTN" },
    { name: "address", label: "Address", placeholder: "City / area" },
    { name: "message", label: "Message", type: "textarea", full: true, placeholder: "Anything specific you'd like to know?" },
  ];

  return (
    <>
      <PageHero eyebrow="Sales" title="Online Inquiry" subtitle="Tell us which model you're interested in and our sales team will reach out with details and pricing." />
      <section className="mx-auto max-w-[820px] px-5 py-[46px] pb-20 sm:px-8">
        <div className="card p-[30px]">
          <SubmitForm
            endpoint="/api/inquiry"
            fields={fields}
            defaultValues={{ product: preselect }}
            submitLabel="Submit inquiry"
            successTitle="Inquiry submitted"
            successMessage="Thanks, we've received your inquiry and our sales team will contact you shortly."
            resetLabel="New inquiry"
          />
        </div>
      </section>
    </>
  );
}
