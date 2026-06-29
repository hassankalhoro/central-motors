import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getSession } from "@/server/auth";

export const metadata: Metadata = {
  title: "Sign in — Dealer Management Portal",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in → go to Settings (dashboard is hidden for now).
  if (await getSession()) redirect("/admin/settings");

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <aside className="relative hidden w-[44%] flex-col items-center justify-center overflow-hidden bg-hero p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-b from-suzuki-dark/30 to-suzuki-darker/80" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <Image src="/brand/logo.png" alt="Suzuki Central Motors" width={220} height={120} className="h-auto w-[200px] drop-shadow" priority />
          <div className="mt-6 h-[3px] w-28 rounded-full bg-suzuki-red" />
          <p className="mt-5 text-lg font-semibold tracking-wide text-white/90">Dealer Management Portal</p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight text-suzuki-dark">Sign in to your dashboard</h1>
          <p className="mt-1.5 text-[15px] text-ink-muted">Welcome back! Please enter your details to continue.</p>
          <div className="mt-8">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
