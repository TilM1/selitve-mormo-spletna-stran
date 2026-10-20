import "server-only";
import { db } from "@/lib/db";
import { ljDateKey } from "@/lib/time";

// Every read of customer data goes through this file, and every query here is filtered
// by the signed-in customer's id. Nothing else in the app reads these tables.

export type Booking = { id: string; vehicle_id: string; starts_at: string; duration_min: number; status: "booked" | "completed" | "cancelled"; is_first_visit: boolean };
export type Subscription = {
  id: string;
  vehicle_id: string;
  plan_key: string;
  status: "pending" | "active" | "past_due" | "paused" | "canceled";
  monthly_amount_cents: number;
  visits_per_period: number;
  stripe_subscription_id: string | null;
  cancel_at_period_end: boolean;
};
export type Vehicle = { id: string; nickname: string; make: string; model: string | null; size: "small" | "suv" | "xl"; plate: string | null };
export type GarageVehicle = Vehicle & {
  subscription: Subscription | null;
  upcoming: Booking[]; // soonest first
  history: Booking[]; // newest first
  remainingThisMonth: number;
};

export async function getGarage(customerId: string): Promise<GarageVehicle[]> {
  const [vehicles, subs, bookings] = await Promise.all([
    db().from("mormo_vehicles").select("id, nickname, make, model, size, plate").eq("customer_id", customerId).eq("active", true).order("created_at"),
    db()
      .from("mormo_subscriptions")
      .select("id, vehicle_id, plan_key, status, monthly_amount_cents, visits_per_period, stripe_subscription_id, cancel_at_period_end")
      .eq("customer_id", customerId)
      .neq("status", "canceled"),
    db()
      .from("mormo_bookings")
      .select("id, vehicle_id, starts_at, duration_min, status, is_first_visit")
      .eq("customer_id", customerId)
      .order("starts_at", { ascending: false })
      .limit(500),
  ]);
  if (vehicles.error || subs.error || bookings.error) throw new Error("garage_load_failed");

  const now = Date.now();
  const thisMonth = ljDateKey(new Date()).slice(0, 7);
  return (vehicles.data as Vehicle[]).map((v) => {
    const subscription = (subs.data as Subscription[]).find((s) => s.vehicle_id === v.id) ?? null;
    const mine = (bookings.data as Booking[]).filter((b) => b.vehicle_id === v.id);
    const usedThisMonth = mine.filter((b) => b.status !== "cancelled" && ljDateKey(b.starts_at).startsWith(thisMonth)).length;
    return {
      ...v,
      subscription,
      upcoming: mine.filter((b) => b.status === "booked" && new Date(b.starts_at).getTime() > now).reverse(),
      history: mine.filter((b) => b.status === "completed" || (b.status === "booked" && new Date(b.starts_at).getTime() <= now)),
      remainingThisMonth: subscription ? Math.max(subscription.visits_per_period - usedThisMonth, 0) : 0,
    };
  });
}

export async function getGarageVehicle(customerId: string, vehicleId: string): Promise<GarageVehicle | null> {
  if (!/^[0-9a-f-]{36}$/i.test(vehicleId)) return null;
  return (await getGarage(customerId)).find((v) => v.id === vehicleId) ?? null;
}
