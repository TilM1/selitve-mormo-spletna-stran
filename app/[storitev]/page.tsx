import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, Phone } from "@phosphor-icons/react/ssr";
import { serviceBySlug, services } from "@/content/services";
import { site } from "@/config/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CallLink, SmsLink } from "@/components/site/ContactLinks";
import { JsonLd } from "@/components/site/JsonLd";
import { Faq, InquirySection } from "@/components/home/Sections";
import { faqSchema, serviceSchema } from "@/lib/schema";
import { photos } from "@/content/photos";
import { Figure } from "@/components/site/Figure";

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ storitev: s.slug }));
}

type Params = { params: Promise<{ storitev: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const s = serviceBySlug((await params).storitev);
  if (!s) return {};
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: `/${s.slug}` },
    openGraph: { url: `/${s.slug}`, title: s.metaTitle, description: s.metaDescription },
  };
}

export default async function ServicePage({ params }: Params) {
  const s = serviceBySlug((await params).storitev);
  if (!s) notFound();
  const related = s.related.map(serviceBySlug).filter((x) => !!x);

  return (
    <>
      <header className="page-head">
        <div className="wrap">
          <Breadcrumbs items={[{ name: s.name, path: `/${s.slug}` }]} />
          <h1 className="t-display mt-8 max-w-[16ch] text-[clamp(2.4rem,6vw,5.25rem)]">{s.h1}</h1>
          <p className="t-lead mt-6 max-w-[60ch] text-white/85">{s.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallLink place={`service-${s.slug}`} className="btn btn-primary btn-lg">
              <Phone size={20} weight="fill" aria-hidden /> Pokličite nas
            </CallLink>
            <Link href="#povprasevanje" className="btn btn-ghost btn-lg">
              Pošljite povpraševanje
            </Link>
          </div>
        </div>
      </header>

      <div className="section">
        <div className="wrap grid gap-16 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <section aria-labelledby="vkljucuje">
              <h2 id="vkljucuje" className="t-headline text-[clamp(1.75rem,3.2vw,2.5rem)]">
                Kaj vključuje
              </h2>
              <ul className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
                {s.includes.map((x) => (
                  <li key={x} className="flex gap-4 text-lg">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lime text-ink" aria-hidden>
                      <Check size={15} weight="bold" />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </section>

            {s.photo ? <Figure photo={photos[s.photo]} sizes="(min-width: 1024px) 860px, 100vw" className="mt-14" /> : null}

            <section aria-labelledby="komu" className="mt-16">
              <h2 id="komu" className="t-headline text-[clamp(1.75rem,3.2vw,2.5rem)]">
                Komu je namenjeno
              </h2>
              <ul className="mt-6 space-y-3">
                {s.suitedFor.map((x) => (
                  <li key={x} className="flex gap-3 text-lg">
                    <span className="mt-3 h-1.5 w-4 shrink-0 rounded-full bg-ink" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="potek" className="mt-16">
              <h2 id="potek" className="t-headline text-[clamp(1.75rem,3.2vw,2.5rem)]">
                Kako poteka
              </h2>
              <ol className="mt-8 grid gap-6 sm:grid-cols-2">
                {s.steps.map((st, i) => (
                  <li key={st.title} className="border-t-2 border-ink pt-5">
                    <span className="t-num text-3xl text-kraft">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="t-title mt-2">{st.title}</h3>
                    <p className="mt-2 text-steel">{st.text}</p>
                  </li>
                ))}
              </ol>
            </section>

            {s.sections?.map((sec) => (
              <section key={sec.id} id={sec.id} aria-labelledby={`${sec.id}-h`} className="mt-16">
                <h2 id={`${sec.id}-h`} className="t-headline text-[clamp(1.75rem,3.2vw,2.5rem)]">
                  {sec.h2}
                </h2>
                {sec.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)} className="prose-measure mt-4 text-lg text-[#3f474c]">
                    {p}
                  </p>
                ))}
              </section>
            ))}

            <section aria-labelledby="cena" className="mt-16 grid gap-6 md:grid-cols-2">
              <div className="rounded-[20px] bg-ink p-7 text-white">
                <h2 id="cena" className="t-title">
                  Kaj vpliva na ceno
                </h2>
                <ul className="mt-5 space-y-3 text-white/80">
                  {s.priceFactors.map((x) => (
                    <li key={x} className="flex gap-3">
                      <span className="mt-2.5 h-1.5 w-3 shrink-0 rounded-full bg-lime" aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
                <Link href="/cenik" className="link-u mt-6 inline-block text-white">
                  Poglejte cenik
                </Link>
              </div>
              <div className="rounded-[20px] bg-kraft-light p-7">
                <h2 className="t-title">Kako se pripravite</h2>
                <ul className="mt-5 space-y-3 text-[#4a3b2c]">
                  {s.prepare.map((x) => (
                    <li key={x} className="flex gap-3">
                      <span className="mt-2.5 h-1.5 w-3 shrink-0 rounded-full bg-kraft" aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </article>

          <aside className="lg:col-span-4">
            <div className="rounded-[20px] bg-lime p-7 lg:sticky lg:top-[calc(var(--nav-h)+24px)]">
              <p className="t-title">Povejte, kaj potrebujete. Ponudbo pripravimo mi.</p>
              <CallLink place={`service-aside-${s.slug}`} className="t-num mt-5 block text-[2.25rem] leading-none hover:underline">
                {site.phone.display}
              </CallLink>
              <div className="mt-6 grid gap-2">
                <CallLink place={`service-aside-${s.slug}`} className="btn btn-ink">
                  Pokličite nas
                </CallLink>
                <SmsLink place={`service-aside-${s.slug}`} className="btn btn-ghost">
                  Pošljite SMS
                </SmsLink>
                <Link href="#povprasevanje" className="btn btn-ghost">
                  Pošljite povpraševanje
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <section aria-labelledby="sorodne" className="bg-fog py-16 md:py-20">
        <div className="wrap">
          <h2 id="sorodne" className="t-title">
            Sorodne storitve
          </h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/${r.slug}`} className="group flex h-full items-start justify-between gap-4 rounded-[20px] bg-white p-6 transition-shadow hover:shadow-lg">
                  <span>
                    <span className="t-title block">{r.name}</span>
                    <span className="mt-2 block text-steel">{r.card}</span>
                  </span>
                  <ArrowUpRight size={22} weight="bold" className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link href={`/#storitve`} className="link-u font-semibold">
              Vse storitve
            </Link>
          </p>
        </div>
      </section>

      <Faq items={s.faq} title={`Vprašanja: ${s.name.toLowerCase()}`} />
      <InquirySection initialService={s.inquiry} title="Pošljite povpraševanje" />

      <JsonLd data={serviceSchema(s)} />
      <JsonLd data={faqSchema(s.faq)} />
    </>
  );
}
