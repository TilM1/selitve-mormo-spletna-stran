// Single source of truth for plans, vehicle sizes, add-ons and prices.
// No component contains a price. Change a number here and it changes everywhere.
// All amounts are in whole euros.

export type SizeKey = "small" | "suv" | "xl";
export type PlanKey = "clean" | "always_clean" | "premium";

export const sizes: { key: SizeKey; label: string; short: string; surchargePerVisit: number }[] = [
  { key: "small", label: "Manjši avto / limuzina", short: "Manjši", surchargePerVisit: 0 },
  { key: "suv", label: "SUV / karavan", short: "SUV / karavan", surchargePerVisit: 15 },
  { key: "xl", label: "XL / 7 sedežev", short: "XL", surchargePerVisit: 25 },
];

export type Plan = {
  key: PlanKey;
  name: string;
  monthly: number;
  visits: number;
  promise: string;
  highlighted?: boolean;
  /** Extra lines shown on top of the shared feature list. Null = not confirmed yet. */
  extras: string[] | null;
};

export const plans: Plan[] = [
  {
    key: "clean",
    name: "CLEAN",
    monthly: 89,
    visits: 1,
    promise: "Enkrat na mesec pridemo in avto spravimo v red.",
    extras: [],
  },
  {
    key: "always_clean",
    name: "ALWAYS CLEAN",
    monthly: 169,
    visits: 2,
    promise: "Vsaka dva tedna. Avto sploh ne utegne postati umazan.",
    highlighted: true,
    extras: [],
  },
  {
    key: "premium",
    name: "PREMIUM",
    monthly: 239,
    visits: 2,
    promise: "Dva obiska na mesec in dodatne ugodnosti.",
    extras: null, // TODO: confirm PREMIUM benefits
  },
];

// Included in every visit, on every plan.
export const includedInEveryVisit = [
  "Ročno pranje zunanjosti",
  "Platišča",
  "Sesanje",
  "Armaturna plošča",
  "Notranja plastika",
  "Stekla znotraj in zunaj",
  "Pragovi vrat",
  "Osnovna ureditev notranjosti",
  "Zaključni detajli",
];

export const visitDuration = "60–90 minut";

// The first month is charged this instead of the plan's monthly price (it covers the first,
// thorough visit). Larger vehicles add their per-visit surcharge once.
export const initialReset = { from: 149 };

export function firstMonthPrice(size: SizeKey) {
  return initialReset.from + (sizes.find((s) => s.key === size)?.surchargePerVisit ?? 0);
}

export type Addon = { key: string; name: string; price: number; priceTo?: number };

export const addonGroups: { title: string; items: Addon[] }[] = [
  {
    title: "Notranjost",
    items: [
      { key: "seat_one", name: "Globinsko čiščenje, en sedež", price: 25 },
      { key: "seat_all", name: "Globinsko čiščenje, vsi sedeži", price: 79 },
      { key: "interior_full", name: "Celotno globinsko čiščenje notranjosti", price: 129, priceTo: 169 },
      { key: "leather", name: "Čiščenje in zaščita usnja", price: 39 },
      { key: "stains", name: "Trdovratni madeži", price: 20, priceTo: 40 },
    ],
  },
  {
    title: "Posebno",
    items: [
      { key: "pet_hair", name: "Živalska dlaka", price: 30 },
      { key: "child_seat", name: "Otroški sedež", price: 15 },
      { key: "boot", name: "Zelo umazan prtljažnik", price: 20 },
      { key: "ozone", name: "Ozoniranje", price: 29 },
    ],
  },
  {
    title: "Zaščita",
    items: [
      { key: "ceramic_spray", name: "Keramična zaščita v spreju", price: 39 },
      { key: "wax", name: "Vosek", price: 49 },
    ],
  },
];

// Occasion upgrades. Contents and prices are not confirmed, so only name and mood are shown.
export const occasions: { key: string; name: string; line: string; tone: "lime" | "ink" | "fog" | "water" }[] = [
  { key: "roadtrip", name: "Ready for Roadtrip", line: "Pred daljšo potjo.", tone: "lime" },
  { key: "date_night", name: "Date Night", line: "Ko mora biti vse na svojem mestu.", tone: "ink" },
  { key: "photoshoot", name: "Photoshoot Ready", line: "Ko bo avto pred objektivom.", tone: "fog" },
  { key: "family_reset", name: "Family Reset", line: "Po počitnicah, drobtinah in vsem ostalem.", tone: "water" },
];

// ---- helpers ----

export function monthlyPrice(plan: Plan, size: SizeKey) {
  const s = sizes.find((x) => x.key === size) ?? sizes[0];
  return plan.monthly + s.surchargePerVisit * plan.visits;
}

const NBSP = " ";

const num = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));

/** Slovenian price format: "89 €", "84,50 €", "129–169 €". */
export function eur(from: number, to?: number) {
  return to ? `${num(from)}–${num(to)}${NBSP}€` : `${num(from)}${NBSP}€`;
}

/** What one visit costs on a plan (monthly price divided by visits). */
export function perVisit(plan: Plan, size: SizeKey = "small") {
  return monthlyPrice(plan, size) / plan.visits;
}

/** The plan with the lowest price per visit. */
export const cheapestPerVisit = plans.reduce((a, b) => (perVisit(b) < perVisit(a) ? b : a));

export const lowestMonthly = Math.min(...plans.map((p) => p.monthly));
