import Link from "next/link";
import { Droplet } from "@/components/ui/Droplet";
import { signupHref, site } from "@/config/site";
import { faq as c } from "@/content/home";

export function Faq() {
  return (
    <section id="faq" className="section bg-fog">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div>
          <h2 className="t-headline reveal">{c.headline}</h2>
          <p className="t-label mt-10 text-steel">{c.areaTitle}</p>
          <p className="t-title mt-2">{site.area}</p>
          <p className="mt-8 text-steel">
            Nisi našel odgovora?{" "}
            {site.phone ? (
              <a href={`tel:${site.phone}`} className="link-action text-ink">
                Pokliči nas
              </a>
            ) : (
              <Link href={signupHref({ enquiry: true })} className="link-action text-ink">
                Piši nam
              </Link>
            )}
          </p>
        </div>
        <div>
          {c.items.map((item) => (
            <details key={item.q} className="faq-item border-t border-mist last:border-b">
              <summary className="flex items-center justify-between gap-6 py-6">
                <span className="t-title !text-[clamp(1.2rem,1.7vw,1.6rem)]">{item.q}</span>
                <Droplet className="faq-drop h-6 w-auto shrink-0 text-ink" />
              </summary>
              <p className="max-w-[60ch] pb-7 text-steel">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
