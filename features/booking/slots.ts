"use server";

import { getCustomer } from "@/features/auth/session";
import { rpc, UserError } from "@/lib/db";
import { backendEnabled } from "@/lib/env";
import { ljDateKey, ljTime } from "@/lib/time";

export type Slot = { iso: string; time: string };
export type SlotsByDay = Record<string, Slot[]>;

/**
 * Free appointment times for one calendar month ("2026-10"), grouped by day.
 * Reveals only which times are free, nothing about what else is in the calendar.
 */
export async function fetchSlots(month: string, size: string, first: boolean, ignoreBooking?: string): Promise<SlotsByDay> {
  if (!backendEnabled || !/^\d{4}-\d{2}$/.test(month)) return {};
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const customer = ignoreBooking ? await getCustomer() : null;

  try {
    const rows = await rpc<{ slot: string }[]>("mormo_available_slots", {
      p_from: `${month}-01`,
      p_to: `${month}-${String(lastDay).padStart(2, "0")}`,
      p_size: ["small", "suv", "xl"].includes(size) ? size : "small",
      p_first: first,
      p_customer: customer?.id ?? null,
      p_ignore_booking: customer && ignoreBooking ? ignoreBooking : null,
    });
    const days: SlotsByDay = {};
    for (const { slot } of rows) (days[ljDateKey(slot)] ??= []).push({ iso: slot, time: ljTime(slot) });
    return days;
  } catch (err) {
    if (!(err instanceof UserError)) console.error("[slots] failed");
    return {};
  }
}
