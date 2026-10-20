// The shape of an inquiry and its validation. Used by the browser for instant feedback
// and by the server as the only check that counts.

import { normalizePhone } from "./phone";
import { inquiryServices } from "@/content/home";
import type { InquiryService } from "@/content/services";

export type InquiryPayload = {
  kind: "wizard" | "contact";
  service?: InquiryService;
  when?: "asap" | "date";
  date?: string; // YYYY-MM-DD
  items?: string[];
  itemsNote?: string;
  from?: string;
  fromId?: string;
  to?: string;
  toId?: string;
  name?: string;
  phone: string;
  email?: string;
  message?: string;
  page?: string;
  // anti-spam
  website?: string; // honeypot, must stay empty
  startedAt?: number; // ms timestamp when the form was first shown
};

export type FieldErrors = Partial<Record<"service" | "when" | "date" | "from" | "to" | "phone" | "email" | "form", string>>;

export const LIMITS = { short: 120, note: 1000, message: 2000, items: 40 };

export const serviceLabel = (id?: string) => inquiryServices.find((s) => s.id === id)?.label ?? "Povpraševanje";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Today's date in Ljubljana as YYYY-MM-DD. */
export function todayLjubljana(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Ljubljana" }).format(now);
}

export function validatePhone(phone: string): string | undefined {
  if (!phone.trim()) return "Vpišite telefonsko številko, da vas lahko pokličemo.";
  if (!normalizePhone(phone)) return "Preverite številko. Primer: 040 123 456 ali +386 40 123 456.";
}

export function validateEmail(email?: string): string | undefined {
  if (email && email.trim() && !EMAIL.test(email.trim())) return "Preverite e-poštni naslov.";
}

export function validateInquiry(p: InquiryPayload): FieldErrors {
  const e: FieldErrors = {};
  if (p.kind === "wizard") {
    if (!p.service || !inquiryServices.some((s) => s.id === p.service)) e.service = "Izberite storitev.";
    if (p.when !== "asap" && p.when !== "date") e.when = "Izberite, kdaj potrebujete pomoč.";
    if (p.when === "date") {
      if (!p.date || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) e.date = "Izberite datum.";
      else if (p.date < todayLjubljana()) e.date = "Izberite današnji ali poznejši datum.";
    }
    if (!p.from?.trim()) e.from = p.service === "odvoz" ? "Vpišite, od kod odpeljemo." : "Vpišite začetno lokacijo.";
    if (p.service !== "odvoz" && !p.to?.trim()) e.to = "Vpišite končno lokacijo.";
  }
  const phone = validatePhone(p.phone ?? "");
  if (phone) e.phone = phone;
  const email = validateEmail(p.email);
  if (email) e.email = email;
  return e;
}

const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : undefined);

/** Coerces untrusted JSON into a payload with bounded strings. */
export function sanitize(input: unknown): InquiryPayload | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const kind = o.kind === "contact" ? "contact" : o.kind === "wizard" ? "wizard" : null;
  if (!kind) return null;
  return {
    kind,
    service: inquiryServices.some((s) => s.id === o.service) ? (o.service as InquiryService) : undefined,
    when: o.when === "asap" || o.when === "date" ? o.when : undefined,
    date: clip(o.date, 10),
    items: Array.isArray(o.items)
      ? o.items.filter((x): x is string => typeof x === "string").slice(0, LIMITS.items).map((x) => x.slice(0, 80))
      : undefined,
    itemsNote: clip(o.itemsNote, LIMITS.note),
    from: clip(o.from, LIMITS.short),
    fromId: clip(o.fromId, 40),
    to: clip(o.to, LIMITS.short),
    toId: clip(o.toId, 40),
    name: clip(o.name, LIMITS.short),
    phone: clip(o.phone, 40) ?? "",
    email: clip(o.email, LIMITS.short),
    message: clip(o.message, LIMITS.message),
    page: clip(o.page, 200),
    website: clip(o.website, 200),
    startedAt: typeof o.startedAt === "number" ? o.startedAt : undefined,
  };
}
