import { NextResponse, type NextRequest } from "next/server";
import { sanitize, validateInquiry } from "@/lib/inquiry";
import { sendInquiryEmail } from "@/lib/email";
import { rateLimited } from "@/lib/rate-limit";
import { site } from "@/config/site";

// One endpoint for the inquiry wizard and the contact form.
// Returns { ok: true } only after the email provider has accepted the message.

const MIN_FILL_MS = 2500;

export async function POST(req: NextRequest) {
  // Same-origin only: the forms post from our own pages.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.nextUrl.host && !origin.startsWith(site.url)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const payload = sanitize(body);
  if (!payload) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });

  // Bots fill the hidden field or submit instantly. Answer like a success so they do not retry, send nothing.
  const tooFast = payload.startedAt != null && Date.now() - payload.startedAt < MIN_FILL_MS;
  if (payload.website || tooFast) {
    return NextResponse.json({ ok: true });
  }

  const errors = validateInquiry(payload);
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, error: "invalid", fields: errors }, { status: 422 });
  }

  try {
    await sendInquiryEmail(payload);
  } catch (err) {
    console.error("[inquiry] delivery failed", err);
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
