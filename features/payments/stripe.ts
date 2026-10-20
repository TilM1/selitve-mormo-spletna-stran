import "server-only";
import Stripe from "stripe";
import { firstMonthPrice, plans, type SizeKey } from "@/config/catalog";
import { site } from "@/config/site";
import { db, rpc } from "@/lib/db";

// Everything that talks to Stripe. Card details never reach our servers: the customer
// types them on Stripe's own page, and we only learn the outcome through the webhook.

let client: Stripe | null = null;
export function stripe(): Stripe {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}

type Sub = { id: string; customer_id: string; vehicle_id: string; plan_key: string; monthly_amount_cents: number; stripe_subscription_id: string | null };

const planName = (key: string) => plans.find((p) => p.key === key)?.name ?? key;

async function ensureStripeCustomer(customer: { id: string; email: string; full_name: string; stripe_customer_id: string | null }) {
  if (customer.stripe_customer_id) return customer.stripe_customer_id;
  const created = await stripe().customers.create({ email: customer.email, name: customer.full_name, metadata: { mormo_customer_id: customer.id } });
  await db().from("mormo_customers").update({ stripe_customer_id: created.id }).eq("id", customer.id);
  return created.id;
}

/** Returns the Stripe page where the customer pays for one vehicle's subscription. */
export async function createCheckoutUrl(
  customer: { id: string; email: string; full_name: string; stripe_customer_id: string | null },
  subscriptionId: string,
): Promise<string> {
  const { data: sub } = await db()
    .from("mormo_subscriptions")
    .select("id, customer_id, vehicle_id, plan_key, monthly_amount_cents, stripe_subscription_id")
    .eq("id", subscriptionId)
    .eq("customer_id", customer.id)
    .single<Sub>();
  if (!sub) throw new Error("subscription_not_found");
  const { data: vehicle } = await db().from("mormo_vehicles").select("nickname, size").eq("id", sub.vehicle_id).single();
  const label = `${planName(sub.plan_key)} · ${vehicle?.nickname ?? "vozilo"}`;

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: await ensureStripeCustomer(customer),
    locale: "sl",
    // Amounts come from our own catalog and database, never from the browser.
    // First month: the first-visit price, charged today. The regular monthly price
    // starts one month later (Stripe "trial" simply means "no recurring charge yet").
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: firstMonthPrice((vehicle?.size ?? "small") as SizeKey) * 100,
          product_data: { name: `Mormo.si prvi mesec (prvi, temeljit obisk) · ${vehicle?.nickname ?? "vozilo"}` },
        },
      },
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: sub.monthly_amount_cents,
          recurring: { interval: "month" },
          product_data: { name: `Mormo.si ${label}` },
        },
      },
    ],
    metadata: { mormo_subscription_id: sub.id },
    subscription_data: { metadata: { mormo_subscription_id: sub.id }, trial_period_days: 30 },
    success_url: `${site.url}/racun?placilo=uspeh`,
    cancel_url: `${site.url}/racun?placilo=preklicano`,
  });
  if (!session.url) throw new Error("checkout_no_url");
  return session.url;
}

/** Stripe's own page for cards, invoices and cancelling. */
export async function createPortalUrl(stripeCustomerId: string): Promise<string> {
  const session = await stripe().billingPortal.sessions.create({ customer: stripeCustomerId, return_url: `${site.url}/racun/profil` });
  return session.url;
}

/** Changes the monthly price of a live subscription. Call before updating our own record. */
export async function changeStripePrice(stripeSubscriptionId: string, monthlyCents: number, label: string) {
  const current = await stripe().subscriptions.retrieve(stripeSubscriptionId);
  const item = current.items.data[0];
  const product = typeof item.price.product === "string" ? item.price.product : item.price.product.id;
  await stripe().products.update(product, { name: label });
  await stripe().subscriptions.update(stripeSubscriptionId, {
    items: [{ id: item.id, price_data: { currency: "eur", product, unit_amount: monthlyCents, recurring: { interval: "month" } } }],
    proration_behavior: "create_prorations",
  });
}

export async function cancelStripeSubscription(stripeSubscriptionId: string) {
  await stripe().subscriptions.cancel(stripeSubscriptionId).catch((err) => console.error("[stripe] cancel failed", err?.message));
}

const STATUS: Record<string, string> = {
  active: "active",
  trialing: "active",
  past_due: "past_due",
  unpaid: "past_due",
  paused: "paused",
  canceled: "canceled",
  incomplete_expired: "canceled",
  incomplete: "pending",
};

/** Copies the state of a Stripe subscription into our database. Safe to call repeatedly. */
export async function syncSubscription(stripeSubscriptionId: string) {
  const sub = await stripe().subscriptions.retrieve(stripeSubscriptionId);
  const mormoId = sub.metadata?.mormo_subscription_id;
  if (!mormoId) return null;
  const item = sub.items.data[0] as Stripe.SubscriptionItem & { current_period_start?: number; current_period_end?: number };
  const legacy = sub as Stripe.Subscription & { current_period_start?: number; current_period_end?: number };
  const start = item?.current_period_start ?? legacy.current_period_start;
  const end = item?.current_period_end ?? legacy.current_period_end;
  const status = STATUS[sub.status] ?? "pending";
  await rpc("mormo_apply_subscription_state", {
    p_subscription: mormoId,
    p_status: status,
    p_stripe_subscription: sub.id,
    p_stripe_price: item?.price?.id ?? null,
    p_period_start: start ? new Date(start * 1000).toISOString() : null,
    p_period_end: end ? new Date(end * 1000).toISOString() : null,
    p_cancel_at_period_end: sub.cancel_at_period_end,
  });
  return { mormoId, status };
}
