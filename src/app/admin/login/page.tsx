import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getSession } from "@/server/auth";

export const metadata: Metadata = {
  title: "Sign in, Dealer Management Portal",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in → go to the dashboard.
  if (await getSession()) redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-suzuki-darker px-3.5 py-6 sm:px-6 sm:py-8">
      {/* ambience: glows + dot grid + giant watermark */}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-48 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(225,22,34,.22),transparent_65%)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -right-40 h-[520px] w-[520px] animate-glow rounded-full bg-[radial-gradient(circle,rgba(46,123,214,.2),transparent_65%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-6 select-none overflow-hidden text-center font-display text-[clamp(80px,16vw,220px)] font-black uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.05)]"
      >
        SUZUKI
      </div>

      {/* card */}
      <div className="relative grid w-full max-w-[920px] overflow-hidden rounded-[20px] bg-white sm:rounded-[26px] shadow-[0_30px_90px_rgba(0,0,0,.45)] lg:grid-cols-[1fr_1.1fr]">
        {/* brand panel: full-height on desktop, rich banner on mobile */}
        <aside className="relative flex flex-col justify-between gap-5 overflow-hidden bg-gradient-to-br from-suzuki-dark to-suzuki-darker p-5 text-white sm:p-9 lg:gap-6 lg:p-10">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(225,22,34,.32),transparent_65%)]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(46,123,214,.25),transparent_65%)]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-7 left-0 right-0 hidden select-none overflow-hidden text-center font-display font-black uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.07)] lg:block lg:text-[130px]"
          >
            SCM
          </div>

          <div className="relative flex items-center gap-3.5">
            <Image src="/brand/suzuki-mark.png" alt="Suzuki" width={606} height={606} priority className="h-9 w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,.35)] sm:h-11" />
            <div>
              <div className="font-display text-[14.5px] font-extrabold leading-tight sm:text-[15.5px]">Central Motors</div>
              <div className="mt-0.5 whitespace-nowrap text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#8FA7CC] sm:text-[10.5px] sm:tracking-[0.18em]">Dealer Management Portal</div>
            </div>
          </div>

          <div className="relative">
            <div className="h-[3px] w-12 rounded-full bg-suzuki-red sm:w-16" />
            <p className="mt-3 font-display text-[15px] font-extrabold leading-snug sm:text-[22px] lg:mt-4">
              Everything on the site, <br className="hidden lg:block" />managed from one place.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 lg:mt-4 lg:gap-2">
              {["Cars & pricing", "Bookings", "Leads", "News & careers"].map((chip) => (
                <span key={chip} className="rounded-full border border-white/15 bg-white/[.07] px-2.5 py-1 text-[10px] font-bold text-[#C3D2EA] sm:px-3 sm:py-1.5 sm:text-[11px]">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* form panel */}
        <main className="relative px-5 py-7 sm:px-10 sm:py-12">
          <h1 className="font-display text-[21px] font-extrabold tracking-tight text-suzuki-dark sm:text-[28px]">
            Sign in to your dashboard
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted sm:mt-1.5 sm:text-[14.5px]">Welcome back! Please enter your details to continue.</p>
          <div className="mt-5 sm:mt-7">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-faint sm:mt-8 sm:text-[12px]">
            Authorised personnel only · Central Motors, Rawalpindi
          </p>
        </main>
      </div>
    </div>
  );
}
