import type { Metadata } from "next";
import Link from "next/link";
import { NewPasswordForm } from "@/features/auth/forms";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/password";

// Keeps the reset token out of the Referer header if the customer clicks a link from here.
export const metadata: Metadata = { title: "Novo geslo", referrer: "no-referrer" };

export default async function NewPasswordPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  return (
    <div className="wrap">
      <div className="mx-auto max-w-[480px]">
        <h1 className="t-headline">Novo geslo</h1>
        <div className="mt-8">
          {t ? (
            <NewPasswordForm token={t} minLength={MIN_PASSWORD_LENGTH} />
          ) : (
            <p className="rounded-2xl bg-white p-6">
              Povezava ni popolna.{" "}
              <Link href="/pozabljeno-geslo" className="link-action">
                Zahtevaj novo
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
