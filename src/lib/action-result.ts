/** Shared contract for Server Actions: success, or an error with optional field. */
export type ActionResult = { ok: true } | { ok: false; error: string; field?: string };
