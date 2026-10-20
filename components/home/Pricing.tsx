import Link from "next/link";
import { Phone } from "@phosphor-icons/react/ssr";
import { inquiryHref } from "@/config/site";
import { fmt, fmtExact, priceExamples, priceGroups, withVat } from "@/content/pricing";
import { CallLink } from "@/components/site/ContactLinks";

// Price list as a receipt: name, dotted leader, price. Three groups side by side on large screens.
export function PriceTables() {
  return (
    <div className="grid border-t-2 border-ink lg:grid-cols-3">
      {priceGroups.map((g, i) => (
        <section
          key={g.id}
          aria-labelledby={`cena-${g.id}`}
          className={`flex flex-col border-b border-mist py-8 lg:border-b-0 ${i > 0 ? "lg:border-l lg:pl-8" : ""} ${i < 2 ? "lg:pr-8" : ""}`}
        >
          <p className="text-sm font-semibold text-kraft">{g.basis}</p>
          <h3 id={`cena-${g.id}`} className="t-title mt-1">
            {g.title}
          </h3>
          <ul className="mt-6 grid gap-4">
            {g.rows.map((r) => (
              <li key={r.label}>
                <div className="flex items-baseline gap-3">
                  <span className="min-w-0">{r.label}</span>
                  <span className="min-w-6 flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-mist" aria-hidden />
                  <span className="t-num shrink-0 text-xl">
                    {r.net != null ? (
                      <>
                        {fmt(r.net)}
                        {r.unit ? <span className="text-base font-semibold text-steel">/{r.unit}</span> : null}
                      </>
                    ) : (
                      <span className="text-base font-semibold text-steel">{r.text}</span>
                    )}
                  </span>
                </div>
                {r.net != null ? (
                  <p className="mt-0.5 text-right text-sm tabular-nums text-steel">
                    {fmt(withVat(r.net))}
                    {r.unit ? `/${r.unit}` : ""} z DDV
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-steel">{g.note}</p>
        </section>
      ))}
    </div>
  );
}

export function PriceExamples() {
  return (
    <div className="rounded-[20px] bg-kraft-light p-6 md:p-8">
      <h3 className="t-title">Kako izračunamo ceno</h3>
      <ul className="mt-5 grid gap-4 md:grid-cols-3">
        {priceExamples.map((ex) => {
          const net = Math.round(ex.parts.reduce((sum, p) => sum + p.net * (p.times ?? 1), 0) * 100) / 100;
          return (
            <li key={ex.title} className="rounded-[14px] bg-white/60 p-5">
              <p className="font-semibold">{ex.title}</p>
              <p className="mt-2 text-sm tabular-nums text-[#4a3b2c]">
                {ex.parts.map((p, i) => (
                  <span key={p.label}>
                    {i > 0 ? " + " : ""}
                    {p.times ? `${p.times} × ` : ""}
                    {fmt(p.net)}
                  </span>
                ))}{" "}
                = {fmt(net)} brez DDV
              </p>
              <p className="t-num mt-2 text-2xl">{fmtExact(withVat(net))}</p>
              <p className="text-sm text-[#4a3b2c]">z DDV</p>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-sm text-[#4a3b2c]">
        Končno ceno potrdimo ob dogovoru za termin, glede na dejanski obseg, dostop in trajanje dela.
      </p>
    </div>
  );
}

export function PricingSection() {
  return (
    <section id="cenik" className="section bg-white" aria-labelledby="cenik-h">
      <div className="wrap">
        <h2 id="cenik-h" className="t-headline max-w-[20ch]">
          Cenik selitev in prevozov
        </h2>
        <p className="t-lead mt-4 max-w-[60ch] text-steel">
          Selitve obračunamo po urah dela ekipe z vozilom, prevoz blaga po prevoženih kilometrih. Cene so brez DDV, pod njimi je znesek z 22 % DDV.
        </p>
        <div className="mt-12">
          <PriceTables />
        </div>
        <div className="mt-10">
          <PriceExamples />
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <CallLink place="pricing" className="btn btn-primary">
            <Phone size={18} weight="fill" aria-hidden /> Pokličite nas
          </CallLink>
          <Link href={inquiryHref} className="btn btn-ghost">
            Pošljite povpraševanje
          </Link>
        </div>
      </div>
    </section>
  );
}
