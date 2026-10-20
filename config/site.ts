// Company and contact details. Everything the site says about "who we are" comes from here.
// A value left as null is simply not shown (for example, no phone number means no "Pokliči nas").

export const site = {
  name: "Mormo.si",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mormo.si",
  tagline: "Avto je vedno čist.",
  description:
    "Mobilno ročno čiščenje avtomobila na domu ali v službi. Mesečna naročnina za Ljubljano z okolico, brez čakanja in vožnje v avtopralnico.",
  area: "Ljubljana z okolico",

  // TODO: fill in before launch.
  phone: null as string | null, // international format, e.g. "+38640123456"
  phoneDisplay: null as string | null, // as shown, e.g. "040 123 456"
  email: null as string | null,
  company: null as { legalName: string; address: string; taxId: string } | null,

  // Sections that wait for real content. Flip to true when ready.
  show: {
    reviews: false,
  },
};

export const nav = [
  { href: "/#kako-deluje", label: "Kako deluje" },
  { href: "/#paketi", label: "Paketi" },
  { href: "/#storitve", label: "Storitve" },
  { href: "/#za-podjetja", label: "Za podjetja" },
  { href: "/#faq", label: "FAQ" },
];

// Shown only in the mobile menu and the footer (the desktop bar has its own "Vpis" link).
export const accountLink = { href: "/vpis", label: "Vpis v račun" };

// The one place that decides where "sign up" buttons lead.
// Today: the enquiry form. Later: the subscription checkout. Only this function changes.
export function signupHref(params?: { plan?: string; size?: string; enquiry?: boolean }) {
  const q = new URLSearchParams();
  if (params?.enquiry) q.set("nacin", "povprasevanje"); // opens the plain enquiry form
  if (params?.plan) q.set("paket", params.plan);
  if (params?.size) q.set("velikost", params.size);
  const s = q.toString();
  return s ? `/prijava?${s}` : "/prijava";
}
