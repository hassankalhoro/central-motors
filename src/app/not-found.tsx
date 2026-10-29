import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/* Global 404 fallback (for routes outside the public-site group). Self-contained
 * so it doesn't depend on the site header/footer. */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-line bg-white">
        <div className="container-site flex h-[72px] items-center">
          <Link href="/" aria-label="Central Motors home" className="flex items-center">
            <span className="font-display text-[24px] font-black tracking-tight text-ink uppercase">Central <span className="text-suzuki-red">Motors</span></span>
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="mx-auto max-w-[640px] text-center">
          <div className="font-display text-[120px] font-black leading-none text-line sm:text-[160px]">404</div>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-suzuki-dark sm:text-4xl">
            Page not found
          </h1>
          <p className="mx-auto mt-3 max-w-[440px] text-[15px] leading-relaxed text-ink-muted">
            The page you&apos;re looking for doesn&apos;t exist, was moved, or the link is broken.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-suzuki-red px-6 py-3.5 text-sm font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk"
            >
              Back to home
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-line bg-white px-6 py-3.5 text-sm font-bold text-suzuki-dark transition hover:border-suzuki-blue hover:text-suzuki-blue"
            >
              Browse Suzuki models
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-line bg-white px-6 py-3.5 text-sm font-bold text-suzuki-dark transition hover:border-suzuki-blue hover:text-suzuki-blue"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
