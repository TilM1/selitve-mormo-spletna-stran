import "server-only";

import { site } from "@/config/site";
import { serviceLabel, type InquiryPayload } from "./inquiry";
import { normalizePhone } from "./phone";
import { describeDistance, distanceLabel, placeById } from "./places";

// Transactional email through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
// No SDK needed. Keys stay on the server.

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("sl-SI", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
};

export function buildInquiryEmail(p: InquiryPayload, receivedAt = new Date()) {
  const phone = normalizePhone(p.phone) ?? p.phone;
  const fromName = placeById(p.fromId)?.name ?? p.from ?? "";
  const toName = placeById(p.toId)?.name ?? p.to ?? "";
  const distance = describeDistance({ id: p.fromId, text: p.from ?? "" }, { id: p.toId, text: p.to ?? "" });

  const label = p.kind === "contact" ? "Sporočilo s kontaktnega obrazca" : serviceLabel(p.service);
  const subject = `Novo povpraševanje — ${site.name} — ${label}`;

  const rows: [string, string | undefined][] =
    p.kind === "contact"
      ? [
          ["Vrsta", "Kontaktni obrazec"],
          ["Sporočilo", p.message],
        ]
      : [
          ["Storitev", serviceLabel(p.service)],
          ["Želeni datum", p.when === "asap" ? "Čim prej" : p.date ? fmtDate(p.date) : undefined],
          ["Izbrani predmeti", p.items?.length ? p.items.join(", ") : undefined],
          ["Dodaten opis", p.itemsNote],
          ["Od kod", fromName],
          ["Kam", toName || (p.service === "odvoz" ? "Po dogovoru" : undefined)],
          ["Ocena razdalje", distanceLabel(distance) || undefined],
          ["Opombe", p.message],
        ];

  rows.push(
    ["Ime", p.name],
    ["Telefon", phone],
    ["E-pošta", p.email],
    ["Stran", p.page],
    ["Prejeto", new Intl.DateTimeFormat("sl-SI", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Ljubljana" }).format(receivedAt)],
  );

  const filled = rows.filter(([, v]) => v && v.trim());

  const text = [label, "", ...filled.map(([k, v]) => `${k}: ${v}`)].join("\n");

  const html = `<!doctype html><html lang="sl"><body style="margin:0;background:#EDEFF0;font-family:Arial,Helvetica,sans-serif;color:#111416">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDEFF0;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#111416;padding:20px 24px;color:#ffffff;font-size:18px;font-weight:bold">${esc(site.name)}<span style="color:#D1FE17"> · </span>${esc(label)}</td></tr>
<tr><td style="padding:20px 24px">
<p style="margin:0 0 16px;font-size:15px">Pokliči stranko: <a href="tel:${esc(phone)}" style="color:#111416;font-weight:bold;font-size:20px">${esc(phone)}</a></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.45">
${filled
  .map(
    ([k, v]) =>
      `<tr><td style="padding:8px 12px 8px 0;color:#5C656C;vertical-align:top;white-space:nowrap;border-top:1px solid #EDEFF0">${esc(k)}</td><td style="padding:8px 0;vertical-align:top;border-top:1px solid #EDEFF0;white-space:pre-wrap">${esc(v!)}</td></tr>`,
  )
  .join("\n")}
</table></td></tr></table></td></tr></table></body></html>`;

  return { subject, text, html };
}

export class EmailConfigError extends Error {}

export async function sendInquiryEmail(p: InquiryPayload) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM;
  const to = (process.env.INQUIRY_TO ?? "luka@mormo.si").split(",").map((s) => s.trim()).filter(Boolean);
  const { subject, text, html } = buildInquiryEmail(p);

  if (!key || !from) {
    // Local development without a key: log and report success only when explicitly asked to.
    if (process.env.NODE_ENV !== "production" && process.env.INQUIRY_DRY_RUN === "1") {
      console.info(`[inquiry dry run] to=${to.join(",")} subject=${subject}\n${text}`);
      return { id: "dry-run" };
    }
    throw new EmailConfigError("RESEND_API_KEY or INQUIRY_FROM is not set");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
      ...(p.email ? { reply_to: p.email } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as { id: string };
}
