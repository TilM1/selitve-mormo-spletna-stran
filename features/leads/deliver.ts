import "server-only";
import type { Lead } from "./schema";

// The only place that knows where a sign-up goes.
// Today: a webhook (n8n, Make, your own endpoint). Later this can write to the
// Supabase database instead, without touching the form or any page.
export async function deliverLead(lead: Lead): Promise<boolean> {
  const payload = { ...lead, source: "mormo.si/prijava", submittedAt: new Date().toISOString() };
  const url = process.env.LEAD_WEBHOOK_URL;

  if (!url) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[leads] LEAD_WEBHOOK_URL is not set. Lead received in development:", payload);
      return true;
    }
    console.error("[leads] LEAD_WEBHOOK_URL is not set. The lead was NOT delivered.");
    return false;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[leads] Webhook answered", res.status);
    return res.ok;
  } catch (err) {
    console.error("[leads] Webhook failed", err);
    return false;
  }
}
