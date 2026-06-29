import { listCategories } from "@/server/services/categoryService";
import { PageHeader } from "@/components/admin/ui";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const cats = await listCategories();
  return (
    <>
      <PageHeader title="Add Product" subtitle="Create a new vehicle listing" />
      <ProductForm categories={cats.map((c) => ({ id: c.id, name: c.name }))} />
    </>
  );
}
