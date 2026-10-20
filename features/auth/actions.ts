"use server";

import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { db } from "@/lib/db";
import { backendEnabled, emailEnabled } from "@/lib/env";
import { sendEmail } from "@/features/email/send";
import { resetEmail } from "@/features/email/templates";
import { burnTime, hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "./password";
import { createSession, destroySession, newToken, sha256 } from "./session";

export type AuthState = { error?: string; done?: boolean; email?: string };

const MAX_ATTEMPTS = 8; // wrong passwords per e-mail
const WINDOW_MIN = 15;

/** Only same-site paths, so a crafted link cannot bounce a customer to another website. */
const safeNext = (value: FormDataEntryValue | null) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/racun";

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!backendEnabled) return { error: "Prijava trenutno ni na voljo." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Vpiši e-naslov in geslo.", email };

  const key = sha256(`login:${email}`);
  const since = new Date(Date.now() - WINDOW_MIN * 60_000).toISOString();
  const { count } = await db().from("mormo_login_attempts").select("*", { count: "exact", head: true }).eq("key", key).gt("at", since);
  if ((count ?? 0) >= MAX_ATTEMPTS) {
    return { error: `Preveč poskusov. Poskusi znova čez ${WINDOW_MIN} minut ali ponastavi geslo.`, email };
  }

  const { data: customer } = await db().from("mormo_customers").select("id").eq("email", email).maybeSingle();
  const { data: cred } = customer
    ? await db().from("mormo_credentials").select("password_hash").eq("customer_id", customer.id).maybeSingle()
    : { data: null };

  const ok = cred ? await verifyPassword(password, cred.password_hash) : (await burnTime(password), false);
  if (!ok || !customer) {
    await db().from("mormo_login_attempts").insert({ key });
    return { error: "E-naslov ali geslo ni pravilno.", email };
  }

  await db().from("mormo_login_attempts").delete().eq("key", key);
  await createSession(customer.id);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  if (backendEnabled) await destroySession();
  redirect("/");
}

/** Always answers the same way, so nobody can find out which e-mails have an account. */
export async function requestPasswordReset(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!backendEnabled) return { error: "Trenutno ni na voljo." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Preveri e-naslov.", email };
  if (!emailEnabled) return { error: "Pošiljanje e-pošte še ni nastavljeno. Piši nam in geslo uredimo ročno.", email };

  const { data: customer } = await db().from("mormo_customers").select("id, full_name").eq("email", email).maybeSingle();
  if (customer) {
    const token = newToken();
    await db().from("mormo_auth_tokens").insert({
      token_hash: sha256(token),
      customer_id: customer.id,
      expires_at: new Date(Date.now() + 60 * 60_000).toISOString(),
    });
    await sendEmail(email, resetEmail(customer.full_name, `${site.url}/novo-geslo?t=${token}`));
  }
  return { done: true };
}

export async function setNewPassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!backendEnabled) return { error: "Trenutno ni na voljo." };
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) return { error: `Geslo naj ima vsaj ${MIN_PASSWORD_LENGTH} znakov.` };

  // Claim the link in one step, so it cannot be used twice even by two requests at once.
  const { data: claimed } = await db()
    .from("mormo_auth_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", sha256(token))
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("customer_id")
    .maybeSingle();
  if (!claimed) return { error: "Povezava je potekla ali je bila že uporabljena. Zahtevaj novo." };

  await db().from("mormo_credentials").upsert({ customer_id: claimed.customer_id, password_hash: await hashPassword(password), updated_at: new Date().toISOString() });
  await db().from("mormo_sessions").delete().eq("customer_id", claimed.customer_id); // sign out everywhere
  redirect("/vpis?geslo=1");
}
