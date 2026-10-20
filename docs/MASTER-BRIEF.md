# Mormo.si — Master Brief

Status: **proposal, awaiting approval**. Nothing in production is built until the architecture and design direction in these documents are approved.

| Document | What it decides |
|---|---|
| `MASTER-BRIEF.md` (this file) | Business, positioning, offer, scope, open decisions, roadmap |
| `ARCHITECTURE.md` | Stack, application structure, Stripe, email, booking, analytics, deployment |
| `DATA-MODEL.md` | Database tables, constraints, access rules |
| `USER-FLOWS.md` | Every journey from visitor to recurring subscriber, plus emails and analytics events |
| `DESIGN-SYSTEM.md` | Colour, type, shape, components, homepage wireframe, copy rules |
| `MOTION.md` | Every animation and interaction, its technique, cost and fallback; hero video strategy |
| `ASSETS.md` | Visual assets to produce, with Higgsfield prompts |

If two documents disagree, the more specific one wins (for example `MOTION.md` over this file on animation).

---

## 0. Current scope (updated 8 October 2026)

Decisions from the owner that override anything below or in the other documents:

- **Build the public website only, for now.** No Stripe, no checkout, no accounts, no booking. "Sign up" buttons lead to a simple enquiry form at `/prijava`.
- **The workers' app already exists** and tracks the washes. This site needs no operator view and no staff login. The `/admin` idea in these documents is dropped.
- **The database will be the existing LLogistika Supabase project**, not a new one. Customer login and self-service booking are a wanted later step, built against that database.
- **We bring all our own equipment everywhere.** The customer provides nothing.
- **Everything is kept separate**, so the calendar, login and payments can be added or changed later without touching the marketing site. See `README.md` for the folder boundaries.

**Backend (added 8 October 2026).** Customer accounts, vehicles, subscriptions and wash bookings live in the LLogistika database in tables prefixed `mormo_`; washes are written into the existing `jobs` calendar as type `pranje`. Customers sign in on the website (their own passwords and sessions), not through Supabase Auth, so no existing LLogistika table or policy changes. The authoritative description is `README.md` and the migration in `supabase/migrations/`; where `ARCHITECTURE.md` and `DATA-MODEL.md` differ, they are out of date.

## 1. The business

Mormo.si is a mobile car cleaning subscription for Ljubljana and the surrounding area. We come to the customer's home, workplace or agreed location and clean the car there by hand.

**What we sell:** not car washing. We sell *"your car stays clean without you having to think about it"*: convenience, time and consistency.

**North Star:** AVTO JE VEDNO ČIST.
**Supporting idea:** MI PRIDEMO DO TEBE.

**The thought we want in the customer's head:** "For this monthly price I never have to think about cleaning my car again."

### Positioning against the old way

| Old way | Our way |
|---|---|
| Drive → Queue → Wash → Wait → Drive home | Park → Continue your day → Clean car |

Secondary argument: hand washing, no automatic brushes. Brush washes *can* leave micro-scratches when dirt is trapped in the washing material. We say this carefully and never claim that every automatic wash damages cars.

## 2. Brand facts already fixed

| Item | Value | Source |
|---|---|---|
| Name | Mormo.si | Logo |
| Brand green | `#D1FE17` | Logo droplet |
| Base dark | `#111416` | Hero embed |
| Logo | White wordmark, lime droplet between "Mormo" and "si" | `public/brand/mormo-logo-dark.svg` |
| Hero video | `mormo-hero-1080p.mp4` + `mormo-hero-poster.jpg`, finished, **not yet in the repo** | Hero embed |
| Language | Slovenian, informal "ti" | Brief |
| Market | Ljubljana + surroundings | Brief |

The droplet in the logo is the brand's own shape. It is reused across the interface (see `DESIGN-SYSTEM.md`).

## 3. The offer (working values)

All prices live in one catalog file (`config/catalog.ts`, see `ARCHITECTURE.md`). No component hard-codes a price.

### Subscriptions

| Plan | Price / month | Visits / month | Notes |
|---|---|---|---|
| CLEAN | 89 € | 1 | Exterior hand wash, wheels, vacuuming, dashboard, interior plastics, windows inside and out, door sills, basic interior tidy, finishing touches. 60–90 min. |
| ALWAYS CLEAN | 169 € | 2 | Everything in CLEAN. **Most popular, the main offer.** |
| PREMIUM | 239 € | 2 | Plus premium benefits. **Benefits not confirmed. Do not invent them.** |

### Vehicle size (per visit)

| Size | Surcharge |
|---|---|
| Small / sedan | base |
| SUV / estate | +15 € |
| XL / 7-seater | +25 € |

The surcharge is per visit, so a two-visit plan carries it twice per month (ALWAYS CLEAN for an SUV = 169 + 30 = 199 €).

### Initial Reset

From 149 €. Brings the car up to our standard before maintenance begins. One-time.

### Add-ons

| Add-on | Price |
|---|---|
| Deep clean, one seat | +25 € |
| Deep clean, all seats | +79 € |
| Full deep interior clean | +129–169 € |
| Pet hair | +30 € |
| Child seat | +15 € |
| Leather cleaning + protection | +39 € |
| Heavy boot cleaning | +20 € |
| Heavy stains | +20–40 € |
| Ozone treatment | +29 € |
| Spray ceramic / sealant | +39 € |
| Wax | +49 € |

### Special occasion upgrades

Packaged upgrades offered during the monthly booking: **Ready for Roadtrip**, **Date Night**, **Photoshoot Ready**, **Family Reset**. Contents and prices are not confirmed.

## 4. Analysis of the brief

What the brief gets right, and the things it implies but does not say.

**1. The product is the monthly loop, not the landing page.** The homepage wins the first payment. Every later payment is won by one email and a booking screen that takes 30 seconds on a phone. That flow gets the same design attention as the hero.

**2. "You never think about it" conflicts with "you must book every month".** The brief asks for manual monthly booking, which is the right V1 choice operationally. To keep the promise, the reminder email offers the customer's usual slot as a one-tap confirmation ("Isti termin kot zadnjič? Čet ob 9:00"). Full auto-booking of a preferred slot is a later option the data model already supports.

**3. Showpiece motion versus Core Web Vitals.** These only conflict if effects are built with heavy JavaScript. The plan in `MOTION.md` uses sticky positioning, compositor-only transforms and native scroll-driven CSS, with one small canvas component loaded on demand. No animation library is needed for V1.

**4. Foam at the hero exit versus the "dirty → clean" page arc.** Both are requested and they pull in different directions (foam would appear before the dirt). Resolution: the page's *tone* moves from dark and gritty to light and glossy, while foam is punctuation used at exactly three moments: hero exit, the wash before pricing, and the final rinse.

**5. Initial Reset is the biggest conversion risk.** A surprise 149 € on top of the first month can lose the sale. It is framed as "the first visit is the thorough one" and shown early on the pricing section, never first revealed at checkout.

**6. The site needs an operator view.** The brief describes the customer side only. Someone has to see tomorrow's jobs, mark them done and block a sick day. V1 includes a minimal protected `/admin` (day agenda, mark complete, block time).

**7. Capacity is finite and the site must know it.** One person doing roughly four visits a day reaches about 85 visits a month, which is around 50–60 subscribers at a typical plan mix. The catalog carries a capacity switch that turns the funnel into a waiting list.

**8. Pricing observation (not a request to change).** Two CLEAN visits would cost 178 €; ALWAYS CLEAN is 169 €. A 9 € saving is a weak reason to choose the main offer. The site will sell ALWAYS CLEAN on the outcome (the car is never dirty for more than two weeks) and not on the discount.

**9. Compliance items that affect the build.** These need confirming with an accountant or lawyer, not with a developer:
- In Slovenia, card payments generally count as cash for fiscal purposes, so invoices may need fiscal verification with FURS (davčno potrjevanje računov). Stripe invoices alone do not do this. The architecture leaves a hook to issue verified invoices through an invoicing provider.
- VAT status decides whether displayed prices include 22 % DDV.
- Distance contracts give consumers a 14-day withdrawal right; starting the service inside that window needs explicit consent at checkout.
- GA4, Google Ads and Meta Pixel require consent before loading.

**10. AI-generated before/after images.** Presenting generated images as real results is misleading. Until real job photos exist, the before/after is framed as a demonstration, and it is replaced with real photos as soon as there are any.

**11. No reviews exist yet.** The reviews section is built but hidden behind a flag until there are real ones. Nothing is fabricated.

## 5. Scope

### V1 (launch)

- Marketing site: `/`, `/paketi`, `/storitve`, `/kako-deluje`, `/za-podjetja`, `/faq`, `/kontakt`, legal pages
- Subscription funnel `/narocilo` ending in Stripe Checkout
- Customer area `/racun`: plan, status, next cleaning, vehicle, address, book, reschedule, skip, link to Stripe portal
- Monthly booking `/rezervacija` with add-on and occasion upsell
- Transactional emails (seven templates)
- Minimal operator view `/admin`
- SEO foundations, consented analytics

### Later

Plan change inside the account, second vehicle, cleaning history with photos, auto-booking of a preferred slot, multiple workers with zones, route optimisation, SEO landing pages, English version, referral scheme.

### Explicitly out of V1

Route optimisation, a CMS, a mobile app, a custom payment form, WebGL.

## 6. Decisions I need from you

Only questions that cannot be settled by product or design judgment. Each has the default I will build with if you do not answer.

### Blocking (needed before implementation starts)

| # | Decision | Default if unanswered |
|---|---|---|
| 1 | **Hero files.** Add the video, the poster and the highest-quality master to the repo or share them. I have not seen the video, so the mobile crop and the legibility treatment are unverified. | Cannot proceed on the hero without them |
| 2 | **Company details**: legal name, address, tax number, VAT-registered or not, public phone and email, confirmation that the domain is `mormo.si`. | Placeholders; prices shown as final amounts |
| 3 | **Fiscal invoicing**: does your accountant require FURS-verified invoices for card payments, and which invoicing tool do you use? | Stripe invoices only, with an integration hook left open |
| 4 | **Launch capacity**: how many people or teams, which days and hours. | One team, Mon–Fri 8:00–17:00, Sat 8:00–13:00 |
| 5 | **Service area**: list of postal codes or municipalities. | Ljubljana plus adjacent municipalities, see `ARCHITECTURE.md` |
| 6 | **What we need on site**: do you bring your own water and power, and where can you not work (street parking, underground garages)? This changes the FAQ, the booking form and the promise. | Fully self-sufficient; garages and private parking yes, public street on request |
| 7 | **Accounts**: a new Supabase project (your organisation already has two, which is the free-tier limit), Vercel Pro (Hobby does not allow commercial use), a Stripe account for the legal entity, DNS access for email sending. | I prepare everything in test mode and wait |

### Needed before the relevant screen is built

| # | Decision | Default if unanswered |
|---|---|---|
| 8 | **PREMIUM benefits**, exact list. | PREMIUM shown as "kmalu" with a waiting-list button |
| 9 | **Initial Reset**: mandatory for everyone or only for cars below standard; price per vehicle size. | Added by default, removable only if the customer states the car was professionally cleaned in the last month; 149 / 169 / 189 € by size |
| 10 | **Occasion packages**: contents and prices of the four upgrades. | Built as configurable bundles, hidden until priced |
| 11 | **One-off washes**: can someone book a single wash without subscribing? | Subscription only; one-off requests go to the contact form |
| 12 | **Policies**: minimum term, cancellation, reschedule deadline, whether an unused visit carries over, what "skip" means, bad-weather rule. | No minimum term; cancel at period end; free reschedule until 24 h before; no carry-over; skip pauses the next payment, at most twice a year; we reschedule for frost or heavy rain |
| 13 | **Reviews**: do you have real ones to use? | Section hidden at launch |

## 7. Roadmap

Each phase ends on a Vercel preview you approve before the next begins.

| Phase | Deliverable |
|---|---|
| 0. Direction prototype | Hero with real video, navigation, the foam transition and one content section, on a preview URL. This is where the design direction is approved or changed cheaply. |
| 1. Marketing site | Full homepage and static pages, SEO foundations, lead forms |
| 2. Subscription funnel | `/narocilo`, Stripe Checkout in test mode, webhooks, welcome flow |
| 3. Subscriber loop | Account, booking engine, add-on payments, all emails, cron jobs |
| 4. Operations and launch | `/admin`, consent and analytics, legal pages, Stripe live mode, production domain |
