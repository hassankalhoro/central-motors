import { listInquiries, inquiryCounts } from "@/server/services/leadService";
import { getSession } from "@/server/auth";
import { can } from "@/server/rbac";
import InquiriesClient from "./InquiriesClient";

export default async function InquiriesPage() {
  const [counts, data, session] = await Promise.all([
    inquiryCounts(),
    listInquiries({ page: 1 }),
    getSession(),
  ]);

  const items = data.items.map((s) => ({
    id: s.id,
    kind: s.kind,
    name: s.name ?? "Website visitor",
    email: s.email ?? "",
    phone: s.phone ?? "",
    message: s.message ?? "",
    productSlug: s.productSlug ?? "",
    status: s.status,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <InquiriesClient
      initialItems={items}
      initialHasMore={data.page < data.pages}
      counts={counts}
      canManage={session ? can(session.role, "inquiry.manage") : false}
    />
  );
}
