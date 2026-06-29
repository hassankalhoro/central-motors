import Link from "next/link";
import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import MarkCard from "@/components/site/MarkCard";
import Reveal from "@/components/site/Reveal";
import { genuineCards } from "@/data";

export const metadata: Metadata = {
  title: "Suzuki Genuine Parts",
  description: "100% authentic Suzuki parts — engineered to fit, built to last. Protect your warranty, safety and resale value.",
};

export default function GenuinePartsPage() {
  return (
    <>
      <PageHero eyebrow="100% Authentic" title="Suzuki Genuine Parts" subtitle="Engineered to fit, built to last. Insist on genuine Suzuki parts to protect your warranty, safety and resale value." />
      <section className="container-site pt-[50px]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {genuineCards.map((g, idx) => (
            <Reveal key={g.title} delay={idx * 40}><MarkCard {...g} markBg="bg-suzuki-red" /></Reveal>
          ))}
        </div>
        <div className="mt-9 rounded-[18px] bg-suzuki-dark px-8 py-[34px] text-center">
          <h2 className="font-display text-2xl font-extrabold text-white">Looking for a specific part?</h2>
          <p className="mx-auto mb-5 mt-2.5 max-w-[480px] leading-relaxed text-[#C3D2EA]">Visit our parts counter or send an inquiry — we&apos;ll confirm availability and pricing.</p>
          <Link href="/online-inquiry" className="btn-light">Send a parts inquiry</Link>
        </div>
      </section>
      <div className="h-[70px]" />
    </>
  );
}
