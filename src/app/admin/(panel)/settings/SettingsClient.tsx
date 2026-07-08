"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Button } from "@/components/admin/ui";
import { saveSiteSettings, saveEmailSettings, sendTestEmail, changePassword } from "./actions";

type EmailCfg = {
  smtpProvider: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  fromName: string;
  fromEmail: string;
  notifyTo: string;
};

const PRESETS: Record<string, { host: string; port: number; secure: boolean }> = {
  titan: { host: "smtp.titan.email", port: 465, secure: true },
  gmail: { host: "smtp.gmail.com", port: 465, secure: true },
};

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <h2 className="font-display text-lg font-bold text-suzuki-dark">{title}</h2>
      {desc && <p className="mb-4 mt-0.5 text-sm text-ink-muted">{desc}</p>}
      <div className={desc ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="flabel">{label}</label>
      <input className="field" {...rest} />
    </div>
  );
}

function Note({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <p className={`text-sm font-medium ${msg.ok ? "text-green-600" : "text-suzuki-red"}`}>{msg.text}</p>
  );
}

export default function SettingsClient({
  site,
  email,
  hasPassword,
  canManage,
}: {
  site: Record<string, string>;
  email: EmailCfg;
  hasPassword: boolean;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  // Site
  const [s, setS] = useState(site);
  const [siteMsg, setSiteMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setS((p) => ({ ...p, [k]: e.target.value }));

  // Email
  const [e, setE] = useState(email);
  const [smtpPass, setSmtpPass] = useState("");
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const setEmail = (k: keyof EmailCfg, v: string | number | boolean) => setE((p) => ({ ...p, [k]: v }));
  function onProvider(provider: string) {
    setEmail("smtpProvider", provider);
    const preset = PRESETS[provider];
    if (preset) {
      setEmail("smtpHost", preset.host);
      setEmail("smtpPort", preset.port);
      setEmail("smtpSecure", preset.secure);
    }
  }

  // Password
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function saveSite(e2: React.FormEvent) {
    e2.preventDefault();
    setSiteMsg(null);
    start(async () => {
      const res = await saveSiteSettings(s);
      setSiteMsg(res.ok ? { ok: true, text: "Saved." } : { ok: false, text: res.error });
      if (res.ok) router.refresh();
    });
  }

  function emailPayload() {
    return { ...e, smtpPass };
  }
  function saveEmail(e2: React.FormEvent) {
    e2.preventDefault();
    setEmailMsg(null);
    start(async () => {
      const res = await saveEmailSettings(emailPayload());
      setEmailMsg(res.ok ? { ok: true, text: "Email settings saved." } : { ok: false, text: res.error });
      if (res.ok) {
        setSmtpPass("");
        router.refresh();
      }
    });
  }
  function testEmail() {
    setEmailMsg(null);
    start(async () => {
      const res = await sendTestEmail(emailPayload());
      setEmailMsg(res.ok ? { ok: true, text: "Test email sent, check the inbox." } : { ok: false, text: res.error });
    });
  }

  function savePw(e2: React.FormEvent) {
    e2.preventDefault();
    setPwMsg(null);
    start(async () => {
      const res = await changePassword(pw);
      setPwMsg(res.ok ? { ok: true, text: "Password changed." } : { ok: false, text: res.error });
      if (res.ok) setPw({ current: "", next: "", confirm: "" });
    });
  }

  const ro = !canManage;

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage site-wide configuration" />

      <div className="max-w-3xl space-y-6">
        {/* Dealership & contact */}
        <form onSubmit={saveSite}>
          <Card title="Dealership & contact" desc="Shown in the site header, footer and contact page.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Site name" value={s.siteName ?? ""} onChange={set("siteName")} disabled={ro} />
              <Field label="Tagline" value={s.tagline ?? ""} onChange={set("tagline")} disabled={ro} />
              <div className="sm:col-span-2"><Field label="Address" value={s.address ?? ""} onChange={set("address")} disabled={ro} /></div>
              <Field label="UAN" value={s.uan ?? ""} onChange={set("uan")} disabled={ro} />
              <Field label="Telephone (no prefix, e.g. 51 4917112 119)" value={s.tel ?? ""} onChange={set("tel")} disabled={ro} />
              <div>
                <label className="flabel">Telephone type</label>
                <select className="field" value={s.telType || "ptcl"} onChange={(ev) => setS((p) => ({ ...p, telType: ev.target.value }))} disabled={ro}>
                  <option value="ptcl">PTCL (local, 0…)</option>
                  <option value="phone">Phone (international, +92…)</option>
                </select>
              </div>
              <Field label="Fax" value={s.fax ?? ""} onChange={set("fax")} disabled={ro} />
              <Field label="Service phone" value={s.servicePhone ?? ""} onChange={set("servicePhone")} disabled={ro} />
              <Field label="Email" value={s.email ?? ""} onChange={set("email")} disabled={ro} />
              <Field label="Secondary email" value={s.email2 ?? ""} onChange={set("email2")} disabled={ro} />
              <Field label="Facebook" value={s.facebook ?? ""} onChange={set("facebook")} disabled={ro} />
              <Field label="Instagram" value={s.instagram ?? ""} onChange={set("instagram")} disabled={ro} />
              <Field label="YouTube" value={s.youtube ?? ""} onChange={set("youtube")} disabled={ro} />
            </div>
            {canManage && (
              <div className="mt-5 flex items-center gap-4">
                <Button type="submit" loading={pending}>Save changes</Button>
                <Note msg={siteMsg} />
              </div>
            )}
          </Card>
        </form>

        {/* Email / SMTP */}
        <form onSubmit={saveEmail}>
          <Card title="Email / SMTP" desc="Where form notifications come from and go to. Supports Titan and Gmail.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flabel">Provider</label>
                <select className="field" value={e.smtpProvider} onChange={(ev) => onProvider(ev.target.value)} disabled={ro}>
                  <option value="titan">Titan Email</option>
                  <option value="gmail">Gmail</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="flabel">Security</label>
                <select className="field" value={e.smtpSecure ? "ssl" : "starttls"} onChange={(ev) => { const ssl = ev.target.value === "ssl"; setEmail("smtpSecure", ssl); setEmail("smtpPort", ssl ? 465 : 587); }} disabled={ro}>
                  <option value="ssl">SSL (port 465)</option>
                  <option value="starttls">STARTTLS (port 587)</option>
                </select>
              </div>
              <Field label="SMTP host" value={e.smtpHost} onChange={(ev) => setEmail("smtpHost", ev.target.value)} disabled={ro} />
              <Field label="SMTP port" type="number" value={e.smtpPort} onChange={(ev) => setEmail("smtpPort", Number(ev.target.value))} disabled={ro} />
              <Field label="SMTP username (mailbox)" value={e.smtpUser} onChange={(ev) => setEmail("smtpUser", ev.target.value)} disabled={ro} />
              <Field label={hasPassword ? "SMTP password (leave blank to keep)" : "SMTP password"} type="password" placeholder={hasPassword ? "••••••••" : "App password for Gmail"} value={smtpPass} onChange={(ev) => setSmtpPass(ev.target.value)} disabled={ro} autoComplete="new-password" />
              <Field label="From name" value={e.fromName} onChange={(ev) => setEmail("fromName", ev.target.value)} disabled={ro} />
              <Field label="From email" type="email" value={e.fromEmail} onChange={(ev) => setEmail("fromEmail", ev.target.value)} disabled={ro} />
              <Field label="Send notifications to" type="email" value={e.notifyTo} onChange={(ev) => setEmail("notifyTo", ev.target.value)} disabled={ro} />
            </div>
            {e.smtpProvider === "gmail" && (
              <p className="mt-3 text-xs text-ink-muted">Gmail requires a 16-character <strong>App Password</strong> (Google Account → Security → 2-Step Verification → App passwords), not your normal password.</p>
            )}
            {canManage && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button type="submit" loading={pending}>Save email settings</Button>
                <Button type="button" variant="secondary" onClick={testEmail} loading={pending}>Send test email</Button>
                <Note msg={emailMsg} />
              </div>
            )}
          </Card>
        </form>

        {/* Change password */}
        <form onSubmit={savePw}>
          <Card title="Change password" desc="Update your own account password.">
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="flabel">Current</label><input type="password" className="field" value={pw.current} onChange={(ev) => setPw((p) => ({ ...p, current: ev.target.value }))} autoComplete="current-password" /></div>
              <div><label className="flabel">New</label><input type="password" className="field" value={pw.next} onChange={(ev) => setPw((p) => ({ ...p, next: ev.target.value }))} autoComplete="new-password" /></div>
              <div><label className="flabel">Confirm</label><input type="password" className="field" value={pw.confirm} onChange={(ev) => setPw((p) => ({ ...p, confirm: ev.target.value }))} autoComplete="new-password" /></div>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <Button type="submit" loading={pending}>Update password</Button>
              <Note msg={pwMsg} />
            </div>
          </Card>
        </form>
      </div>
    </>
  );
}
