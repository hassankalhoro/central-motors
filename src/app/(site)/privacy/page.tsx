import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import { getSettings } from "@/data/db";
import { telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Central Motors collects, uses, and protects the personal information you submit through our website forms.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "26 June 2026";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero
        eyebrow="Your data, protected"
        title="Privacy Policy"
        subtitle="How we collect, use, and safeguard the information you share with us."
      />
      <section className="container-site py-[50px] pb-20">
        <div className="mx-auto max-w-[820px]">
          <p className="text-sm text-ink-muted">Last updated: {UPDATED}</p>

          <Block title="1. Who we are">
            <p>
              {settings.siteName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is an authorised 7S Suzuki
              dealership in Rawalpindi, Pakistan. We are responsible for the personal information
              you provide through this website. Our address is {settings.address}.
            </p>
          </Block>

          <Block title="2. Information we collect">
            <p>We only collect what you choose to send us through our forms:</p>
            <ul className="ml-5 mt-2 list-disc space-y-1.5">
              <li><strong>Contact form:</strong> your name, email, phone number, preferred contact method, and your message.</li>
              <li><strong>Online inquiry form:</strong> the model you&apos;re interested in, your name, phone, email, address, and, if you provide them, your CNIC and NTN for booking and invoicing purposes.</li>
            </ul>
            <p className="mt-3">
              Providing your CNIC and NTN is optional. We ask for them only because they may be
              required to formalise a vehicle booking or tax invoice. Please do not submit them
              unless you intend to proceed with a purchase.
            </p>
          </Block>

          <Block title="3. How we use your information">
            <ul className="ml-5 list-disc space-y-1.5">
              <li>To respond to your message or sales inquiry.</li>
              <li>To prepare quotations, bookings, service appointments, and invoices you request.</li>
              <li>To contact you about the specific request you submitted.</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> sell your data, and we do not add you to marketing lists
              from these forms without your consent.
            </p>
          </Block>

          <Block title="4. Legal basis">
            <p>
              We process your information on the basis of your consent (given when you submit a
              form) and our legitimate interest in responding to enquiries and fulfilling the
              sales or service you ask for.
            </p>
          </Block>

          <Block title="5. Who we share it with">
            <p>
              Your submission is delivered to our internal sales and service staff and to
              Pak Suzuki Motor Company where required to process a booking, warranty, or service
              claim. We use a reputable email provider to deliver these notifications. We never
              share your information with unrelated third parties for their own marketing.
            </p>
          </Block>

          <Block title="6. How long we keep it">
            <p>
              We retain enquiry and booking information only as long as needed to serve you and to
              meet legal, tax, and warranty record-keeping obligations, after which it is securely
              deleted.
            </p>
          </Block>

          <Block title="7. How we protect it">
            <p>
              Form submissions are transmitted over encrypted (HTTPS) connections and email is
              sent over a secure (TLS) channel. Access to your information is limited to staff who
              need it to assist you.
            </p>
          </Block>

          <Block title="8. Your rights & unsubscribing">
            <p>
              You may ask us to access, correct, or delete the personal information you have given
              us, or to stop contacting you, at any time. Notification recipients can unsubscribe
              from internal alerts using the link in each email. To exercise any of these rights,
              contact us using the details below.
            </p>
          </Block>

          <Block title="9. Cookies">
            <p>
              This website uses only the cookies strictly necessary for it to function. We do not
              use advertising or cross-site tracking cookies.
            </p>
          </Block>

          <Block title="10. Contact us">
            <p>For any privacy request or question, reach us at:</p>
            <div className="mt-3 rounded-[14px] border border-line bg-paper p-5 text-[15px]">
              <div className="font-semibold text-ink">{settings.siteName}</div>
              <div className="mt-1 text-ink-muted">{settings.address}</div>
              <div className="mt-2">
                Email:{" "}
                <a href={`mailto:${settings.email}`} className="font-semibold text-suzuki-blue">{settings.email}</a>
              </div>
              <div className="mt-1">
                UAN:{" "}
                <a href={telHref(settings.uan)} className="font-semibold text-suzuki-blue">{settings.uan}</a>
              </div>
            </div>
          </Block>

          <p className="mt-8 text-sm text-ink-muted">
            We may update this policy from time to time. Material changes will be reflected by the
            &ldquo;last updated&rdquo; date above.
          </p>
        </div>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="font-display text-xl font-extrabold text-ink">{title}</h2>
      <div className="mt-2.5 space-y-2 text-[15px] leading-relaxed text-ink-muted">{children}</div>
    </div>
  );
}
