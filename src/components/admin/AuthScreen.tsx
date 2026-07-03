import Image from "next/image";

/* Shared split-screen wrapper for admin auth pages (login / forgot / reset). */
export default function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative hidden w-[44%] flex-col items-center justify-center overflow-hidden bg-hero p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-b from-suzuki-dark/30 to-suzuki-darker/80" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <Image src="/brand/suzuki-wordmark-white.png" alt="Suzuki Central Motors" width={1912} height={556} className="h-auto w-[260px] drop-shadow" priority />
          <div className="mt-6 h-[3px] w-28 rounded-full bg-suzuki-red" />
          <p className="mt-5 text-lg font-semibold tracking-wide text-white/90">Dealer Management Portal</p>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight text-suzuki-dark">{title}</h1>
          <p className="mt-1.5 text-[15px] text-ink-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
