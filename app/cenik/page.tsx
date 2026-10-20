import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "@phosphor-icons/react/ssr";
import { site } from "@/config/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CallLink } from "@/components/site/ContactLinks";
import { Faq, InquirySection } from "@/components/home/Sections";
import { PriceExamples, PriceTables } from "@/components/home/Pricing";
import { JsonLd } from "@/components/site/JsonLd";
import { faqSchema } from "@/lib/schema";

const title = "Cenik selitev in prevozov Ljubljana | Cena na uro in km";
const description =
  "Cenik selitev: kombi in dva delavca 60 €/h, tovorno vozilo in dva delavca 70 €/h. Prevoz blaga od 1,10 €/km, odvoz kosovnih odpadkov 0,47 €/kg. Cene brez in z DDV.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/cenik" },
  openGraph: { url: "/cenik", title, description },
};

const factors = [
  { t: "Čas dela", d: "Selitve obračunamo po urah. Na čas vplivajo količina stvari, nadstropje, dvigalo in pot od vrat do vozila." },
  { t: "Izbira vozila", d: "Kombi je cenejši na uro, tovorno vozilo pa pri večji selitvi prihrani kakšno vožnjo." },
  { t: "Razdalja", d: "Pri prevozu blaga štejejo prevoženi kilometri. Pri poteh nad 420 km obračunamo tudi nočitev voznika." },
  { t: "Dodatno delo", d: "Razstavljanje in sestavljanje pohištva ter pomoč pri pakiranju obračunamo po isti urni postavki." },
];

const faq = [
  {
    q: "Koliko stane selitev stanovanja v Ljubljani?",
    a: "Selitev obračunamo po urah dela ekipe z vozilom: 60 € na uro s kombijem ali 70 € na uro s tovornim vozilom, plus prihod na lokacijo 30 ali 40 €. Cene so brez DDV. Koliko ur traja vaša selitev, ocenimo, ko nam opišete, kaj selite.",
  },
  {
    q: "Ali so cene z DDV ali brez?",
    a: "V ceniku je najprej cena brez DDV, pod njo pa znesek z 22 % DDV.",
  },
  {
    q: "Kako se obračuna prevoz v tujino?",
    a: "Za prevoz blaga v tujino velja enaka kilometrina kot v Sloveniji, cestnine in trajekte zaračunamo posebej. Za mednarodne selitve pripravimo ponudbo po meri.",
  },
  {
    q: "Ali je povpraševanje obvezujoče?",
    a: "Ne. Povpraševanje vas ne obvezuje. Končno ceno potrdimo ob dogovoru za termin.",
  },
];

export default function PricingPage() {
  return (
    <>
      <header className="page-head">
        <div className="wrap">
          <Breadcrumbs items={[{ name: "Cenik", path: "/cenik" }]} />
          <h1 className="t-display mt-8 max-w-[16ch] text-[clamp(2.4rem,6vw,5.25rem)]">Koliko stane selitev?</h1>
          <p className="t-lead mt-6 max-w-[60ch] text-white/85">
            Selitev s kombijem in dvema delavcema stane 60 € na uro, s tovornim vozilom 70 € na uro, brez DDV. Prevoz blaga obračunamo po kilometrih, odvoz kosovnih odpadkov po teži. Spodaj je celoten cenik.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallLink place="cenik" className="btn btn-primary btn-lg">
              <Phone size={20} weight="fill" aria-hidden /> Pokličite nas
            </CallLink>
            <Link href="#povprasevanje" className="btn btn-ghost btn-lg">
              Pošljite povpraševanje
            </Link>
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="cenik-h">
        <div className="wrap">
          <h2 id="cenik-h" className="sr-only">
            Cenik
          </h2>
          <PriceTables />
          <div className="mt-10">
            <PriceExamples />
          </div>

          <h2 className="t-headline mt-20 text-[clamp(1.75rem,3.2vw,2.5rem)]">Kaj vpliva na končni znesek</h2>
          <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {factors.map((f) => (
              <div key={f.t} className="border-t-2 border-ink pt-5">
                <h3 className="t-title">{f.t}</h3>
                <p className="mt-2 text-steel">{f.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-steel">
            Fotografije večjih kosov lahko pošljete po SMS na {site.phone.display}, pa vam čas dela ocenimo natančneje.
          </p>
        </div>
      </section>

      <Faq items={faq} title="Vprašanja o ceni" />
      <InquirySection title="Pošljite povpraševanje" />
      <JsonLd data={faqSchema(faq)} />
    </>
  );
}
