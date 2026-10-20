import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/forms";
import { getCustomer } from "@/features/auth/session";
import { backendEnabled } from "@/lib/env";

export const metadata: Metadata = { title: "Prijava" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; geslo?: string }> }) {
  const { next, geslo } = await searchParams;
  if (await getCustomer()) redirect("/racun");
  return (
    <div className="wrap">
      <div className="mx-auto max-w-[480px]">
        <h1 className="t-headline">Prijava</h1>
        <p className="t-lead mt-4 text-steel">V svojem računu vidiš svoja vozila, paket in termine.</p>
        <div className="mt-8">
          {backendEnabled ? (
            <LoginForm next={next} notice={geslo ? "Geslo je spremenjeno. Prijavi se z novim." : undefined} />
          ) : (
            <p className="rounded-2xl bg-white p-6">Prijava še ni na voljo.</p>
          )}
        </div>
        <p className="mt-10 text-steel">
          Še nimaš računa?{" "}
          <Link href="/prijava" className="link-action text-ink">
            Izberi paket
          </Link>
        </p>
      </div>
    </div>
  );
}
