import type { Metadata } from "next";
import Link from "next/link";
import { ChatText, Phone } from "@phosphor-icons/react/ssr";
import { inquiryHref, site } from "@/config/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CallLink, SmsLink } from "@/components/site/ContactLinks";
import { ContactForm } from "@/components/forms/ContactForm";

const title = "Kontakt | Selitveni servis Ljubljana";
const description = `Pokličite nas na ${site.phone.display}, pošljite SMS ali sporočilo. Selitve in prevozi v Ljubljani z okolico in po Sloveniji.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/kontakt" },
  openGraph: { url: "/kontakt", title, description },
};

export default function ContactPage() {
  return (
    <>
      <header className="page-head">
        <div className="wrap">
          <Breadcrumbs items={[{ name: "Kontakt", path: "/kontakt" }]} />
          <h1 className="t-display mt-8 text-[clamp(2.4rem,6vw,5.25rem)]">Kontakt</h1>
          <p className="t-lead mt-6 max-w-[52ch] text-white/85">Najhitreje se dogovorimo po telefonu. Lahko pa pošljete SMS ali sporočilo spodaj.</p>
          <CallLink place="kontakt-head" className="t-num mt-8 inline-block text-[clamp(2.6rem,7vw,5rem)] leading-none text-lime hover:underline">
            {site.phone.display}
          </CallLink>
        </div>
      </header>

      <section className="section">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="grid gap-3">
              <CallLink place="kontakt" className="btn btn-primary btn-lg justify-start">
                <Phone size={22} weight="fill" aria-hidden /> Pokličite nas
              </CallLink>
              <SmsLink place="kontakt" className="btn btn-ghost btn-lg justify-start">
                <ChatText size={22} weight="bold" aria-hidden /> Pošljite SMS
              </SmsLink>
              <Link href={inquiryHref} className="btn btn-ghost btn-lg justify-start">
                Pošljite povpraševanje
              </Link>
            </div>
            <dl className="mt-12 grid gap-6">
              <div>
                <dt className="t-label text-steel">Telefon in SMS</dt>
                <dd className="mt-1 text-lg font-semibold">{site.phone.display}</dd>
              </div>
              {site.email ? (
                <div>
                  <dt className="t-label text-steel">E-pošta</dt>
                  <dd className="mt-1 text-lg font-semibold">
                    <a href={`mailto:${site.email}`} className="link-u">
                      {site.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="t-label text-steel">Območje</dt>
                <dd className="mt-1 text-lg">
                  {site.areaServed.primary}: {site.areaServed.towns.join(", ")}. {site.areaServed.note}
                </dd>
              </div>
              {site.company ? (
                <div>
                  <dt className="t-label text-steel">Podjetje</dt>
                  <dd className="mt-1">
                    {site.company.legalName}, {site.company.address}
                    <br />
                    ID za DDV: {site.company.taxId}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="rounded-[20px] bg-fog p-6 md:p-10 lg:col-span-7">
            <h2 className="t-headline text-[clamp(1.75rem,3.2vw,2.5rem)]">Pošljite sporočilo</h2>
            <p className="mb-8 mt-3 text-steel">Za ponudbo za selitev je najhitrejše povpraševanje z zemljevidom.</p>
            <ContactForm tone="light" />
          </div>
        </div>
      </section>
    </>
  );
}
