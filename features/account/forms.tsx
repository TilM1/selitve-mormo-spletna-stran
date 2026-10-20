"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { eur, firstMonthPrice, monthlyPrice, plans, sizes, type SizeKey } from "@/config/catalog";
import { SlotPicker, type Picked } from "@/features/booking/SlotPicker";
import { addVehicle, changePlan, deleteAccount, registerAndCheckout, saveAppointment, updateProfile, updateVehicle, type FormState } from "./actions";

const LOCATIONS = [
  { value: "doma", label: "Doma" },
  { value: "sluzba", label: "V službi" },
  { value: "drugje", label: "Drugje" },
];

function Notice({ state }: { state: FormState }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-xl border-[1.5px] border-[#c4281c] bg-white p-4 text-[#8f1d14]">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p role="status" className="rounded-xl bg-lime p-4">
        {state.ok}
      </p>
    );
  return null;
}

function Field({ label, name, state, hint, ...rest }: { label: string; name: string; state?: FormState; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const error = state?.errors?.[name];
  return (
    <label className="block">
      <span className="t-label mb-2 block text-steel">{label}</span>
      <input name={name} className="field" defaultValue={state?.values?.[name] ?? rest.defaultValue} aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-error` : undefined} {...rest} />
      {hint && !error ? <span className="mt-2 block text-sm text-steel">{hint}</span> : null}
      {error ? (
        <span id={`${name}-error`} className="mt-2 block text-sm text-[#c4281c]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function LocationChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="t-label mb-2 text-steel">Kje naj ga operemo?</legend>
      <div className="inline-flex flex-wrap gap-1 rounded-[28px] bg-white p-1">
        {LOCATIONS.map((o) => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} className={`t-label rounded-full px-4 py-3 transition-colors ${value === o.value ? "bg-ink text-white" : "hover:bg-fog"}`}>
            {o.label}
          </button>
        ))}
      </div>
      <input type="hidden" name="location" value={value} />
    </fieldset>
  );
}

/** Last step of the public sign-up: creates the account and goes to payment. */
export function CheckoutForm({ size, plan, picked, payOnline }: { size: string; plan: string; picked: Picked | null; payOnline: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAndCheckout, {});
  const [location, setLocation] = useState("doma");
  const chosenPlan = plans.find((p) => p.key === plan);
  const sizeKey = (size || "small") as SizeKey;

  return (
    <form action={action} noValidate>
      <h1 className="t-headline">Zaključi rezervacijo.</h1>
      <div className="mt-6">
        <Notice state={state} />
      </div>
      <input type="hidden" name="size" value={size} />
      <input type="hidden" name="plan" value={plan} />
      <input type="hidden" name="slot" value={picked?.iso ?? ""} />

      <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-start">
        <div className="grid gap-8">
          <section className="grid gap-5">
            <h2 className="t-title">Tvoj račun</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Ime in priimek" name="full_name" autoComplete="name" state={state} required />
              <Field label="Telefon (neobvezno)" name="phone" type="tel" autoComplete="tel" inputMode="tel" state={state} />
              <Field label="E-naslov" name="email" type="email" autoComplete="email" inputMode="email" state={state} required />
              <Field label="Izberi geslo" name="password" type="password" autoComplete="new-password" state={state} hint="Vsaj 8 znakov. Z njim se prijaviš v svoj račun." required />
            </div>
          </section>

          <section className="grid gap-5">
            <h2 className="t-title">Tvoj avto</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Znamka" name="make" state={state} placeholder="npr. Škoda" required />
              <Field label="Model" name="model" state={state} placeholder="npr. Octavia" />
              <Field label="Ime za ta avto (neobvezno)" name="nickname" state={state} placeholder="npr. Družinski" hint="Tako ga boš videl v svojem računu." />
              <Field label="Registrska (neobvezno)" name="plate" state={state} hint="Da ga na parkirišču lažje najdemo." />
            </div>
          </section>

          <section className="grid gap-5">
            <h2 className="t-title">Naslov</h2>
            <LocationChips value={location} onChange={setLocation} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Ulica in hišna številka" name="street" autoComplete="street-address" state={state} required />
              <Field label="Poštna številka in kraj" name="city" autoComplete="postal-code" state={state} required />
            </div>
          </section>

          <section className="grid gap-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" name="terms" className="mt-1 h-5 w-5 accent-[#111416]" aria-describedby={state.errors?.terms ? "terms-error" : undefined} />
              <span>
                Strinjam se s{" "}
                <Link href="/pogoji" target="_blank" className="link-action">
                  pogoji
                </Link>{" "}
                in sem prebral{" "}
                <Link href="/zasebnost" target="_blank" className="link-action">
                  politiko zasebnosti
                </Link>
                .
              </span>
            </label>
            {state.errors?.terms ? (
              <span id="terms-error" className="text-sm text-[#c4281c]">
                {state.errors.terms}
              </span>
            ) : null}
            <label className="flex items-start gap-3 text-steel">
              <input type="checkbox" name="marketing" className="mt-1 h-5 w-5 accent-[#111416]" />
              <span>Želim občasne novice in ponudbe po e-pošti (neobvezno).</span>
            </label>
          </section>
        </div>

        <aside className="rounded-3xl bg-ink p-6 text-white md:sticky md:top-[calc(var(--nav-h)+24px)] md:p-7">
          <p className="t-label text-lime">Tvoja rezervacija</p>
          <dl className="mt-5 grid gap-4">
            <Row term="Paket" value={chosenPlan?.name ?? "Ni izbran"} />
            <Row term="Vozilo" value={sizes.find((s) => s.key === sizeKey)?.label ?? ""} />
            <Row term="Prvi termin" value={picked?.label ?? "Ni izbran"} error={state.errors?.slot} />
          </dl>
          {chosenPlan ? (
            <div className="mt-6 border-t border-white/15 pt-5">
              <p className="t-label !text-[0.68rem] text-white/55">Prvi mesec</p>
              <p className="mt-1">
                <span className="t-num text-[2.5rem] leading-none text-lime">{eur(firstMonthPrice(sizeKey))}</span>
              </p>
              <p className="mt-1 text-sm text-white/70">Vključuje prvi, temeljit obisk.</p>
              <p className="mt-4 text-white/85">
                Nato <strong>{eur(monthlyPrice(chosenPlan, sizeKey))}</strong> na mesec
              </p>
            </div>
          ) : null}
          <p className="mt-4 text-sm text-white/70">
            {payOnline ? "V naslednjem koraku plačaš s kartico na varni strani Stripe." : "Zdaj ne plačaš ničesar. Kontaktirali te bomo in potrdili termin."}
          </p>
        </aside>
      </div>

      <div className="hidden" aria-hidden="true">
        <label>
          Spletna stran
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-8">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Shranjujem …" : payOnline ? "Na plačilo" : "Potrdi rezervacijo"}
        </button>
      </div>
    </form>
  );
}

function Row({ term, value, error }: { term: string; value: string; error?: string }) {
  return (
    <div>
      <dt className="t-label !text-[0.68rem] text-white/55">{term}</dt>
      <dd className="mt-1 font-semibold first-letter:uppercase">{value}</dd>
      {error ? <dd className="mt-1 text-sm text-[#ff9a8f]">{error}</dd> : null}
    </div>
  );
}

/** Choose a new appointment, or move an existing one. */
export function AppointmentForm({ vehicleId, size, bookingId, first }: { vehicleId: string; size: string; bookingId?: string; first: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveAppointment, {});
  const [picked, setPicked] = useState<Picked | null>(null);
  return (
    <form action={action} className="grid gap-6">
      <Notice state={state} />
      <input type="hidden" name="vehicle" value={vehicleId} />
      <input type="hidden" name="booking" value={bookingId ?? ""} />
      <input type="hidden" name="slot" value={picked?.iso ?? ""} />
      <SlotPicker size={size} first={first} ignoreBooking={bookingId} onChange={setPicked} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" disabled={pending || !picked} className="btn btn-primary disabled:opacity-50">
          {pending ? "Shranjujem …" : bookingId ? "Prestavi termin" : "Rezerviraj termin"}
        </button>
        <p className="text-steel first-letter:uppercase">{picked?.label ?? "Izberi dan in uro."}</p>
      </div>
    </form>
  );
}

export function AddVehicleForm({ payOnline }: { payOnline: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addVehicle, {});
  const [size, setSize] = useState(state.values?.size ?? "small");
  const [plan, setPlan] = useState(state.values?.plan ?? "always_clean");
  const [picked, setPicked] = useState<Picked | null>(null);
  return (
    <form action={action} noValidate className="grid gap-8">
      <Notice state={state} />
      <input type="hidden" name="slot" value={picked?.iso ?? ""} />
      <section className="grid gap-5 sm:grid-cols-2">
        <Field label="Znamka" name="make" state={state} placeholder="npr. Škoda" required />
        <Field label="Model" name="model" state={state} placeholder="npr. Octavia" />
        <Field label="Ime za ta avto (neobvezno)" name="nickname" state={state} placeholder="npr. Službeni" />
        <Field label="Registrska (neobvezno)" name="plate" state={state} />
        <label className="block">
          <span className="t-label mb-2 block text-steel">Velikost</span>
          <select name="size" className="field" value={size} onChange={(e) => setSize(e.target.value)}>
            {sizes.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="t-label mb-2 block text-steel">Paket</span>
          <select name="plan" className="field" value={plan} onChange={(e) => setPlan(e.target.value)}>
            {plans.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name} · {eur(monthlyPrice(p, size as SizeKey))} na mesec
              </option>
            ))}
          </select>
        </label>
      </section>
      <section>
        <h2 className="t-title">Prvi termin</h2>
        <p className="mt-2 text-steel">Lahko ga izbereš zdaj ali kasneje v računu.</p>
        <div className="mt-5">
          <SlotPicker size={size} first onChange={setPicked} />
        </div>
      </section>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Shranjujem …" : payOnline ? "Dodaj in plačaj" : "Dodaj vozilo"}
        </button>
        <p className="text-steel first-letter:uppercase">{picked?.label ?? ""}</p>
      </div>
    </form>
  );
}

export function PlanForm({ subscriptionId, current, size }: { subscriptionId: string; current: string; size: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(changePlan, {});
  return (
    <form action={action} className="grid gap-4">
      <Notice state={state} />
      <input type="hidden" name="subscription" value={subscriptionId} />
      <div className="flex flex-wrap gap-3">
        <select name="plan" className="field !w-auto min-w-[260px] flex-1" defaultValue={current} aria-label="Paket">
          {plans.map((p) => (
            <option key={p.key} value={p.key}>
              {p.name} · {eur(monthlyPrice(p, size as SizeKey))} na mesec
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className="btn btn-ink disabled:opacity-60">
          {pending ? "Shranjujem …" : "Spremeni paket"}
        </button>
      </div>
    </form>
  );
}

export function VehicleForm({ vehicle }: { vehicle: { id: string; nickname: string; make: string; model: string | null; plate: string | null } }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateVehicle, {});
  return (
    <form action={action} className="grid gap-5">
      <Notice state={state} />
      <input type="hidden" name="vehicle" value={vehicle.id} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ime za ta avto" name="nickname" defaultValue={vehicle.nickname} required />
        <Field label="Registrska" name="plate" defaultValue={vehicle.plate ?? ""} />
        <Field label="Znamka" name="make" defaultValue={vehicle.make} required />
        <Field label="Model" name="model" defaultValue={vehicle.model ?? ""} />
      </div>
      <div>
        <button type="submit" disabled={pending} className="btn btn-ink btn-sm disabled:opacity-60">
          {pending ? "Shranjujem …" : "Shrani"}
        </button>
      </div>
    </form>
  );
}

export function ProfileForm({ customer }: { customer: { full_name: string; phone: string | null; street: string | null; city: string | null; location_kind: string | null; access_notes: string | null; marketing: boolean } }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  const [location, setLocation] = useState(customer.location_kind ?? "doma");
  return (
    <form action={action} className="grid gap-5">
      <Notice state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ime in priimek" name="full_name" autoComplete="name" defaultValue={customer.full_name} required />
        <Field label="Telefon" name="phone" type="tel" autoComplete="tel" defaultValue={customer.phone ?? ""} />
      </div>
      <LocationChips value={location} onChange={setLocation} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ulica in hišna številka" name="street" autoComplete="street-address" defaultValue={customer.street ?? ""} />
        <Field label="Poštna številka in kraj" name="city" defaultValue={customer.city ?? ""} />
      </div>
      <label className="block">
        <span className="t-label mb-2 block text-steel">Kje je avto in kako pridemo do njega</span>
        <textarea name="access_notes" rows={3} className="field" defaultValue={customer.access_notes ?? ""} placeholder="Parkirno mesto, nadstropje garaže, koda zapornice …" />
      </label>
      <label className="flex items-start gap-3 text-steel">
        <input type="checkbox" name="marketing" defaultChecked={customer.marketing} className="mt-1 h-5 w-5 accent-[#111416]" />
        <span>Želim občasne novice in ponudbe po e-pošti.</span>
      </label>
      <div>
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Shranjujem …" : "Shrani"}
        </button>
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(deleteAccount, {});
  return (
    <form action={action} className="grid gap-4">
      <Notice state={state} />
      <label className="block max-w-sm">
        <span className="t-label mb-2 block text-steel">Za potrditev vpiši geslo</span>
        <input className="field" name="password" type="password" autoComplete="current-password" required />
      </label>
      <div>
        <button type="submit" disabled={pending} className="btn btn-sm bg-[#c4281c] text-white disabled:opacity-60">
          {pending ? "Brišem …" : "Trajno izbriši račun"}
        </button>
      </div>
    </form>
  );
}
