import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[760px] px-5 py-[100px] text-center sm:px-8">
      <div className="font-display text-[90px] font-black leading-none text-line">404</div>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">Page not found</h1>
      <p className="mt-3 text-ink-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Back home</Link>
        <Link href="/products" className="btn-ghost">Browse models</Link>
      </div>
    </section>
  );
}
