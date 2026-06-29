import { notFound } from "next/navigation";
import { getProduct } from "@/server/services/productService";
import { listCategories } from "@/server/services/categoryService";
import { PageHeader } from "@/components/admin/ui";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, cats] = await Promise.all([getProduct(params.id), listCategories()]);
  if (!product) notFound();

  return (
    <>
      <PageHeader title="Edit Product" subtitle={product.name} />
      <ProductForm
        categories={cats.map((c) => ({ id: c.id, name: c.name }))}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          tag: product.tag ?? "",
          description: product.description ?? "",
          status: product.status,
          featured: product.featured,
          published: product.published,
          brochureUrl: product.brochureUrl ?? "",
          variants: product.variants.map((v) => ({ name: v.name, price: v.price })),
          features: product.features.map((f) => f.label),
          images: product.images.map((i) => ({ url: i.url, publicId: i.publicId ?? undefined, alt: i.alt ?? undefined })),
        }}
      />
    </>
  );
}
