import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eur, plans, sizes } from "@/config/catalog";
import { getGarageVehicle } from "@/features/account/data";
import { PlanForm, VehicleForm } from "@/features/account/forms";
import { requireCustomer } from "@/features/auth/session";
import { ljDateTime, ljShort, ljTime } from "@/lib/time";

export const metadata: Metadata = { title: "Vozilo" };

const RESCHEDULE_DAYS = 3; // shown to the customer; the database enforces the real rule

export default async function VehiclePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ termin?: string; novo?: string }> }) {
  const { id } = await params;
  const customer = await requireCustomer(`/racun/vozilo/${id}`);
  const [v, query] = await Promise.all([getGarageVehicle(customer.id, id), searchParams]);
  if (!v) notFound();

  const plan = plans.find((p) => p.key === v.subscription?.plan_key);
  const notice = query.termin === "prestavljen" ? "Termin je prestavljen." : query.termin === "rezerviran" ? "Termin je rezerviran." : query.novo ? "Vozilo je dodano." : null;
  const canMove = (startsAt: string) => new Date(startsAt).getTime() - Date.now() >= RESCHEDULE_DAYS * 864e5;

  return (
    <div className="wrap">
      <Link href="/racun" className="link-action text-steel">
        ← Moja vozila
      </Link>
      <h1 className="t-headline mt-5">{v.nickname}</h1>
      <p className="t-lead mt-2 text-steel">
        {[v.make, v.model].filter(Boolean).join(" ")} · {sizes.find((s) => s.key === v.size)?.label}
        {v.plate ? ` · ${v.plate}` : ""}
      </p>

      {notice ? (
        <p role="status" className="mt-8 rounded-2xl bg-lime p-5">
          {notice}
        </p>
      ) : null}

      <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {/* Appointments */}
        <section className="rounded-3xl bg-ink p-6 text-white md:p-8">
          <h2 className="t-label text-lime">Naslednji termin</h2>
          {v.upcoming.length === 0 ? (
            <>
              <p className="t-title mt-4">Ni izbranega termina.</p>
              {v.remainingThisMonth > 0 ? (
                <Link href={`/racun/vozilo/${v.id}/termin`} className="btn btn-primary mt-6">
                  Izberi termin
                </Link>
              ) : (
                <p className="mt-3 text-white/70">Ta mesec so vsi obiski tvojega paketa že opravljeni ali rezervirani.</p>
              )}
            </>
          ) : (
            <ul className="mt-4 grid gap-6">
              {v.upcoming.map((b, i) => (
                <li key={b.id} className={i > 0 ? "border-t border-white/15 pt-6" : ""}>
                  <p className="t-title first-letter:uppercase">{ljDateTime(b.starts_at)}</p>
                  <p className="mt-1 text-white/70">
                    {b.is_first_visit ? "Prvi, temeljit obisk · " : ""}približno {b.duration_min} minut
                  </p>
                  {canMove(b.starts_at) ? (
                    <Link href={`/racun/vozilo/${v.id}/termin?termin=${b.id}`} className="btn btn-secondary btn-sm mt-4">
                      Preveri možnost drugih terminov
                    </Link>
                  ) : (
                    <p className="mt-4 text-sm text-white/70">Do termina je manj kot {RESCHEDULE_DAYS} dni, zato ga tukaj ni več mogoče prestaviti. Pokliči nas.</p>
                  )}
                </li>
              ))}
              {v.remainingThisMonth > 0 ? (
                <li className="border-t border-white/15 pt-6">
                  <Link href={`/racun/vozilo/${v.id}/termin`} className="link-action text-lime">
                    Rezerviraj še en termin ta mesec →
                  </Link>
                </li>
              ) : null}
            </ul>
          )}
        </section>

        {/* Plan */}
        <section className="rounded-3xl bg-white p-6 md:p-8">
          <h2 className="t-label text-steel">Paket</h2>
          {v.subscription ? (
            <>
              <p className="t-title mt-4">{plan?.name ?? v.subscription.plan_key}</p>
              <p className="mt-1 text-steel">
                {eur(v.subscription.monthly_amount_cents / 100)} na mesec · {v.subscription.visits_per_period === 1 ? "1 obisk" : `${v.subscription.visits_per_period} obiska`} na mesec
              </p>
              {v.subscription.cancel_at_period_end ? <p className="mt-2 text-sm text-[#c4281c]">Naročnina se izteče ob koncu plačanega obdobja.</p> : null}
              <div className="mt-6">
                <PlanForm subscriptionId={v.subscription.id} current={v.subscription.plan_key} size={v.size} />
              </div>
            </>
          ) : (
            <p className="mt-4 text-steel">To vozilo nima paketa.</p>
          )}
        </section>
      </div>

      {/* History */}
      <section className="mt-4 rounded-3xl bg-white p-6 md:p-8">
        <h2 className="t-label text-steel">Zgodovina</h2>
        {v.history.length === 0 ? (
          <p className="mt-4 text-steel">Tukaj se bodo zbirali opravljeni obiski.</p>
        ) : (
          <ul className="mt-4">
            {v.history.map((b) => (
              <li key={b.id} className="flex items-baseline justify-between gap-4 border-b border-fog py-3 last:border-0">
                <span className="font-semibold">{ljShort(b.starts_at)}</span>
                <span className="text-steel">
                  {ljTime(b.starts_at)} · {b.is_first_visit ? "prvi obisk" : "redno čiščenje"} · {b.status === "completed" ? "opravljeno" : "v teku"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <details className="mt-4 rounded-3xl bg-white p-6 md:p-8">
        <summary className="t-label cursor-pointer text-steel">Uredi podatke o vozilu</summary>
        <div className="mt-6">
          <VehicleForm vehicle={v} />
        </div>
      </details>
    </div>
  );
}
