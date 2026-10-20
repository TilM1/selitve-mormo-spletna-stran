import Link from "next/link";
import { ChatText, Phone } from "@phosphor-icons/react/ssr";
import { nav } from "@/config/site";
import { services } from "@/content/services";
import { Logo } from "./Logo";
import { CallLink, SmsLink } from "./ContactLinks";
import { MobileMenu } from "./MobileMenu";

export function Nav() {
  return (
    <header className="nav">
      <div className="wrap flex h-full items-center justify-between gap-4">
        <Link href="/" aria-label="Selitve Mormo, domov" className="shrink-0">
          <Logo className="h-[15px] w-auto sm:h-[19px] xl:h-[22px]" />
        </Link>

        <nav aria-label="Glavna navigacija" className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/kontakt" className="btn btn-sm hidden px-3 text-white/90 hover:text-white xl:inline-flex">
            Kontakt
          </Link>
          <SmsLink place="nav" className="btn btn-sm btn-ghost hidden md:inline-flex">
            <ChatText size={18} weight="bold" aria-hidden />
            <span>Pošljite SMS</span>
          </SmsLink>
          <CallLink place="nav" className="btn btn-sm btn-primary max-sm:w-[44px] max-sm:min-h-[44px] max-sm:px-0">
            <Phone size={18} weight="fill" aria-hidden />
            <span className="max-sm:sr-only">Pokličite nas</span>
          </CallLink>
          <MobileMenu
            items={[...nav, { href: "/kontakt", label: "Kontakt" }]}
            services={services.map((s) => ({ href: `/${s.slug}`, label: s.name }))}
          />
        </div>
      </div>
    </header>
  );
}
