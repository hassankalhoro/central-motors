import { createLeadHandler } from "@/lib/leads";

export const POST = createLeadHandler("appointment", ["name", "phone", "model"]);
