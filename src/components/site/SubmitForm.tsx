"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select" | "date";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  /** column span on the 2-col grid */
  full?: boolean;
};

export default function SubmitForm({
  endpoint,
  fields,
  submitLabel,
  successTitle,
  successMessage,
  defaultValues = {},
  resetLabel = "Send another",
}: {
  endpoint: string;
  fields: Field[];
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  defaultValues?: Record<string, string>;
  resetLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = (name: string, v: string) => {
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: false }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // honeypot
    if (values["company"]) { setStatus("sent"); return; }
    const errs: Record<string, boolean> = {};
    fields.forEach((f) => { if (f.required && !String(values[f.name] ?? "").trim()) errs[f.name] = true; });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="px-2.5 py-7 text-center">
        <div className="mx-auto grid h-[62px] w-[62px] place-items-center rounded-full bg-[#E8F7EE] text-3xl text-[#1F8A5B]">✓</div>
        <h2 className="mt-[18px] font-display text-[22px] font-extrabold text-ink">{successTitle}</h2>
        <p className="mx-auto mt-2.5 max-w-[380px] text-[15px] leading-relaxed text-ink-muted">{successMessage}</p>
        <button onClick={() => { setValues({}); setStatus("idle"); }} className="mt-[22px] rounded-full border border-[#D8DEE8] bg-white px-[22px] py-2.5 font-bold text-suzuki-dark">
          {resetLabel}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.name} className={cn("block", f.full && "sm:col-span-2")}>
            <span className="flabel">{f.label}{f.required && " *"}</span>
            {f.type === "textarea" ? (
              <textarea className="field" rows={4} placeholder={f.placeholder} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />
            ) : f.type === "select" ? (
              <select className="field" value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}>
                <option value="">Select…</option>
                {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input className="field" type={f.type ?? "text"} placeholder={f.placeholder} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />
            )}
            {errors[f.name] && <span className="text-[11.5px] font-semibold text-suzuki-red">Required</span>}
          </label>
        ))}
      </div>
      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" value={values["company"] ?? ""} onChange={(e) => set("company", e.target.value)} className="hidden" aria-hidden />
      {status === "error" && (
        <p className="mt-3 rounded-lg bg-[#FDEEF0] px-4 py-3 text-sm font-medium text-suzuki-red">Something went wrong, please try again or call us.</p>
      )}
      <button type="submit" disabled={status === "sending"} className="mt-[18px] flex w-full items-center justify-center gap-2 rounded-xl bg-suzuki-red py-[15px] text-[15px] font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk disabled:opacity-70">
        {status === "sending" && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {status === "sending" ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
