"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { eur, monthlyPrice, plans, sizes, type SizeKey } from "@/config/catalog";
import { CheckoutForm } from "@/features/account/forms";
import { SlotPicker, type Picked } from "@/features/booking/SlotPicker";
import { submitLead, type LeadState } from "./actions";
import { DateTimePicker, formatDate, formatTime } from "./DateTimePicker";
import { locationOptions } from "./schema";

// Click-through sign-up. Always starts with "Kaj voziš?":
//   1 vehicle  →  2 plan  →  3 first appointment  →  4 checkout
// A link in the corner switches to the plain enquiry form for questions and special requests.
//
// Two modes, chosen by the server:
//   backend = true   real availability from the shared calendar; step 4 creates the
//                    customer's account, vehicle and first appointment, then goes to payment
//   backend = false  (no database keys configured) the booking is sent to us as a message

type Contact = { phone: string | null; phoneDisplay: string | null; email: string | null };
const STEPS = ["size", "plan", "date", "checkout"] as const;

export function SignupWizard({
  initialPlan,
  initialSize,
  enquiry,
  contact,
  backend = false,
  payOnline = false,
}: {
  initialPlan?: string;
  initialSize?: string;
  enquiry?: boolean;
  contact: Contact;
  backend?: boolean;
  payOnline?: boolean;
}) {
  const [mode, setMode] = useState<"booking" | "enquiry">(enquiry ? "enquiry" : "booking");
  const [index, setIndex] = useState(0);
  const [size, setSize] = useState(sizes.some((s) => s.key === initialSize) ? initialSize! : "");
  const [plan, setPlan] = useState(plans.some((p) => p.key === initialPlan) ? initialPlan! : "");
  const [when, setWhen] = useState({ date: "", time: 18 }); // 18 half-hours = 9:00
  const [location, setLocation] = useState("doma");
  const [picked, setPicked] = useState<Picked | null>(null); // backend mode: a real free slot

  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div role="status" className="wiz-step mx-auto max-w-[720px] rounded-3xl bg-lime p-8 md:p-12">
        <h1 className="t-headline">{mode === "booking" ? "Rezervacija je pri nas." : "Sporočilo je pri nas."}</h1>
        <p className="t-lead mt-4 max-w-[36ch]">
          {mode === "booking" ? "Kontaktirali te bomo in potrdili termin." : "Kontaktirali te bomo v najkrajšem možnem času."}
        </p>
      </div>
    );
  }

  const errors = state.status === "invalid" ? state.errors : {};
  const values = state.status === "invalid" || state.status === "failed" ? state.values : null;
  const failed = state.status === "failed" ? <Failed contact={contact} /> : null;

  // ---------- Plain enquiry form ----------
  if (mode === "enquiry") {
    return (
      <div className="mx-auto max-w-[720px]">
        <div className="flex justify-end">
          <button type="button" className="link-action text-sm text-steel" onClick={() => setMode("booking")}>
            Rezerviraj termin v nekaj klikih
          </button>
        </div>
        <form action={action} noValidate className="wiz-step mt-8">
          <h1 className="t-headline">Kaj te zanima?</h1>
          <p className="t-lead mt-4 text-steel">Vprašanja, posebne zahteve ali več vozil. Kontaktirali te bomo.</p>
          {failed}
          <input type="hidden" name="kind" value="enquiry" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field label="Ime in priimek" name="name" autoComplete="name" defaultValue={values?.name} error={errors.name} required />
            <Field label="Podjetje (neobvezno)" name="company" autoComplete="organization" defaultValue={values?.company} />
            <Field label="E-naslov" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={values?.email} error={errors.email} required />
            <Field label="Telefon (neobvezno)" name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={values?.phone} error={errors.phone} />
          </div>
          <label className="mt-5 block">
            <span className="t-label mb-2 block text-steel">Sporočilo</span>
            <textarea name="message" rows={5} defaultValue={values?.message} className="field" placeholder="Kaj voziš, kaj potrebuješ, koliko vozil imate …" />
          </label>
          <Honeypot />
          <Submit pending={pending} label="Pošlji povpraševanje" />
        </form>
      </div>
    );
  }

  // ---------- Booking flow ----------
  const step = STEPS[index];
  const sizeKey = (size || "small") as SizeKey;
  const chosenPlan = plans.find((p) => p.key === plan);
  const next = () => setIndex((i) => Math.min(i + 1, STEPS.length - 1));

  return (
    <div className={`mx-auto ${step === "date" || step === "checkout" ? "max-w-[980px]" : "max-w-[720px]"}`}>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="t-label rounded-full px-1 py-2 text-steel hover:text-ink disabled:hidden">
          ← Nazaj
        </button>
        <div className="wiz-bar flex-1" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={index + 1} aria-label="Napredek prijave">
          <span style={{ width: `${((index + 1) / STEPS.length) * 100}%` }} />
        </div>
        <span className="t-label tabular-nums text-steel">
          {index + 1} / {STEPS.length}
        </span>
      </div>
      <div className="mt-3 flex justify-end">
        <button type="button" className="link-action text-sm text-steel" onClick={() => setMode("enquiry")}>
          Dodatna vprašanja ali zahteve? Standardna prijava
        </button>
      </div>

      <div key={step} className="wiz-step mt-8 md:mt-10">
        {step === "size" && (
          <Question title="Kaj voziš?">
            {sizes.map((s) => (
              <Option
                key={s.key}
                selected={size === s.key}
                label={s.label}
                onClick={() => {
                  setSize(s.key);
                  next();
                }}
              />
            ))}
          </Question>
        )}

        {step === "plan" && (
          <Question title="Kako pogosto naj pridemo?">
            {plans.map((p) => (
              <Option
                key={p.key}
                selected={plan === p.key}
                label={p.visits === 1 ? "Enkrat na mesec" : p.key === "premium" ? "Dvakrat na mesec, z ugodnostmi" : "Dvakrat na mesec"}
                hint={p.name}
                right={`${eur(monthlyPrice(p, sizeKey))} / mesec`}
                tag={p.highlighted ? "Najbolj priljubljen" : undefined}
                onClick={() => {
                  setPlan(p.key);
                  next();
                }}
              />
            ))}
          </Question>
        )}

        {step === "date" && (
          <div>
            <h1 className="t-headline">Rezerviraj svoj prvi termin.</h1>
            <div className="mt-8">
              {backend ? <SlotPicker size={sizeKey} first onChange={setPicked} /> : <DateTimePicker date={when.date} time={when.time} onChange={setWhen} />}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button type="button" className="btn btn-primary disabled:opacity-50" disabled={backend ? !picked : !when.date} onClick={next}>
                Naprej
              </button>
              <p className="text-sm text-steel first-letter:uppercase">{backend ? (picked?.label ?? "Prikazani so samo prosti termini.") : "Termin ti potrdimo, preden pridemo."}</p>
            </div>
          </div>
        )}

        {step === "checkout" && backend && <CheckoutForm size={sizeKey} plan={plan} picked={picked} payOnline={payOnline} />}

        {step === "checkout" && !backend && (
          <form action={action} noValidate>
            <h1 className="t-headline">Zaključi rezervacijo.</h1>
            {failed}
            <input type="hidden" name="kind" value="booking" />
            <input type="hidden" name="size" value={size} />
            <input type="hidden" name="plan" value={plan} />
            <input type="hidden" name="date" value={when.date} />
            <input type="hidden" name="time" value={formatTime(when.time)} />
            <input type="hidden" name="location" value={location} />

            <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-start">
              <div className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Ime in priimek" name="name" autoComplete="name" defaultValue={values?.name} error={errors.name} required />
                  <Field label="E-naslov" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={values?.email} error={errors.email} required />
                </div>
                <Field label="Telefon (neobvezno)" name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={values?.phone} error={errors.phone} />

                <fieldset>
                  <legend className="t-label mb-2 text-steel">Kje naj ga operemo?</legend>
                  <div className="inline-flex flex-wrap gap-1 rounded-[28px] bg-white p-1">
                    {locationOptions.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={location === o.value}
                        onClick={() => setLocation(o.value)}
                        className={`t-label rounded-full px-4 py-3 transition-colors ${location === o.value ? "bg-ink text-white" : "hover:bg-fog"}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Ulica in hišna številka" name="street" autoComplete="street-address" defaultValue={values?.street} error={errors.street} required />
                  <Field label="Poštna številka in kraj" name="city" autoComplete="postal-code" defaultValue={values?.city} error={errors.city} required />
                </div>
              </div>

              {/* Order summary */}
              <aside className="rounded-3xl bg-ink p-6 text-white md:p-7">
                <p className="t-label text-lime">Tvoja rezervacija</p>
                <dl className="mt-5 grid gap-4">
                  <Row term="Paket" value={chosenPlan?.name ?? "Ni izbran"} />
                  <Row term="Vozilo" value={sizes.find((s) => s.key === sizeKey)?.label ?? ""} />
                  <Row term="Prvi termin" value={when.date ? `${formatDate(when.date)} ob ${formatTime(when.time)}` : "Ni izbran"} error={errors.date} />
                </dl>
                {chosenPlan ? (
                  <p className="mt-6 border-t border-white/15 pt-5">
                    <span className="t-num text-[2.5rem] leading-none text-lime">{eur(monthlyPrice(chosenPlan, sizeKey))}</span>
                    <span className="ml-2 text-white/70">na mesec</span>
                  </p>
                ) : null}
                <p className="mt-4 text-sm text-white/70">Zdaj ne plačaš ničesar. Kontaktirali te bomo in potrdili termin.</p>
              </aside>
            </div>

            <Honeypot />
            <Submit pending={pending} label="Potrdi rezervacijo" />
          </form>
        )}
      </div>
    </div>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="t-headline">{title}</h1>
      <div className="mt-8 grid gap-3">{children}</div>
    </div>
  );
}

function Option({ label, hint, right, tag, selected, onClick }: { label: string; hint?: string; right?: string; tag?: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" className="wiz-option" aria-pressed={selected} onClick={onClick}>
      <span>
        <span className="t-title flex flex-wrap items-center gap-x-3 gap-y-1 !text-[clamp(1.15rem,1.8vw,1.5rem)]">
          {label}
          {tag ? <span className="t-label rounded-full bg-lime px-2.5 py-1 !text-[0.68rem] text-ink">{tag}</span> : null}
        </span>
        {hint ? <span className="mt-1 block text-[0.95rem] opacity-65">{hint}</span> : null}
      </span>
      {right ? <span className="t-num whitespace-nowrap text-[clamp(1.05rem,1.6vw,1.35rem)]">{right}</span> : <span aria-hidden="true">→</span>}
    </button>
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

function Field({ label, error, name, ...rest }: { label: string; error?: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const errId = `${name}-error`;
  return (
    <label className="block">
      <span className="t-label mb-2 block text-steel">{label}</span>
      <input name={name} className="field" aria-invalid={error ? true : undefined} aria-describedby={error ? errId : undefined} {...rest} />
      {error ? (
        <span id={errId} className="mt-2 block text-sm text-[#c4281c]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
      <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
        {pending ? "Pošiljam …" : label}
      </button>
      <p className="text-sm text-steel">Podatke uporabimo samo za to, da se ti oglasimo.</p>
    </div>
  );
}

function Honeypot() {
  return (
    <div className="hidden" aria-hidden="true">
      <label>
        Spletna stran
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function Failed({ contact }: { contact: Contact }) {
  return (
    <div role="alert" className="mt-6 rounded-xl border-[1.5px] border-[#c4281c] bg-white p-5">
      <p className="font-semibold">Tega nismo mogli poslati.</p>
      <p className="mt-1 text-steel">
        Poskusi še enkrat čez minuto
        {contact.phone ? (
          <>
            {" "}
            ali nas pokliči na{" "}
            <Link className="link-action text-ink" href={`tel:${contact.phone}`}>
              {contact.phoneDisplay ?? contact.phone}
            </Link>
          </>
        ) : contact.email ? (
          <>
            {" "}
            ali nam piši na{" "}
            <Link className="link-action text-ink" href={`mailto:${contact.email}`}>
              {contact.email}
            </Link>
          </>
        ) : null}
        .
      </p>
    </div>
  );
}
