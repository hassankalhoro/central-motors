import "server-only";
import { cookies } from "next/headers";
import type { Lang } from "./i18n";

/** Current public-site language (cookie-driven, defaults to English). */
export function getLang(): Lang {
  return cookies().get("lang")?.value === "ur" ? "ur" : "en";
}
