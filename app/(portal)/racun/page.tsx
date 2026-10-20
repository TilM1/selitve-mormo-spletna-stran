import type { Metadata } from "next";
import Link from "next/link";
import { Droplet } from "@/components/ui/Droplet";
import { eur, plans, sizes } from "@/config/catalog";
import { payNow } from "@/features/account/actions";
import { getGarage, type GarageVehicle } from "@/features/account/data";
import { requireCustomer } from "@/features/auth/session";
import { stripeEnabled } from "@/lib/env";
import { ljDateTime } from "@/lib/time";

export const metadata: Metadata = { title: "Moja vozila" };

const NOTICES: Record<string, string> = {
  dobrodosel: "Račun je odprt in prvi termin je shranjen. Kontaktirali te bomo in ga potrdili.",
  uspeh: "Plačilo je uspelo. Hvala! Potrditev se v računu pokaže v nekaj trenutkih.",
  preklicano: "Plačilo ni bilo dokončano. Dokončaš ga lahko spodaj pri vozilu.",
  napaka: "Plačila nismo mogli začeti. Poskusi znova spodaj pri vozilu.",
};

export default async function GaragePage({ searchParams }: { searchParams: Promise<{ dobrodosel?: string; placilo?: string }> }) {
  const customer = await requireCustomer("/racun");
  const [garage, params] = await Promise.all([getGarage(customer.id), searchParams]);
  const notice = params.dobrodosel ? NOTICES.dobrodosel : params.placilo ? NOTICES[params.placilo] : null;

  return (
    <div className="wrap">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="t-label text-steel">Živjo, {customer.full_name.split(" ")[0]}</p>
          <h1 className="t-headline mt-2">Moja vozila</h1>
        </div>
        <Link href="/racun/novo-vozilo" className="btn btn-ink">
          + Dodaj vozilo
        </Link>
      </div>

      {notice ? (
        <p role="status" className="mt-8 rounded-2xl bg-lime p-5">
          {notice}
        </p>
      ) : null}

      {garage.length === 0 ? (
        <p className="mt-10 rounded-3xl bg-white p-8">Nimaš še nobenega vozila. Dodaj prvega.</p>
      ) : (
        <ul className="mt-10 grid gap-4 lg:grid-cols-2">
          {garage.map((v) => (
            <VehicleCard key={v.id} v={v} />
          ))}
        </ul>
      )}
    </div>
  );
}

function VehicleCard({ v }: { v: GarageVehicle }) {
  const plan = plans.find((p) => p.key === v.subscription?.plan_key);
  const next = v.upcoming[0];
  const status = v.subscription?.status;
  return (
    <li className="flex flex-col gap-6 rounded-3xl bg-white p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="t-title">{v.nickname}</h2>
          <p className="mt-1 text-steel">
            {[v.make, v.model].filter(Boolean).join(" ")} · {sizes.find((s) => s.key === v.size)?.label}
          </p>
        </div>
        <Droplet className={`h-9 w-auto shrink-0 ${status === "active" ? "text-lime" : "text-mist"}`} />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="t-label text-steel">Paket</dt>
          <dd className="mt-1 font-semibold">
            {plan?.name ?? "Brez paketa"}
            {v.subscription ? <span className="font-normal text-steel"> · {eur(v.subscription.monthly_amount_cents / 100)} na mesec</span> : null}
          </dd>
          <dd className="mt-1 text-sm text-steel">
            {status === "active" && "Aktiven"}
            {status === "pending" && (stripeEnabled ? "Čaka na plačilo" : "Čaka na potrditev")}
            {status === "past_due" && <span className="text-[#c4281c]">Plačilo ni uspelo</span>}
            {status === "paused" && "Začasno ustavljen"}
          </dd>
        </div>
        <div>
          <dt className="t-label text-steel">Naslednji termin</dt>
          <dd className="mt-1 font-semibold first-letter:uppercase">{next ? ljDateTime(next.starts_at) : "Ni izbran"}</dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap gap-3">
        <Link href={`/racun/vozilo/${v.id}`} className="btn btn-ink btn-sm">
          Odpri
        </Link>
        {!next && v.remainingThisMonth > 0 ? (
          <Link href={`/racun/vozilo/${v.id}/termin`} className="btn btn-primary btn-sm">
            Izberi termin
          </Link>
        ) : null}
        {stripeEnabled && v.subscription && (status === "pending" || status === "past_due") ? (
          <form action={payNow}>
            <input type="hidden" name="subscription" value={v.subscription.id} />
            <button type="submit" className="btn btn-primary btn-sm">
              Plačaj
            </button>
          </form>
        ) : null}
      </div>
    </li>
  );
}
