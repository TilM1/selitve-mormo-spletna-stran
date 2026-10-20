import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "@phosphor-icons/react/ssr";
import { site } from "@/config/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CallLink } from "@/components/site/ContactLinks";
import { Faq, InquirySection } from "@/components/home/Sections";
import { JsonLd } from "@/components/site/JsonLd";
import { faqSchema } from "@/lib/schema";

// No price list is published until prices are confirmed by the business. This page answers
// "koliko stane selitev" honestly: what the price depends on and how to get a quote fast.

const title = "Cenik selitev in prevozov | Kako nastane cena";
const description =
  "Koliko stane selitev v Ljubljani? Kaj vpliva na ceno selitve in prevoza, katere podatke potrebujemo in kako hitro dobite ponudbo. Brez obveznosti.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/cenik" },
  openGraph: { url: "/cenik", title, description },
};

const factors = [
  { t: "Količina stvari", d: "Število večjih kosov pohištva in škatel določa, koliko ljudi in kakšno vozilo potrebujemo." },
  { t: "Dostop", d: "Nadstropje, dvigalo, širina stopnišča in razdalja od vrat do vozila na obeh naslovih." },
  { t: "Razdalja", d: "Pot med naslovoma. Pri prevozih zunaj Ljubljane in v tujino se upošteva tudi čas vožnje." },
  { t: "Dodatno delo", d: "Razstavljanje in sestavljanje pohištva, zaščita posebnih kosov, odvoz stvari, ki jih ne selite." },
  { t: "Termin", d: "Datum in ura selitve, na primer ob vikendu ali zunaj običajnega delovnega časa." },
  { t: "Vrsta tovora", d: "Pri prevozu blaga štejeta teža in način nakladanja, pri odvozu vrsta odpadkov." },
];

const faq = [
  {
    q: "Zakaj ne objavite fiksnih cen?",
    a: "Ker sta dve selitvi redko enaki. Enosobno stanovanje v pritličju in enako stanovanje v četrtem nadstropju brez dvigala pomenita zelo različno količino dela. Ponudbo zato pripravimo za vaš primer.",
  },
  {
    q: "Ali je povpraševanje obvezujoče?",
    a: "Ne. Povpraševanje in ponudba vas ne obvezujeta. Odločite se, ko ponudbo prejmete.",
  },
  {
    q: "Kako hitro dobim ponudbo?",
    a: "Odgovorimo v najkrajšem možnem času. Če ponudbo potrebujete takoj, nas pokličite.",
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
            Cena selitve je odvisna od količine stvari, dostopa na obeh naslovih, razdalje in dodatnega dela. Zato ne objavljamo enotnega cenika, ampak za vsako selitev ali prevoz pripravimo ponudbo. Brez obveznosti.
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

      <section className="section" aria-labelledby="dejavniki">
        <div className="wrap">
          <h2 id="dejavniki" className="t-headline">
            Kaj vpliva na ceno
          </h2>
          <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {factors.map((f) => (
              <div key={f.t} className="border-t-2 border-ink pt-5">
                <h3 className="t-title">{f.t}</h3>
                <p className="mt-2 text-steel">{f.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 grid gap-8 rounded-[20px] bg-ink p-7 text-white md:grid-cols-2 md:p-12">
            <div>
              <h2 className="t-headline text-[clamp(1.75rem,3.2vw,2.5rem)]">Za hitro ponudbo nam pošljite</h2>
              <p className="mt-4 text-white/70">Več kot vemo, natančnejša je ponudba. Fotografije lahko pošljete po SMS na {site.phone.display}.</p>
            </div>
            <ul className="space-y-3">
              {[
                "Kaj selite ali prevažate, z večjimi kosi",
                "Od kod in kam",
                "Nadstropje in dvigalo na obeh naslovih",
                "Želeni datum",
                "Ali je treba kaj razstaviti ali odpeljati",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-3 shrink-0 rounded-full bg-lime" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Faq items={faq} title="Vprašanja o ceni" />
      <InquirySection title="Pošljite povpraševanje za ponudbo" />
      <JsonLd data={faqSchema(faq)} />
    </>
  );
}
