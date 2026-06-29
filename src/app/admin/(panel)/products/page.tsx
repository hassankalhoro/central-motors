import { listProducts } from "@/server/services/productService";
import { listCategories } from "@/server/services/categoryService";
import { getSession } from "@/server/auth";
import { can } from "@/server/rbac";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const categoryId = searchParams.category || "";
  const search = searchParams.q || "";

  const [data, cats, session] = await Promise.all([
    listProducts({ categoryId: categoryId || undefined, search: search || undefined, page }),
    listCategories(),
    getSession(),
  ]);

  const rows = data.items.map((p) => ({
    id: p.id,
    name: p.name,
    categoryName: p.category.name,
    startPrice: p.startPrice,
    status: p.status,
    image: p.images[0]?.url ?? null,
  }));

  return (
    <ProductsClient
      rows={rows}
      categories={cats.map((c) => ({ id: c.id, name: c.name }))}
      total={data.total}
      page={data.page}
      pages={data.pages}
      categoryId={categoryId}
      search={search}
      canEdit={session ? can(session.role, "content.edit") : false}
      canDelete={session ? can(session.role, "content.delete") : false}
    />
  );
}
