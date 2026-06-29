import { requireSession } from "@/server/auth";
import AdminShell from "@/components/admin/AdminShell";

// Authed admin pages always render fresh (session + live data).
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession(); // redirects to /admin/login if missing
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }}>{children}</AdminShell>
  );
}
