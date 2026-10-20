# Prompt for the LLogistika app

Paste everything below the line into the coding assistant working on the LLogistika (ERP) codebase.

---

The Supabase database this app uses now also serves a second product, **Mormo.si** (mobile car washing). A migration named `mormo_customer_portal` adds it. Please update this app so that it works correctly with the changes below. Do not change the database schema; only adapt the app.

## What changed in the database

1. **`jobs.type` has a new allowed value: `'pranje'`** (car wash), next to `'selitev'`, `'odvoz'`, `'transport'`.
2. **Wash jobs are created by the Mormo.si website, not by this app.** For such a job:
   - `type = 'pranje'`
   - `status` is `'reserved'` (customer booked, not yet paid/confirmed) or `'confirmed'`
   - `customer_id` points to a normal row in `customers` whose `notes` is `'Mormo.si stranka'`
   - `starts_at`, `duration_min`, `ends_at` are set as for any job (duration is a multiple of 15)
   - `from_address` is where the car is parked; `to_address` is null
   - `notes` looks like `Mormo.si · Družinski (Škoda Octavia) · ALWAYS CLEAN · prvi obisk`
   - `vehicle_id` (our fleet vehicle) is null, and there are no rows in `job_workers` until the owner assigns someone
   - `agreed_price`, `expected_payment_method` and all `est_*` fields are null (the customer pays a monthly subscription online, nothing is collected on site)
3. **New tables, all prefixed `mormo_`.** The owner can read `mormo_customers`, `mormo_vehicles`, `mormo_subscriptions`, `mormo_bookings`, `mormo_plans`, `mormo_settings`. Workers cannot. Nobody but the website's server can write to them.
4. **A trigger on `jobs`** (`mormo_sync_booking`) copies `status` and `starts_at` of a `'pranje'` job to the customer's booking. So when this app moves, completes or cancels a wash job, the customer sees it in their account automatically. Nothing else is needed for that.

## What to change in this app

1. **Everywhere the job type is listed, typed, validated, filtered, labelled or coloured, add `'pranje'`.** Label: "Pranje". Give it its own colour so washes are distinguishable from moves in the calendar. Search the codebase for `selitev`, `odvoz` and `transport` to find every place (TypeScript unions, zod schemas, select options, colour maps, switch statements, filters, reports).
2. **Calendar and job lists:** show `'pranje'` jobs. A missing `to_address`, vehicle, price or crew must not break rendering. For a wash, show `from_address` as "Lokacija" and the `notes` line as the description.
3. **Assigning workers:** the owner must be able to assign one or more workers (and optionally a fleet vehicle) to a `'pranje'` job with the existing assignment flow (`erp_set_job_workers`), so the assigned worker sees it in their job list.
4. **Worker flow:** a worker must be able to start and complete a `'pranje'` job. On completion do **not** ask for payment method or collected amount (leave `actual_payment_method` and `collected_amount` null). If `erp_complete_job` requires them, allow null for this type. Time tracking for a wash should use the existing "moving" (work on site) mode unless a better fit already exists.
5. **Job form:** creating or editing a `'pranje'` job by hand should hide the fields that do not apply (to-address, kilometres, estimated transport hours). The owner may change `starts_at`, `duration_min` and `status`; do not let the form change `customer_id` or `notes` of a job whose notes start with `Mormo.si ·`.
6. **Reports and finances:** exclude `'pranje'` jobs from revenue/cost reports of the moving business (views such as `job_financials`, per-job margins, km statistics), or show them in a separate "Pranja" group. Their revenue is subscription income handled by Stripe, not per-job cash.
7. **Conflict checks:** `erp_job_conflicts` already treats every active job as occupying its vehicle and workers, so washes are included automatically. Keep it that way.
8. **Optional, nice to have:** a read-only "Mormo stranke" screen for the owner listing `mormo_customers` with their `mormo_vehicles`, plan (`mormo_subscriptions.plan_key`, `status`) and next booking (`mormo_bookings` where `status = 'booked'` and `starts_at > now()`).

## How availability for customers is decided (for information)

The website offers a wash slot only when it is inside the opening hours in `mormo_settings.open_hours`, and no other active job (`reserved`, `confirmed`, `in_progress`) overlaps it, with a travel buffer on both sides. Settings the owner can change directly in the `mormo_settings` table:

| key | meaning | default |
|---|---|---|
| `open_hours` | ISO weekday → [open hour, close hour] | every day 8–18 |
| `duration_min` | wash length by vehicle size | 90 / 105 / 120 |
| `first_visit_extra_min` | extra time for the first visit | 60 |
| `buffer_min` | free time kept around every job | 30 |
| `max_parallel_jobs` | overlapping jobs allowed before a slot is full | 1 |
| `moves_block_washes` | `true`: moves also block wash slots; `false`: only other washes do | true |
| `min_lead_hours` | earliest bookable time from now | 48 |
| `reschedule_min_days` | customer may move a booking until this many days before | 3 |

When finished, list every file you changed and anything in the app that still assumes only three job types.
