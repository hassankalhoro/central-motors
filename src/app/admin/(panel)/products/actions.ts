"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth";
import { rolesFor } from "@/server/rbac";
import { writeAudit } from "@/server/audit";
import { productSchema } from "@/server/validators/product";
import { createProduct, updateProduct, deleteProduct, moveProduct } from "@/server/services/productService";
import { ServiceError } from "@/server/services/categoryService";
import type { ActionResult } from "@/lib/action-result";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
}

export async function saveProduct(input: unknown & { id?: string }): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("content.edit"));
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path.join(".") };
  }
  const id = (input as { id?: string }).id;
  try {
    const result = id ? await updateProduct(id, parsed.data) : await createProduct(parsed.data);
    await writeAudit({
      userId: session.sub,
      action: id ? "product.update" : "product.create",
      entity: `Product:${result.id}`,
    });
    revalidateAll();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message, field: e.field };
    throw e;
  }
}

export async function reorderProduct(id: string, dir: "up" | "down"): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("content.edit"));
  try {
    await moveProduct(id, dir);
    await writeAudit({ userId: session.sub, action: "product.reorder", entity: `Product:${id}` });
    revalidateAll();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}

export async function removeProduct(id: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("content.delete"));
  try {
    await deleteProduct(id);
    await writeAudit({ userId: session.sub, action: "product.delete", entity: `Product:${id}` });
    revalidateAll();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}
