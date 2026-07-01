import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import SubmitForm, { type Field } from "@/components/site/SubmitForm";
import { getSettings } from "@/data/db";
import { telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about a model, a service or a part? Send us a message and our team will get back to you.",
};

const fields: Field[] = [
  { name: "firstName", label: "First name", required: true, placeholder: "Ahmed" },
  { name: "lastName", label: "Last name", required: true, placeholder: "Khan" },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "you@email.com" },
  { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "03XX-XXXXXXX" },
  { name: "method", label: "Preferred contact", type: "select", options: ["Phone call", "Email", "WhatsApp"] },
  { name: "intent", label: "I want to", type: "select", options: ["Buy a vehicle", "Sell or exchange", "Book a service", "General enquiry"] },
  { name: "message", label: "Message", type: "textarea", full: true, placeholder: "How can we help?" },
];

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero eyebrow="Get in touch" title="Contact us" subtitle="Questions about a model, a service or a part? Send us a message and our team will get back to you." />
      <section className="container-site grid grid-cols-1 items-start gap-[34px] py-[50px] pb-20 lg:grid-cols-[1.3fr_.9fr]">
        <div className="card p-[30px]">
          <SubmitForm
            endpoint="/api/contact"
            fields={fields}
            submitLabel="Send message"
            successTitle="Message received"
            successMessage="We've received your message and will be in touch shortly. Thank you for reaching out."
          />
        </div>
        <div>
          <div className="rounded-[18px] bg-suzuki-dark p-[26px] text-[#C3D2EA]">
            <h2 className="mb-4 font-display text-lg font-extrabold text-white">Visit our showroom</h2>
            <div className="text-sm leading-relaxed">{settings.address}</div>
            <div className="mt-4 text-sm"><span className="text-[#7E96BC]">UAN</span><br /><a href={telHref(settings.uan)} className="font-semibold text-white">{settings.uan}</a></div>
            <div className="mt-2.5 text-sm"><span className="text-[#7E96BC]">Tel</span><br /><span className="font-semibold text-white">{settings.tel}</span></div>
            <div className="mt-2.5 text-sm"><span className="text-[#7E96BC]">Fax</span><br /><span className="font-semibold text-white">{settings.fax}</span></div>
            <div className="mt-2.5 text-sm">
              <span className="text-[#7E96BC]">Email</span><br />
              <a href={`mailto:${settings.email}`} className="font-semibold text-white">{settings.email}</a>
              {settings.email2 && (<><br /><a href={`mailto:${settings.email2}`} className="font-semibold text-white">{settings.email2}</a></>)}
            </div>
            <div className="mt-2.5 text-sm"><span className="text-[#7E96BC]">Hours</span><br /><span className="font-semibold text-white">Mon–Sat · 9:00am – 7:00pm</span></div>
          </div>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
            target="_blank"
            rel="noreferrer"
            className="well-stripe mt-4 flex h-[200px] flex-col items-center justify-center gap-2 rounded-[18px] border border-line bg-gradient-to-br from-[#EEF2F8] to-[#E2E9F3]"
          >
            <span aria-hidden className="text-[30px]">📍</span>
            <span className="text-xs font-semibold text-ink-muted">G.T. Road, Soan, Rawalpindi, open in Maps</span>
          </a>
        </div>
      </section>
    </>
  );
}
