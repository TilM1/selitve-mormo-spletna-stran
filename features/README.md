# features/

Each folder here is one self-contained piece of functionality. The marketing site never
reaches inside a feature; it only uses the feature's entry component.

| Folder | What it is |
|---|---|
| `leads/` | The sign-up wizard and the plain enquiry form |
| `auth/` | Customer sign-in: password hashing, sessions, password reset |
| `account/` | Everything a signed-in customer can see and change |
| `booking/` | Real appointment availability and the calendar/time picker |
| `payments/` | Stripe: checkout, billing portal, state sync |
| `email/` | Sending and the e-mail texts |

Rules that keep the main site safe when these change:

1. A feature may import from `config/` and `components/ui/`. It never imports from `components/site/`.
2. The site imports a feature only through its top-level component (for example `features/leads/SignupWizard`).
3. Anything that talks to an outside service lives in one file: the database in `lib/db.ts`, Stripe in
   `payments/stripe.ts`, e-mail in `email/send.ts`, the enquiry webhook in `leads/deliver.ts`.
   Swapping a service means editing that one file.
4. Logged-in pages get their own route group, `app/(portal)/`, with their own layout.
   Nothing in `app/(site)/` needs to change when it is added.
