import Link from "next/link";
import { signupHref, site } from "@/config/site";
import { finalCta as c } from "@/content/home";

export function FinalCta() {
  return (
    <section className="gloss bg-lime text-ink">
      <div className="wrap flex flex-col items-start gap-10 py-[clamp(96px,14vw,200px)]">
        <h2 className="t-display max-w-[13ch]">{c.headline}</h2>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href="/#paketi" className="btn btn-ink">
            {c.cta}
          </Link>
          {site.phone ? (
            <a href={`tel:${site.phone}`} className="link-action">
              {site.phoneDisplay ?? site.phone}
            </a>
          ) : (
            <Link href={signupHref({ enquiry: true })} className="link-action">
              Pošlji povpraševanje
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
