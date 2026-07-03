import { listJobs } from "@/server/services/jobService";
import { getSession } from "@/server/auth";
import { can } from "@/server/rbac";
import CareersClient from "./CareersClient";

export default async function AdminCareersPage() {
  const [jobs, session] = await Promise.all([listJobs(), getSession()]);
  return (
    <CareersClient
      rows={jobs.map((j) => ({
        id: j.id,
        slug: j.slug,
        title: j.title,
        location: j.location,
        type: j.type,
        description: j.description,
        published: j.published,
      }))}
      canEdit={session ? can(session.role, "content.edit") : false}
      canDelete={session ? can(session.role, "content.delete") : false}
    />
  );
}
