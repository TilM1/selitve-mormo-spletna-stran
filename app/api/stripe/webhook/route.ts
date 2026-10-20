import type Stripe from "stripe";
import { sendEmail } from "@/features/email/send";
import { paymentFailedEmail } from "@/features/email/templates";
import { stripe, syncSubscription } from "@/features/payments/stripe";
import { db } from "@/lib/db";
import { stripeEnabled } from "@/lib/env";

// Stripe tells us here what really happened with a payment. This, not the page the
// customer lands on after paying, is what switches a subscription on.

export const dynamic = "force-dynamic";

const subscriptionIdOf = (obj: { subscription?: string | { id: string } | null; parent?: { subscription_details?: { subscription?: string | { id: string } | null } | null } | null }) => {
  const s = obj.subscription ?? obj.parent?.subscription_details?.subscription;
  return typeof s === "string" ? s : (s?.id ?? null);
};

export async function POST(req: Request) {
  if (!stripeEnabled || !process.env.STRIPE_WEBHOOK_SECRET) return new Response("not configured", { status: 503 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("bad signature", { status: 400 }); // not from Stripe
  }

  // Each event is handled once, even if Stripe delivers it several times.
  const { error: seen } = await db().from("mormo_stripe_events").insert({ id: event.id, type: event.type });
  if (seen) return new Response(seen.code === "23505" ? "already handled" : "storage error", { status: seen.code === "23505" ? 200 : 500 });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const id = subscriptionIdOf(event.data.object as Stripe.Checkout.Session);
        if (id) await syncSubscription(id);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription((event.data.object as Stripe.Subscription).id);
        break;
      case "invoice.paid": {
        const id = subscriptionIdOf(event.data.object as never);
        if (id) await syncSubscription(id);
        break;
      }
      case "invoice.payment_failed": {
        const id = subscriptionIdOf(event.data.object as never);
        const result = id ? await syncSubscription(id) : null;
        if (result) {
          const { data: sub } = await db().from("mormo_subscriptions").select("customer_id").eq("id", result.mormoId).maybeSingle();
          const { data: customer } = sub ? await db().from("mormo_customers").select("email, full_name").eq("id", sub.customer_id).maybeSingle() : { data: null };
          if (customer) await sendEmail(customer.email, paymentFailedEmail(customer.full_name));
        }
        break;
      }
    }
  } catch (err) {
    // Forget the event so Stripe's retry is processed again, then report the failure.
    await db().from("mormo_stripe_events").delete().eq("id", event.id);
    console.error("[stripe] webhook failed", event.type, err);
    return new Response("handler error", { status: 500 });
  }
  return new Response("ok");
}
