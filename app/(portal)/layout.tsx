import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { logout } from "@/features/auth/actions";
import { getCustomer } from "@/features/auth/session";

// The customer area. Its own layout, separate from the public site, and never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };
// Always rendered per request: these pages depend on who is signed in and must never be cached or prebuilt.
export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCustomer();
  return (
    <div className="flex min-h-svh flex-col bg-fog">
      <header className="bg-ink text-white">
        <div className="wrap flex h-[var(--nav-h)] items-center justify-between gap-4">
          <Link href="/" aria-label="Mormo.si, domov">
            <Logo className="h-[20px] w-auto md:h-[24px]" />
          </Link>
          {customer ? (
            <nav aria-label="Račun" className="flex items-center gap-1 sm:gap-4">
              <Link href="/racun" className="nav-link px-2 py-2 text-[0.92rem] font-medium opacity-90 hover:opacity-100">
                Moja vozila
              </Link>
              <Link href="/racun/profil" className="nav-link px-2 py-2 text-[0.92rem] font-medium opacity-90 hover:opacity-100">
                Profil
              </Link>
              <form action={logout}>
                <button type="submit" className="btn btn-secondary btn-sm">
                  Odjava
                </button>
              </form>
            </nav>
          ) : null}
        </div>
      </header>
      <main className="flex-1 pb-24 pt-10 md:pt-16">{children}</main>
    </div>
  );
}
