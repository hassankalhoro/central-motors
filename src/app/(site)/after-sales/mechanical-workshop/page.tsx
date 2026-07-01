import type { Metadata } from "next";
import ServiceDetail from "@/components/site/ServiceDetail";
import { workshopServices } from "@/data";

export const metadata: Metadata = {
  title: "Mechanical Workshop",
  description:
    "Our authorised Suzuki mechanical workshop, scheduled maintenance, engine diagnostics, AC, brakes, electrical and more, by certified technicians using genuine parts.",
};

const SECTIONS = [
  { heading: "Certified Suzuki technicians", body: "A trained team that works on Suzuki vehicles every day, kept current through continuous factory training." },
  { heading: "Factory-grade diagnostics", body: "Computerised tools that find faults accurately the first time, no guesswork, no repeat visits." },
  { heading: "Genuine parts & warranty", body: "Every job is finished with authentic Suzuki parts and backed by a warranty on the work carried out." },
];

const STATS = [
  { num: "13+", label: "Years serving Rawalpindi" },
  { num: "7S", label: "Complete dealership facility" },
  { num: "100%", label: "Genuine Suzuki parts" },
  { num: "1000s", label: "Cars serviced" },
];

export default function MechanicalWorkshopPage() {
  return (
    <ServiceDetail
      eyebrow="After-Sales · Workshop"
      title="Mechanical Workshop"
      intro="From your Suzuki's first running-in inspection to major repairs years later, our workshop handles the whole journey in-house, to factory standards, protecting its performance, safety and resale value."
      icon="workshop"
      image="/images/aftersales/workshop.jpg"
      imageAlt="Technician servicing a car engine in our workshop"
      tone="cool"
      chips={["Certified technicians", "Genuine parts", "Warranty on work", "Factory-grade tools"]}
      book={{ href: "/service-appointment", label: "Book an appointment" }}
      callPhone="0315-8709624"
      stats={STATS}
      servicesHeading="Our complete workshop services"
      servicesIntro="Everything your Suzuki needs under one roof, carried out by certified technicians using genuine Suzuki parts and ECSTAR oils."
      services={workshopServices}
      sections={SECTIONS}
      closing="Whether it's a routine service or a complex repair, our workshop treats every Suzuki with the same care, and hands it back running exactly as it should."
    />
  );
}
