import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { can } from "@/server/rbac";
import { listInquiries } from "@/server/services/leadService";
import type { SubmissionStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED"];
const KINDS = ["contact", "inquiry", "appointment"];

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !can(session.role, "content.view")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const kindParam = url.searchParams.get("kind");
  const q = url.searchParams.get("q")?.trim() || undefined;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);

  const status = statusParam && STATUSES.includes(statusParam) ? (statusParam as SubmissionStatus) : undefined;
  const kind = kindParam && KINDS.includes(kindParam) ? kindParam : undefined;

  const data = await listInquiries({ status, kind, search: q, page });
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

  return NextResponse.json({ items, page: data.page, pages: data.pages, total: data.total, hasMore: data.page < data.pages });
}
