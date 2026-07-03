import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import ProductsBrowser from "@/components/site/ProductsBrowser";
import { getProducts, getBodyTypes } from "@/data/db";

export const metadata: Metadata = {
  title: "Suzuki Car Prices in Pakistan, All New Models",
  description:
    "Compare all new Suzuki car prices in Pakistan: Fronx, Swift, Cultus, Alto and Every. Official variants, specs and starting prices at Central Motors, authorised Suzuki dealer in Rawalpindi.",
  keywords: ["Suzuki car prices Pakistan", "new Suzuki models", "Suzuki Fronx price", "Suzuki Swift price", "Suzuki Alto price", "Suzuki Cultus price"],
  alternates: { canonical: "/products" },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, types] = await Promise.all([getProducts(), getBodyTypes()]);
  return (
    <>
      <PageHero
        eyebrow="Our lineup"
        title="All Suzuki models"
        subtitle="The current Suzuki passenger lineup. Prices shown are starting figures."
      />
      <div className="pt-10">
        <ProductsBrowser products={products} types={types} />
      </div>
    </>
  );
}
