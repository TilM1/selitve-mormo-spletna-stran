// Checks the database migration against a throwaway in-memory Postgres with a stand-in for the
// ERP tables it touches. Run: npm i --no-save @electric-sql/pglite && node scripts/test-migration.mjs
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
const MIG = new URL("../supabase/migrations/20261008160000_mormo_customer_portal.sql", import.meta.url);
const db = new PGlite();
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`); };
const q = async (sql, p) => (await db.query(sql, p)).rows;
const err = async (sql, p) => { try { await db.query(sql, p); return null; } catch (e) { return e.message; } };

// --- a stand-in for the parts of the ERP the migration touches
await db.exec(`
  create role anon; create role authenticated; create role service_role;
  create table customers (id uuid primary key default gen_random_uuid(), name text not null, phone text, email text, notes text, is_partner boolean not null default false, created_at timestamptz not null default now());
  create table jobs (id uuid primary key default gen_random_uuid(), job_no bigint generated always as identity unique, type text not null, status text not null default 'reserved',
    customer_id uuid references customers(id), starts_at timestamptz not null, duration_min integer not null default 180, ends_at timestamptz not null,
    from_address text, notes text, vat_rate numeric not null default 22, updated_at timestamptz not null default now(),
    constraint jobs_type_check check (type = any (array['selitev','odvoz','transport'])),
    constraint jobs_status_check check (status = any (array['reserved','confirmed','in_progress','completed','cancelled'])),
    constraint jobs_duration_min_check check (duration_min > 0 and duration_min % 15 = 0));
  create function erp_jobs_before() returns trigger language plpgsql as $$ begin new.ends_at := new.starts_at + make_interval(mins => new.duration_min); new.updated_at := now(); return new; end $$;
  create trigger jobs_before before insert or update on jobs for each row execute function erp_jobs_before();
  create function erp_is_owner() returns boolean language sql stable as 'select false';
`);
await db.exec(fs.readFileSync(MIG, "utf8"));
ok("migration applies", true);

// a Wednesday 7-13 days from now, so every rule (lead time, 3-day rule) has room
const day = new Date(); day.setDate(day.getDate() + 7); while (day.getDay() !== 3) day.setDate(day.getDate() + 1);
const D = day.toISOString().slice(0, 10);
const at = (hm, d = D) => `(timestamp '${d} ${hm}' at time zone 'Europe/Ljubljana')`;
const local = (rows) => rows.map((r) => r.t);

// an existing confirmed move 10:00-13:00 on that day
await db.exec(`insert into jobs (type, status, starts_at, duration_min, ends_at) values ('selitev', 'confirmed', ${at("10:00")}, 180, ${at("13:00")})`);

let slots = local(await q(`select to_char(slot at time zone 'Europe/Ljubljana', 'HH24:MI') t from mormo_available_slots($1, $1, 'small', false)`, [D]));
ok("slots avoid the move incl. 30 min buffer (90 min wash)", slots.join(",") === "08:00,13:30,14:00,14:30,15:00,15:30,16:00,16:30", slots.join(","));
slots = local(await q(`select to_char(slot at time zone 'Europe/Ljubljana', 'HH24:MI') t from mormo_available_slots($1, $1, 'small', true)`, [D]));
ok("first visit is longer (150 min) so fewer slots", slots.join(",") === "13:30,14:00,14:30,15:00,15:30", slots.join(","));
const sun = new Date(day); while (sun.getDay() !== 0) sun.setDate(sun.getDate() + 1);
ok("Sunday is open 8-18 (18 half-hour starts for a 90 min wash)", (await q(`select count(*)::int n from mormo_available_slots($1, $1)`, [sun.toISOString().slice(0, 10)]))[0].n === 18);
await db.exec(`update mormo_settings set value = '{"1":[8,18]}' where key = 'open_hours'`);
ok("a day missing from open_hours is closed", (await q(`select count(*)::int n from mormo_available_slots($1, $1)`, [D]))[0].n === 0);
await db.exec(`update mormo_settings set value = '{"1":[8,18],"2":[8,18],"3":[8,18],"4":[8,18],"5":[8,18],"6":[8,18],"7":[8,18]}' where key = 'open_hours'`);
const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
ok("nothing bookable inside 48 h", (await q(`select count(*)::int n from mormo_available_slots($1, $1)`, [tomorrow]))[0].n === 0);

const reg = (email, time, plan = "clean", size = "small") => `select mormo_register('${email}', 'scrypt$xxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Ana Novak', '040 123 456', 'Celovška 123', '1000 Ljubljana', 'doma', 'Beli', 'BMW', 'X5', '${size}', null, '${plan}', ${time}, '2026-10', false) r`;
const r1 = (await q(reg("Ana@Example.com", at("13:30"))))[0].r;
ok("register creates customer, subscription and booking", !!(r1.customer_id && r1.subscription_id && r1.booking_id));
const job = (await q(`select j.* , to_char(j.starts_at at time zone 'Europe/Ljubljana','HH24:MI') t from jobs j join mormo_bookings b on b.job_id = j.id where b.id = $1`, [r1.booking_id]))[0];
ok("wash is in the ERP calendar as 'pranje', reserved, 150 min", job.type === "pranje" && job.status === "reserved" && job.duration_min === 150 && job.t === "13:30", `${job.type}/${job.status}/${job.duration_min}/#${job.job_no}`);
ok("calendar note describes the car", job.notes === "Mormo.si · Beli (BMW X5) · CLEAN · prvi obisk" && job.from_address === "Celovška 123, 1000 Ljubljana", job.notes);
ok("ERP customer row created", (await q(`select name, notes from customers`))[0].notes === "Mormo.si stranka");
ok("e-mail stored lower-case", (await q(`select email from mormo_customers`))[0].email === "ana@example.com");

let e = await err(reg("ana@example.com", at("08:00")));
ok("duplicate e-mail refused", /že obstaja/.test(e || ""), e);
e = await err(reg("bor@example.com", at("14:00")));
ok("overlapping slot refused for a second customer", /zaseden|ni na voljo/.test(e || ""), e);
ok("failed registration leaves nothing behind", (await q(`select count(*)::int n from mormo_customers`))[0].n === 1 && (await q(`select count(*)::int n from customers`))[0].n === 1);
e = await err(reg("cid@example.com", at("09:15")));
ok("off-grid time refused", /ni na voljo/.test(e || ""), e);
e = await err(reg("dan@example.com", at("17:00")));
ok("slot running past closing refused", /ni na voljo/.test(e || ""), e);
e = await err(reg("eva@example.com", at("08:00"), "gold"));
ok("unknown plan refused", /Neznan paket/.test(e || ""), e);

const cust = r1.customer_id, veh = (await q(`select id from mormo_vehicles`))[0].id;
const next = new Date(day); next.setDate(next.getDate() + 1); const D2 = next.toISOString().slice(0, 10);
e = await err(`select mormo_book($1, $2, ${at("09:00", D2)})`, [cust, veh]);
ok("monthly quota enforced (CLEAN = 1 visit)", /vsi obiski/.test(e || "") || next.getMonth() !== day.getMonth(), e);
e = await err(`select mormo_book($1, $2, ${at("09:00", D2)})`, ["00000000-0000-0000-0000-000000000001", veh]);
ok("cannot book someone else's vehicle", /nima aktivne/.test(e || ""), e);

// reschedule: allowed when >= 3 days away
await q(`select mormo_reschedule($1, $2, ${at("09:00", D2)})`, [cust, r1.booking_id]);
const moved = (await q(`select to_char(j.starts_at at time zone 'Europe/Ljubljana','YYYY-MM-DD HH24:MI') t, b.rescheduled_count c, (b.starts_at = j.starts_at) same from jobs j join mormo_bookings b on b.job_id = j.id where b.id = $1`, [r1.booking_id]))[0];
ok("reschedule moves the calendar entry and the booking", moved.t === `${D2} 09:00` && moved.c === 1 && moved.same, moved.t);
slots = local(await q(`select to_char(slot at time zone 'Europe/Ljubljana', 'HH24:MI') t from mormo_available_slots($1, $1, 'small', false)`, [D]));
ok("old slot is free again", slots.includes("13:30"), slots.join(","));
e = await err(`select mormo_reschedule($1, $2, ${at("09:00", D)})`, ["00000000-0000-0000-0000-000000000001", r1.booking_id]);
ok("cannot move someone else's booking", /ne obstaja/.test(e || ""), e);
// pull the booking to 2 days from now (as staff would), then the customer may no longer move it
await db.exec(`update jobs set starts_at = now() + interval '2 days' where type = 'pranje'`);
ok("staff moving the job updates the customer's booking (trigger)", (await q(`select (b.starts_at = j.starts_at) same from jobs j join mormo_bookings b on b.job_id = j.id`))[0].same);
e = await err(`select mormo_reschedule($1, $2, ${at("14:00", D)})`, [cust, r1.booking_id]);
ok("3-day rule enforced", /najkasneje 3 dni/.test(e || ""), e);

// payment
await q(`select mormo_apply_subscription_state($1, 'active', 'sub_1', 'price_1', now(), now() + interval '1 month', false)`, [r1.subscription_id]);
ok("payment confirms the held appointment", (await q(`select status from jobs where type='pranje'`))[0].status === "confirmed");
const due = await q(`select * from mormo_due_reminders()`);
ok("no reminder while this month's visit is booked", due.length === 0 || new Date(Date.now() + 2 * 864e5).getMonth() !== new Date().getMonth(), JSON.stringify(due));
await db.exec(`update jobs set status = 'cancelled' where type = 'pranje'`);
ok("staff cancelling shows as cancelled to the customer", (await q(`select status from mormo_bookings`))[0].status === "cancelled");
const due2 = await q(`select * from mormo_due_reminders()`);
ok("reminder due when a visit is still open", due2.length === 1 && due2[0].remaining === 1 && due2[0].nickname === "Beli", JSON.stringify(due2.map((d) => [d.email, d.remaining])));
await db.exec(`update jobs set status = 'completed' where type = 'pranje'`);
ok("completed wash appears as history", (await q(`select status from mormo_bookings`))[0].status === "completed");

// plan, vehicle, profile
await q(`select mormo_change_plan($1, $2, 'always_clean')`, [cust, r1.subscription_id]);
const sub = (await q(`select plan_key, visits_per_period v, monthly_amount_cents c from mormo_subscriptions where id = $1`, [r1.subscription_id]))[0];
ok("plan change updates visits and price", sub.plan_key === "always_clean" && sub.v === 2 && sub.c === 16900, JSON.stringify(sub));
const add = (await q(`select mormo_add_vehicle($1, 'Družinski', 'Škoda', 'Kodiaq', 'suv', 'LJ AB-123', 'always_clean', null) r`, [cust]))[0].r;
const sub2 = (await q(`select monthly_amount_cents c from mormo_subscriptions where id = $1`, [add.subscription_id]))[0];
ok("second vehicle gets its own subscription with size surcharge (169 + 2x15)", sub2.c === 19900, String(sub2.c));
e = await err(`insert into mormo_subscriptions (customer_id, vehicle_id, plan_key, visits_per_period, monthly_amount_cents) values ($1, $2, 'clean', 1, 8900)`, [cust, add.vehicle_id]);
ok("one live subscription per vehicle", /mormo_subscriptions_one_live_per_vehicle/.test(e || ""), e?.slice(0, 60));
await q(`select mormo_update_profile($1, 'Ana Kovač', '041 000 000', 'Nova 1', '1000 Ljubljana', 'sluzba', 'Garaža -2', true)`, [cust]);
ok("profile update also updates the ERP customer name", (await q(`select name from customers`))[0].name === "Ana Kovač");

// GDPR
const exp = (await q(`select mormo_export_data($1) r`, [cust]))[0].r;
ok("export contains profile, 2 vehicles, bookings and no internal ids", exp.vehicles.length === 2 && exp.bookings.length === 1 && !("stripe_customer_id" in exp.profile) && !JSON.stringify(exp).includes("password"));
await q(`select mormo_delete_customer($1)`, [cust]);
const left = (await q(`select (select count(*) from mormo_customers)::int c, (select count(*) from mormo_vehicles)::int v, (select count(*) from mormo_bookings)::int b, (select count(*) from mormo_credentials)::int p`))[0];
ok("erase removes every customer row", left.c + left.v + left.b + left.p === 0, JSON.stringify(left));
const anon = (await q(`select j.notes, j.from_address, c.name, c.phone from jobs j join customers c on c.id = j.customer_id where j.type = 'pranje'`))[0];
ok("erase scrubs the calendar entry and the ERP customer", anon.notes === "Mormo.si · podatki izbrisani" && anon.from_address === null && anon.name === "Izbrisana stranka" && anon.phone === null, JSON.stringify(anon));
ok("the move is untouched", (await q(`select type, status, duration_min from jobs where job_no = 1`))[0].status === "confirmed");

// privileges
const priv = (await q(`select
  has_function_privilege('anon', 'mormo_register(text,text,text,text,text,text,text,text,text,text,text,text,text,timestamptz,text,boolean)', 'execute') a1,
  has_function_privilege('authenticated', 'mormo_book(uuid,uuid,timestamptz)', 'execute') a2,
  has_function_privilege('anon', 'mormo_available_slots(date,date,text,boolean,uuid,uuid)', 'execute') a3,
  has_function_privilege('authenticated', 'mormo__setting(text)', 'execute') a4,
  has_function_privilege('service_role', 'mormo_book(uuid,uuid,timestamptz)', 'execute') s1,
  has_table_privilege('authenticated', 'mormo_credentials', 'select') t1,
  has_table_privilege('anon', 'mormo_customers', 'select') t2,
  has_table_privilege('authenticated', 'mormo_sessions', 'select') t3,
  (select bool_and(relrowsecurity) from pg_class where relname like 'mormo\\_%' and relkind = 'r') rls,
  (select count(*)::int from pg_proc where proname like 'mormo%' and (proconfig is null or not prosecdef)) loose`))[0];
ok("visitors and ERP logins cannot call any function", !priv.a1 && !priv.a2 && !priv.a3 && !priv.a4, JSON.stringify(priv));
ok("the server can", priv.s1);
ok("sign-in tables unreadable to any API role", !priv.t1 && !priv.t2 && !priv.t3);
ok("RLS on every mormo table", priv.rls === true);
ok("every function pins its search_path", priv.loose === 0, String(priv.loose));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
