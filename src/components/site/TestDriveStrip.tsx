"use client";

import { useState } from "react";

/* ────────────────────────────────────────────────────────────────
   Launch lead strip, a slim band under the hero that turns
   new-car curiosity into a test-drive lead in one step.
   Posts into the existing inquiry system (admin → Inquiries).
   ──────────────────────────────────────────────────────────────── */

export default function TestDriveStrip({ carName, carSlug }: { carName: string; carSlug: string }) {
  const [values, setValues] = useState({ name: "", phone: "", company: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (values.company) return setStatus("sent"); // honeypot
    if (!values.name.trim() || !values.phone.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          phone: values.phone.trim(),
          product: carSlug,
          message: `Test drive request for the ${carName} (homepage launch strip).`,
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-suzuki-red to-suzuki-red-dk">
      <div aria-hidden className="absolute inset-0 opacity-[.14] [background-image:radial-gradient(rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div aria-hidden className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

      <div className="container-site relative flex flex-col items-center gap-4 py-5 lg:flex-row lg:justify-between lg:gap-8">
        {/* pitch */}
        <div className="text-center lg:text-left">
          <span className="inline-block rounded-full bg-white px-2.5 py-0.5 text-[10.5px] font-black uppercase tracking-[0.14em] text-suzuki-red">
            New launch
          </span>
          <h2 className="mt-2 font-display text-[clamp(19px,2.4vw,24px)] font-extrabold leading-tight text-white">
            Be among the first to drive the all-new {carName}
          </h2>
          <p className="mt-1 text-[13px] font-medium text-white/80">Leave your number and our team will arrange your test drive.</p>
        </div>

        {/* quick form card */}
        {status === "sent" ? (
          <div className="flex w-full max-w-[440px] items-center gap-3.5 rounded-2xl bg-white p-5 shadow-lift lg:w-[420px]">
            <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5"><path d="M4 10.5l3.5 3.5L16 5.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div>
              <div className="font-display text-[15.5px] font-extrabold text-ink">Thank you, {values.name.trim().split(" ")[0]}!</div>
              <div className="mt-0.5 text-[13px] leading-snug text-ink-muted">Our team will call you shortly to arrange your {carName} test drive.</div>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="w-full max-w-[440px] rounded-2xl bg-white p-4 shadow-lift sm:p-5 lg:flex lg:w-auto lg:max-w-none lg:items-center lg:gap-2.5 lg:p-3">
            {/* honeypot */}
            <input
              type="text"
              name="company"
              value={values.company}
              onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
            />
            <div className="space-y-3 lg:flex lg:items-center lg:gap-2.5 lg:space-y-0">
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted lg:hidden">Full name</span>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint">
                    <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M5 19.5c1.2-3.4 4-4.8 7-4.8s5.8 1.4 7 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Ahmed Khan"
                    value={values.name}
                    onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-line bg-paper pl-11 pr-4 text-[14px] font-medium text-ink placeholder:text-ink-faint focus:border-suzuki-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-suzuki-red/15 lg:w-[190px]"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-muted lg:hidden">Mobile number</span>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint">
                    <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.24 11.4 11.4 0 003.6.58 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.58 3.6 1 1 0 01-.24 1l-2.24 2.2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="03xx xxxxxxx"
                    value={values.phone}
                    onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-line bg-paper pl-11 pr-4 text-[14px] font-medium text-ink placeholder:text-ink-faint focus:border-suzuki-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-suzuki-red/15 lg:w-[190px]"
                  />
                </div>
              </label>
            </div>
            {status === "error" && (
              <p className="mt-3 text-[12.5px] font-semibold text-suzuki-red">Something went wrong, please try again or call us directly.</p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-4 h-11 w-full rounded-xl bg-suzuki-red px-5 text-[14px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk disabled:opacity-60 lg:mt-0 lg:w-auto lg:flex-shrink-0 lg:whitespace-nowrap"
            >
              {status === "sending" ? "Booking…" : "Book My Test Drive"}
            </button>
            <p className="mt-2.5 text-center text-[11.5px] text-ink-faint lg:hidden">Takes 10 seconds. Our team calls during showroom hours.</p>
          </form>
        )}
      </div>
    </section>
  );
}
