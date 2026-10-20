// Everything the site says about the business comes from here. Change a value once, it changes everywhere.
// A value left as null is not shown anywhere (no invented addresses, hours or company data).

export const site = {
  name: "Selitve Mormo",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://selitve-mormo.si").replace(/\/$/, ""),
  locale: "sl_SI",
  description:
    "Selitveni servis v Ljubljani in okolici. Selitve stanovanj, pisarn, prevoz pohištva in pomoč pri selitvi. Pokličite nas ali pošljite povpraševanje.",
  signature: "Mormo delat!",

  // Telephone: used for every call and SMS link on the site.
  phone: {
    e164: "+38664195960",
    display: "064 195 960",
  },

  // Shown publicly on the contact page and in the footer. Inquiries are emailed to INQUIRY_TO (see .env.example).
  email: null as string | null,

  // Service-area business: no public street address.
  areaServed: {
    primary: "Ljubljana z okolico",
    towns: ["Ljubljana", "Grosuplje", "Škofljica", "Domžale", "Kamnik", "Medvode", "Vrhnika", "Logatec", "Kranj", "Novo mesto"],
    note: "Selitve in prevozi tudi drugod po Sloveniji, mednarodni prevozi po dogovoru.",
  },

  // Legal entity that runs the site: footer, contact page, privacy policy (controller).
  company: {
    legalName: "Mormo, Luka Predalič s.p.",
    address: "Parmova ulica 53, 1000 Ljubljana",
    taxId: "SI74110845",
  } as null | {
    legalName: string;
    address: string;
    taxId: string;
    registrationNo?: string;
  },

  partner: {
    name: "LLogistika",
    nameWith: "LLogistiko", // "z LLogistiko"
    url: "https://www.llogistika.com",
  },

  social: [] as { label: string; url: string }[],
};

import { photos, type Photo } from "@/content/photos";

export const tel = `tel:${site.phone.e164}`;
export const sms = `sms:${site.phone.e164}`;

export const nav = [
  { href: "/#storitve", label: "Storitve" },
  { href: "/#kako-delamo", label: "Kako delamo" },
  { href: "/#ekipa", label: "Naša ekipa" },
  { href: "/#vozila", label: "Vozila" },
];

export const inquiryHref = "/#povprasevanje";

// Vehicles: real photos. Add verified dimensions or payload to `specs` only when confirmed.
export const vehicles: {
  name: string;
  type: string;
  suited: string[];
  photo?: Photo;
  specs?: { label: string; value: string }[];
}[] = [
  {
    name: "Volkswagen Crafter",
    type: "Kombi",
    suited: ["Selitev sobe ali manjšega stanovanja", "Posamezni kosi pohištva in bela tehnika", "Hitri prevozi po mestu"],
    photo: photos.crafter,
  },
  {
    name: "Iveco Daily",
    type: "Tovorno vozilo s ponjavo",
    suited: ["Selitve stanovanj in hiš", "Pisarniška oprema", "Material in blago na paletah, nakladanje z viličarjem"],
    photo: photos.iveco,
  },
];
