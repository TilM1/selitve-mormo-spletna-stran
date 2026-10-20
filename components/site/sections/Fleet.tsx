import Image from "next/image";
import Link from "next/link";
import { signupHref } from "@/config/site";
import { fleet as c } from "@/content/home";
import mapImg from "@/public/img/map.jpg";

export function Fleet() {
  return (
    <section id="za-podjetja" className="section bg-ink text-white">
      <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-20">
        <div>
          <p className="t-label text-lime">Za podjetja</p>
          <h2 className="t-headline reveal mt-5 max-w-[13ch]">{c.headline}</h2>
          <p className="t-lead mt-5 max-w-[36ch] text-white/75">{c.text}</p>
          <Link href={signupHref({ enquiry: true })} className="btn btn-primary mt-9">
            {c.cta}
          </Link>
        </div>
        <div className="gloss rounded-2xl md:rounded-3xl">
          <Image
            src={mapImg}
            alt="Zemljevid ulic z označenimi lokacijami, kamor pridemo"
            sizes="(min-width: 1024px) 55vw, 100vw"
            placeholder="blur"
            className="w-full rounded-2xl border border-white/10 md:rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
}
