import { getSettings, getEmailConfig } from "@/server/services/settingsService";
import { getSession } from "@/server/auth";
import { can } from "@/server/rbac";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const [site, email, session] = await Promise.all([getSettings(), getEmailConfig(), getSession()]);
  return (
    <SettingsClient
      site={site}
      email={{
        smtpProvider: email.provider,
        smtpHost: email.host,
        smtpPort: email.port,
        smtpSecure: email.secure,
        smtpUser: email.user,
        fromName: email.fromName,
        fromEmail: email.fromEmail,
        notifyTo: email.notifyTo,
      }}
      hasPassword={Boolean(email.pass)}
      canManage={session ? can(session.role, "settings.manage") : false}
    />
  );
}
