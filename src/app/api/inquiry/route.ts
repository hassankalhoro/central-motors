import { createLeadHandler } from "@/lib/leads";

export const POST = createLeadHandler("inquiry", ["name", "phone", "product"]);
