"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/admin/ui";

export default function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed.");
        return;
      }
      setDone(true);
      setTimeout(() => router.replace("/admin/login"), 1800);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="rounded-[10px] border border-suzuki-red/20 bg-suzuki-red/5 px-4 py-3 text-sm font-medium text-suzuki-red">
          This reset link is missing its token. Please request a new link.
        </div>
        <Link href="/admin/forgot-password" className="inline-block text-sm font-semibold text-suzuki-blue">Request a new link</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-[10px] border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
        Password updated. Redirecting you to sign in…
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-[10px] border border-suzuki-red/20 bg-suzuki-red/5 px-4 py-3 text-sm font-medium text-suzuki-red">{error}</div>
      )}
      <div>
        <label className="flabel" htmlFor="password">New password</label>
        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="field" autoComplete="new-password" />
      </div>
      <div>
        <label className="flabel" htmlFor="confirm">Confirm password</label>
        <input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field" autoComplete="new-password" />
      </div>
      <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-suzuki-red py-3.5 text-sm font-bold text-white shadow-cta transition hover:bg-suzuki-red-dk disabled:opacity-60">
        {loading && <Spinner />}
        {loading ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}
