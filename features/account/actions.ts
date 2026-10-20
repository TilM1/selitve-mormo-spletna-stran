"use server";

import { redirect } from "next/navigation";
import { monthlyPrice, plans, sizes, type SizeKey } from "@/config/catalog";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/features/auth/password";
import { createSession, destroySession, requireCustomer } from "@/features/auth/session";
import { sendEmail } from "@/features/email/send";
import { bookingEmail, welcomeEmail } from "@/features/email/templates";
import { cancelStripeSubscription, changeStripePrice, createCheckoutUrl, createPortalUrl } from "@/features/payments/stripe";
import { db, rpc, UserError } from "@/lib/db";
import { backendEnabled, PRIVACY_VERSION, stripeEnabled } from "@/lib/env";
import { ljDateTime } from "@/lib/time";

// Every change a customer can make. Each action first establishes who is signed in on the
// server, then asks the database to do the work for that customer only. Rules such as
// "move an appointment at most 3 days before" are enforced by the database itself.

export type FormState = { error?: string; ok?: string; errors?: Record<string, string>; values?: Record<string, string> };

const GENERIC = "Nekaj je šlo narobe. Poskusi še enkrat.";
const text = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);
const values = (form: FormData, keys: string[]) => Object.fromEntries(keys.map((k) => [k, text(form, k)]));
const fail = (err: unknown): FormState => ({ error: err instanceof UserError ? err.message : GENERIC });
const isSlot = (v: string) => /^\d{4}-\d{2}-\d{2}T/.test(v) && !Number.isNaN(Date.parse(v));

/** First purchase on the public site: creates the account, the vehicle, the subscription and the first appointment. */
export async function registerAndCheckout(_prev: FormState, form: FormData): Promise<FormState> {
  if (!backendEnabled) return { error: "Rezervacija trenutno ni na voljo." };
  if (form.get("website")) return { ok: "sent" }; // honeypot

  const keep = values(form, ["full_name", "email", "phone", "make", "model", "nickname", "plate", "street", "city", "location"]);
  const password = String(form.get("password") ?? "");
  const slot = text(form, "slot", 40);
  const errors: Record<string, string> = {};
  if (keep.full_name.length < 2) errors.full_name = "Vpiši ime in priimek.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(keep.email)) errors.email = "Preveri e-naslov.";
  if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Geslo naj ima vsaj ${MIN_PASSWORD_LENGTH} znakov.`;
  if (keep.phone && keep.phone.replace(/\D/g, "").length < 8) errors.phone = "Preveri telefonsko številko.";
  if (keep.make.length < 1) errors.make = "Vpiši znamko vozila.";
  if (keep.street.length < 3) errors.street = "Vpiši ulico in hišno številko.";
  if (keep.city.length < 2) errors.city = "Vpiši poštno številko in kraj.";
  if (!isSlot(slot)) errors.slot = "Izberi termin.";
  if (form.get("terms") !== "on") errors.terms = "Za nadaljevanje potrdi pogoje in politiko zasebnosti.";
  if (Object.keys(errors).length) return { errors, values: keep };

  let result: { customer_id: string; subscription_id: string; booking_id: string | null };
  try {
    result = await rpc("mormo_register", {
      p_email: keep.email,
      p_password_hash: await hashPassword(password),
      p_full_name: keep.full_name,
      p_phone: keep.phone,
      p_street: keep.street,
      p_city: keep.city,
      p_location_kind: keep.location,
      p_nickname: keep.nickname || [keep.make, keep.model].filter(Boolean).join(" "),
      p_make: keep.make,
      p_model: keep.model,
      p_size: text(form, "size", 10),
      p_plate: keep.plate,
      p_plan: text(form, "plan", 20),
      p_starts_at: slot,
      p_privacy_version: PRIVACY_VERSION,
      p_marketing: form.get("marketing") === "on",
    });
  } catch (err) {
    if (err instanceof UserError && err.code === "P0002") return { errors: { email: err.message }, values: keep };
    return { ...fail(err), values: keep };
  }

  await createSession(result.customer_id);
  await sendEmail(keep.email.toLowerCase(), welcomeEmail(keep.full_name, ljDateTime(slot), false));

  let next = "/racun?dobrodosel=1";
  if (stripeEnabled) {
    try {
      next = await createCheckoutUrl({ id: result.customer_id, email: keep.email.toLowerCase(), full_name: keep.full_name, stripe_customer_id: null }, result.subscription_id);
    } catch (err) {
      console.error("[checkout] could not start payment", err);
      next = "/racun?placilo=napaka"; // the account exists; payment can be started from there
    }
  }
  redirect(next);
}

/** Another vehicle with its own plan, from inside the account. */
export async function addVehicle(_prev: FormState, form: FormData): Promise<FormState> {
  const customer = await requireCustomer("/racun/novo-vozilo");
  const keep = values(form, ["make", "model", "nickname", "plate", "size", "plan"]);
  const slot = text(form, "slot", 40);
  const errors: Record<string, string> = {};
  if (keep.make.length < 1) errors.make = "Vpiši znamko vozila.";
  if (!sizes.some((s) => s.key === keep.size)) errors.size = "Izberi velikost vozila.";
  if (!plans.some((p) => p.key === keep.plan)) errors.plan = "Izberi paket.";
  if (Object.keys(errors).length) return { errors, values: keep };

  let result: { subscription_id: string; vehicle_id: string };
  try {
    result = await rpc("mormo_add_vehicle", {
      p_customer: customer.id,
      p_nickname: keep.nickname || [keep.make, keep.model].filter(Boolean).join(" "),
      p_make: keep.make,
      p_model: keep.model,
      p_size: keep.size,
      p_plate: keep.plate,
      p_plan: keep.plan,
      p_starts_at: isSlot(slot) ? slot : null,
    });
  } catch (err) {
    return { ...fail(err), values: keep };
  }

  let next = `/racun/vozilo/${result.vehicle_id}?novo=1`;
  if (stripeEnabled) {
    try {
      next = await createCheckoutUrl(customer, result.subscription_id);
    } catch (err) {
      console.error("[checkout] could not start payment", err);
    }
  }
  redirect(next);
}

/** Books a new appointment, or moves an existing one when `booking` is given. */
export async function saveAppointment(_prev: FormState, form: FormData): Promise<FormState> {
  const vehicleId = text(form, "vehicle", 40);
  const customer = await requireCustomer(`/racun/vozilo/${vehicleId}/termin`);
  const bookingId = text(form, "booking", 40);
  const slot = text(form, "slot", 40);
  if (!isSlot(slot)) return { error: "Izberi dan in uro." };

  try {
    if (bookingId) await rpc("mormo_reschedule", { p_customer: customer.id, p_booking: bookingId, p_starts_at: slot });
    else await rpc("mormo_book", { p_customer: customer.id, p_vehicle: vehicleId, p_starts_at: slot });
  } catch (err) {
    return fail(err);
  }

  const { data: vehicle } = await db().from("mormo_vehicles").select("nickname").eq("id", vehicleId).eq("customer_id", customer.id).maybeSingle();
  await sendEmail(customer.email, bookingEmail(customer.full_name, vehicle?.nickname ?? "Vozilo", ljDateTime(slot), Boolean(bookingId)));
  redirect(`/racun/vozilo/${vehicleId}?termin=${bookingId ? "prestavljen" : "rezerviran"}`);
}

export async function changePlan(_prev: FormState, form: FormData): Promise<FormState> {
  const customer = await requireCustomer();
  const subscriptionId = text(form, "subscription", 40);
  const planKey = text(form, "plan", 20);
  const plan = plans.find((p) => p.key === planKey);
  if (!plan) return { error: "Izberi paket." };

  const { data: sub } = await db()
    .from("mormo_subscriptions")
    .select("id, vehicle_id, plan_key, stripe_subscription_id")
    .eq("id", subscriptionId)
    .eq("customer_id", customer.id) // only the customer's own subscription
    .maybeSingle();
  if (!sub) return { error: "Naročnina ne obstaja." };
  if (sub.plan_key === planKey) return { ok: "Ta paket že imaš." };

  try {
    if (sub.stripe_subscription_id && stripeEnabled) {
      const { data: vehicle } = await db().from("mormo_vehicles").select("nickname, size").eq("id", sub.vehicle_id).single();
      const cents = monthlyPrice(plan, (vehicle?.size ?? "small") as SizeKey) * 100;
      await changeStripePrice(sub.stripe_subscription_id, cents, `Mormo.si ${plan.name} · ${vehicle?.nickname ?? "vozilo"}`);
    }
    await rpc("mormo_change_plan", { p_customer: customer.id, p_subscription: subscriptionId, p_plan: planKey });
  } catch (err) {
    return fail(err);
  }
  return { ok: `Paket je spremenjen na ${plan.name}.` };
}

export async function updateVehicle(_prev: FormState, form: FormData): Promise<FormState> {
  const customer = await requireCustomer();
  try {
    await rpc("mormo_update_vehicle", {
      p_customer: customer.id,
      p_vehicle: text(form, "vehicle", 40),
      p_nickname: text(form, "nickname", 60),
      p_make: text(form, "make", 80),
      p_model: text(form, "model", 80),
      p_plate: text(form, "plate", 16),
    });
  } catch (err) {
    return fail(err);
  }
  return { ok: "Shranjeno." };
}

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const customer = await requireCustomer("/racun/profil");
  try {
    await rpc("mormo_update_profile", {
      p_customer: customer.id,
      p_full_name: text(form, "full_name", 120),
      p_phone: text(form, "phone", 40),
      p_street: text(form, "street", 160),
      p_city: text(form, "city", 120),
      p_location_kind: text(form, "location", 10),
      p_access_notes: text(form, "access_notes", 500),
      p_marketing: form.get("marketing") === "on",
    });
  } catch (err) {
    return fail(err);
  }
  return { ok: "Shranjeno." };
}

/** Pay for a subscription that is still waiting for payment. */
export async function payNow(form: FormData) {
  const customer = await requireCustomer();
  if (!stripeEnabled) redirect("/racun");
  let url = "/racun?placilo=napaka";
  try {
    url = await createCheckoutUrl(customer, text(form, "subscription", 40));
  } catch (err) {
    console.error("[checkout] could not start payment", err);
  }
  redirect(url);
}

/** Stripe's page for cards, invoices and cancelling. */
export async function openBilling() {
  const customer = await requireCustomer("/racun/profil");
  if (!stripeEnabled || !customer.stripe_customer_id) redirect("/racun/profil");
  let url = "/racun/profil";
  try {
    url = await createPortalUrl(customer.stripe_customer_id);
  } catch (err) {
    console.error("[billing] portal failed", err);
  }
  redirect(url);
}

/** GDPR erasure, confirmed with the password. */
export async function deleteAccount(_prev: FormState, form: FormData): Promise<FormState> {
  const customer = await requireCustomer("/racun/profil");
  const { data: cred } = await db().from("mormo_credentials").select("password_hash").eq("customer_id", customer.id).maybeSingle();
  if (!cred || !(await verifyPassword(String(form.get("password") ?? ""), cred.password_hash))) {
    return { error: "Geslo ni pravilno." };
  }
  try {
    if (stripeEnabled) {
      const { data: subs } = await db().from("mormo_subscriptions").select("stripe_subscription_id").eq("customer_id", customer.id).not("stripe_subscription_id", "is", null);
      for (const s of subs ?? []) await cancelStripeSubscription(s.stripe_subscription_id);
    }
    await rpc("mormo_delete_customer", { p_customer: customer.id });
  } catch (err) {
    return fail(err);
  }
  await destroySession();
  redirect("/?racun=izbrisan");
}
