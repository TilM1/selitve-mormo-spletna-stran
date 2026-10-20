import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGarageVehicle } from "@/features/account/data";
import { AppointmentForm } from "@/features/account/forms";
import { requireCustomer } from "@/features/auth/session";
import { ljDateTime } from "@/lib/time";

export const metadata: Metadata = { title: "Izberi termin" };

// The monthly reminder e-mail links here. Not signed in? The customer signs in and comes straight back.
export default async function AppointmentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ termin?: string }> }) {
  const { id } = await params;
  const { termin } = await searchParams;
  const customer = await requireCustomer(`/racun/vozilo/${id}/termin${termin ? `?termin=${termin}` : ""}`);
  const v = await getGarageVehicle(customer.id, id);
  if (!v) notFound();

  const moving = termin ? v.upcoming.find((b) => b.id === termin) : undefined;
  if (termin && !moving) notFound();
  const noVisitsLeft = !moving && v.remainingThisMonth === 0 && v.upcoming.length > 0;

  return (
    <div className="wrap">
      <div className="mx-auto max-w-[980px]">
        <Link href={`/racun/vozilo/${v.id}`} className="link-action text-steel">
          ← {v.nickname}
        </Link>
        <h1 className="t-headline mt-5">{moving ? "Izberi drug termin." : "Izberi termin."}</h1>
        {moving ? <p className="t-lead mt-3 text-steel first-letter:uppercase">Zdaj: {ljDateTime(moving.starts_at)}</p> : null}
        {noVisitsLeft ? <p className="mt-3 text-steel">Za ta mesec so vsi obiski že rezervirani. Izbereš lahko termin v naslednjem mesecu.</p> : null}
        <div className="mt-8">
          <AppointmentForm vehicleId={v.id} size={v.size} bookingId={moving?.id} first={false} />
        </div>
      </div>
    </div>
  );
}
