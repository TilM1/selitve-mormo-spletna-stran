"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowsDownUp,
  ArrowCounterClockwise,
  CalendarBlank,
  Check,
  CheckCircle,
  Lightning,
  Package,
  Phone,
  Recycle,
  Truck,
  WarningCircle,
} from "@phosphor-icons/react";
import { inquiryServices, itemGroups } from "@/content/home";
import type { InquiryService } from "@/content/services";
import { site } from "@/config/site";
import { CallLink } from "@/components/site/ContactLinks";
import { todayLjubljana, validateEmail, validatePhone, serviceLabel, type FieldErrors, type InquiryPayload } from "@/lib/inquiry";
import { ABROAD_LABEL, describeDistance, distanceLabel, matchPlace, places } from "@/lib/places";
import { track } from "@/lib/track";
import { Calendar } from "./Calendar";

// The map is the heaviest part, so it loads only when the route step opens. If it fails,
// the two searchable fields above it still do the whole job.
const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => <div className="aspect-[1000/662] w-full animate-pulse rounded-[20px] bg-fog" aria-hidden />,
});

type State = {
  service?: InquiryService;
  when?: "asap" | "date";
  date?: string;
  items: string[];
  itemsNote: string;
  from: string;
  fromId?: string;
  to: string;
  toId?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  website: string; // honeypot
};

const EMPTY: State = { items: [], itemsNote: "", from: "", to: "", name: "", phone: "", email: "", message: "", website: "" };
const STEPS = ["Storitev", "Termin", "Predmeti", "Pot", "Kontakt"];
const DRAFT_KEY = "mormo-povprasevanje-v1";
const ICONS = { selitev: Package, prevoz: Truck, odvoz: Recycle } as const;

type Status = "idle" | "sending" | "success" | "error";

export function InquiryWizard({ initialService }: { initialService?: InquiryService }) {
  const [s, setS] = useState<State>({ ...EMPTY, service: initialService });
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [target, setTarget] = useState<"from" | "to">("from");
  const startedAt = useRef<number | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false); // focus moves only after the visitor changes step
  const today = useMemo(() => todayLjubljana(), []);
  const uid = useId();

  // Restore an unsent draft (same tab session only).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { s: State; step: number };
        setS({ ...EMPTY, ...d.s, website: "", service: d.s.service ?? initialService });
        setStep(Math.min(Math.max(d.step ?? 0, 0), STEPS.length - 1));
      }
    } catch {}
  }, [initialService]);

  useEffect(() => {
    if (status === "success") return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ s: { ...s, website: "" }, step }));
    } catch {}
  }, [s, step, status]);

  // Move focus to the step heading after navigation, for keyboard and screen-reader users.
  useEffect(() => {
    if (!navigated.current) return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.closest("[data-wizard]")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [step, status]);

  const set = <K extends keyof State>(k: K, v: State[K]) => {
    if (startedAt.current == null) {
      startedAt.current = Date.now();
      track("inquiry_started");
    }
    setS((prev) => ({ ...prev, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const service = s.service;
  const groups = service ? itemGroups[service] : [];
  const validItems = useMemo(() => {
    const allowed = new Set(groups.flatMap((g) => g.items.map((i) => `${g.title}: ${i}`)));
    return s.items.filter((i) => allowed.has(i));
  }, [groups, s.items]);
  const distance = describeDistance({ id: s.fromId, text: s.from }, { id: s.toId, text: s.to });

  function stepErrors(i: number): FieldErrors {
    const e: FieldErrors = {};
    if (i === 0 && !service) e.service = "Izberite storitev.";
    if (i === 1) {
      if (!s.when) e.when = "Izberite eno od možnosti.";
      else if (s.when === "date" && (!s.date || s.date < today)) e.date = "Izberite datum v koledarju.";
    }
    if (i === 3) {
      if (!s.from.trim()) e.from = service === "odvoz" ? "Vpišite, od kod odpeljemo." : "Vpišite ali na zemljevidu izberite začetno lokacijo.";
      if (service !== "odvoz" && !s.to.trim()) e.to = "Vpišite ali na zemljevidu izberite končno lokacijo.";
    }
    if (i === 4) {
      const p = validatePhone(s.phone);
      if (p) e.phone = p;
      const m = validateEmail(s.email);
      if (m) e.email = m;
    }
    return e;
  }

  const go = (to: number) => {
    navigated.current = true;
    setDir(to > step ? "fwd" : "back");
    setStep(to);
  };

  const next = () => {
    const e = stepErrors(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    track("inquiry_step_completed", { step: step + 1, name: STEPS[step] });
    go(step + 1);
  };

  const pickService = (id: InquiryService) => {
    set("service", id);
    track("inquiry_step_completed", { step: 1, name: STEPS[0] });
    setTimeout(() => go(1), 180);
  };

  const pickPlace = (id: string) => {
    const p = places.find((x) => x.id === id);
    if (!p) return;
    if (target === "from") {
      if (p.id === s.toId) return;
      setS((prev) => ({ ...prev, from: p.name, fromId: p.id }));
      setErrors((e) => ({ ...e, from: undefined }));
      setTarget("to");
    } else {
      if (p.id === s.fromId) return;
      setS((prev) => ({ ...prev, to: p.name, toId: p.id }));
      setErrors((e) => ({ ...e, to: undefined }));
    }
  };

  const typePlace = (which: "from" | "to", text: string) => {
    const hit = matchPlace(text);
    setS((prev) => (which === "from" ? { ...prev, from: text, fromId: hit?.id } : { ...prev, to: text, toId: hit?.id }));
    setErrors((e) => ({ ...e, [which]: undefined }));
    // A recognised start town means the next map click is the destination.
    if (which === "from" && hit && !s.to) setTarget("to");
  };

  // "ljubljana" becomes "Ljubljana" once the field is left.
  const tidyPlace = (which: "from" | "to") =>
    setS((prev) => {
      const id = which === "from" ? prev.fromId : prev.toId;
      const name = places.find((p) => p.id === id)?.name;
      return name ? { ...prev, [which]: name } : prev;
    });

  const swap = () => setS((p) => ({ ...p, from: p.to, fromId: p.toId, to: p.from, toId: p.fromId }));
  const reset = () => {
    setS((p) => ({ ...p, from: "", fromId: undefined, to: "", toId: undefined }));
    setTarget("from");
  };

  async function submit() {
    const e = stepErrors(4);
    setErrors(e);
    if (Object.keys(e).length) return;
    navigated.current = true;
    setStatus("sending");
    const payload: InquiryPayload = {
      kind: "wizard",
      service: s.service,
      when: s.when,
      date: s.when === "date" ? s.date : undefined,
      items: validItems,
      itemsNote: s.itemsNote,
      from: s.from,
      fromId: s.fromId,
      to: s.to,
      toId: s.toId,
      name: s.name,
      phone: s.phone,
      email: s.email,
      message: s.message,
      page: typeof window !== "undefined" ? window.location.pathname : undefined,
      website: s.website,
      startedAt: startedAt.current ?? undefined,
    };
    try {
      const res = await fetch("/api/povprasevanje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; fields?: FieldErrors } | null;
      if (res.ok && data?.ok) {
        track("inquiry_submitted", { service: s.service ?? "" });
        setStatus("success");
        try {
          sessionStorage.removeItem(DRAFT_KEY);
        } catch {}
        return;
      }
      if (res.status === 422 && data?.fields) setErrors(data.fields);
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div data-wizard className="wiz-panel p-6 md:p-12" role="status">
        <CheckCircle size={56} weight="fill" className="text-ink" aria-hidden />
        <h3 ref={heading} tabIndex={-1} className="t-headline mt-6 outline-none">
          Hvala za zaupanje!
        </h3>
        <p className="t-lead mt-4 max-w-[52ch] text-steel">
          Vaše povpraševanje smo uspešno prejeli. Kontaktirali vas bomo v najkrajšem možnem času.
        </p>
        <p className="mt-6 font-semibold">Če želite ponudbo čim prej, nas lahko tudi pokličete.</p>
        <CallLink place="wizard-success" className="t-num mt-3 inline-flex items-center gap-3 text-[clamp(2rem,5vw,3.25rem)] hover:underline">
          <Phone size="0.7em" weight="fill" aria-hidden />
          {site.phone.display}
        </CallLink>
        <div className="mt-8">
          <button
            type="button"
            className="link-u text-sm"
            onClick={() => {
              setS({ ...EMPTY });
              setStep(0);
              setStatus("idle");
              startedAt.current = null;
            }}
          >
            Pošljite novo povpraševanje
          </button>
        </div>
      </div>
    );
  }

  const errId = (k: string) => `${uid}-${k}-err`;
  const Err = ({ k }: { k: keyof FieldErrors }) =>
    errors[k] ? (
      <p id={errId(k)} className="field-error" role="alert">
        {errors[k]}
      </p>
    ) : null;

  return (
    <div data-wizard className="wiz-panel overflow-hidden">
      {/* Progress */}
      <div className="border-b border-fog px-5 pb-5 pt-5 md:px-10 md:pt-7">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold">
            Korak {step + 1} od {STEPS.length}
            <span className="text-steel"> · {STEPS[step]}</span>
          </p>
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-steel hover:text-ink">
              <ArrowLeft size={16} weight="bold" aria-hidden /> Nazaj
            </button>
          ) : null}
        </div>
        <div className="progress mt-3" aria-hidden>
          {STEPS.map((label, i) => (
            <span key={label} data-done={i <= step ? "" : undefined} />
          ))}
        </div>
      </div>

      <div key={step} className="wiz-step px-5 py-7 md:px-10 md:py-10" data-dir={dir}>
        {/* STEP 1 */}
        {step === 0 ? (
          <fieldset>
            <legend className="contents">
              <h3 ref={heading} tabIndex={-1} className="t-headline outline-none">
                Kaj potrebujete?
              </h3>
            </legend>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {inquiryServices.map((o) => {
                const Icon = ICONS[o.id];
                return (
                  <button key={o.id} type="button" className="opt min-h-[180px] md:min-h-[220px]" aria-pressed={service === o.id} onClick={() => pickService(o.id)}>
                    <span className="opt__icon">
                      <Icon size={26} weight="bold" aria-hidden />
                    </span>
                    <span className="opt__check" aria-hidden>
                      <Check size={14} weight="bold" />
                    </span>
                    <span className="t-title mt-auto">{o.label}</span>
                    <span className="text-[0.95rem] opacity-75">{o.text}</span>
                  </button>
                );
              })}
            </div>
            <Err k="service" />
          </fieldset>
        ) : null}

        {/* STEP 2 */}
        {step === 1 ? (
          <fieldset>
            <legend className="contents">
              <h3 ref={heading} tabIndex={-1} className="t-headline outline-none">
                Kdaj potrebujete pomoč?
              </h3>
            </legend>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="opt"
                aria-pressed={s.when === "asap"}
                onClick={() => {
                  set("when", "asap");
                  setErrors({});
                }}
              >
                <span className="opt__icon">
                  <Lightning size={24} weight="bold" aria-hidden />
                </span>
                <span className="opt__check" aria-hidden>
                  <Check size={14} weight="bold" />
                </span>
                <span className="t-title">Čim prej</span>
                <span className="text-[0.95rem] opacity-75">Preverimo prvi prost termin in vam ga sporočimo.</span>
              </button>
              <button type="button" className="opt" aria-pressed={s.when === "date"} onClick={() => set("when", "date")}>
                <span className="opt__icon">
                  <CalendarBlank size={24} weight="bold" aria-hidden />
                </span>
                <span className="opt__check" aria-hidden>
                  <Check size={14} weight="bold" />
                </span>
                <span className="t-title">Izberem datum</span>
                <span className="text-[0.95rem] opacity-75">{s.date && s.when === "date" ? formatDate(s.date) : "Izberite dan v koledarju."}</span>
              </button>
            </div>
            <Err k="when" />
            {s.when === "date" ? (
              <div className="mt-8 grid items-start gap-6 md:grid-cols-[auto_1fr]">
                <Calendar value={s.date} min={today} onChange={(d) => set("date", d)} />
                <p className="max-w-[38ch] text-sm text-steel md:pt-14">
                  Izbrani dan ni rezervacija. Razpoložljivost preverimo in termin potrdimo, ko vam pošljemo ponudbo.
                </p>
              </div>
            ) : null}
            <Err k="date" />
          </fieldset>
        ) : null}

        {/* STEP 3 */}
        {step === 2 ? (
          <div>
            <h3 ref={heading} tabIndex={-1} className="t-headline outline-none">
              {service === "odvoz" ? "Kaj odpeljemo?" : service === "prevoz" ? "Kaj prepeljemo?" : "Kaj vse bomo selili?"}
            </h3>
            <p className="mt-3 max-w-[60ch] text-steel">
              {service === "odvoz"
                ? "Označite, kaj odvažamo, in na kratko opišite količino. Fotografije lahko pošljete pozneje po SMS."
                : "Izberite stvari, ki jih želite preseliti. Označite lahko več možnosti."}
            </p>
            <div className={`mt-8 grid gap-8 ${groups.length > 1 ? "lg:grid-cols-3" : ""}`}>
              {groups.map((g) => (
                <fieldset key={g.id}>
                  <legend className="t-label text-steel">{g.title}</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {g.items.map((it) => {
                      const key = `${g.title}: ${it}`;
                      const on = s.items.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          className="chip"
                          aria-pressed={on}
                          onClick={() => set("items", on ? s.items.filter((x) => x !== key) : [...s.items, key])}
                        >
                          {on ? <Check size={14} weight="bold" aria-hidden /> : null}
                          {it}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="mt-8 max-w-[720px]">
              <label htmlFor={`${uid}-note`} className="label">
                {service === "odvoz" ? "Opis in količina" : "Kaj še moramo vedeti?"} <span className="font-normal text-steel">(neobvezno)</span>
              </label>
              <textarea
                id={`${uid}-note`}
                className="field"
                maxLength={1000}
                value={s.itemsNote}
                onChange={(e) => set("itemsNote", e.target.value)}
                placeholder={
                  service === "odvoz"
                    ? "Npr. star kavč, dve omari in približno 10 vreč gradbenih odpadkov v kleti."
                    : service === "prevoz"
                      ? "Npr. 4 palete ploščic, skupaj približno 800 kg. Na lokaciji je viličar."
                      : "Npr. klavir, sedežna garnitura iz treh delov, 3. nadstropje brez dvigala."
                }
              />
              {s.items.some((i) => i.endsWith(": Drugo")) && !s.itemsNote.trim() ? (
                <p className="mt-2 text-sm font-semibold">Označili ste »Drugo«. Na kratko napišite, za kaj gre.</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* STEP 4 */}
        {step === 3 ? (
          <div>
            <h3 ref={heading} tabIndex={-1} className="t-headline outline-none">
              Od kod in kam?
            </h3>
            <p className="mt-3 text-steel">
              {service === "odvoz"
                ? "Izberite ali vpišite, od kod odpeljemo. Cilj ni obvezen."
                : "Izberite začetno in končno lokacijo. Na zemljevidu ali z vpisom kraja ali naslova."}
            </p>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
              <div>
                <datalist id={`${uid}-places`}>
                  {places.map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                  <option value={ABROAD_LABEL} />
                </datalist>
                <div className="grid gap-5">
                  <PlaceField
                    id={`${uid}-from`}
                    label={service === "odvoz" ? "Od kod odpeljemo?" : "Od kod?"}
                    letter="A"
                    value={s.from}
                    list={`${uid}-places`}
                    active={target === "from"}
                    onFocus={() => setTarget("from")}
                    onBlur={() => {
                      tidyPlace("from");
                      if (s.from.trim() && !s.to.trim()) setTarget("to");
                    }}
                    onChange={(v) => typePlace("from", v)}
                    error={errors.from}
                    errorId={errId("from")}
                  />
                  <PlaceField
                    id={`${uid}-to`}
                    label={service === "odvoz" ? "Kam? (neobvezno)" : "Kam?"}
                    letter="B"
                    value={s.to}
                    list={`${uid}-places`}
                    active={target === "to"}
                    onFocus={() => setTarget("to")}
                    onBlur={() => tidyPlace("to")}
                    onChange={(v) => typePlace("to", v)}
                    placeholder={service === "odvoz" ? "Po dogovoru" : "Kraj, naslov ali Tujina"}
                    error={errors.to}
                    errorId={errId("to")}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={swap} className="btn btn-sm btn-ghost" disabled={!s.from && !s.to}>
                    <ArrowsDownUp size={16} weight="bold" aria-hidden /> Zamenjaj smer
                  </button>
                  <button type="button" onClick={reset} className="btn btn-sm btn-ghost" disabled={!s.from && !s.to}>
                    <ArrowCounterClockwise size={16} weight="bold" aria-hidden /> Ponastavi
                  </button>
                </div>

                <div className="mt-6 rounded-[20px] bg-ink p-5 text-white" aria-live="polite">
                  <p className="t-label text-white/60">Ocena razdalje</p>
                  {distance.kind === "km" ? (
                    <p className="mt-1">
                      <span className="t-num text-[2.25rem] text-lime">~{distance.km} km</span>
                      <span className="ml-2 text-white/70">po cesti</span>
                    </p>
                  ) : (
                    <p className="mt-2 font-semibold">
                      {distance.kind === "none"
                        ? service === "odvoz" && s.from
                          ? "Kam odpeljemo, se dogovorimo."
                          : "Izberite obe lokaciji."
                        : distanceLabel(distance)}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-white/55">Ocena po cestah iz OpenStreetMap, med središči krajev. Točno pot preverimo ob ponudbi.</p>
                </div>
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Kaj izbirate na zemljevidu">
                  <span className="text-steel">Na zemljevidu izbirate:</span>
                  {(["from", "to"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={target === t}
                      onClick={() => setTarget(t)}
                      className="chip px-4 text-sm"
                    >
                      {t === "from" ? "A · Od kod" : "B · Kam"}
                    </button>
                  ))}
                </div>
                <RouteMap fromId={s.fromId} toId={s.toId} target={target} onPick={pickPlace} />
              </div>
            </div>
          </div>
        ) : null}

        {/* STEP 5 */}
        {step === 4 ? (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <h3 ref={heading} tabIndex={-1} className="t-headline outline-none">
                Kam vam lahko pošljemo ponudbo?
              </h3>
              <p className="mt-3 text-steel">Za ponudbo potrebujemo samo telefonsko številko. Poklicali ali pisali vam bomo v zvezi s tem povpraševanjem.</p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor={`${uid}-phone`} className="label">
                    Telefonska številka
                  </label>
                  <input
                    id={`${uid}-phone`}
                    className="field"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    placeholder="040 123 456"
                    value={s.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    onBlur={() => s.phone && setErrors((x) => ({ ...x, phone: validatePhone(s.phone) }))}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? errId("phone") : `${uid}-phone-hint`}
                  />
                  {errors.phone ? (
                    <Err k="phone" />
                  ) : (
                    <p id={`${uid}-phone-hint`} className="mt-1.5 text-sm text-steel">
                      Slovenska ali tuja številka, npr. +43 660 123 4567.
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor={`${uid}-name`} className="label">
                    Ime <span className="font-normal text-steel">(neobvezno)</span>
                  </label>
                  <input id={`${uid}-name`} className="field" autoComplete="name" value={s.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div>
                  <label htmlFor={`${uid}-email`} className="label">
                    E-pošta <span className="font-normal text-steel">(neobvezno)</span>
                  </label>
                  <input
                    id={`${uid}-email`}
                    className="field"
                    type="email"
                    autoComplete="email"
                    value={s.email}
                    onChange={(e) => set("email", e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? errId("email") : undefined}
                  />
                  <Err k="email" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`${uid}-msg`} className="label">
                    Sporočilo <span className="font-normal text-steel">(neobvezno)</span>
                  </label>
                  <textarea
                    id={`${uid}-msg`}
                    className="field"
                    maxLength={2000}
                    placeholder="Nadstropje, dvigalo, parkiranje ali karkoli, kar bi nam pomagalo."
                    value={s.message}
                    onChange={(e) => set("message", e.target.value)}
                  />
                </div>
                {/* Honeypot: hidden from people, irresistible to bots. */}
                <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label htmlFor={`${uid}-web`}>Spletna stran</label>
                  <input id={`${uid}-web`} tabIndex={-1} autoComplete="off" value={s.website} onChange={(e) => setS((p) => ({ ...p, website: e.target.value }))} />
                </div>
              </div>

              <p className="mt-6 text-sm text-steel">
                Podatke uporabimo samo za pripravo ponudbe in odgovor na povpraševanje. Več v{" "}
                <Link href="/zasebnost" className="link-u text-ink">
                  pravilniku o zasebnosti
                </Link>
                .
              </p>

              {status === "error" ? (
                <div role="alert" className="mt-6 rounded-[20px] border-2 border-danger bg-[#fff4f2] p-5">
                  <p className="flex items-center gap-2 font-bold text-danger">
                    <WarningCircle size={22} weight="fill" aria-hidden /> Oprostite, prišlo je do napake.
                  </p>
                  <p className="mt-2">Povpraševanja žal ni bilo mogoče poslati. Prosimo, poskusite znova ali nas pokličite.</p>
                  <CallLink place="wizard-error" className="t-num mt-3 inline-flex items-center gap-2 text-[1.75rem] hover:underline">
                    <Phone size={24} weight="fill" aria-hidden /> {site.phone.display}
                  </CallLink>
                </div>
              ) : null}

              <button type="submit" className="btn btn-primary btn-lg mt-8 w-full sm:w-auto" disabled={status === "sending"}>
                {status === "sending" ? "Pošiljamo ..." : status === "error" ? "Poskusi znova" : "Pošlji povpraševanje"}
                {status === "sending" ? null : (
                  <span className="btn__icon" aria-hidden>
                    <ArrowRight size={18} weight="bold" />
                  </span>
                )}
              </button>
            </form>

            <aside aria-label="Povzetek povpraševanja" className="self-start rounded-[20px] bg-fog p-6">
              <h4 className="t-title">Povzetek</h4>
              <dl className="mt-4 grid gap-4 text-[0.95rem]">
                <Summary label="Storitev" value={serviceLabel(service)} onEdit={() => go(0)} />
                <Summary label="Termin" value={s.when === "asap" ? "Čim prej" : s.date ? formatDate(s.date) : "Ni izbran"} onEdit={() => go(1)} />
                <Summary
                  label={service === "odvoz" ? "Kaj odpeljemo" : "Predmeti"}
                  value={validItems.length ? validItems.map((i) => i.split(": ")[1]).join(", ") : s.itemsNote ? "Glej opis" : "Ni izbrano"}
                  onEdit={() => go(2)}
                />
                <Summary
                  label="Pot"
                  value={`${s.from || "?"} → ${s.to || (service === "odvoz" ? "po dogovoru" : "?")}${distance.kind === "km" ? `, ~${distance.km} km` : ""}`}
                  onEdit={() => go(3)}
                />
              </dl>
            </aside>
          </div>
        ) : null}

        {/* Footer actions for steps 1-4 */}
        {step < 4 ? (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-fog pt-6">
            <p className="text-sm text-steel">
              Raje kar pokličete?{" "}
              <CallLink place={`wizard-step-${step + 1}`} className="link-u font-semibold text-ink">
                {site.phone.display}
              </CallLink>
            </p>
            <button type="button" className="btn btn-ink btn-lg" onClick={next}>
              Naprej
              <span className="btn__icon" aria-hidden>
                <ArrowRight size={18} weight="bold" />
              </span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PlaceField(props: {
  id: string;
  label: string;
  letter: string;
  value: string;
  list: string;
  active: boolean;
  placeholder?: string;
  error?: string;
  errorId: string;
  onFocus: () => void;
  onBlur?: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="label">
        {props.label}
      </label>
      <div className="relative">
        <span
          aria-hidden
          className={`absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-sm font-extrabold transition-colors ${
            props.active ? "bg-ink text-lime" : "bg-fog text-ink"
          }`}
        >
          {props.letter}
        </span>
        <input
          id={props.id}
          className="field pl-14"
          list={props.list}
          autoComplete="off"
          placeholder={props.placeholder ?? "Kraj ali naslov"}
          value={props.value}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onChange={(e) => props.onChange(e.target.value)}
          aria-invalid={!!props.error}
          aria-describedby={props.error ? props.errorId : undefined}
        />
      </div>
      {props.error ? (
        <p id={props.errorId} className="field-error" role="alert">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}

function Summary({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <dt className="text-sm text-steel">{label}</dt>
        <dd className="mt-0.5 break-words font-semibold">{value}</dd>
      </div>
      <button type="button" onClick={onEdit} className="link-u -my-2 shrink-0 py-3 text-sm" aria-label={`Uredi: ${label}`}>
        Uredi
      </button>
    </div>
  );
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("sl-SI", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}
