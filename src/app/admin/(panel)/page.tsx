import { db } from "@/lib/db";
import { getSession } from "@/server/auth";
import { PageHeader, StatCard, StatusPill, LinkButton } from "@/components/admin/ui";
import { InquiriesIcon, ProductsIcon, NewsIcon, PlusIcon } from "@/components/admin/icons";
import { initials, formatDateShort } from "@/lib/utils";

const STATUS_TONE = { NEW: "red", IN_PROGRESS: "amber", RESOLVED: "green" } as const;
const STATUS_LABEL = { NEW: "New", IN_PROGRESS: "In Progress", RESOLVED: "Resolved" } as const;

function prettyModel(s: string): string {
  return s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default async function DashboardPage() {
  const session = await getSession();
  const [productCount, newsPublished, newInquiries, resolved, recent] = await Promise.all([
    db.product.count({ where: { deletedAt: null } }),
    db.newsPost.count({ where: { published: true } }),
    db.submission.count({ where: { status: "NEW" } }),
    db.submission.count({ where: { status: "RESOLVED" } }),
    db.submission.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const firstName = session?.name?.split(" ")[0] ?? "there";

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName}`} subtitle="Here's what's happening at the dealership today.">
        <LinkButton href="/admin/products/new"><PlusIcon className="h-4 w-4" /> Add Product</LinkButton>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New Inquiries" value={newInquiries} sub="Awaiting response" tone="red" icon={<InquiriesIcon />} />
        <StatCard label="Products Live" value={productCount} sub="In the lineup" tone="blue" icon={<ProductsIcon />} />
        <StatCard label="Published News" value={newsPublished} sub="Visible on site" tone="green" icon={<NewsIcon />} />
        <StatCard label="Resolved" value={resolved} sub="Closed inquiries" tone="amber" icon={<InquiriesIcon />} />
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-bold text-suzuki-dark">Recent Inquiries</h2>
          <LinkButton href="/admin/inquiries" variant="secondary" className="px-4 py-2 text-xs">View all</LinkButton>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-ink-muted">No inquiries yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-6 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-suzuki-blue/10 text-sm font-bold text-suzuki-blue">
                  {initials(s.name || "Visitor")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{s.name || "Website visitor"}</p>
                  <p className="truncate text-xs text-ink-muted">{cap(s.kind)}{s.productSlug ? ` · ${prettyModel(s.productSlug)}` : ""}</p>
                </div>
                <span className="hidden text-xs text-ink-faint sm:block">{formatDateShort(s.createdAt.toISOString())}</span>
                <StatusPill tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</StatusPill>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
