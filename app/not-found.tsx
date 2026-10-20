import Link from "next/link";
import { CallLink } from "@/components/site/ContactLinks";
import { site } from "@/config/site";

export const metadata = { title: "Stran ne obstaja", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="page-head min-h-[70svh]">
      <div className="wrap">
        <p className="t-label text-lime">Napaka 404</p>
        <h1 className="t-headline mt-4 max-w-[18ch]">Te strani ni. Preselila se je ali pa je nikoli ni bilo.</h1>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Na domačo stran
          </Link>
          <CallLink place="404" className="btn btn-ghost">
            Pokličite nas {site.phone.display}
          </CallLink>
        </div>
      </div>
    </section>
  );
}
