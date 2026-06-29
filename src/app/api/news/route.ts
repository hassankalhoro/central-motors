import { NextResponse } from "next/server";
import { getNewsPaged } from "@/data/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public, paginated published news (for the home slider + /news index load-more). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(12, Math.max(1, Number(url.searchParams.get("pageSize")) || 6));
  const data = await getNewsPaged(page, pageSize);
  return NextResponse.json({ items: data.items, page, hasMore: data.hasMore, total: data.total });
}
