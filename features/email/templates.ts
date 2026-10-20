import { site } from "@/config/site";
import type { Email } from "./send";

// Plain, single-button e-mails. Values that come from customers are escaped.

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const first = (fullName: string) => esc(fullName.trim().split(/\s+/)[0] ?? "");

function layout(heading: string, body: string, button?: { label: string; url: string }) {
  return `<!doctype html><html lang="sl"><body style="margin:0;background:#edeff0;font-family:Arial,Helvetica,sans-serif;color:#111416">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px">
<tr><td style="padding:32px">
<p style="margin:0 0 24px;font-size:18px;font-weight:bold">Mormo.si</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.2">${heading}</h1>
<div style="font-size:16px;line-height:1.5">${body}</div>
${button ? `<p style="margin:28px 0 0"><a href="${button.url}" style="display:inline-block;background:#d1fe17;color:#111416;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px">${button.label}</a></p>` : ""}
</td></tr></table>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#5c656c">${esc(site.company?.legalName ?? site.name)} · ${esc(site.area)}</p>
</td></tr></table></body></html>`;
}

export function welcomeEmail(fullName: string, appointment: string | null, paid: boolean): Email {
  return {
    subject: "Dobrodošel pri Mormo.si",
    html: layout(
      `Živjo, ${first(fullName)}.`,
      `<p>Tvoj račun je odprt.${appointment ? ` Prvi termin: <strong>${esc(appointment)}</strong>.` : ""}</p>
       <p>${paid ? "Termin je potrjen." : "Kontaktirali te bomo in termin potrdili."} V svojem računu vidiš svoje vozilo, paket in termine.</p>`,
      { label: "Odpri moj račun", url: `${site.url}/racun` },
    ),
  };
}

export function resetEmail(fullName: string, url: string): Email {
  return {
    subject: "Novo geslo za Mormo.si",
    html: layout(
      "Nastavi novo geslo",
      `<p>Živjo, ${first(fullName)}. Povezava velja eno uro in jo lahko uporabiš enkrat.</p>
       <p>Če novega gesla nisi zahteval, to sporočilo preprosto prezri.</p>`,
      { label: "Nastavi novo geslo", url },
    ),
  };
}

export function reminderEmail(fullName: string, nickname: string, month: string, url: string): Email {
  return {
    subject: `Čas je za tvoje pranje v mesecu ${month}`,
    html: layout(
      `Izberi termin za ${esc(nickname)}`,
      `<p>Živjo, ${first(fullName)}. Za ${esc(month)} še nimaš izbranega termina. Izbereš ga v pol minute.</p>`,
      { label: "Izberi termin", url },
    ),
  };
}

export function bookingEmail(fullName: string, nickname: string, appointment: string, moved: boolean): Email {
  return {
    subject: moved ? "Termin je prestavljen" : "Termin je rezerviran",
    html: layout(
      moved ? "Termin je prestavljen" : "Termin je rezerviran",
      `<p>Živjo, ${first(fullName)}. ${esc(nickname)}: <strong>${esc(appointment)}</strong>.</p>
       <p>Termin lahko prestaviš najkasneje 3 dni prej.</p>`,
      { label: "Odpri moj račun", url: `${site.url}/racun` },
    ),
  };
}

export function paymentFailedEmail(fullName: string): Email {
  return {
    subject: "Plačilo ni uspelo",
    html: layout(
      "Plačilo naročnine ni uspelo",
      `<p>Živjo, ${first(fullName)}. Zadnjega plačila nismo mogli izvesti. V svojem računu posodobi kartico, da termini ostanejo rezervirani.</p>`,
      { label: "Uredi plačilo", url: `${site.url}/racun/profil` },
    ),
  };
}
