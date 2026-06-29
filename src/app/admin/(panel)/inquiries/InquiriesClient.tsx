"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, StatCard, StatusPill, Button } from "@/components/admin/ui";
import SlideOver from "@/components/admin/SlideOver";
import { InquiriesIcon, SearchIcon } from "@/components/admin/icons";
import { initials, formatDateShort } from "@/lib/utils";
import { setStatus as setStatusAction, reply as replyAction } from "./actions";
import type { SubmissionStatus } from "@prisma/client";

type Item = {
  id: string;
  kind: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  productSlug: string;
  status: SubmissionStatus;
  createdAt: string;
};

const TONE: Record<SubmissionStatus, "red" | "amber" | "green"> = { NEW: "red", IN_PROGRESS: "amber", RESOLVED: "green" };
const LABEL: Record<SubmissionStatus, string> = { NEW: "New", IN_PROGRESS: "In Progress", RESOLVED: "Resolved" };
const KINDS = [
  { v: "", l: "All types" },
  { v: "inquiry", l: "Inquiry" },
  { v: "contact", l: "Contact" },
  { v: "appointment", l: "Appointment" },
];

/** "wagon-r" → "Wagon R", "swift" → "Swift". */
function prettyModel(s: string): string {
  return s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}
function cap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export default function InquiriesClient({
  initialItems,
  initialHasMore,
  counts,
  canManage,
}: {
  initialItems: Item[];
  initialHasMore: boolean;
  counts: Record<SubmissionStatus, number>;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const [items, setItems] = useState<Item[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [status, setStatusFilter] = useState<"" | SubmissionStatus>("");
  const [kind, setKind] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selId, setSelId] = useState<string | null>(initialItems[0]?.id ?? null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [sendMsg, setSendMsg] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  const selected = items.find((i) => i.id === selId) ?? items[0] ?? null;
  const filtersActive = Boolean(status || kind || query);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (kind) params.set("kind", kind);
        if (query) params.set("q", query);
        params.set("page", String(pageNum));
        const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) return;
        setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
        setHasMore(data.hasMore);
        setPage(data.page);
        if (replace) setSelId(data.items[0]?.id ?? null);
      } finally {
        setLoading(false);
      }
    },
    [status, kind, query],
  );

  // Re-query from page 1 whenever a filter or the search term changes.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    fetchPage(1, true);
  }, [status, kind, query, fetchPage]);

  // Infinite scroll: load the next page when the sentinel scrolls into view.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) fetchPage(page + 1, false);
      },
      { root: scrollRef.current, rootMargin: "120px" },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [hasMore, loading, page, fetchPage]);

  function toggleStatus(s: SubmissionStatus) {
    setStatusFilter((prev) => (prev === s ? "" : s));
  }

  function changeStatus(id: string, s: SubmissionStatus) {
    start(async () => {
      const res = await setStatusAction(id, s);
      if (!res.ok) {
        setFeedback(res.error);
        return;
      }
      setItems((prev) => {
        const updated = prev.map((it) => (it.id === id ? { ...it, status: s } : it));
        return status ? updated.filter((it) => it.status === status) : updated;
      });
      router.refresh(); // refresh the stat-card counts
    });
  }

  function clearFilters() {
    setStatusFilter("");
    setKind("");
    setSearchInput("");
    setQuery("");
  }

  function openCompose(item: Item) {
    const model = item.productSlug ? prettyModel(item.productSlug) : "";
    setReplySubject(
      model
        ? `Re: your inquiry about the Suzuki ${model} — Suzuki Central Motors`
        : `Re: your ${item.kind} — Suzuki Central Motors`,
    );
    const lines = [`Dear ${item.name},`, ""];
    if (model) lines.push(`Thank you for your interest in the Suzuki ${model}.`, "");
    lines.push("", "", "— Suzuki Central Motors");
    setReplyBody(lines.join("\n"));
    setSendMsg(null);
    setComposeOpen(true);
  }

  function sendEmail() {
    if (!selected) return;
    setSendMsg(null);
    start(async () => {
      const res = await replyAction(selected.id, replyBody, replySubject);
      if (!res.ok) {
        setSendMsg(res.error);
        return;
      }
      setComposeOpen(false);
      setItems((prev) => {
        const updated = prev.map((it) => (it.id === selected.id ? { ...it, status: "IN_PROGRESS" as SubmissionStatus } : it));
        return status ? updated.filter((it) => it.status === status) : updated;
      });
      router.refresh();
    });
  }

  const statCard = (s: SubmissionStatus, label: string, sub: string, tone: "red" | "amber" | "green") => (
    <button onClick={() => toggleStatus(s)} className="text-left">
      <div className={`rounded-2xl transition ${status === s ? "ring-2 ring-suzuki-red ring-offset-2" : ""}`}>
        <StatCard label={label} value={counts[s]} sub={sub} tone={tone} icon={<InquiriesIcon />} />
      </div>
    </button>
  );

  return (
    <>
      <PageHeader title="Inquiries" subtitle="Manage and respond to customer inquiries" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCard("NEW", "New", "Unresponded inquiries", "red")}
        {statCard("IN_PROGRESS", "In Progress", "Ongoing conversations", "amber")}
        {statCard("RESOLVED", "Resolved", "Closed inquiries", "green")}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Master list */}
        <div className="flex max-h-[680px] flex-col rounded-2xl border border-line bg-white shadow-card">
          <div className="space-y-2 border-b border-line p-3">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, email or phone…"
                className="h-10 w-full rounded-lg border border-line bg-paper pl-9 pr-3 text-sm outline-none focus:border-suzuki-accent focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-suzuki-accent"
              >
                {KINDS.map((k) => (
                  <option key={k.v} value={k.v}>{k.l}</option>
                ))}
              </select>
              {filtersActive && (
                <button onClick={clearFilters} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-paper">
                  Clear
                </button>
              )}
            </div>
          </div>

          <div ref={scrollRef} data-testid="inquiry-scroll" className="flex-1 overflow-y-auto">
            {items.length === 0 && !loading ? (
              <p className="px-6 py-16 text-center text-sm text-ink-muted">No inquiries match your filters.</p>
            ) : (
              <ul className="divide-y divide-line">
                {items.map((it) => (
                  <li key={it.id}>
                    <button
                      onClick={() => setSelId(it.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${selected?.id === it.id ? "bg-suzuki-blue/5" : "hover:bg-paper"}`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-suzuki-blue/10 text-sm font-bold text-suzuki-blue">
                        {initials(it.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">{it.name}</span>
                        <span className="block truncate text-xs text-ink-muted">{it.productSlug ? prettyModel(it.productSlug) : cap(it.kind)}</span>
                      </span>
                      <span className="flex flex-col items-end gap-1">
                        <span className="text-xs text-ink-faint">{formatDateShort(it.createdAt)}</span>
                        {it.status === "NEW" && <span className="h-2 w-2 rounded-full bg-suzuki-red" />}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {/* Infinite-scroll sentinel + loading indicator */}
            <div ref={sentinelRef} />
            {loading && <p className="py-4 text-center text-xs text-ink-faint">Loading…</p>}
            {!hasMore && items.length > 0 && <p className="py-4 text-center text-xs text-ink-faint">End of list</p>}
          </div>
        </div>

        {/* Detail */}
        <div className="rounded-2xl border border-line bg-white shadow-card">
          {!selected ? (
            <p className="px-6 py-24 text-center text-sm text-ink-muted">Select an inquiry to view details.</p>
          ) : (
            <div className="flex h-full flex-col">
              <div className="border-b border-line p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-suzuki-blue/10 text-base font-bold text-suzuki-blue">
                      {initials(selected.name)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-suzuki-dark">{selected.name}</h3>
                        <StatusPill tone={TONE[selected.status]}>{LABEL[selected.status]}</StatusPill>
                      </div>
                      <p className="text-sm text-ink-muted">
                        {selected.phone && <span>{selected.phone}</span>}
                        {selected.phone && selected.email && <span> · </span>}
                        {selected.email && <span>{selected.email}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="hidden text-right text-xs text-ink-faint sm:block">
                    <p>ID: {selected.id.slice(-8).toUpperCase()}</p>
                    <p>Received: {formatDateShort(selected.createdAt)}</p>
                  </div>
                </div>
                {selected.productSlug && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-paper px-3 py-2 text-sm">
                    <span className="text-ink-muted">Interested in</span>
                    <span className="font-bold text-suzuki-dark">Suzuki {prettyModel(selected.productSlug)}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 p-6">
                <p className="mb-2 text-sm font-bold text-ink">Customer Message</p>
                <div className="rounded-2xl rounded-tl-sm bg-paper px-4 py-3 text-sm text-ink-soft">
                  {selected.message || <span className="text-ink-faint">No message provided.</span>}
                </div>

                {canManage && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="flabel">Status</label>
                      <select
                        value={selected.status}
                        onChange={(e) => changeStatus(selected.id, e.target.value as SubmissionStatus)}
                        disabled={pending}
                        className="field"
                      >
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>
                    {feedback && <p className="text-sm font-medium text-suzuki-red">{feedback}</p>}
                    {selected.email ? (
                      <Button onClick={() => openCompose(selected)}>Reply by Email</Button>
                    ) : (
                      <p className="text-sm text-ink-muted">No email on file — contact this customer by phone.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose email — sends via the dealership SMTP (caisol), no desktop mail app needed. */}
      <SlideOver
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Send Email to Customer"
        footer={
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={sendEmail} loading={pending} disabled={!replyBody.trim()}>
              {pending ? "Sending…" : "Send Email"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {sendMsg && (
            <div className="rounded-[10px] border border-suzuki-red/20 bg-suzuki-red/5 px-4 py-3 text-sm font-medium text-suzuki-red">
              {sendMsg}
            </div>
          )}
          <div>
            <label className="flabel">To</label>
            <input value={selected?.email ?? ""} readOnly className="field bg-paper text-ink-muted" />
          </div>
          <div>
            <label className="flabel">Subject</label>
            <input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} className="field" />
          </div>
          <div>
            <label className="flabel">Message</label>
            <textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={10} className="field resize-none" />
          </div>
          <p className="text-xs text-ink-faint">
            Sent from contact@caisol.com. The customer&apos;s reply will arrive in that mailbox.
          </p>
        </div>
      </SlideOver>
    </>
  );
}
