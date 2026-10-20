import type { Metadata } from "next";
import { Legal } from "@/components/site/Legal";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Politika zasebnosti", alternates: { canonical: "/zasebnost" } };

// OSNUTEK. Opisuje, kaj sistem dejansko počne s podatki. Pred objavo naj ga pregleda pravnik,
// podatke o upravljavcu pa dopolni v config/site.ts (company, email).
export default function PrivacyPage() {
  const controller = site.company ? `${site.company.legalName}, ${site.company.address}` : "Mormo.si (podatki o podjetju bodo dopolnjeni)";
  return (
    <Legal title="Politika zasebnosti" updated="oktober 2026">
      <p>
        Tukaj piše, katere osebne podatke zbiramo, zakaj, kako dolgo jih hranimo in kakšne pravice imaš. Pišemo kratko in naravnost.
      </p>

      <h2>Kdo upravlja tvoje podatke</h2>
      <p>
        Upravljavec je <strong>{controller}</strong>.{site.email ? <> Za vse v zvezi z zasebnostjo nam piši na <a href={`mailto:${site.email}`}>{site.email}</a>.</> : null}
      </p>

      <h2>Katere podatke zbiramo</h2>
      <ul>
        <li><strong>Račun:</strong> ime in priimek, e-naslov, telefon (če ga vpišeš). Gesla ne hranimo, hranimo samo njegov šifrirani odtis.</li>
        <li><strong>Naslov in dostop:</strong> kje je avto parkiran in navodila, kako pridemo do njega.</li>
        <li><strong>Vozilo:</strong> znamka, model, velikost, ime, ki mu ga daš, in registrska številka (če jo vpišeš).</li>
        <li><strong>Naročnina in termini:</strong> izbrani paket, rezervirani in opravljeni termini.</li>
        <li><strong>Plačila:</strong> podatke o kartici vpišeš neposredno pri ponudniku plačil Stripe. Mi jih nikoli ne vidimo in ne hranimo; prejmemo samo podatek, ali je plačilo uspelo.</li>
      </ul>

      <h2>Zakaj jih uporabljamo</h2>
      <ul>
        <li><strong>Da opravimo storitev</strong> (izvajanje pogodbe): rezervacija in izvedba čiščenja, obveščanje o terminih, obračun naročnine.</li>
        <li><strong>Ker to zahteva zakon:</strong> hramba računov.</li>
        <li><strong>S tvojo privolitvijo:</strong> novice in ponudbe po e-pošti. Privolitev je neobvezna in jo kadarkoli umakneš v svojem profilu.</li>
      </ul>

      <h2>Kdo jih obdeluje za nas</h2>
      <p>Podatkov ne prodajamo. Za delovanje uporabljamo te ponudnike, ki podatke obdelujejo po naših navodilih:</p>
      <ul>
        <li><strong>Supabase</strong> (baza podatkov),</li>
        <li><strong>Vercel</strong> (gostovanje spletne strani),</li>
        <li><strong>Stripe</strong> (plačila),</li>
        <li><strong>Resend</strong> (pošiljanje e-pošte).</li>
      </ul>
      <p>Kadar ponudnik podatke obdeluje zunaj Evropskega gospodarskega prostora, to poteka na podlagi sklepa o ustreznosti ali standardnih pogodbenih določil.</p>

      <h2>Kako dolgo jih hranimo</h2>
      <ul>
        <li>Podatke računa, vozil in terminov hranimo, dokler imaš račun.</li>
        <li>Ko račun izbrišeš, izbrišemo profil, vozila in termine ter odstranimo tvoje podatke iz našega koledarja.</li>
        <li>Račune hranimo toliko časa, kolikor zahtevajo davčni predpisi.</li>
      </ul>

      <h2>Tvoje pravice</h2>
      <ul>
        <li><strong>Vpogled in prenos:</strong> v profilu z enim klikom preneseš kopijo vseh svojih podatkov.</li>
        <li><strong>Popravek:</strong> podatke urejaš sam v profilu.</li>
        <li><strong>Izbris:</strong> račun lahko kadarkoli izbrišeš v profilu.</li>
        <li><strong>Omejitev in ugovor:</strong> piši nam.</li>
        <li><strong>Pritožba:</strong> pritožiš se lahko pri Informacijskem pooblaščencu Republike Slovenije (ip-rs.si).</li>
      </ul>

      <h2>Piškotki</h2>
      <p>
        Uporabljamo en sam, nujen piškotek, ki te po prijavi ohrani prijavljenega. Sledilnih in oglaševalskih piškotkov ne uporabljamo, zato te ne sprašujemo za privolitev.
      </p>

      <h2>Varnost</h2>
      <p>
        Povezava s stranjo je šifrirana. Do podatkov strank dostopa samo strežnik naše spletne strani; vsaka stranka vidi le svoje podatke.
      </p>
    </Legal>
  );
}
