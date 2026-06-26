import { createLeadHandler } from "@/lib/leads";

// nodemailer requires the Node.js runtime (not Edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createLeadHandler("inquiry", ["name", "phone", "product"]);
