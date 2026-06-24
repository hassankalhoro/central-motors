"use client";

import { useState } from "react";

type Album = { title: string; photos: string[] };

export default function MediaGallery({ albums }: { albums: Album[] }) {
  const [open, setOpen] = useState<Album | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((al, i) => (
          <button key={al.title} onClick={() => setOpen(al)} className="card card-lift overflow-hidden p-0 text-left">
            <div className="well-stripe relative flex h-[180px] items-center justify-center bg-gradient-to-br from-[#EEF2F8] to-[#E2E9F3]">
              <span aria-hidden className="font-display text-[80px] font-black italic text-[rgba(6,36,92,.08)]">{i + 1}</span>
              <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-[5px] text-[11px] font-bold text-suzuki-dark">{al.photos.length} photos</span>
            </div>
            <div className="px-[18px] py-4">
              <h3 className="font-display text-[16.5px] font-bold text-ink">{al.title}</h3>
              <div className="mt-1.5 text-[12.5px] font-bold text-suzuki-blue">View album →</div>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-[rgba(6,17,36,.82)] p-5 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <div className="max-h-[88vh] w-full max-w-[920px] overflow-auto rounded-[20px] bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-[18px] flex items-center justify-between">
              <h3 className="font-display text-xl font-extrabold text-ink">{open.title}</h3>
              <button onClick={() => setOpen(null)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-[10px] border border-line text-[17px] text-ink-soft">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {open.photos.map((p) => (
                <div key={p} className="well-stripe flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#EEF2F8] to-[#E2E9F3]">
                  <span aria-hidden className="font-display text-[38px] font-black italic text-[rgba(6,36,92,.1)]">S</span>
                  <span className="font-mono text-[10.5px] text-ink-faint">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
