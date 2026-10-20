"use server";

import { deliverLead } from "./deliver";
import { parseLead, type Lead, type LeadErrors } from "./schema";

export type LeadState =
  | { status: "idle" }
  | { status: "invalid"; errors: LeadErrors; values: Lead }
  | { status: "failed"; values: Lead }
  | { status: "sent" };

export async function submitLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  // Honeypot: real people never fill this hidden field.
  if (form.get("website")) return { status: "sent" };

  const { lead, errors } = parseLead(form);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors, values: lead };

  const ok = await deliverLead(lead);
  return ok ? { status: "sent" } : { status: "failed", values: lead };
}
