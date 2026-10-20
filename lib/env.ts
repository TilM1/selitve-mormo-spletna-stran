import "server-only";

// Which parts of the backend are switched on. Each part is enabled only when its keys are
// present, so the public site keeps working on a deployment that has none of them.

export const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Accounts, garage and real appointment availability. */
export const backendEnabled = Boolean(SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
/** Online payment. Without it a sign-up is saved as "awaiting confirmation". */
export const stripeEnabled = Boolean(backendEnabled && process.env.STRIPE_SECRET_KEY);
/** Outgoing e-mail (welcome, password reset, monthly reminder). */
export const emailEnabled = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

/** Bump when the privacy notice changes; stored with every consent. */
export const PRIVACY_VERSION = "2026-10";
