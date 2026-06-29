import { listCategories } from "@/server/services/categoryService";
import { getSession } from "@/server/auth";
import { can } from "@/server/rbac";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const [categories, session] = await Promise.all([listCategories(), getSession()]);
  const rows = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    blurb: c.blurb ?? "",
    productCount: c.productCount,
  }));
  return (
    <CategoriesClient
      categories={rows}
      canEdit={session ? can(session.role, "content.edit") : false}
      canDelete={session ? can(session.role, "content.delete") : false}
    />
  );
}
