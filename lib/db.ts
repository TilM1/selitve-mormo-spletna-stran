import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

// The only door to the database. It uses the secret key, so it must never be imported
// by client code ("server-only" makes the build fail if that happens).
//
// Customers have no database login of their own: the website checks who is signed in
// (features/auth) and passes that customer's id to the database functions.

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, process.env.SUPABASE_SECRET_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/** An error whose message is safe and meant to be shown to the customer. */
export class UserError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

/** Calls a database function. Business-rule refusals come back as UserError with a Slovenian message. */
export async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await db().rpc(name, args);
  if (error) {
    if (error.code === "P0001" || error.code === "P0002") throw new UserError(error.message, error.code);
    console.error(`[db] ${name} failed`, error.code, error.message);
    throw new Error("database_error");
  }
  return data as T;
}
