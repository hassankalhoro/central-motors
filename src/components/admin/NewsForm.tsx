"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/ui";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { saveNews } from "@/app/admin/(panel)/news/actions";

export type NewsFormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  imageUrl: string;
  imagePublicId: string;
  published: boolean;
};

export default function NewsForm({ post }: { post?: NewsFormData }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [cover, setCover] = useState<UploadedImage[]>(
    post?.imageUrl ? [{ url: post.imageUrl, publicId: post.imagePublicId || undefined }] : [],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      id: post?.id,
      title,
      slug,
      excerpt,
      body,
      imageUrl: cover[0]?.url ?? "",
      imagePublicId: cover[0]?.publicId ?? "",
      published,
    };
    start(async () => {
      const res = await saveNews(input);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/news");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      {error && (
        <div className="rounded-[10px] border border-suzuki-red/20 bg-suzuki-red/5 px-4 py-3 text-sm font-medium text-suzuki-red">{error}</div>
      )}

      <section className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flabel">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="field" required />
          </div>
          <div>
            <label className="flabel">Slug <span className="text-ink-faint">(optional)</span></label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from title" className="field" />
          </div>
        </div>
        <div>
          <label className="flabel">Excerpt</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="field resize-none" />
        </div>
        <div>
          <label className="flabel">Cover image</label>
          <ImageUploader value={cover} onChange={(imgs) => setCover(imgs.slice(-1))} folder="suzuki-central-motors/news" />
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <label className="flabel mb-2 block">Body</label>
        <RichTextEditor value={body} onChange={setBody} />
      </section>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-soft">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded border-line text-suzuki-red focus:ring-suzuki-red" />
          Published (visible on the site)
        </label>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/news")}>Cancel</Button>
          <Button type="submit" loading={pending}>{pending ? "Saving…" : post?.id ? "Save changes" : "Create post"}</Button>
        </div>
      </div>
    </form>
  );
}
