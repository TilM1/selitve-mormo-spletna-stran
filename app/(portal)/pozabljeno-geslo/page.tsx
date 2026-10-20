import type { Metadata } from "next";
import Link from "next/link";
import { ResetRequestForm } from "@/features/auth/forms";

export const metadata: Metadata = { title: "Pozabljeno geslo" };

export default function ForgotPage() {
  return (
    <div className="wrap">
      <div className="mx-auto max-w-[480px]">
        <h1 className="t-headline">Pozabljeno geslo</h1>
        <p className="t-lead mt-4 text-steel">Vpiši e-naslov. Pošljemo ti povezavo, s katero nastaviš novo geslo.</p>
        <div className="mt-8">
          <ResetRequestForm />
        </div>
        <p className="mt-10">
          <Link href="/vpis" className="link-action">
            Nazaj na prijavo
          </Link>
        </p>
      </div>
    </div>
  );
}
