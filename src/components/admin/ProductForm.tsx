"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/ui";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";
import { PlusIcon, TrashIcon } from "@/components/admin/icons";
import { saveProduct } from "@/app/admin/(panel)/products/actions";

type Variant = { name: string; price: string };
type Status = "IN_STOCK" | "COMING_SOON" | "DISCONTINUED";

export type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  tag: string;
  description: string;
  status: Status;
  featured: boolean;
  published: boolean;
  brochureUrl: string;
  variants: { name: string; price: number }[];
  features: string[];
  images: UploadedImage[];
};

export default function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: ProductFormData;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [tag, setTag] = useState(product?.tag ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [status, setStatus] = useState<Status>(product?.status ?? "IN_STOCK");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [published, setPublished] = useState(product?.published ?? true);
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants.map((v) => ({ name: v.name, price: String(v.price) })) ?? [{ name: "", price: "" }],
  );
  const [features, setFeatures] = useState<string[]>(product?.features.length ? product.features : [""]);
  const [images, setImages] = useState<UploadedImage[]>(product?.images ?? []);

  function setVariant(i: number, patch: Partial<Variant>) {
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      id: product?.id,
      name,
      slug,
      categoryId,
      tag,
      description,
      status,
      featured,
      published,
      brochureUrl: product?.brochureUrl ?? "",
      variants: variants
        .filter((v) => v.name.trim())
        .map((v) => ({ name: v.name.trim(), price: Number(v.price) || 0 })),
      features: features.map((f) => f.trim()).filter(Boolean),
      images: images.map((img) => ({ url: img.url, publicId: img.publicId, alt: img.alt })),
    };
    start(async () => {
      const res = await saveProduct(input);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      {error && (
        <div className="rounded-[10px] border border-suzuki-red/20 bg-suzuki-red/5 px-4 py-3 text-sm font-medium text-suzuki-red">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-bold text-suzuki-dark">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flabel">Model name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field" required />
          </div>
          <div>
            <label className="flabel">Slug <span className="text-ink-faint">(optional)</span></label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" className="field" />
          </div>
          <div>
            <label className="flabel">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="field" required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flabel">Body type / tag</label>
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Hatchback, SUV, Van…" className="field" />
          </div>
          <div className="sm:col-span-2">
            <label className="flabel">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="field resize-none" />
          </div>
          <div>
            <label className="flabel">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="field">
              <option value="IN_STOCK">In Stock</option>
              <option value="COMING_SOON">Coming Soon</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
          </div>
          <div className="flex items-end gap-6 pb-1">
            <label className="flex items-center gap-2 text-sm font-medium text-ink-soft">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-line text-suzuki-red focus:ring-suzuki-red" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-soft">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-line text-suzuki-red focus:ring-suzuki-red" />
              Published
            </label>
          </div>
        </div>
      </section>

      {/* Variants */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-suzuki-dark">Variants & pricing</h2>
          <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => setVariants((v) => [...v, { name: "", price: "" }])}>
            <PlusIcon className="h-4 w-4" /> Add variant
          </Button>
        </div>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="flex gap-3">
              <input value={v.name} onChange={(e) => setVariant(i, { name: e.target.value })} placeholder="Variant (e.g. GLX)" className="field flex-1" />
              <input value={v.price} onChange={(e) => setVariant(i, { price: e.target.value })} placeholder="Price (PKR)" inputMode="numeric" className="field w-44" />
              <button type="button" onClick={() => setVariants((vs) => vs.filter((_, idx) => idx !== i))} className="px-2 text-suzuki-red hover:text-suzuki-red-dk" aria-label="Remove variant">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-suzuki-dark">Features</h2>
          <Button type="button" variant="secondary" className="px-3 py-2 text-xs" onClick={() => setFeatures((f) => [...f, ""])}>
            <PlusIcon className="h-4 w-4" /> Add feature
          </Button>
        </div>
        <div className="space-y-3">
          {features.map((f, i) => (
            <div key={i} className="flex gap-3">
              <input value={f} onChange={(e) => setFeatures((fs) => fs.map((x, idx) => (idx === i ? e.target.value : x)))} placeholder="e.g. ABS with EBD" className="field flex-1" />
              <button type="button" onClick={() => setFeatures((fs) => fs.filter((_, idx) => idx !== i))} className="px-2 text-suzuki-red hover:text-suzuki-red-dk" aria-label="Remove feature">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Images */}
      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-bold text-suzuki-dark">Images</h2>
        <ImageUploader value={images} onChange={setImages} folder="suzuki-central-motors/products" />
      </section>

      <div className="flex gap-3">
        <Button type="submit" loading={pending}>{pending ? "Saving…" : product?.id ? "Save changes" : "Create product"}</Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/products")}>Cancel</Button>
      </div>
    </form>
  );
}
