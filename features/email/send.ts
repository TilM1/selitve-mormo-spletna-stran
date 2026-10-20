import "server-only";
import { emailEnabled } from "@/lib/env";

export type Email = { subject: string; html: string };

// The only place that talks to the e-mail provider (Resend). Swap providers by editing this file.
// A failed e-mail never breaks the action that triggered it.
export async function sendEmail(to: string, email: Email): Promise<boolean> {
  if (!emailEnabled) {
    console.warn(`[email] not configured, skipped "${email.subject}"`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject: email.subject, html: email.html }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[email] provider answered", res.status);
    return res.ok;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}
