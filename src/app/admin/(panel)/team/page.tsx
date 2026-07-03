import { listTeam } from "@/server/services/teamService";
import { getSession } from "@/server/auth";
import { can } from "@/server/rbac";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  const [members, session] = await Promise.all([listTeam(), getSession()]);
  return (
    <TeamClient
      rows={members.map((m) => ({
        id: m.id,
        name: m.name,
        title: m.title,
        group: m.group,
        phone: m.phone ?? "",
        photoUrl: m.photoUrl ?? "",
        published: m.published,
      }))}
      canEdit={session ? can(session.role, "content.edit") : false}
      canDelete={session ? can(session.role, "content.delete") : false}
    />
  );
}
