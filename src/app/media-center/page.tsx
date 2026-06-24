import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import MediaGallery from "@/components/site/MediaGallery";
import { albums } from "@/data";

export const metadata: Metadata = {
  title: "Media Center",
  description: "Moments from our showroom, workshop, campaigns and customer events.",
};

export default function MediaCenterPage() {
  return (
    <>
      <PageHero eyebrow="Gallery" title="Media Center" subtitle="Moments from our showroom, workshop, campaigns and customer events. Tap an album to view." />
      <section className="container-site py-10 pb-20">
        <MediaGallery albums={albums} />
      </section>
    </>
  );
}
