import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChatText, Phone, Plus } from "@phosphor-icons/react/ssr";
import { inquiryHref, site, vehicles } from "@/config/site";
import { photos } from "@/content/photos";
import { Figure } from "@/components/site/Figure";
import { faq, process, reasons } from "@/content/home";
import { services, type InquiryService } from "@/content/services";
import { CallLink, SmsLink } from "@/components/site/ContactLinks";
import { InquiryWizard } from "@/components/inquiry/InquiryWizard";
import { ContactForm } from "@/components/forms/ContactForm";

/* ------------------------------------------------------------------ */
/* Inquiry                                                             */
/* ------------------------------------------------------------------ */
export function InquirySection({ initialService, title = "Povpraševanje v 5 korakih" }: { initialService?: InquiryService; title?: string }) {
  return (
    <section id="povprasevanje" className="bg-fog pb-[clamp(72px,10vw,144px)] pt-10 md:pt-14" aria-labelledby="povprasevanje-h">
      <div className="wrap">
        <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 id="povprasevanje-h" className="t-title">
            {title}
          </h2>
          <p className="text-steel">Izberite storitev, povlecite pot na zemljevidu in pustite številko.</p>
        </div>
        <InquiryWizard initialService={initialService} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */
export function Process() {
  return (
    <section id="kako-delamo" className="section bg-ink text-white" aria-labelledby="kako-h" style={{ viewTimelineName: "--process" } as React.CSSProperties}>
      <div className="wrap grid gap-14 lg:grid-cols-12">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+48px)] lg:col-span-5 lg:self-start">
          <h2 id="kako-h" className="t-headline">
            Kako poteka selitev?
          </h2>
          <p className="t-lead mt-5 max-w-[40ch] text-white/75">Šest korakov od prvega zvonca do zadnje škatle v pravem prostoru.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallLink place="process" className="btn btn-primary">
              <Phone size={18} weight="fill" aria-hidden /> Pokličite nas
            </CallLink>
          </div>
          <Figure photo={photos.teamLoading} tone="dark" sizes="(min-width: 1024px) 480px, 100vw" className="mt-10" />
        </div>

        <ol className="relative lg:col-span-7">
          <div className="route-rail" aria-hidden>
            <span />
          </div>
          {process.map((p, i) => (
            <li key={p.title} className={`reveal relative grid grid-cols-[48px_1fr] gap-5 pb-12 last:pb-0 lg:grid-cols-[80px_1fr] lg:gap-8`}>
              <span
                className={`t-num relative z-[1] grid h-12 w-12 place-items-center rounded-full text-lg lg:h-20 lg:w-20 lg:text-2xl ${
                  p.signature ? "bg-lime text-ink" : "bg-graphite text-white ring-1 ring-white/15"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {p.signature ? (
                <div className="-mt-1 rounded-[20px] bg-lime p-6 text-ink lg:p-8">
                  <p className="t-title">Začnemo selit, ker:</p>
                  <h3 className="t-display mt-2 text-[clamp(2.4rem,5.4vw,4.75rem)]">{p.title}</h3>
                  <p className="mt-4 max-w-[46ch] text-lg">{p.text}</p>
                </div>
              ) : (
                <div className="pt-2 lg:pt-5">
                  <h3 className="t-title">{p.title}</h3>
                  <p className="mt-2 max-w-[52ch] text-white/75">{p.text}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */
export function Services() {
  return (
    <section id="storitve" className="section bg-white" aria-labelledby="storitve-h">
      <div className="wrap">
        <h2 id="storitve-h" className="t-headline max-w-[22ch]">
          Selitve in prevozi v Ljubljani ter po Sloveniji
        </h2>
        <ul className="mt-12 grid border-t-2 border-ink md:grid-cols-2">
          {services.map((s, i) => (
            <li key={s.slug} className={`border-b border-mist ${i % 2 === 0 ? "md:border-r md:pr-10" : "md:pl-10"}`}>
              <Link href={`/${s.slug}`} className="group grid grid-cols-[1fr_auto] items-start gap-6 py-8">
                <span>
                  <span className="t-title block transition-colors group-hover:text-kraft">{s.name}</span>
                  <span className="mt-2 block max-w-[46ch] text-steel">{s.card}</span>
                </span>
                <span className="grid h-12 w-12 place-items-center rounded-full bg-fog transition-all group-hover:-rotate-45 group-hover:bg-lime">
                  <ArrowUpRight size={20} weight="bold" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href={inquiryHref} className="btn btn-ink">
            Pošljite povpraševanje
          </Link>
          <Link href="/#cenik" className="link-u font-semibold">
            Poglejte cenik
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Why us                                                              */
/* ------------------------------------------------------------------ */
export function WhyUs() {
  return (
    <section className="section bg-fog" aria-labelledby="zakaj-h">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="zakaj-h" className="t-headline">
            Zakaj izbrati Mormo Selitve?
          </h2>
          <div className="mt-8 rounded-[20px] bg-ink p-6 text-white">
            <p className="t-title">Najhitreje se dogovorimo po telefonu.</p>
            <CallLink place="why" className="t-num mt-4 block text-[2rem] text-lime hover:underline">
              {site.phone.display}
            </CallLink>
            <SmsLink place="why" className="mt-3 inline-flex items-center gap-2 text-white/80 hover:text-white">
              <ChatText size={18} weight="bold" aria-hidden /> ali pošljite SMS
            </SmsLink>
          </div>
        </div>
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-8">
          {reasons.map((r, i) => (
            <div key={r.title} className={`reveal ${i % 2 === 1 ? "sm:translate-y-10" : ""}`}>
              <span className="block h-1 w-10 rounded-full bg-kraft" aria-hidden />
              <h3 className="t-title mt-5">{r.title}</h3>
              <p className="mt-2 text-steel">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */
export function Team() {
  return (
    <section id="ekipa" className="section bg-ink text-white" aria-labelledby="ekipa-h">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <h2 id="ekipa-h" className="t-display lg:col-span-7">
            Naša ekipa
          </h2>
          <div className="space-y-4 text-white/80 lg:col-span-5">
            <p className="t-lead text-white">
              Smo ekipa, ki selitve in prevoze opravi sama: nosimo, nalagamo, razstavljamo in vozimo.
            </p>
            <p>
              Kadar je potrebno, pri primernih logističnih projektih sodelujemo tudi z{" "}
              <a href={site.partner.url} className="link-u text-white" target="_blank" rel="noopener">
                {site.partner.nameWith}
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-14 grid items-end gap-6 md:grid-cols-12">
          <Figure photo={photos.teamPortrait} tone="dark" sizes="(min-width: 768px) 40vw, 100vw" className="md:col-span-5" />
          <div className="md:col-span-7">
            <div className="mb-6 flex flex-wrap gap-2">
              {["Nosimo", "Zaščitimo", "Prepeljemo"].map((w, i) => (
                <span key={w} className={`t-title rounded-full px-5 py-2.5 ${i === 1 ? "bg-lime text-ink" : "bg-graphite text-white ring-1 ring-white/10"}`}>
                  {w}
                </span>
              ))}
            </div>
            <Figure photo={photos.teamSofa} tone="dark" sizes="(min-width: 768px) 56vw, 100vw" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Vehicles                                                            */
/* ------------------------------------------------------------------ */
export function Fleet() {
  return (
    <section id="vozila" className="section bg-white" aria-labelledby="vozila-h">
      <div className="wrap">
        <h2 id="vozila-h" className="t-headline">
          Naša vozila
        </h2>
        <p className="t-lead mt-4 max-w-[54ch] text-steel">
          Vozilo izberemo glede na količino in težo stvari. Prevažamo vedno v okviru dovoljene nosilnosti.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {vehicles.map((v, i) => (
            <article key={v.name} className={`overflow-hidden rounded-[20px] ${i === 0 ? "bg-fog" : "bg-kraft-light"}`}>
              {v.photo ? (
                <Image
                  src={v.photo.src}
                  alt={v.photo.alt}
                  width={v.photo.width}
                  height={v.photo.height}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : null}
              <div className="p-7 md:p-9">
                <p className="font-semibold text-[#4b5257]">{v.type}</p>
                <h3 className="t-headline mt-1 text-[clamp(1.75rem,3vw,2.5rem)]">{v.name}</h3>
                <p className="t-label mt-6 text-[#4b5257]">Primerno za</p>
                <ul className="mt-3 space-y-2">
                  {v.suited.map((s) => (
                    <li key={s} className="flex gap-3">
                      <span className="mt-2.5 h-1.5 w-3 shrink-0 rounded-full bg-ink" aria-hidden />
                      {s}
                    </li>
                  ))}
                </ul>
                {v.specs?.length ? (
                  <dl className="mt-6 grid grid-cols-2 gap-4">
                    {v.specs.map((sp) => (
                      <div key={sp.label}>
                        <dt className="text-sm text-[#4b5257]">{sp.label}</dt>
                        <dd className="t-num text-xl">{sp.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */
export function Faq({ items = faq, title = "Pogosta vprašanja" }: { items?: { q: string; a: string }[]; title?: string }) {
  return (
    <section id="vprasanja" className="section bg-white" aria-labelledby="faq-h">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <h2 id="faq-h" className="t-headline lg:col-span-4">
          {title}
        </h2>
        <div className="lg:col-span-8">
          {items.map((f) => (
            <details key={f.q} className="faq-item border-b border-mist first:border-t-2 first:border-t-ink">
              <summary className="flex min-h-[72px] items-center justify-between gap-6 py-5">
                <h3 className="text-lg font-bold md:text-xl">{f.q}</h3>
                <span className="faq-icon grid h-10 w-10 shrink-0 place-items-center rounded-full bg-fog" aria-hidden>
                  <Plus size={18} weight="bold" />
                </span>
              </summary>
              <p className="max-w-[64ch] pb-6 text-steel">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */
export function ContactSection() {
  return (
    <section id="kontakt" className="bg-lime text-ink" aria-labelledby="kontakt-h">
      <div className="wrap grid gap-12 py-[clamp(72px,10vw,144px)] lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h2 id="kontakt-h" className="t-display">
            Imate selitev? Mormo delat!
          </h2>
          <CallLink place="contact" className="t-num mt-10 inline-block whitespace-nowrap text-[clamp(2.4rem,5.2vw,4.75rem)] leading-none hover:underline">
            {site.phone.display}
          </CallLink>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallLink place="contact" className="btn btn-ink btn-lg">
              <Phone size={20} weight="fill" aria-hidden /> Pokličite nas
            </CallLink>
            <SmsLink place="contact" className="btn btn-ghost btn-lg">
              <ChatText size={20} weight="bold" aria-hidden /> Pošljite SMS
            </SmsLink>
          </div>
        </div>
        <div className="rounded-[20px] bg-ink p-6 text-white md:p-10 lg:col-span-6">
          <h3 className="t-title">Ali nam napišite</h3>
          <p className="mb-8 mt-2 text-white/70">Za hitro vprašanje. Za ponudbo je najhitrejše povpraševanje zgoraj.</p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
