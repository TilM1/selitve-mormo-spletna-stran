import { Droplet } from "@/components/ui/Droplet";
import { cheapestPerVisit, eur, initialReset, perVisit } from "@/config/catalog";
import { reset as c } from "@/content/home";

// One big first visit, then small regular ones, each with its price,
// so it is obvious how little every following visit costs.
export function InitialReset() {
  return (
    <section className="bg-fog pb-[clamp(88px,11vw,160px)]">
      <div className="wrap">
        <div className="grid gap-10 rounded-2xl border border-mist p-7 md:rounded-3xl md:p-12 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16">
          <div>
            <h2 className="t-headline !text-[clamp(1.75rem,3.4vw,3rem)]">{c.headline}</h2>
            <p className="t-lead mt-4 max-w-[36ch] text-steel">{c.text}</p>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-[clamp(20px,4vw,48px)]">
            <div>
              <Droplet className="h-24 w-auto text-ink md:h-32" />
              <div className="mt-5 border-t-2 border-ink pt-4">
                <p className="t-label">{c.first}</p>
                <p className="mt-2 whitespace-nowrap">
                  <span className="text-steel">{c.from} </span>
                  <span className="t-num text-[clamp(1.9rem,3.4vw,3rem)] leading-none">{eur(initialReset.from)}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex items-end gap-[clamp(10px,2.4vw,28px)]" aria-hidden="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <Droplet key={i} className="h-8 w-auto text-water md:h-10" />
                ))}
              </div>
              <div className="mt-5 border-t-2 border-mist pt-4">
                <p className="t-label text-steel">{c.next}</p>
                <p className="mt-2">
                  <span className="text-steel">{c.from} </span>
                  <span className="t-num inline-block rounded-lg bg-lime px-2 py-1 text-[clamp(1.9rem,3.4vw,3rem)] leading-none">
                    {eur(perVisit(cheapestPerVisit))}
                  </span>
                </p>
                <p className="mt-2 text-sm text-steel">{c.nextNote(cheapestPerVisit.name)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
