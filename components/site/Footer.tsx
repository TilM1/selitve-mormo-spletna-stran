import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { accountLink, nav, signupHref, site } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <Logo className="h-7 w-auto" />
          <p className="mt-5 max-w-xs text-white/70">
            {site.tagline} {site.area}.
          </p>
        </div>
        <nav aria-label="Noga" className="flex flex-col gap-3">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-white/80 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-3">
          <Link href={signupHref()} className="text-white/80 hover:text-white">
            Prijavi pranje
          </Link>
          <Link href={accountLink.href} className="text-white/80 hover:text-white">
            {accountLink.label}
          </Link>
          {site.phone ? (
            <a href={`tel:${site.phone}`} className="text-white/80 hover:text-white">
              {site.phoneDisplay ?? site.phone}
            </a>
          ) : null}
          {site.email ? (
            <a href={`mailto:${site.email}`} className="text-white/80 hover:text-white">
              {site.email}
            </a>
          ) : null}
        </div>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-white/10 py-6 text-sm text-white/50 md:flex-row md:justify-between">
        <span>
          © {new Date().getFullYear()} {site.company?.legalName ?? site.name}
        </span>
        <span className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/pogoji" className="hover:text-white">
            Pogoji
          </Link>
          <Link href="/zasebnost" className="hover:text-white">
            Zasebnost
          </Link>
          {site.company ? (
            <span>
              {site.company.address} · {site.company.taxId}
            </span>
          ) : null}
        </span>
      </div>
    </footer>
  );
}
