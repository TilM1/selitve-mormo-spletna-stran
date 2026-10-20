import type { Metadata } from "next";
import Link from "next/link";
import { AddVehicleForm } from "@/features/account/forms";
import { requireCustomer } from "@/features/auth/session";
import { stripeEnabled } from "@/lib/env";

export const metadata: Metadata = { title: "Dodaj vozilo" };

export default async function AddVehiclePage() {
  await requireCustomer("/racun/novo-vozilo");
  return (
    <div className="wrap">
      <div className="mx-auto max-w-[980px]">
        <Link href="/racun" className="link-action text-steel">
          ← Moja vozila
        </Link>
        <h1 className="t-headline mt-5">Dodaj vozilo</h1>
        <p className="t-lead mt-3 text-steel">Vsako vozilo ima svoj paket in svoje termine.</p>
        <div className="mt-8">
          <AddVehicleForm payOnline={stripeEnabled} />
        </div>
      </div>
    </div>
  );
}
