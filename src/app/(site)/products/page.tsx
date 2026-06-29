import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import ProductsBrowser from "@/components/site/ProductsBrowser";
import { getProducts, getBodyTypes } from "@/data/db";

export const metadata: Metadata = {
  title: "All Suzuki Models",
  description: "Browse the current Suzuki Central Motors lineup — Alto, WagonR, Cultus, Swift, Every and Fronx with starting prices.",
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
