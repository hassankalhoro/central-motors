import type { Metadata } from "next";
import ServiceDetail from "@/components/site/ServiceDetail";
import { bodyShopServices } from "@/data";

export const metadata: Metadata = {
  title: "Paint & Body Shop",
  description:
    "Our Suzuki paint & body shop, collision repair, denting, colour-matched painting, frame straightening and insurance claims, restoring your car to factory condition.",
};

const SECTIONS = [
  { heading: "Colour-matched paint booth", body: "A dust-free, baked spray booth with computerised paint matching for a flawless, factory-perfect finish." },
  { heading: "Genuine panels & parts", body: "Original Suzuki panels and components that fit precisely and protect your car's safety and resale value." },
  { heading: "Restored to factory standard", body: "Structural work on precision jigs, so your vehicle leaves looking, and driving, exactly like it did new." },
];

const STATS = [
  { num: "42+", label: "Years of body repairs" },
  { num: "OEM", label: "Genuine Suzuki panels" },
  { num: "100%", label: "Colour-matched paint" },
  { num: "1:1", label: "Factory-standard finish" },
];

export default function PaintBodyShopPage() {
  return (
    <ServiceDetail
      eyebrow="After-Sales · Body Shop"
      title="Paint & Body Shop"
      intro="From a car-park scuff to major collision damage, our body shop restores your Suzuki to its original condition, appearance and safety alike. We handle the repair and the insurance paperwork, so getting back on the road is simple."
      icon="bodyshop"
      image="/images/aftersales/body-shop.jpg"
      imageAlt="Car panel being spray-painted in our body shop booth"
      tone="red"
      chips={["Colour-matched paint", "Genuine panels", "Insurance claims", "Factory finish"]}
      book={{ href: "/online-inquiry", label: "Get a repair estimate" }}
      callPhone="0315-8709624"
      stats={STATS}
      servicesHeading="Our complete body & paint services"
      servicesIntro="A wide range of body and paint work to keep your Suzuki looking pristine, carried out with genuine parts and a factory-matched finish."
      services={bodyShopServices}
      sections={SECTIONS}
      closing="Whether it's a minor touch-up or a full restoration, we take pride in returning your Suzuki looking, and feeling, brand new."
    />
  );
}
