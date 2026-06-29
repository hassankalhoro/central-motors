"use client";

import { useState } from "react";
import Image from "next/image";
import { PlusIcon, TrashIcon } from "./icons";
import { Spinner } from "./ui";

export type UploadedImage = { url: string; publicId?: string; alt?: string };

export default function ImageUploader({
  value,
  onChange,
  folder,
}: {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        if (folder) fd.append("folder", folder);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Upload failed.");
          continue;
        }
        uploaded.push({ url: data.url, publicId: data.publicId });
      }
      if (uploaded.length) onChange([...value, ...uploaded]);
    } finally {
      setBusy(false);
    }
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((img, i) => (
          <div key={img.url} className="relative h-24 w-32 overflow-hidden rounded-xl border border-line bg-paper">
            <Image src={img.url} alt={img.alt || "Product image"} fill sizes="128px" className="object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-suzuki-red shadow hover:bg-white"
              aria-label="Remove image"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-suzuki-dark/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                Cover
              </span>
            )}
          </div>
        ))}

        <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-ink-muted transition hover:border-suzuki-blue hover:text-suzuki-blue">
          {busy ? <Spinner className="h-5 w-5 text-suzuki-blue" /> : <PlusIcon className="h-5 w-5" />}
          <span className="text-xs font-semibold">{busy ? "Uploading…" : "Add image"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            disabled={busy}
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-suzuki-red">{error}</p>}
      <p className="mt-2 text-xs text-ink-faint">JPG, PNG or WebP · up to 5 MB · first image is the cover.</p>
    </div>
  );
}
