# Mormo.si — Architecture

Status: **proposal, awaiting approval.**

Guiding rule: the simplest set of managed services that is reliable for payments and bookings. Four vendors, one codebase, no servers to run.

---

## 1. Stack

| Layer | Choice | Why this and not something else |
|---|---|---|
| Framework | **Next.js (App Router), React, TypeScript** | Marketing pages are statically generated and ship almost no JavaScript through Server Components; the funnel, account and webhooks live in the same project. Native fit for Vercel. |
| Hosting | **Vercel (Pro)** | Already chosen. Preview deployment per pull request, cron jobs, CDN. Hobby does not permit commercial use, so Pro is required. |
| Styling | **Tailwind CSS v4 with design tokens as CSS variables, plus hand-written CSS for signature effects** | Tailwind is used for layout and spacing speed only. The look comes from the tokens and custom CSS in `DESIGN-SYSTEM.md`. No component kit, no template. |
| UI primitives | Native HTML first (`<details>`, `<dialog>`, `<input type="range">`). A headless primitive is added only for a control that native HTML cannot do accessibly. | Keeps the bundle small and the accessibility correct. |
| Database | **Supabase Postgres, region eu-central-1 (Frankfurt)** | Managed Postgres with backups, EU data residency, and you already use it. Postgres gives us the exclusion constraint that makes double booking impossible. |
| Auth | **Supabase Auth, passwordless (6-digit email code)** | No passwords to store or reset. A typed code is used in preference to a magic link because corporate mail scanners open links and consume them. |
| Payments | **Stripe Checkout + Billing + Customer Portal** | Card data never touches our servers. Checkout handles SCA, Apple Pay and Google Pay. The Portal covers card updates, invoices and cancellation without us building them. |
| Email | **Resend + React Email** | Templates are React components in the repo, versioned and previewable. One API, good deliverability, EU sending region. |
| Scheduling | **Our own small slot engine in Postgres** | A third-party scheduler cannot make duration depend on vehicle size and add-ons, or tie a booking to a paid subscription period. The engine is small (see section 6). |
| Background jobs | **Vercel Cron → route handlers** | Three daily jobs. No queue needed at this volume. |
| Animation | **CSS and native scroll-driven animations; Canvas 2D for one component; no animation library** | See `MOTION.md`. GSAP is not needed for what is specified; it is reconsidered only if a later effect needs timeline scrubbing that CSS cannot do. |
| Validation | **Zod** | One schema shared by forms, server actions and webhooks. |
| Analytics | GA4, Google Ads, Meta Pixel behind a consent gate and one typed `track()` function | One place where events are defined, so nothing fires twice. |
| Errors | Sentry (or Vercel's built-in observability to start) | Webhook and cron failures must be visible. |

### Deliberately not used

| Not used | Reason |
|---|---|
| ORM (Prisma, Drizzle) | SQL migrations plus generated types are enough; the few multi-step writes are Postgres functions, which is where atomicity belongs. |
| CMS | Content changes rarely and lives in typed files. Revisit when a non-developer needs to edit. |
| GSAP, Framer Motion, Lenis | Not required by the motion spec. Smooth-scroll libraries also hurt INP and accessibility. |
| WebGL / three.js | No effect in the spec justifies the weight. |
| Google Tag Manager | Three tags do not need a tag manager, and it invites duplicate events. |
| A queue (Inngest, QStash) | Idempotent cron jobs cover V1. |

---

## 2. System overview

```
Browser
  │
  ├── Marketing pages (static, CDN) ──────────────── no database, no auth
  │
  ├── /narocilo funnel ── server action ──► checkout_intents ──► Stripe Checkout
  │                                                                   │
  │                                   webhook (signed) ◄──────────────┘
  │                                          │
  │                                          ▼
  ├── /racun, /rezervacija ◄──────────── Supabase Postgres ◄──── Vercel Cron
  │        (auth or booking token)           │                    (reminders)
  │                                          ▼
  └── /admin (staff only)                  Resend ──► customer email
```

Stripe is the source of truth for money. Postgres is the source of truth for bookings. The webhook keeps a mirror of subscription state in Postgres so pages never call Stripe to render.

---

## 3. Application structure

```
app/
  (marketing)/            static pages, no auth, no middleware
    page.tsx              homepage
    paketi/  storitve/  kako-deluje/  za-podjetja/  faq/  kontakt/
    pogoji/  zasebnost/  piskotki/
  narocilo/               subscription funnel (vehicle → plan → extras → address → details)
    uspeh/                welcome page, verifies the session server-side
  rezervacija/            monthly booking (login or booking token)
  racun/                  customer area
  admin/                  operator view
  api/
    stripe/webhook/       Stripe events
    cron/                 monthly-reminders, day-before, nudges
  sitemap.ts  robots.ts  opengraph-image.tsx
components/
  marketing/              page sections
  motion/                 foam edge, before-after, gloss, hero video
  ui/                     button, field, etc.
config/
  catalog.ts              plans, sizes, add-ons, occasions, durations  ← single source of truth
  site.ts                 name, phone, email, service area, opening hours
  content/                Slovenian copy per section, FAQ entries
lib/
  stripe/  supabase/  email/  booking/  analytics/
emails/                   React Email templates
supabase/migrations/      SQL migrations
scripts/
  stripe-sync.ts          creates Stripe products and prices from catalog.ts
public/
  brand/  video/  img/
docs/
```

### Rendering rules

- Marketing pages are static. They read the catalog at build time and never touch the database.
- Session handling (`proxy.ts`, formerly middleware) is matched to `/racun`, `/rezervacija`, `/narocilo` and `/admin` only, so it adds no latency to marketing pages.
- A component is a Client Component only if it handles input or animation state. Section layout and copy stay on the server.
- The funnel, account and admin are excluded from indexing.

---

## 4. The catalog

`config/catalog.ts` is the only place prices, durations and labels exist.

```ts
plans:     { key, name, monthlyCents, visitsPerPeriod, baseDurationMin, features[], highlighted }
sizes:     { key, label, surchargePerVisitCents, extraDurationMin }
addons:    { key, name, group, priceCents | { fromCents, toCents }, durationMin, needsQuote }
occasions: { key, name, includes[], priceCents, durationMin, active }
reset:     { priceBySizeCents, extraDurationMin }
ops:       { travelBufferMin, slotStepMin, leadTimeHours, acceptingNewSubscribers }
```

- The marketing site, the funnel, the booking flow, the emails and the Stripe sync all read from it.
- `scripts/stripe-sync.ts` creates or updates Stripe products and prices from it. Each plan and size pair is one Stripe price with a stable `lookup_key` such as `always_clean_suv_monthly`, so code never contains a Stripe price ID.
- Add-ons with a price range ("20–40 €") are marked `needsQuote`: the customer sees the range, the final amount is set by the operator after the visit.
- Every booking and subscription stores a snapshot of the amounts it was sold at, so later price changes never rewrite history.

---

## 5. Stripe

### Subscription purchase

1. The funnel's last step calls a server action. It validates the whole payload with Zod, recomputes every price from the catalog (client-supplied amounts are ignored), stores a `checkout_intents` row, and creates a Checkout Session in `subscription` mode.
2. Line items: the recurring plan price for the chosen size, plus the Initial Reset as a one-time item on the first invoice when applicable.
3. `client_reference_id` carries the intent ID. Consent to start the service within the withdrawal period is collected with Checkout's consent field.
4. Stripe redirects to `/narocilo/uspeh?session_id=…`. The page asks our server, which checks the session with Stripe directly. A redirect alone is never treated as proof of payment.

### Webhook

One endpoint, `/api/stripe/webhook`.

1. Verify the signature.
2. Insert the event ID into `stripe_events`. If it is already there, return 200 and stop. This makes every handler safe to receive twice.
3. Fetch the current object from Stripe and upsert our mirror from that, not from the event payload, because events can arrive out of order.

| Event | What we do |
|---|---|
| `checkout.session.completed` | Turn the intent into customer, auth user, vehicle, address and subscription rows. Send the welcome email. |
| `invoice.paid` | Open a new `subscription_periods` row with the visits allowed. Record the payment. Issue a fiscally verified invoice if that integration is enabled. |
| `invoice.payment_failed` | Mark the subscription `past_due`. Send the payment-failed email with a Portal link. Existing bookings stay; new bookings are blocked. |
| `customer.subscription.updated` | Sync status, plan, period dates, pause state, `cancel_at_period_end`. Send the subscription-updated email when the plan or status changed. |
| `customer.subscription.deleted` | Mark cancelled. Cancel future bookings outside the paid period. |

### Add-ons bought during booking

The customer already has a card on file, so the add-on is charged without a second checkout:

1. Create invoice items for the add-ons and an invoice set to charge automatically.
2. If the charge succeeds, the booking items are marked paid.
3. If the bank demands authentication or the card fails, the booking is still confirmed, the items are marked `pending`, and the customer is emailed Stripe's hosted payment page. An unpaid add-on is visible in `/admin` before the visit.

### Other Stripe behaviour

- **Customer Portal**: update card, see invoices, cancel. Plan changes inside the Portal are switched off in V1 because a plan change also changes visits and vehicle size; it goes through us.
- **Skip**: pauses collection for one cycle through the API.
- **Receipts**: Stripe sends them. Stripe's own failed-payment emails are switched off so the customer gets one branded message, not two.
- **Tax**: a single Slovenian rate applied to inclusive prices if the company is VAT-registered. Stripe Tax is unnecessary for a single-country business.
- **Environments**: test-mode keys in Preview and Development, live keys only in Production. The sync script is run once per mode.

---

## 6. Booking engine

### V1 model

- One or more **workers** (a worker can be a team). Each has weekly **availability rules** and dated **exceptions** (day off, shorter day).
- A booking occupies a time range for one worker. The range is `service duration + travel buffer`.
- `service duration = plan base + size extra + sum of add-on durations (+ reset extra on the first visit)`.
- Travel is a fixed buffer from the catalog (30 minutes to start). No route optimisation.
- The service area is a list of postal codes.

### Finding slots

For each day in the bookable window and each worker: take the working hours, subtract existing bookings and exceptions, and offer start times on a 30-minute grid where the whole range fits. The window runs from `now + lead time` to the end of the paid period.

### Making a booking

A single Postgres function inserts the booking and its items. A database exclusion constraint on `(worker, time range)` rejects overlaps, so two people confirming the same slot at the same moment cannot both succeed; the loser is shown the refreshed slots. The same function checks that the period still has an unused visit.

### What this deliberately postpones

Per-zone days, travel time between consecutive addresses, and multi-worker balancing. The tables already hold what those need (`workers`, address coordinates, postal code on every booking), so they are additions, not rewrites.

---

## 7. Authentication and access

| Who | How they get in | What they can reach |
|---|---|---|
| Visitor | nothing | Marketing pages, funnel |
| Subscriber | Email code via Supabase Auth | `/racun`, `/rezervacija` |
| Subscriber from the monthly email | Signed booking token in the link | Only the booking for that period. Anything else asks for the email code. |
| Operator | Email code, `staff` role | `/admin` |

- The account is created by the webhook after payment, so the funnel never interrupts the purchase with an email verification step.
- Booking tokens are random, stored hashed, expire at the end of the period, and are scoped to one subscription period. A forwarded email can at worst book that customer's own wash.
- All writes go through server code using a server-only database client. Row Level Security is enabled on every table as a second line of defence; customers can read only their own rows.

---

## 8. Email

| Template | Trigger |
|---|---|
| Welcome | `checkout.session.completed` |
| Monthly booking reminder | Cron, when a new period opens |
| Booking confirmation | Booking created |
| 24-hour reminder | Cron, day before |
| Reschedule confirmation | Booking moved |
| Payment failed | `invoice.payment_failed` |
| Subscription updated | Plan, pause or cancellation change |
| Later: "we haven't cleaned your car this month" | Cron, mid-period with no booking |

- Every send first writes a row to `email_log` with a unique key such as `monthly_reminder:{period_id}`. A duplicate key means the email was already sent, so cron reruns and webhook retries cannot send twice.
- The operator receives a plain notification for every new, moved or cancelled booking.
- Sending domain is authenticated with SPF, DKIM and DMARC on a subdomain (for example `posta.mormo.si`).

### Cron jobs

| Job | Schedule | Does |
|---|---|---|
| `monthly-reminders` | daily 08:00 | Finds open periods with no reminder sent, creates booking tokens, sends reminders |
| `day-before` | daily 16:00 | Sends 24-hour reminders for tomorrow's bookings |
| `nudges` | daily 10:00 | Mid-period reminder when nothing is booked (off until enabled) |

Cron routes require a secret header. Each job is safe to run twice.

---

## 9. Analytics

- Scripts load only after consent (Google Consent Mode v2), and never before the page is interactive.
- All events go through `lib/analytics/track.ts`, which is typed with the event list below and forwards to GA4, Google Ads and Meta. Components never call `gtag` or `fbq` directly.
- Conversion events that depend on payment (`subscription_created`, `booking_created`) fire once from the confirmation screen after the server has verified the result, and the server marks them as tracked so a page reload cannot fire them again.

The event list and exactly where each fires are in `USER-FLOWS.md`.

---

## 10. SEO

- Per-page metadata and canonical URLs, Slovenian `lang`, Open Graph image generated from brand assets.
- `sitemap.ts` and `robots.ts`. Funnel, account, booking and admin are `noindex`.
- Structured data: `AutoWash` (a LocalBusiness type) with service area and opening hours; `Service` and `Offer` for the plans; `FAQPage` on the FAQ.
- One primary topic per page, no stuffing:

| Page | Primary search intent |
|---|---|
| `/` | pranje avta na domu, mobilna avtopralnica |
| `/paketi` | mesečno čiščenje avtomobila, naročnina |
| `/storitve` | globinsko čiščenje avta, detailing Ljubljana |
| `/kako-deluje` | mobilno čiščenje avtomobila |
| `/za-podjetja` | čiščenje voznega parka |
| `/kontakt` | čiščenje avta Ljubljana |

---

## 11. Performance budget

| Metric | Target (mid-range phone, 4G) |
|---|---|
| LCP | ≤ 2.0 s (the hero poster image) |
| INP | ≤ 150 ms |
| CLS | ≤ 0.02 |
| Our own client JavaScript on the homepage | ≤ 15 KB gzipped beyond the framework |
| Hero video | ≤ 3.5 MB desktop, ≤ 1.5 MB mobile |
| Web fonts | one variable family, ≤ 2 files, `font-display: swap` with a metric-matched fallback |

The budget is checked with Lighthouse CI on every pull request. A change that breaks it does not merge. Hero video details are in `MOTION.md`.

---

## 12. Environments and deployment

```
feature branch ──► pull request ──► Vercel Preview (Stripe test, Supabase dev)
main           ──► Vercel Production (Stripe live, Supabase prod)
```

- Two Supabase projects: development and production. Migrations are SQL files in the repo, applied to development first.
- Secrets live only in Vercel environment variables. `.env.example` lists names without values. `.env*.local` is git-ignored.
- The optimised hero encodes are committed. The video master is not.

### Environment variables

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY                 server only
STRIPE_SECRET_KEY                   server only
STRIPE_WEBHOOK_SECRET               server only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RESEND_API_KEY                      server only
EMAIL_FROM
OPERATOR_EMAIL
CRON_SECRET                         server only
BOOKING_TOKEN_SECRET                server only
NEXT_PUBLIC_GA4_ID
NEXT_PUBLIC_GOOGLE_ADS_ID
NEXT_PUBLIC_META_PIXEL_ID
SENTRY_DSN
```

### Error handling

- Webhook and cron handlers record failures in the database and report them to error tracking. A failed webhook returns a non-200 status so Stripe retries.
- Forms show a specific Slovenian message per field and keep what the user typed.
- Branded `not-found` and `error` pages.
- If Stripe or the database is unavailable, the funnel says so and offers the phone number.

---

## 13. Proposed service area (to confirm)

Ljubljana (1000 and district codes 1210, 1211, 1231, 1260, 1261) plus Medvode, Domžale, Trzin, Mengeš, Škofljica, Ig, Brezovica, Dobrova, Grosuplje and Vrhnika. Stored as a postal code list in the database so it can change without a deploy. An address outside the list is offered the waiting list.
