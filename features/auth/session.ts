import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { backendEnabled } from "@/lib/env";

// Sign-in sessions. The browser holds a random token in an httpOnly cookie (scripts on the
// page cannot read it). The database stores only a hash of that token, so even someone
// who could read the sessions table could not sign in as a customer.

const COOKIE = "mormo_session";
const DAYS = 30;

export type Customer = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  street: string | null;
  city: string | null;
  location_kind: string | null;
  access_notes: string | null;
  stripe_customer_id: string | null;
  marketing_consent_at: string | null;
};

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");

export async function createSession(customerId: string) {
  const token = newToken();
  const expires = new Date(Date.now() + DAYS * 864e5);
  const { error } = await db().from("mormo_sessions").insert({ token_hash: sha256(token), customer_id: customerId, expires_at: expires.toISOString() });
  if (error) throw new Error("session_create_failed");
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db().from("mormo_sessions").delete().eq("token_hash", sha256(token));
  jar.delete(COOKIE);
}

/** The signed-in customer, or null. Looked up once per request. */
export const getCustomer = cache(async (): Promise<Customer | null> => {
  if (!backendEnabled) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { data: session } = await db()
    .from("mormo_sessions")
    .select("customer_id, expires_at")
    .eq("token_hash", sha256(token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!session) return null;
  const { data: customer } = await db()
    .from("mormo_customers")
    .select("id, email, full_name, phone, street, city, location_kind, access_notes, stripe_customer_id, marketing_consent_at")
    .eq("id", session.customer_id)
    .maybeSingle();
  return (customer as Customer) ?? null;
});

/** For pages and actions that need a signed-in customer. Sends everyone else to the sign-in page. */
export async function requireCustomer(next = "/racun"): Promise<Customer> {
  if (!backendEnabled) redirect("/");
  const customer = await getCustomer();
  if (!customer) redirect(`/vpis?next=${encodeURIComponent(next)}`);
  return customer;
}
