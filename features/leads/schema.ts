import { plans, sizes } from "@/config/catalog";

// What the sign-up page collects.
// "booking" = the click-through flow ending in checkout; "enquiry" = the plain form with a message.
export type Lead = {
  kind: "booking" | "enquiry";
  size: string; // vehicle size key
  plan: string; // plan key
  date: string; // requested first visit, YYYY-MM-DD
  time: string; // requested first visit, HH:MM
  location: string; // doma | sluzba | drugje
  street: string;
  city: string;
  company: string;
  message: string;
  name: string;
  email: string;
  phone: string;
};

export type LeadErrors = Partial<Record<"name" | "email" | "phone" | "street" | "city" | "date", string>>;

export const locationOptions = [
  { value: "doma", label: "Doma" },
  { value: "sluzba", label: "V službi" },
  { value: "drugje", label: "Drugje" },
];

// Working hours offered when the database is not connected: every day, in half-hour steps.
export const hours = { open: 8, close: 18 };
export const booking = { leadDays: 2, horizonDays: 60 };

const str = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const oneOf = (v: string, allowed: string[]) => (allowed.includes(v) ? v : "");

export function parseLead(form: FormData): { lead: Lead; errors: LeadErrors } {
  const date = str(form.get("date"), 10);
  const time = str(form.get("time"), 5);
  const lead: Lead = {
    kind: str(form.get("kind"), 10) === "enquiry" ? "enquiry" : "booking",
    size: oneOf(str(form.get("size"), 20), sizes.map((s) => s.key)),
    plan: oneOf(str(form.get("plan"), 20), plans.map((p) => p.key)),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    time: /^\d{1,2}:\d{2}$/.test(time) ? time : "",
    location: oneOf(str(form.get("location"), 20), locationOptions.map((o) => o.value)),
    street: str(form.get("street"), 160),
    city: str(form.get("city"), 120),
    company: str(form.get("company"), 160),
    message: str(form.get("message"), 2000),
    name: str(form.get("name"), 120),
    email: str(form.get("email"), 160),
    phone: str(form.get("phone"), 40),
  };

  const errors: LeadErrors = {};
  if (lead.name.length < 2) errors.name = "Vpiši ime in priimek.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) errors.email = "Vpiši e-naslov, da ti lahko odgovorimo.";
  if (lead.phone && lead.phone.replace(/\D/g, "").length < 8) errors.phone = "Preveri telefonsko številko.";
  if (lead.kind === "booking") {
    if (lead.street.length < 3) errors.street = "Vpiši ulico in hišno številko.";
    if (lead.city.length < 2) errors.city = "Vpiši poštno številko in kraj.";
    if (!lead.date || !lead.time) errors.date = "Izberi datum in uro prvega termina.";
  }

  return { lead, errors };
}
