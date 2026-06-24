import { createLeadHandler } from "@/lib/leads";

export const POST = createLeadHandler("contact", ["firstName", "lastName", "email", "phone"]);
