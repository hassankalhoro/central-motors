"use client";

import Link from "next/link";
import { useState } from "react";
import { Spinner } from "@/components/admin/ui";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [noAccount, setNoAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      if (data.found) setSent(true);
      else setNoAccount(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (noAccount) {
    return (
      <div className="space-y-4">
        <div className="rounded-[10px] border border-suzuki-red/20 bg-suzuki-red/5 px-4 py-3 text-sm font-medium text-suzuki-red">
          You don&apos;t have an account with <strong>{email}</strong>. Please contact the administration to get access.
        </div>
        <button
          onClick={() => { setNoAccount(false); setEmail(""); }}
          className="text-sm font-semibold text-suzuki-blue"
        >
          ← Try another email
        </button>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="rounded-[10px] border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          A password-reset link has been sent to <strong>{email}</strong>. Check the inbox (and spam). The link is
          valid for 1 hour.
        </div>
        <Link href="/admin/login" className="inline-block text-sm font-semibold text-suzuki-blue">← Back to sign in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-[10px] border border-suzuki-red/20 bg-suzuki-red/5 px-4 py-3 text-sm font-medium text-suzuki-red">{error}</div>
      )}
      <div>
        <label className="flabel" htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@scm.com.pk" className="field" autoComplete="email" />
      </div>
      <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-suzuki-red py-3.5 text-sm font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk disabled:opacity-60">
        {loading && <Spinner />}
        {loading ? "Sending…" : "Send reset link"}
      </button>
      <Link href="/admin/login" className="inline-block text-sm font-semibold text-suzuki-blue">← Back to sign in</Link>
    </form>
  );
}
