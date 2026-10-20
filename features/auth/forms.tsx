"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, requestPasswordReset, setNewPassword, type AuthState } from "./actions";

const Err = ({ children }: { children?: string }) =>
  children ? (
    <p role="alert" className="rounded-xl border-[1.5px] border-[#c4281c] bg-white p-4 text-[#8f1d14]">
      {children}
    </p>
  ) : null;

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, {});
  return (
    <form action={action} className="grid gap-5">
      {notice ? <p className="rounded-xl bg-lime p-4">{notice}</p> : null}
      <Err>{state.error}</Err>
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="block">
        <span className="t-label mb-2 block text-steel">E-naslov</span>
        <input className="field" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state.email} required />
      </label>
      <label className="block">
        <span className="t-label mb-2 block text-steel">Geslo</span>
        <input className="field" name="password" type="password" autoComplete="current-password" required />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Prijavljam …" : "Prijava"}
        </button>
        <Link href="/pozabljeno-geslo" className="link-action text-steel">
          Pozabljeno geslo?
        </Link>
      </div>
    </form>
  );
}

export function ResetRequestForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  if (state.done) {
    return (
      <p role="status" className="rounded-2xl bg-lime p-6">
        Če račun s tem e-naslovom obstaja, smo nanj poslali povezavo za novo geslo. Velja eno uro.
      </p>
    );
  }
  return (
    <form action={action} className="grid gap-5">
      <Err>{state.error}</Err>
      <label className="block">
        <span className="t-label mb-2 block text-steel">E-naslov</span>
        <input className="field" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state.email} required />
      </label>
      <div>
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Pošiljam …" : "Pošlji povezavo"}
        </button>
      </div>
    </form>
  );
}

export function NewPasswordForm({ token, minLength }: { token: string; minLength: number }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(setNewPassword, {});
  return (
    <form action={action} className="grid gap-5">
      <Err>{state.error}</Err>
      <input type="hidden" name="token" value={token} />
      <label className="block">
        <span className="t-label mb-2 block text-steel">Novo geslo (vsaj {minLength} znakov)</span>
        <input className="field" name="password" type="password" autoComplete="new-password" minLength={minLength} required />
      </label>
      <div>
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Shranjujem …" : "Shrani novo geslo"}
        </button>
      </div>
    </form>
  );
}
