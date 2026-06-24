"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-[760px] px-5 py-[100px] text-center sm:px-8">
      <div className="font-display text-[70px] font-black leading-none text-line">!</div>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">Something went wrong</h1>
      <p className="mt-3 text-ink-muted">An unexpected error occurred. Please try again.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-ghost">Back home</Link>
      </div>
    </section>
  );
}
