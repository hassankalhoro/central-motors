/** Format an integer PKR amount as "PKR 4,460,160"; 0 → "Call for price". */
export function formatPKR(amount: number): string {
  return amount > 0 ? `PKR ${amount.toLocaleString("en-US")}` : "Call for price";
}

/** className combiner. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Up-to-2-letter initials for avatar fallbacks. */
export function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

/** Long date label, e.g. "10 July 2018". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Short date label, e.g. "10 Jul 2018". */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** tel: href from a display phone number. */
export function telHref(phone: string): string {
  return "tel:" + phone.replace(/[^0-9+]/g, "");
}

/** Format a bare local number ("51 4917112 119") as PTCL ("051 …") or an international phone ("+92 51 …"). */
export function formatTel(tel: string, telType: "ptcl" | "phone"): string {
  return telType === "phone" ? `+92 ${tel}` : `0${tel}`;
}
