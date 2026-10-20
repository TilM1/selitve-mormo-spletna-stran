import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { accountLink, nav, signupHref } from "@/config/site";
import { MobileMenu } from "./MobileMenu";

export function Nav() {
  return (
    <header className="nav">
      <div className="wrap flex h-full items-center justify-between gap-3 md:gap-6">
        <Link href="/" aria-label="Mormo.si, domov" className="shrink-0">
          <Logo className="h-[18px] w-auto sm:h-[22px] md:h-[26px]" />
        </Link>
        <nav aria-label="Glavna navigacija" className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/vpis" className="nav-link hidden px-3 py-2 sm:block">
            Vpis
          </Link>
          <Link href={signupHref()} className="btn btn-primary btn-sm max-sm:px-4 max-sm:text-[0.72rem]">
            Prijavi pranje
          </Link>
          <MobileMenu items={[...nav, accountLink]} />
        </div>
      </div>
    </header>
  );
}
