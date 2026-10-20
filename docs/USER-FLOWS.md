# Mormo.si — User Flows

Status: **proposal, awaiting approval.**

The full journey:

```
VISITOR → PLAN → CHECKOUT → SUBSCRIBER → MONTHLY EMAIL → BOOKING → ADD-ON → CLEANING → NEXT MONTH
```

---

## 1. Visitor → plan

**Entry points:** search, ads, direct, referral. Most traffic lands on `/`.

1. The hero plays. One primary action: **Izberi paket**.
2. The visitor scrolls the story or jumps straight to pricing.
3. On the pricing section they set the vehicle size (the prices update) and pick a plan. The choice travels into the funnel, so they never enter it twice.
4. Side exits, always available: phone call, enquiry form, fleet enquiry.

**Naming note.** The brief's navigation button says "Prijavi pranje", which reads as booking a single wash. If the service is subscription-only (open decision 11), every subscribe button says **Izberi paket** so the label matches what happens next.

## 2. Plan → checkout: the funnel (`/narocilo`)

One question per screen, a visible progress bar, back always works, state survives a reload.

| Step | Screen | Asks | Notes |
|---|---|---|---|
| 1 | **Vozilo** | Size (three large illustrated choices), make and model, postal code | The postal code is checked here. Outside the area: "Do tebe še ne pridemo" with a waiting-list field, so nobody completes five steps to be refused. |
| 2 | **Paket** | CLEAN / ALWAYS CLEAN / PREMIUM, prices for the chosen size | Preselected if chosen on the homepage. |
| 3 | **Prvi obisk** | Initial Reset, shown as the first visit | One honest question about the car's condition (default rule in `MASTER-BRIEF.md`, decision 9). Add-ons are *not* sold here; they belong to the monthly booking where they are relevant. |
| 4 | **Naslov** | Street, number, city, where the car is parked, access notes | "Doma" or "V službi" label. |
| 5 | **Podatki** | Name, email, phone; optional company details | Terms, privacy, and consent to start within the withdrawal period. |
| 6 | **Pregled** | Order summary: today's charge and the monthly charge, stated separately | Button: **Na plačilo** → Stripe Checkout. |

After payment: `/narocilo/uspeh`.

- The page waits for the server to confirm the subscription (the webhook normally lands within a couple of seconds; the server also checks Stripe directly).
- Then it shows: "Dobrodošel. Avto je od zdaj naša skrb." and goes straight to choosing the first appointment. Booking the first visit in the same session is the single best predictor that the subscription sticks.
- If the customer closes the tab, the welcome email carries the same booking link.

**If capacity is full** (`acceptingNewSubscribers = false`): the funnel collects vehicle, postal code and email for the waiting list and says when we expect space.

**Abandoned funnel:** nothing is charged, the draft expires. No abandoned-cart emails in V1 (they need marketing consent the visitor has not given).

## 3. Subscriber: the account (`/racun`)

Sign-in: email → 6-digit code.

The first screen answers one question: **is my next wash sorted?**

```
┌────────────────────────────────────────────────┐
│  Naslednje pranje                              │
│  Četrtek, 15. oktober · 9:00                   │
│  Doma, Celovška 123                            │
│  [Prestavi]   [Dodaj storitev]                 │
└────────────────────────────────────────────────┘
  Ta mesec: 1 od 2 obiskov rezerviran   [Izberi drugi termin]

  Paket        ALWAYS CLEAN · 199 € / mesec · naslednje plačilo 3. 11.
  Vozilo       Škoda Octavia Combi (SUV / karavan)
  Naslov       Celovška 123, Ljubljana
  Plačilo      Kartica •••• 4242        [Uredi plačilo in račune]  → Stripe Portal
               [Preskoči naslednji mesec]
```

| Action | V1 behaviour |
|---|---|
| Book | Opens the booking flow for the current period |
| Reschedule | Free until the deadline (default 24 h before); later, asks to call |
| Skip | Pauses the next payment; limited per year (decision 12) |
| Edit vehicle or address | Edits in place. A change of vehicle size changes the price and goes through us. |
| Payment, invoices, cancel | Stripe Customer Portal |
| Change plan | "Piši nam" in V1 |

If the subscription is `past_due`, the account shows one thing first: "Plačilo ni uspelo" with a button to fix the card. Existing bookings stay; new ones are blocked.

## 4. Monthly email → booking

**Trigger:** a new paid period opens (`invoice.paid`). The reminder is sent the next morning at 08:00.

**Email**

> **Zadeva:** Čas je za tvoje oktobrsko pranje
>
> Živjo, Ana. Tvoj oktober je plačan in avto čaka na termin.
>
> **Isti termin kot zadnjič?** Četrtek, 15. 10. ob 9:00
> [ POTRDI TA TERMIN ]
>
> [ Izberi drug termin ]

- The suggested slot is the customer's usual weekday and time, if it is free. This keeps the "you don't think about it" promise while leaving the choice with the customer.
- Both buttons carry the booking token, so no login is needed to book.
- For two-visit plans the flow books the first visit, then offers the second ("Drugi obisk čez dva tedna?").

**Booking flow (`/rezervacija`)**, three screens on a phone:

1. **Termin.** A week strip of days and the free times for the selected day. The usual slot is highlighted. Address shown with "spremeni".
2. **Ta mesec kaj posebnega?** The upsell screen (section 5).
3. **Potrditev.** Summary and, if anything was added, the amount charged to the saved card. Button: **Potrdi termin**.

Then: confirmation screen with "Dodaj v koledar", the confirmation email, and a notification to the operator.

**If nobody books:** a second reminder mid-period (when enabled). An unused visit follows the carry-over policy (decision 12).

## 5. Add-ons and occasions

Shown on screen 2 of the booking flow, and nowhere earlier.

- **Top: one contextual question, not a list.** "Tale mesec greš na roadtrip?" with a single package and a single button: **Dodaj Ready for Roadtrip +XX €**. Which package leads is seasonal (road trip in June–August and before holidays, Family Reset in September, and so on), set in the catalog.
- **Middle: the other occasions** as three compact choices: Date Night, Photoshoot Ready, Family Reset.
- **Bottom: individual add-ons**, collapsed under "Dodaj posamezno storitev", grouped as Notranjost / Zaščita / Posebno.
- Adding something updates the visit length, and the times on offer change if the longer visit no longer fits the chosen slot.
- Price-range items ("Trdovratni madeži 20–40 €") are added as "od 20 €"; the final amount is confirmed by us after the visit and never charged above the stated range.
- A clearly visible **Preskoči** continues without adding anything.

**Payment:** added items are charged to the card on file at confirmation. If the bank asks for authentication or the charge fails, the booking is still confirmed and the customer receives a payment link (see `ARCHITECTURE.md`).

## 6. Cleaning day

| When | What happens |
|---|---|
| Day before, 16:00 | 24-hour reminder: time, address, what is included, "the car must be accessible; you don't need to be there". Link to reschedule if still inside the deadline. |
| Morning | Operator opens `/admin`: today's visits in order, each with address, access notes, vehicle, plate, add-ons, phone, any unpaid item. |
| On site | Operator does the work. For quoted items, sets the final price. |
| After | Operator marks the visit **Opravljeno**. If this was the Initial Reset, the subscription's reset state becomes done. |
| Later | Optional "Avto je čist" message with a review request, once reviews are being collected. |

Exceptions the operator can record: car not accessible (`no_show`), postponed for weather (reschedule without using the visit).

## 7. Next month

1. Stripe charges the renewal.
2. `invoice.paid` opens a new period with fresh visits.
3. The reminder email goes out. Back to section 4.

The loop needs no manual work unless a payment fails.

## 8. Edge flows

| Situation | Behaviour |
|---|---|
| **Renewal payment fails** | Stripe retries automatically. We send one email with a link to update the card. New bookings are blocked; existing ones stand. If retries are exhausted the subscription is cancelled and future bookings are released. |
| **Reschedule** | Before the deadline: choose a new slot, old one is released atomically, confirmation email. After the deadline: phone only. |
| **Cancel subscription** | In the Stripe Portal. Effective at period end. Visits already paid for remain bookable until then. |
| **Skip a month** | Billing pauses for one cycle, no period is opened, no reminder is sent. |
| **Two people take the same slot** | The database rejects the second. That customer sees "Ta termin je pravkar zaseden" and the refreshed times. |
| **Moved house / new car** | Edited in the account. A new postal code is checked against the service area. A size change adjusts the price from the next period. |
| **Email typo at checkout** | The welcome page shows the email used and a "to ni moj naslov" link to contact us. |
| **Out of area** | Waiting-list lead, stored with postal code. |
| **Fleet enquiry** | Form on `/za-podjetja` → lead → operator notification. Handled by hand in V1. |

## 9. Email map

| Email | Trigger | Primary button |
|---|---|---|
| Dobrodošel | Subscription created | Izberi prvi termin |
| Čas je za tvoje {mesec} pranje | New period | Potrdi ta termin / Izberi drug termin |
| Termin potrjen | Booking created | Dodaj v koledar |
| Jutri pridemo | Day before | Prestavi termin |
| Termin prestavljen | Reschedule | Dodaj v koledar |
| Plačilo ni uspelo | Payment failed | Posodobi kartico |
| Naročnina posodobljena | Plan, pause, cancellation | Odpri račun |

All emails: plain layout, one button, sent from a real reply-to address.

## 10. Analytics events

Each event has exactly one place where it fires.

| Event | Fires when | Guard against duplicates |
|---|---|---|
| `hero_cta_clicked` | Click on any hero action; parameter says which | One per click |
| `plan_viewed` | Pricing section first becomes visible | Once per page view |
| `plan_selected` | A plan is chosen (homepage or funnel step 2); parameter `plan` | Fires on change only |
| `booking_started` | Funnel step 1 is first shown | Once per funnel session |
| `vehicle_selected` | Vehicle size confirmed in step 1 | Fires on change only |
| `addon_selected` | An add-on or occasion is added in the booking flow | Once per item per booking |
| `checkout_started` | "Na plačilo" clicked, just before redirect | Once per intent |
| `subscription_created` | Welcome page, after the server confirms payment | Server flag `conversion_tracked_at` |
| `booking_created` | Booking confirmation screen | Server flag `conversion_tracked_at` |
| `fleet_lead` | Fleet form submitted successfully | On server success only |
| `phone_clicked` | Click on any `tel:` link | One per click |
| `contact_submitted` | Contact form submitted successfully | On server success only |

`subscription_created` carries the plan and value and is the conversion sent to Google Ads and Meta.
