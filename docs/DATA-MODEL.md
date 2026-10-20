# Mormo.si — Data Model

Status: **proposal, awaiting approval.** Database: Supabase Postgres.

## Principles

1. **Stripe owns money, we own bookings.** Subscription and payment tables are mirrors written only by the webhook.
2. **The catalog is code.** Plans, add-ons and prices live in `config/catalog.ts`. The database stores catalog *keys* and a *snapshot* of the amount sold. There is no `plans` or `addons` table to drift out of sync with the site and Stripe. If a non-developer later needs to edit prices, the catalog moves into tables without changing the rest of the model.
3. **Impossible states are prevented by the database**, not by application checks: no overlapping bookings, no duplicate webhook processing, no duplicate emails.
4. All timestamps are `timestamptz`. Display uses `Europe/Ljubljana`. Money is integer cents in EUR.

## Entity map

```
auth.users ─1:1─ customers ─┬─< vehicles
                            ├─< addresses >── service_areas
                            ├─< subscriptions ─< subscription_periods ─< bookings ─< booking_items
                            ├─< payments
                            └─< booking_tokens

workers ─┬─< availability_rules
         ├─< availability_exceptions
         └─< bookings

checkout_intents      stripe_events      email_log      leads
```

## Tables

### customers

Created by the webhook after the first successful payment.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| auth_user_id | uuid unique, null | → `auth.users`. Null until the account is created |
| email | citext unique | |
| full_name | text | |
| phone | text | |
| company_name, vat_id | text, null | For business customers |
| stripe_customer_id | text unique | |
| marketing_consent_at | timestamptz, null | |
| created_at | timestamptz | |

### vehicles

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| customer_id | uuid fk | |
| size | enum `small` `suv` `xl` | Drives price and duration |
| make, model, color | text | |
| plate | text, null | Helps the worker find the car |
| notes | text, null | |
| active | boolean | |

### addresses

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| customer_id | uuid fk | |
| label | text | "Doma", "Služba" |
| street, house_number, postal_code, city | text | |
| lat, lng | numeric, null | Filled by geocoding later; not required in V1 |
| access_notes | text, null | Parking spot, garage level, gate code |
| is_default | boolean | |

### service_areas

| Column | Type | Notes |
|---|---|---|
| postal_code | text pk | |
| city | text | |
| active | boolean | |
| zone | text, null | Reserved for per-zone days |

### subscriptions

Mirror of the Stripe subscription. One subscription covers one vehicle.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| customer_id, vehicle_id, address_id | uuid fk | |
| plan_key | text | Catalog key: `clean`, `always_clean`, `premium` |
| vehicle_size | enum | Snapshot at purchase |
| visits_per_period | int | Snapshot |
| monthly_amount_cents | int | Snapshot |
| stripe_subscription_id | text unique | |
| stripe_price_id | text | |
| status | enum `incomplete` `active` `past_due` `paused` `canceled` `unpaid` | Mirrors Stripe |
| current_period_start, current_period_end | timestamptz | |
| cancel_at_period_end | boolean | |
| canceled_at | timestamptz, null | |
| initial_reset | enum `not_required` `pending` `done` | |
| preferred_weekday, preferred_time | smallint, time, null | Learned from the last booking; powers "same slot as last time" |
| created_at, updated_at | timestamptz | |

### subscription_periods

One row per paid billing period. This is the entitlement: how many visits the customer may book between two dates.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| subscription_id | uuid fk | |
| period_start, period_end | timestamptz | From the Stripe invoice |
| visits_allowed | int | |
| stripe_invoice_id | text unique | Makes `invoice.paid` idempotent |
| status | enum `open` `closed` `skipped` | |
| reminder_sent_at | timestamptz, null | |

Visits used are counted from bookings, not stored, so the number cannot go stale.

### bookings

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| customer_id, vehicle_id, address_id | uuid fk | |
| subscription_id, period_id | uuid fk, null | Null for a future one-off wash |
| worker_id | uuid fk | |
| kind | enum `maintenance` `initial_reset` `one_off` | |
| status | enum `confirmed` `completed` `cancelled` `no_show` | |
| service_range | tstzrange | Start and end of the work on site |
| blocked_range | tstzrange | `service_range` plus travel buffer; what the calendar reserves |
| duration_min | int | Snapshot |
| postal_code | text | Snapshot, for future zone logic |
| customer_note | text, null | |
| operator_note | text, null | |
| rescheduled_from | uuid, null | Previous booking when moved |
| cancelled_at, completed_at | timestamptz, null | |
| conversion_tracked_at | timestamptz, null | Analytics de-duplication |
| created_at | timestamptz | |

Constraints:

```sql
-- no two live bookings for one worker may overlap
alter table bookings add constraint bookings_no_overlap
  exclude using gist (worker_id with =, blocked_range with &&)
  where (status in ('confirmed', 'completed'));
```

The "visits used ≤ visits allowed" rule is enforced inside the `create_booking` function, which locks the period row while it counts.

### booking_items

What a visit contains beyond the plan: add-ons and occasion packages.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| booking_id | uuid fk | |
| kind | enum `addon` `occasion` `reset` | |
| item_key | text | Catalog key |
| label | text | Snapshot of the name shown to the customer |
| amount_cents | int, null | Null while a quoted item awaits its final price |
| duration_min | int | Snapshot |
| payment_status | enum `included` `pending` `paid` `failed` `refunded` | |
| stripe_invoice_id | text, null | |

### payments

Read-only mirror for the account page and admin. Stripe remains authoritative.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| customer_id | uuid fk | |
| kind | enum `subscription` `addon` `initial_reset` | |
| stripe_invoice_id | text unique | |
| amount_cents | int | |
| status | enum `paid` `open` `failed` `refunded` | |
| hosted_invoice_url | text | |
| fiscal_invoice_ref | text, null | Reference from the fiscal invoicing provider, if used |
| paid_at | timestamptz, null | |

### workers, availability_rules, availability_exceptions

| Table | Columns |
|---|---|
| workers | id, name, phone, auth_user_id (null), active |
| availability_rules | id, worker_id, weekday (1–7), start_time, end_time, valid_from, valid_to (null) |
| availability_exceptions | id, worker_id, date, kind (`off` or `custom`), start_time, end_time, note |

### booking_tokens

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| token_hash | text unique | Only the hash is stored |
| customer_id, subscription_id, period_id | uuid fk | Scope |
| expires_at | timestamptz | End of the period |
| last_used_at | timestamptz, null | |

### checkout_intents

The funnel's validated payload, held between "pay" and the webhook.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | Sent to Stripe as `client_reference_id` |
| email | citext | |
| payload | jsonb | Vehicle, plan, reset, address, contact details, consents, recomputed prices |
| stripe_checkout_session_id | text unique, null | |
| status | enum `draft` `completed` `expired` | |
| attribution | jsonb, null | UTM parameters, click IDs |
| conversion_tracked_at | timestamptz, null | |
| created_at | timestamptz | Drafts older than 30 days are deleted |

### stripe_events

| Column | Type | Notes |
|---|---|---|
| id | text pk | Stripe event ID; a second insert fails, which is the idempotency check |
| type | text | |
| received_at, processed_at | timestamptz | |
| error | text, null | |

### email_log

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| dedupe_key | text unique | For example `monthly_reminder:{period_id}` |
| customer_id | uuid fk, null | |
| template | text | |
| to_email | citext | |
| provider_message_id | text, null | |
| status | enum `queued` `sent` `failed` | |
| created_at | timestamptz | |

### leads

Fleet enquiries, contact form, out-of-area waiting list, PREMIUM waiting list.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| kind | enum `fleet` `contact` `waitlist_area` `waitlist_capacity` `waitlist_premium` | |
| name, email, phone | text | |
| company, fleet_size | text, int, null | |
| postal_code | text, null | |
| message | text, null | |
| attribution | jsonb, null | |
| handled_at | timestamptz, null | |
| created_at | timestamptz | |

## Access rules

Row Level Security is on for every table.

| Table | Customer (signed in) | Staff | Anonymous |
|---|---|---|---|
| customers, vehicles, addresses | read own | read all | none |
| subscriptions, subscription_periods, payments | read own | read all | none |
| bookings, booking_items | read own | read all | none |
| service_areas | read | read | read |
| workers, availability_* | none | read | none |
| everything else | none | none | none |

All inserts, updates and deletes are done by server code with the server-only key, after validation. No table accepts direct writes from the browser.

## Database functions

| Function | Purpose |
|---|---|
| `create_booking(...)` | Locks the period, checks remaining visits, inserts booking and items in one transaction. The overlap constraint is the final guard. |
| `reschedule_booking(...)` | Cancels the old booking and creates the new one atomically, linking them. |
| `available_slots(worker, from, to, duration)` | Returns free start times. May live in TypeScript at first; the constraint keeps it safe either way. |

## State machines

**Subscription** (follows Stripe)

```
incomplete ─► active ─► past_due ─► active        (payment recovered)
                 │           └────► canceled      (retries exhausted)
                 ├─► paused ─► active             (skip, then resume)
                 └─► canceled                     (customer cancels; effective at period end)
```

**Booking**

```
confirmed ─► completed
    ├─────► cancelled        (by customer before the deadline, or by operator)
    ├─────► no_show          (set by operator)
    └─────► cancelled + new confirmed booking   (reschedule)
```

**Period**

```
open ─► closed     (period_end passed)
  └──► skipped     (customer skipped; billing paused for that cycle)
```

## Data protection

- Personal data is limited to what the service needs: name, email, phone, address, vehicle.
- Hosted in the EU. Card data is never stored by us.
- Account deletion removes or anonymises customer rows while keeping payment records for the legally required retention period.
- Processors to list in the privacy policy: Supabase, Stripe, Resend, Vercel, and the analytics providers once consented.
