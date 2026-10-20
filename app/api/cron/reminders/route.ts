import { site } from "@/config/site";
import { sendEmail } from "@/features/email/send";
import { reminderEmail } from "@/features/email/templates";
import { db, rpc } from "@/lib/db";
import { backendEnabled, emailEnabled } from "@/lib/env";
import { ljMonth } from "@/lib/time";

// Runs once a day (see vercel.json). Every active subscription that still has an unbooked
// visit this month gets one e-mail with a link to choose an appointment.

export const dynamic = "force-dynamic";

type Due = { subscription_id: string; customer_id: string; vehicle_id: string; email: string; full_name: string; nickname: string; month: string };

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("unauthorized", { status: 401 });
  }
  if (!backendEnabled || !emailEnabled) return Response.json({ skipped: "not configured" });

  const due = await rpc<Due[]>("mormo_due_reminders", {});
  let sent = 0;
  for (const d of due) {
    // The unique key makes this "at most once per subscription per month", even if the job runs twice.
    const { error } = await db().from("mormo_email_log").insert({ dedupe_key: `reminder:${d.subscription_id}:${d.month}`, customer_id: d.customer_id, template: "reminder" });
    if (error) continue;
    const ok = await sendEmail(d.email, reminderEmail(d.full_name, d.nickname, ljMonth(d.month), `${site.url}/racun/vozilo/${d.vehicle_id}/termin`));
    if (ok) sent++;
    else await db().from("mormo_email_log").delete().eq("dedupe_key", `reminder:${d.subscription_id}:${d.month}`); // try again tomorrow
  }
  return Response.json({ due: due.length, sent });
}
