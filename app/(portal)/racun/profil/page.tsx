import type { Metadata } from "next";
import { openBilling } from "@/features/account/actions";
import { DeleteAccountForm, ProfileForm } from "@/features/account/forms";
import { requireCustomer } from "@/features/auth/session";
import { stripeEnabled } from "@/lib/env";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const c = await requireCustomer("/racun/profil");
  return (
    <div className="wrap">
      <div className="mx-auto grid max-w-[820px] gap-4">
        <h1 className="t-headline">Profil</h1>
        <p className="text-steel">{c.email}</p>

        <section className="mt-4 rounded-3xl bg-white p-6 md:p-8">
          <h2 className="t-title">Moji podatki</h2>
          <div className="mt-6">
            <ProfileForm
              customer={{ full_name: c.full_name, phone: c.phone, street: c.street, city: c.city, location_kind: c.location_kind, access_notes: c.access_notes, marketing: Boolean(c.marketing_consent_at) }}
            />
          </div>
        </section>

        {stripeEnabled && c.stripe_customer_id ? (
          <section className="rounded-3xl bg-white p-6 md:p-8">
            <h2 className="t-title">Plačilo in računi</h2>
            <p className="mt-2 text-steel">Kartico, račune in odpoved urejaš na varni strani našega ponudnika plačil Stripe.</p>
            <form action={openBilling} className="mt-5">
              <button type="submit" className="btn btn-ink btn-sm">
                Uredi plačilo in račune
              </button>
            </form>
          </section>
        ) : null}

        <section className="rounded-3xl bg-white p-6 md:p-8">
          <h2 className="t-title">Moji podatki in zasebnost</h2>
          <p className="mt-2 text-steel">Kadarkoli lahko prevzameš kopijo vseh podatkov, ki jih hranimo o tebi.</p>
          <a href="/racun/izvoz" className="btn btn-secondary btn-sm mt-5">
            Prenesi moje podatke
          </a>
          <details className="mt-8 border-t border-fog pt-6">
            <summary className="cursor-pointer font-semibold text-[#c4281c]">Izbriši račun</summary>
            <p className="mt-3 max-w-[60ch] text-steel">
              Izbrišemo tvoj profil, vozila in termine ter odpovemo naročnine. Prihodnji termini se sprostijo. Izdani računi ostanejo pri ponudniku plačil, kolikor zahteva zakon. Tega ni mogoče razveljaviti.
            </p>
            <div className="mt-5">
              <DeleteAccountForm />
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
