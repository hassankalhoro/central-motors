import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import Reveal from "@/components/site/Reveal";
import ServicesExplorer from "@/components/site/ServicesExplorer";
import { serviceSections } from "@/data";

export const metadata: Metadata = {
  title: "Services",
  description: "Everything beyond the sale from Central Motors: exchange, certified used cars, extended warranty and car insurance, in Rawalpindi and Islamabad.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="After-sales" title="Services" subtitle="Everything beyond the sale, exchange, certified used cars, warranty and insurance." />
      <section className="mx-auto max-w-[1100px] px-5 py-14 sm:px-8">
        <Reveal>
          <p className="mb-7 max-w-[640px] text-[15px] leading-relaxed text-ink-muted">
            Tap any service to see what&apos;s included. Our team is here for the whole journey —
            from your first valuation to every service visit after.
          </p>
        </Reveal>
        <Reveal delay={60}>
          <ServicesExplorer services={serviceSections} />
        </Reveal>
      </section>
    </>
  );
}
