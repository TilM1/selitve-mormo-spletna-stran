/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { inquiryHref, site } from "@/config/site";
import { services } from "@/content/services";
import { CallLink, SmsLink } from "./ContactLinks";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-white">
      <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <img src="/brand/selitve-mormo-stacked-dark.svg" alt="Selitve Mormo" width={6385} height={1335} className="h-auto w-[220px]" />
          <p className="mt-6 max-w-[42ch] text-white/75">
            Selitveni servis za Ljubljano z okolico. Selitve stanovanj in pisarn, prevoz pohištva in blaga ter odvoz krame. {site.areaServed.note}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallLink place="footer" className="btn btn-primary">
              {site.phone.display}
            </CallLink>
            <SmsLink place="footer" className="btn btn-ghost">
              Pošljite SMS
            </SmsLink>
          </div>
        </div>

        <nav aria-label="Storitve" className="md:col-span-4">
          <h2 className="t-label text-white/60">Storitve</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 md:grid-cols-1 lg:grid-cols-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/${s.slug}`} className="text-white/85 hover:text-lime">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className="t-label text-white/60">Kontakt</h2>
          <ul className="mt-4 space-y-2.5 text-white/85">
            <li>
              <CallLink place="footer-list" className="hover:text-lime">
                Telefon: {site.phone.display}
              </CallLink>
            </li>
            {site.email ? (
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-lime">
                  {site.email}
                </a>
              </li>
            ) : null}
            <li>
              <Link href={inquiryHref} className="hover:text-lime">
                Pošljite povpraševanje
              </Link>
            </li>
            <li>
              <Link href="/cenik" className="hover:text-lime">
                Cenik in ponudba
              </Link>
            </li>
            <li>
              <Link href="/kontakt" className="hover:text-lime">
                Kontakt
              </Link>
            </li>
            <li className="pt-2 text-white/60">Območje: {site.areaServed.primary}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-3 py-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.company?.legalName ?? site.name}
            {site.company ? `, ${site.company.address}, ID za DDV ${site.company.taxId}` : ""}
          </p>
          <p className="flex gap-5">
            <Link href="/zasebnost" className="hover:text-white">
              Zasebnost in piškotki
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
