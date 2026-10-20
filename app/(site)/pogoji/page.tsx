import type { Metadata } from "next";
import { Legal } from "@/components/site/Legal";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Pogoji", alternates: { canonical: "/pogoji" } };

// OSNUTEK. Vsebuje samo pravila, ki jih sistem že izvaja. Odpoved, vračila, slabo vreme in
// podobno je treba dopolniti in dati v pregled pravniku pred objavo.
export default function TermsPage() {
  const provider = site.company ? `${site.company.legalName}, ${site.company.address}` : "Mormo.si (podatki o podjetju bodo dopolnjeni)";
  return (
    <Legal title="Pogoji" updated="oktober 2026">
      <p>Ti pogoji veljajo za naročnino na mobilno čiščenje avtomobila Mormo.si.</p>

      <h2>Ponudnik</h2>
      <p><strong>{provider}</strong></p>

      <h2>Naročnina</h2>
      <ul>
        <li>Naročnina velja za eno vozilo in se obračunava mesečno.</li>
        <li>Paket določa število obiskov na mesec. Cena je odvisna od paketa in velikosti vozila ter je prikazana pred potrditvijo.</li>
        <li>Prvi mesec se namesto redne mesečne cene obračuna cena prvega, temeljitega obiska. Redna mesečna cena velja od drugega meseca.</li>
        <li>Paket lahko spremeniš v svojem računu.</li>
      </ul>

      <h2>Termini</h2>
      <ul>
        <li>Termin izbereš sam v svojem računu med prostimi termini.</li>
        <li>Termin lahko prestaviš najkasneje 3 dni pred njim. Kasneje nas pokliči.</li>
        <li>Na dan termina mora biti vozilo dostopno na dogovorjenem naslovu.</li>
      </ul>

      <h2>Plačilo</h2>
      <p>Plačilo poteka s kartico prek ponudnika plačil Stripe. Podatkov o kartici ne hranimo.</p>

      <h2>Odstop od pogodbe</h2>
      <p>
        Kot potrošnik lahko od pogodbe, sklenjene na daljavo, odstopiš v 14 dneh brez navedbe razloga. Če želiš, da storitev opravimo pred iztekom tega roka, s potrditvijo naročila to izrecno zahtevaš; za že opravljeno storitev pravice do odstopa ni.
      </p>

      <h2>Zasebnost</h2>
      <p>
        Kako ravnamo s tvojimi podatki, piše v <a href="/zasebnost">politiki zasebnosti</a>.
      </p>
    </Legal>
  );
}
