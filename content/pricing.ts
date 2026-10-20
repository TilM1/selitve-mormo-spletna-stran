// Price list. Net prices only; the price with VAT is computed (VAT_RATE) so the two can never disagree.

export const VAT_RATE = 0.22;

export type PriceRow = {
  label: string;
  net?: number; // EUR without VAT
  unit?: "h" | "km" | "kg"; // shown as "/h"; omit for a flat amount
  text?: string; // instead of a number, e.g. "po urni postavki vozila"
};

export type PriceGroup = {
  id: string;
  title: string;
  basis: string;
  rows: PriceRow[];
  note: string;
};

export const priceGroups: PriceGroup[] = [
  {
    id: "selitve",
    title: "Selitve in pomoč pri selitvi",
    basis: "Obračun po urah dela",
    rows: [
      { label: "Kombi VW Crafter in dva delavca", net: 60, unit: "h" },
      { label: "Tovorno vozilo Iveco Daily in dva delavca", net: 70, unit: "h" },
      { label: "Prihod na lokacijo s kombijem", net: 30 },
      { label: "Prihod na lokacijo s tovornim vozilom", net: 40 },
    ],
    note: "Po isti urni postavki obračunamo tudi razstavljanje in sestavljanje pohištva ter pomoč pri pakiranju.",
  },
  {
    id: "odvoz",
    title: "Odvoz krame in kosovnih odpadkov",
    basis: "Obračun po teži",
    rows: [
      { label: "Kosovni odpadki", net: 0.47, unit: "kg" },
      { label: "Vožnja na deponijo", net: 20 },
      { label: "Iznos in nakladanje", text: "po urni postavki vozila" },
    ],
    note: "Gradbene odpadke, les in druge vrste odpadkov ovrednotimo po dogovoru.",
  },
  {
    id: "prevoz",
    title: "Prevoz blaga in materiala",
    basis: "Obračun po kilometrih",
    rows: [
      { label: "Kombi VW Crafter, do 1.300 kg", net: 1.1, unit: "km" },
      { label: "Iveco Daily, do 2.300 kg", net: 1.4, unit: "km" },
      { label: "Nočitev voznika pri poteh nad 420 km", net: 60 },
      { label: "Čakanje, prvih 20 minut brez plačila", net: 30, unit: "h" },
    ],
    note: "Kilometrina velja tudi za prevoze v tujino; cestnine in trajekte zaračunamo posebej. Za mednarodne selitve pripravimo ponudbo po meri.",
  },
];

export const priceExamples = [
  { title: "Manjša selitev s kombijem, 2 uri dela", parts: [{ net: 30, label: "prihod" }, { net: 60, times: 2, label: "ura" }] },
  { title: "Večja selitev s tovornim vozilom, 4 ure dela", parts: [{ net: 40, label: "prihod" }, { net: 70, times: 4, label: "ura" }] },
  { title: "Prevoz materiala s kombijem, 100 km", parts: [{ net: 1.1, times: 100, label: "km" }] },
] as { title: string; parts: { net: number; times?: number; label: string }[] }[];

const eur = new Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const eurWhole = new Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const withVat = (net: number) => Math.round(net * (1 + VAT_RATE) * 100) / 100;
/** 60 € for whole amounts, 1,10 € otherwise (never 1,1 €). */
export const fmt = (n: number) => (Number.isInteger(n) ? eurWhole : eur).format(n);
export const fmtExact = (n: number) => eur.format(n);
