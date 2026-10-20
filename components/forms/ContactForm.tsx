"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { site } from "@/config/site";
import { CallLink } from "@/components/site/ContactLinks";
import { validateEmail, validatePhone, type FieldErrors } from "@/lib/inquiry";
import { track } from "@/lib/track";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const uid = useId();
  const [v, setV] = useState({ name: "", phone: "", email: "", message: "", website: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const startedAt = useRef<number | null>(null);
  const dark = tone === "dark";
  const field = `field ${dark ? "field-dark" : ""}`;
  const errCls = `field-error ${dark ? "field-error-dark" : ""}`;
  const muted = dark ? "text-white/65" : "text-steel";

  const set = (k: keyof typeof v, val: string) => {
    startedAt.current ??= Date.now();
    setV((p) => ({ ...p, [k]: val }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FieldErrors = {};
    const p = validatePhone(v.phone);
    if (p) errs.phone = p;
    const m = validateEmail(v.email);
    if (m) errs.email = m;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/povprasevanje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "contact", ...v, page: window.location.pathname, startedAt: startedAt.current ?? undefined }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; fields?: FieldErrors } | null;
      if (res.ok && data?.ok) {
        track("contact_form_submitted");
        setStatus("success");
        return;
      }
      if (data?.fields) setErrors(data.fields);
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="py-4">
        <CheckCircle size={44} weight="fill" className={dark ? "text-lime" : "text-ink"} aria-hidden />
        <p className="t-title mt-4">Hvala za zaupanje!</p>
        <p className={`mt-2 ${muted}`}>Vaše sporočilo smo uspešno prejeli. Kontaktirali vas bomo v najkrajšem možnem času.</p>
        <p className="mt-4">
          Če želite odgovor čim prej, nas pokličite:{" "}
          <CallLink place="contact-success" className="font-bold underline underline-offset-4">
            {site.phone.display}
          </CallLink>
        </p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor={`${uid}-n`} className="label">
          Ime <span className={`font-normal ${muted}`}>(neobvezno)</span>
        </label>
        <input id={`${uid}-n`} className={field} autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${uid}-p`} className="label">
          Telefon
        </label>
        <input
          id={`${uid}-p`}
          className={field}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="040 123 456"
          value={v.phone}
          onChange={(e) => set("phone", e.target.value)}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? `${uid}-pe` : undefined}
        />
        {errors.phone ? (
          <p id={`${uid}-pe`} className={errCls} role="alert">
            {errors.phone}
          </p>
        ) : null}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${uid}-e`} className="label">
          E-pošta <span className={`font-normal ${muted}`}>(neobvezno)</span>
        </label>
        <input
          id={`${uid}-e`}
          className={field}
          type="email"
          autoComplete="email"
          value={v.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${uid}-ee` : undefined}
        />
        {errors.email ? (
          <p id={`${uid}-ee`} className={errCls} role="alert">
            {errors.email}
          </p>
        ) : null}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${uid}-m`} className="label">
          Sporočilo <span className={`font-normal ${muted}`}>(neobvezno)</span>
        </label>
        <textarea id={`${uid}-m`} className={field} maxLength={2000} value={v.message} onChange={(e) => set("message", e.target.value)} />
      </div>
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-w`}>Spletna stran</label>
        <input id={`${uid}-w`} tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => setV((p) => ({ ...p, website: e.target.value }))} />
      </div>

      {status === "error" ? (
        <div role="alert" className={`sm:col-span-2 rounded-[20px] p-5 ${dark ? "bg-[#3a1d1a] text-white" : "border-2 border-danger bg-[#fff4f2]"}`}>
          <p className="flex items-center gap-2 font-bold">
            <WarningCircle size={22} weight="fill" aria-hidden /> Oprostite, prišlo je do napake.
          </p>
          <p className="mt-2">
            Sporočila žal ni bilo mogoče poslati. Prosimo, poskusite znova ali nas pokličite:{" "}
            <CallLink place="contact-error" className="font-bold underline underline-offset-4">
              {site.phone.display}
            </CallLink>
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-span-2">
        <button type="submit" className={`btn btn-lg ${dark ? "btn-primary" : "btn-ink"}`} disabled={status === "sending"}>
          {status === "sending" ? "Pošiljamo ..." : "Pošlji sporočilo"}
        </button>
        <p className={`text-sm ${muted}`}>
          Odgovorimo na vaše sporočilo.{" "}
          <Link href="/zasebnost" className="underline underline-offset-4">
            Zasebnost
          </Link>
        </p>
      </div>
    </form>
  );
}
