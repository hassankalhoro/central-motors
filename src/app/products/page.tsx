import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import ProductsBrowser from "@/components/site/ProductsBrowser";
import { getProducts, getBodyTypes } from "@/data";

export const metadata: Metadata = {
  title: "All Suzuki Models",
  description: "Browse the current Suzuki Central Motors lineup — Alto, WagonR, Cultus, Swift, Every and Fronx with starting prices.",
};

export default function ProductsPage() {
  const products = getProducts();
  const types = getBodyTypes();
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
