# Mormo.si

Public website for Mormo.si, a mobile car cleaning subscription for Ljubljana and surroundings.

Next.js (App Router), TypeScript, Tailwind CSS v4. The public site works on its own. Customer
accounts, real appointment availability, payments and e-mail each switch on when their keys
are added (see `.env.example`).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

Copy `.env.example` to `.env.local` and fill in what you have. Nothing is required for the
public pages.

## Switching the backend on

| Step | What | Result |
|---|---|---|
| 1 | Apply `supabase/migrations/20261008160000_mormo_customer_portal.sql` to the LLogistika Supabase project | Tables and functions exist |
| 2 | Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` | Sign-up creates an account, a vehicle and a real appointment in the shared calendar; `/vpis` and `/racun` work |
| 3 | Set `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET` | Welcome, password reset and the monthly "choose your appointment" e-mail |
| 4 | Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; in Stripe add a webhook to `/api/stripe/webhook` for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`; then set `require_payment` to `true` in `mormo_settings` | Customers pay at sign-up; unpaid holds expire |
| 5 | Update the LLogistika app with `docs/LLOGISTIKA-PROMPT.md` | Washes show correctly in the ERP calendar |

Do step 5 before real customers can book: until then the ERP does not know the job type `pranje`.

### How customer data is protected

- Customers sign in on this website. They do not get a Supabase login, so they can never query
  the database directly, and no existing LLogistika table or policy had to change.
- Passwords are stored only as salted scrypt hashes. Sessions are random tokens in an httpOnly
  cookie; the database keeps only a hash of each token.
- Only this site's server (the secret key, `lib/db.ts`) can read or write the `mormo_` tables.
  Every read is filtered by the signed-in customer (`features/account/data.ts`); every change
  goes through a database function that checks ownership and the business rules.
- Card details never reach this site: Stripe collects them on its own page.
- A customer can download all their data and delete their account from `/racun/profil`.
- The only cookie is the sign-in cookie. No tracking, so no cookie banner.

The migration is tested by `scripts/test-migration.mjs` against a throwaway local Postgres.

## Where things are

| I want to change… | Edit |
|---|---|
| Prices, plans, add-ons, vehicle sizes | `config/catalog.ts` |
| Phone, email, company details, menu links | `config/site.ts` |
| Any text on the homepage, FAQ | `content/home.ts` |
| Order of homepage sections | `app/(site)/page.tsx` |
| One section's layout | `components/site/sections/<Section>.tsx` |
| Colours, type, buttons, animations | `app/globals.css` |
| Where enquiries are sent | `features/leads/deliver.ts` |
| Opening hours, wash duration, 3-day rule | table `mormo_settings` in Supabase |
| E-mail texts | `features/email/templates.ts` |
| Privacy notice and terms (drafts) | `app/(site)/zasebnost`, `app/(site)/pogoji` |
| Where "sign up" buttons lead | `signupHref()` in `config/site.ts` |
| Photos in sections | `public/img/` (same filename = automatic swap) |

## Structure

```
app/
  layout.tsx            fonts, metadata (shared by everything)
  (site)/               the public website: nav + footer layout, homepage, /prijava
  (portal)/             customer area: /vpis, /racun, vehicles, appointments, profile
  api/                  Stripe webhook, daily reminder job
components/
  site/                 navigation, footer, homepage sections
  motion/               hero video, foam edge, before/after slider
  ui/                   logo, droplet
config/                 catalog and site details (single source of truth)
content/                Slovenian copy
features/               auth, account, booking, payments, email, leads (see features/README.md)
lib/                    database door (server only), env switches, Ljubljana time
supabase/migrations/    database changes
public/video/           optimised hero encodes and posters
docs/                   brief, architecture, design system, motion, flows, data model, assets
```

The marketing site and the future customer area are separate on purpose: different route
groups, different layouts, and features that the site only touches through one component.
Adding a calendar, login or Stripe later does not require editing the homepage.

## Hero video

The master (`mormo-hero-master-hq.mp4`, 15 MB) is not committed. The site serves optimised
encodes from `public/video/`:

| File | For | Size |
|---|---|---|
| `hero-portrait-720.v2.av1.mp4` / `.mp4` | phones (re-framed per scene) | 1.1 / 1.4 MB |
| `hero-1280.v2.mp4` | laptops | 2.5 MB |
| `hero-1920.v2.av1.mp4` / `.mp4` | large screens | 3.2 / 5.2 MB |

The poster image loads first; the video is attached after first paint and is skipped for
reduced-motion and data-saver users. To replace the video, re-encode, bump `v2` to `v3` in the
filenames and in `components/motion/HeroVideo.tsx` and `components/site/sections/Hero.tsx`.
