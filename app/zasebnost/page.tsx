import type { Metadata } from "next";
import { site } from "@/config/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

// Have this reviewed before launch.

export const metadata: Metadata = {
  title: "Zasebnost in piškotki",
  description: "Kako Selitve Mormo uporablja osebne podatke iz povpraševanj in kontaktnih obrazcev ter katere tehnologije shranjevanja uporablja spletna stran.",
  alternates: { canonical: "/zasebnost" },
};

export default function PrivacyPage() {
  const controller = site.company ? `${site.company.legalName}, ${site.company.address}` : `${site.name} (podatki o podjetju bodo dodani)`;
  return (
    <>
      <header className="page-head">
        <div className="wrap">
          <Breadcrumbs items={[{ name: "Zasebnost in piškotki", path: "/zasebnost" }]} />
          <h1 className="t-headline mt-8">Zasebnost in piškotki</h1>
        </div>
      </header>
      <div className="section">
        <div className="wrap legal max-w-[760px]">
          <p>Zadnja posodobitev: 20. 10. 2026</p>

          <h2>Upravljavec</h2>
          <p>
            Upravljavec osebnih podatkov je {controller}. Za vprašanja o vaših podatkih nas pokličite na {site.phone.display}
            {site.email ? ` ali pišite na ${site.email}` : ""}.
          </p>

          <h2>Katere podatke zbiramo</h2>
          <p>Ko pošljete povpraševanje ali sporočilo, prejmemo podatke, ki jih vpišete:</p>
          <ul>
            <li>telefonsko številko (obvezno), ime in e-poštni naslov (neobvezno),</li>
            <li>opis storitve, želeni datum, seznam predmetov in opombe,</li>
            <li>začetno in končno lokacijo selitve ali prevoza.</li>
          </ul>
          <p>Ob pošiljanju se za zaščito pred zlorabo začasno obdela tudi IP-naslov.</p>

          <h2>Zakaj in na kakšni podlagi</h2>
          <p>
            Podatke uporabimo samo za odgovor na vaše povpraševanje in pripravo ponudbe. Pravna podlaga so ukrepi na vašo zahtevo pred sklenitvijo pogodbe (člen 6(1)(b) Splošne uredbe o varstvu podatkov).
          </p>

          <h2>Kdo podatke prejme</h2>
          <p>
            Povpraševanje se iz spletne strani pošlje na naš e-poštni naslov prek ponudnika storitev pošiljanja e-pošte (Resend), ki podatke obdeluje v našem imenu. Spletna stran gostuje pri ponudniku gostovanja. Podatkov ne prodajamo in jih ne posredujemo za oglaševanje.
          </p>

          <h2>Koliko časa jih hranimo</h2>
          <p>Povpraševanja hranimo, dokler je to potrebno za pripravo ponudbe in izvedbo storitve, nato pa jih izbrišemo, razen če zakon zahteva daljšo hrambo.</p>

          <h2>Vaše pravice</h2>
          <p>
            Imate pravico do dostopa, popravka, izbrisa in omejitve obdelave svojih podatkov ter pravico do ugovora. Pritožbo lahko vložite pri Informacijskem pooblaščencu RS (
            <a href="https://www.ip-rs.si" rel="noopener" target="_blank">
              www.ip-rs.si
            </a>
            ).
          </p>

          <h2>Piškotki in lokalna shramba</h2>
          <p>Spletna stran ne uporablja oglaševalskih ali analitičnih piškotkov. V vašem brskalniku shrani le:</p>
          <ul>
            <li>osnutek nedokončanega povpraševanja (do zaprtja zavihka), da ob osvežitvi strani ne izgubite vpisanega,</li>
            <li>stanje seznama »Ste pripravljeni na selitev?«, dokler ga ne izbrišete.</li>
          </ul>
          <p>Ti podatki ostanejo v vašem brskalniku in se nam ne pošiljajo. Če bo kasneje dodana analitika, bo ta stran posodobljena in po potrebi bo dodano soglasje.</p>
        </div>
      </div>
    </>
  );
}
