-- Mormo.si customer portal
-- ---------------------------------------------------------------------------
-- Adds the customer side (accounts, their vehicles, subscriptions, wash bookings)
-- next to the existing ERP. Wash appointments are written into the existing
-- calendar (public.jobs, type 'pranje'), so they appear beside the moves.
--
-- How access works:
--   * Customers do NOT get Supabase Auth accounts. They sign in on the website,
--     which keeps its own sessions. A customer therefore never holds a login
--     that is valid for this database, and no existing ERP table or policy
--     needs to change.
--   * Only the website's server (service_role) can touch the mormo_ tables and
--     call the mormo_ functions. Visitors and ERP workers cannot.
--   * The ERP owner can read customers, vehicles, subscriptions and bookings.
--
-- Changes to existing ERP objects (nothing is deleted, no row is modified):
--   * jobs.type accepts one more value: 'pranje'
--   * one AFTER UPDATE trigger on jobs that keeps a wash booking in step when
--     staff move, complete or cancel it. It can never block an ERP update.
-- ---------------------------------------------------------------------------

-- 1. The calendar accepts washes -------------------------------------------------
alter table public.jobs
  drop constraint jobs_type_check,
  add constraint jobs_type_check
    check (type = any (array['selitev'::text, 'odvoz'::text, 'transport'::text, 'pranje'::text]));

-- 2. Settings the owner can tune without a deploy --------------------------------
create table public.mormo_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
insert into public.mormo_settings (key, value) values
  -- ISO weekday (1 = Monday) -> [opening hour, closing hour]. A missing day is closed.
  ('open_hours', '{"1":[8,18],"2":[8,18],"3":[8,18],"4":[8,18],"5":[8,18],"6":[8,18],"7":[8,18]}'),
  ('slot_step_min', '30'),
  ('duration_min', '{"small":90,"suv":105,"xl":120}'),
  ('first_visit_extra_min', '60'),
  ('buffer_min', '30'),              -- travel time kept free before and after every job
  ('max_parallel_jobs', '1'),        -- how many jobs may overlap a wash slot before it is full
  ('moves_block_washes', 'true'),    -- false = only other washes make a slot busy
  ('min_lead_hours', '48'),          -- earliest bookable time from now
  ('horizon_days', '60'),            -- latest bookable day from now
  ('reschedule_min_days', '3'),      -- a booking can be moved until this many days before it
  ('require_payment', 'false'),      -- true once Stripe is live: unpaid holds then expire
  ('pending_hold_minutes', '120'),
  ('size_surcharge_cents', '{"small":0,"suv":1500,"xl":2500}');

create table public.mormo_plans (
  key text primary key,
  name text not null,
  monthly_cents integer not null check (monthly_cents >= 0),
  visits_per_period integer not null check (visits_per_period > 0),
  active boolean not null default true
);
-- Must match config/catalog.ts on the website.
insert into public.mormo_plans (key, name, monthly_cents, visits_per_period) values
  ('clean', 'CLEAN', 8900, 1),
  ('always_clean', 'ALWAYS CLEAN', 16900, 2),
  ('premium', 'PREMIUM', 23900, 2);

-- 3. Customer data ---------------------------------------------------------------
create table public.mormo_customers (
  id uuid primary key default gen_random_uuid(),
  erp_customer_id uuid references public.customers (id),
  email text not null,
  full_name text not null,
  phone text,
  street text,
  city text,
  location_kind text check (location_kind in ('doma', 'sluzba', 'drugje')),
  access_notes text,
  stripe_customer_id text unique,
  terms_accepted_at timestamptz not null,
  privacy_version text not null,
  marketing_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index mormo_customers_email_key on public.mormo_customers (lower(email));

-- Sign-in data lives apart from the profile, so nothing that can read a profile can read a password hash.
create table public.mormo_credentials (
  customer_id uuid primary key references public.mormo_customers (id) on delete cascade,
  password_hash text not null,
  updated_at timestamptz not null default now()
);
create table public.mormo_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,           -- only a hash of the cookie value is stored
  customer_id uuid not null references public.mormo_customers (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index mormo_sessions_customer_idx on public.mormo_sessions (customer_id);
create table public.mormo_auth_tokens (       -- single-use password reset links
  token_hash text primary key,
  customer_id uuid not null references public.mormo_customers (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
);
create table public.mormo_login_attempts (    -- for slowing down password guessing
  key text not null,                          -- hash of the e-mail, never the e-mail itself
  at timestamptz not null default now()
);
create index mormo_login_attempts_idx on public.mormo_login_attempts (key, at);

create table public.mormo_vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.mormo_customers (id) on delete cascade,
  nickname text not null,
  make text not null,
  model text,
  size text not null check (size in ('small', 'suv', 'xl')),
  plate text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index mormo_vehicles_customer_idx on public.mormo_vehicles (customer_id);

create table public.mormo_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.mormo_customers (id) on delete cascade,
  vehicle_id uuid not null references public.mormo_vehicles (id) on delete cascade,
  plan_key text not null references public.mormo_plans (key),
  visits_per_period integer not null,
  monthly_amount_cents integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'past_due', 'paused', 'canceled')),
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- One live subscription per vehicle.
create unique index mormo_subscriptions_one_live_per_vehicle
  on public.mormo_subscriptions (vehicle_id) where status <> 'canceled';
create index mormo_subscriptions_customer_idx on public.mormo_subscriptions (customer_id);

create table public.mormo_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.mormo_customers (id) on delete cascade,
  vehicle_id uuid not null references public.mormo_vehicles (id) on delete cascade,
  subscription_id uuid not null references public.mormo_subscriptions (id) on delete cascade,
  job_id uuid unique references public.jobs (id) on delete set null,
  starts_at timestamptz not null,
  duration_min integer not null,
  status text not null default 'booked' check (status in ('booked', 'completed', 'cancelled')),
  is_first_visit boolean not null default false,
  rescheduled_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index mormo_bookings_vehicle_idx on public.mormo_bookings (vehicle_id, starts_at);
create index mormo_bookings_subscription_idx on public.mormo_bookings (subscription_id, starts_at);

create table public.mormo_stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);
create table public.mormo_email_log (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique,
  customer_id uuid references public.mormo_customers (id) on delete cascade,
  template text not null,
  created_at timestamptz not null default now()
);

-- 4. Row level security ----------------------------------------------------------
-- RLS is on everywhere. With no policy, a table is closed to everyone except the server.
alter table public.mormo_settings enable row level security;
alter table public.mormo_plans enable row level security;
alter table public.mormo_customers enable row level security;
alter table public.mormo_credentials enable row level security;
alter table public.mormo_sessions enable row level security;
alter table public.mormo_auth_tokens enable row level security;
alter table public.mormo_login_attempts enable row level security;
alter table public.mormo_vehicles enable row level security;
alter table public.mormo_subscriptions enable row level security;
alter table public.mormo_bookings enable row level security;
alter table public.mormo_stripe_events enable row level security;
alter table public.mormo_email_log enable row level security;

revoke all on public.mormo_settings, public.mormo_plans, public.mormo_customers, public.mormo_credentials,
  public.mormo_sessions, public.mormo_auth_tokens, public.mormo_login_attempts, public.mormo_vehicles,
  public.mormo_subscriptions, public.mormo_bookings, public.mormo_stripe_events, public.mormo_email_log
  from anon, authenticated;

-- The ERP owner may read the business data (not sign-in data).
grant select on public.mormo_settings, public.mormo_plans, public.mormo_customers, public.mormo_vehicles,
  public.mormo_subscriptions, public.mormo_bookings to authenticated;
create policy mormo_settings_owner_read on public.mormo_settings for select to authenticated using (public.erp_is_owner());
create policy mormo_plans_owner_read on public.mormo_plans for select to authenticated using (public.erp_is_owner());
create policy mormo_customers_owner_read on public.mormo_customers for select to authenticated using (public.erp_is_owner());
create policy mormo_vehicles_owner_read on public.mormo_vehicles for select to authenticated using (public.erp_is_owner());
create policy mormo_subscriptions_owner_read on public.mormo_subscriptions for select to authenticated using (public.erp_is_owner());
create policy mormo_bookings_owner_read on public.mormo_bookings for select to authenticated using (public.erp_is_owner());

-- 5. Helpers -----------------------------------------------------------------------
create or replace function public.mormo__setting(p_key text)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select value from public.mormo_settings where key = p_key;
$$;

create or replace function public.mormo__duration(p_size text, p_first boolean)
returns integer language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce((public.mormo__setting('duration_min') ->> p_size)::int, 90)
       + case when p_first then coalesce((public.mormo__setting('first_visit_extra_min') #>> '{}')::int, 0) else 0 end;
$$;

-- Is the slot inside opening hours, on the booking grid, and not too soon or too far?
create or replace function public.mormo__slot_allowed(p_starts timestamptz, p_duration integer)
returns boolean language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_local timestamp := p_starts at time zone 'Europe/Ljubljana';
  v_hours jsonb := public.mormo__setting('open_hours') -> (extract(isodow from v_local)::int)::text;
  v_step int := (public.mormo__setting('slot_step_min') #>> '{}')::int;
  v_start_min int := extract(hour from v_local)::int * 60 + extract(minute from v_local)::int;
begin
  if v_hours is null then return false; end if;
  if extract(second from v_local) <> 0 or v_start_min % v_step <> 0 then return false; end if;
  if v_start_min < (v_hours ->> 0)::int * 60 then return false; end if;
  if v_start_min + p_duration > (v_hours ->> 1)::int * 60 then return false; end if;
  if p_starts < now() + make_interval(hours => (public.mormo__setting('min_lead_hours') #>> '{}')::int) then return false; end if;
  if p_starts > now() + make_interval(days => (public.mormo__setting('horizon_days') #>> '{}')::int) then return false; end if;
  return true;
end $$;

-- Is the crew free? Looks at the active jobs in the calendar, with travel buffer on
-- both sides. Unpaid holds that have expired do not count.
create or replace function public.mormo__slot_free(p_starts timestamptz, p_duration integer, p_ignore_job uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  with cfg as (
    select make_interval(mins => (public.mormo__setting('buffer_min') #>> '{}')::int) as buf,
           (public.mormo__setting('max_parallel_jobs') #>> '{}')::int as cap,
           (public.mormo__setting('moves_block_washes') #>> '{}')::boolean as moves,
           (public.mormo__setting('require_payment') #>> '{}')::boolean as pay,
           make_interval(mins => (public.mormo__setting('pending_hold_minutes') #>> '{}')::int) as hold
  )
  select count(*) < (select cap from cfg)
  from public.jobs j, cfg
  where j.id is distinct from p_ignore_job
    and j.status in ('reserved', 'confirmed', 'in_progress')
    and (cfg.moves or j.type = 'pranje')
    and j.starts_at < p_starts + make_interval(mins => p_duration) + cfg.buf
    and j.ends_at > p_starts - cfg.buf
    and not (
      cfg.pay and j.type = 'pranje' and j.status = 'reserved' and exists (
        select 1 from public.mormo_bookings b
        join public.mormo_subscriptions s on s.id = b.subscription_id
        where b.job_id = j.id and s.status = 'pending' and b.created_at < now() - cfg.hold));
$$;

-- Creates the calendar entry and the booking. The caller has already checked ownership.
create or replace function public.mormo__create_booking(p_sub uuid, p_starts timestamptz, p_first boolean)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  s public.mormo_subscriptions; v public.mormo_vehicles; c public.mormo_customers;
  v_duration int; v_job uuid; v_booking uuid; v_month_count int;
begin
  select * into s from public.mormo_subscriptions where id = p_sub;
  select * into v from public.mormo_vehicles where id = s.vehicle_id;
  select * into c from public.mormo_customers where id = s.customer_id;

  if s.status not in ('active', 'pending') then
    raise exception 'Naročnina za to vozilo ni aktivna.' using errcode = 'P0001';
  end if;
  if s.status = 'pending' and (public.mormo__setting('require_payment') #>> '{}')::boolean and not p_first then
    raise exception 'Najprej dokončaj plačilo naročnine.' using errcode = 'P0001';
  end if;

  v_duration := public.mormo__duration(v.size, p_first);
  if not public.mormo__slot_allowed(p_starts, v_duration) then
    raise exception 'Ta termin ni na voljo.' using errcode = 'P0001';
  end if;

  -- One booking at a time, so two customers cannot take the same slot.
  perform pg_advisory_xact_lock(hashtext('mormo_booking'));

  select count(*) into v_month_count from public.mormo_bookings b
   where b.subscription_id = s.id and b.status in ('booked', 'completed')
     and date_trunc('month', b.starts_at at time zone 'Europe/Ljubljana')
       = date_trunc('month', p_starts at time zone 'Europe/Ljubljana');
  if v_month_count >= s.visits_per_period then
    raise exception 'Za ta mesec so vsi obiski tvojega paketa že rezervirani.' using errcode = 'P0001';
  end if;

  if not public.mormo__slot_free(p_starts, v_duration, null) then
    raise exception 'Ta termin je pravkar zaseden. Izberi drugega.' using errcode = 'P0001';
  end if;

  -- job_no is numbered by the database itself (identity column), so it is not set here.
  insert into public.jobs (type, status, customer_id, starts_at, duration_min, ends_at, from_address, notes)
  values (
    'pranje',
    case when s.status = 'active' then 'confirmed' else 'reserved' end,
    c.erp_customer_id, p_starts, v_duration, p_starts + make_interval(mins => v_duration),
    nullif(concat_ws(', ', c.street, c.city), ''),
    format('Mormo.si · %s (%s) · %s%s', v.nickname, concat_ws(' ', v.make, v.model),
           (select name from public.mormo_plans where key = s.plan_key),
           case when p_first then ' · prvi obisk' else '' end)
  ) returning id into v_job;

  insert into public.mormo_bookings (customer_id, vehicle_id, subscription_id, job_id, starts_at, duration_min, is_first_visit)
  values (c.id, v.id, s.id, v_job, p_starts, v_duration, p_first)
  returning id into v_booking;
  return v_booking;
end $$;

create or replace function public.mormo__create_vehicle_subscription(
  p_customer uuid, p_nickname text, p_make text, p_model text, p_size text, p_plate text, p_plan text)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare p public.mormo_plans; v_vehicle uuid; v_sub uuid; v_surcharge int;
begin
  select * into p from public.mormo_plans where key = p_plan and active;
  if not found then raise exception 'Neznan paket.' using errcode = 'P0001'; end if;
  if p_size is null or p_size not in ('small', 'suv', 'xl') then raise exception 'Izberi velikost vozila.' using errcode = 'P0001'; end if;
  if length(btrim(coalesce(p_nickname, ''))) < 1 or length(btrim(coalesce(p_make, ''))) < 1 then
    raise exception 'Vpiši vozilo in ime zanj.' using errcode = 'P0001';
  end if;
  v_surcharge := coalesce((public.mormo__setting('size_surcharge_cents') ->> p_size)::int, 0);

  insert into public.mormo_vehicles (customer_id, nickname, make, model, size, plate)
  values (p_customer, left(btrim(p_nickname), 60), left(btrim(p_make), 80), nullif(left(btrim(coalesce(p_model, '')), 80), ''),
          p_size, nullif(left(btrim(coalesce(p_plate, '')), 16), ''))
  returning id into v_vehicle;

  insert into public.mormo_subscriptions (customer_id, vehicle_id, plan_key, visits_per_period, monthly_amount_cents)
  values (p_customer, v_vehicle, p.key, p.visits_per_period, p.monthly_cents + v_surcharge * p.visits_per_period)
  returning id into v_sub;
  return v_sub;
end $$;

-- 6. Functions the website's server calls --------------------------------------------
-- Every function that acts for a customer takes that customer's id from the server's
-- own session and checks that the vehicle, booking or subscription belongs to them.

-- Free start times between two dates. Returns only times, never whose job blocks one.
create or replace function public.mormo_available_slots(
  p_from date, p_to date, p_size text default 'small', p_first boolean default false,
  p_customer uuid default null, p_ignore_booking uuid default null)
returns table (slot timestamptz) language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_duration int := public.mormo__duration(p_size, p_first);
  v_step int := (public.mormo__setting('slot_step_min') #>> '{}')::int;
  v_ignore uuid;
begin
  if p_to < p_from or p_to - p_from > 62 then
    raise exception 'Predolgo obdobje.' using errcode = 'P0001';
  end if;
  if p_ignore_booking is not null then -- when moving a booking, its own slot counts as free
    select b.job_id, b.duration_min into v_ignore, v_duration from public.mormo_bookings b
     where b.id = p_ignore_booking and b.customer_id = p_customer;
    if not found then raise exception 'Termin ne obstaja.' using errcode = 'P0001'; end if;
  end if;
  return query
    select t.s
    from generate_series(p_from::timestamp, p_to::timestamp, interval '1 day') d
    cross join lateral generate_series(0, 24 * 60 - v_step, v_step) m
    cross join lateral (select (d + make_interval(mins => m)) at time zone 'Europe/Ljubljana' as s) t
    where public.mormo__slot_allowed(t.s, v_duration)
      and public.mormo__slot_free(t.s, v_duration, v_ignore)
    order by t.s;
end $$;

-- First checkout: account + first vehicle + subscription + first appointment, all or nothing.
create or replace function public.mormo_register(
  p_email text, p_password_hash text, p_full_name text, p_phone text, p_street text, p_city text, p_location_kind text,
  p_nickname text, p_make text, p_model text, p_size text, p_plate text,
  p_plan text, p_starts_at timestamptz, p_privacy_version text, p_marketing boolean)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_email text := lower(btrim(coalesce(p_email, ''))); c public.mormo_customers; v_erp uuid; v_sub uuid; v_booking uuid;
begin
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Preveri e-naslov.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.mormo_customers where lower(email) = v_email) then
    raise exception 'Račun s tem e-naslovom že obstaja. Prijavi se.' using errcode = 'P0002';
  end if;
  if length(coalesce(p_password_hash, '')) < 20 then raise exception 'Geslo manjka.' using errcode = 'P0001'; end if;
  if length(btrim(coalesce(p_full_name, ''))) < 2 or length(btrim(coalesce(p_street, ''))) < 3 or length(btrim(coalesce(p_city, ''))) < 2 then
    raise exception 'Vpiši ime in naslov.' using errcode = 'P0001';
  end if;

  insert into public.customers (name, phone, email, notes)
  values (left(btrim(p_full_name), 120), nullif(left(btrim(coalesce(p_phone, '')), 40), ''), v_email, 'Mormo.si stranka')
  returning id into v_erp;

  insert into public.mormo_customers (erp_customer_id, email, full_name, phone, street, city, location_kind,
                                      terms_accepted_at, privacy_version, marketing_consent_at)
  values (v_erp, v_email, left(btrim(p_full_name), 120), nullif(left(btrim(coalesce(p_phone, '')), 40), ''),
          left(btrim(p_street), 160), left(btrim(p_city), 120),
          case when p_location_kind in ('doma', 'sluzba', 'drugje') then p_location_kind end,
          now(), left(coalesce(p_privacy_version, ''), 20), case when p_marketing then now() end)
  returning * into c;
  insert into public.mormo_credentials (customer_id, password_hash) values (c.id, p_password_hash);

  v_sub := public.mormo__create_vehicle_subscription(c.id, p_nickname, p_make, p_model, p_size, p_plate, p_plan);
  if p_starts_at is not null then
    v_booking := public.mormo__create_booking(v_sub, p_starts_at, true);
  end if;
  return jsonb_build_object('customer_id', c.id, 'subscription_id', v_sub, 'booking_id', v_booking);
end $$;

-- Another car with its own plan.
create or replace function public.mormo_add_vehicle(
  p_customer uuid, p_nickname text, p_make text, p_model text, p_size text, p_plate text, p_plan text, p_starts_at timestamptz)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_sub uuid; v_booking uuid;
begin
  if not exists (select 1 from public.mormo_customers where id = p_customer) then
    raise exception 'Profil ne obstaja.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.mormo_vehicles where customer_id = p_customer and active) >= 20 then
    raise exception 'Za več kot 20 vozil nam piši.' using errcode = 'P0001';
  end if;
  v_sub := public.mormo__create_vehicle_subscription(p_customer, p_nickname, p_make, p_model, p_size, p_plate, p_plan);
  if p_starts_at is not null then
    v_booking := public.mormo__create_booking(v_sub, p_starts_at, true);
  end if;
  return jsonb_build_object('subscription_id', v_sub, 'booking_id', v_booking,
                            'vehicle_id', (select vehicle_id from public.mormo_subscriptions where id = v_sub));
end $$;

-- A regular monthly appointment for one of the customer's vehicles.
create or replace function public.mormo_book(p_customer uuid, p_vehicle uuid, p_starts_at timestamptz)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_sub uuid;
begin
  select s.id into v_sub from public.mormo_subscriptions s
   where s.vehicle_id = p_vehicle and s.customer_id = p_customer and s.status in ('active', 'pending');
  if not found then raise exception 'To vozilo nima aktivne naročnine.' using errcode = 'P0001'; end if;
  return public.mormo__create_booking(v_sub, p_starts_at, false);
end $$;

-- Move an appointment. Allowed until N days before it (setting reschedule_min_days).
create or replace function public.mormo_reschedule(p_customer uuid, p_booking uuid, p_starts_at timestamptz)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  b public.mormo_bookings; s public.mormo_subscriptions;
  v_days int := (public.mormo__setting('reschedule_min_days') #>> '{}')::int; v_month_count int;
begin
  select * into b from public.mormo_bookings where id = p_booking and customer_id = p_customer for update;
  if not found then raise exception 'Termin ne obstaja.' using errcode = 'P0001'; end if;
  if b.status <> 'booked' then raise exception 'Tega termina ni več mogoče prestaviti.' using errcode = 'P0001'; end if;
  if b.starts_at - now() < make_interval(days => v_days) then
    raise exception 'Termin lahko prestaviš najkasneje % dni prej. Za spremembo nas pokliči.', v_days using errcode = 'P0001';
  end if;
  if not public.mormo__slot_allowed(p_starts_at, b.duration_min) then
    raise exception 'Ta termin ni na voljo.' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtext('mormo_booking'));
  select * into s from public.mormo_subscriptions where id = b.subscription_id;
  select count(*) into v_month_count from public.mormo_bookings x
   where x.subscription_id = s.id and x.id <> b.id and x.status in ('booked', 'completed')
     and date_trunc('month', x.starts_at at time zone 'Europe/Ljubljana')
       = date_trunc('month', p_starts_at at time zone 'Europe/Ljubljana');
  if v_month_count >= s.visits_per_period then
    raise exception 'Za ta mesec so vsi obiski tvojega paketa že rezervirani.' using errcode = 'P0001';
  end if;
  if not public.mormo__slot_free(p_starts_at, b.duration_min, b.job_id) then
    raise exception 'Ta termin je pravkar zaseden. Izberi drugega.' using errcode = 'P0001';
  end if;

  update public.jobs set starts_at = p_starts_at where id = b.job_id;
  update public.mormo_bookings
     set starts_at = p_starts_at, rescheduled_count = rescheduled_count + 1, updated_at = now()
   where id = b.id;
  return b.id;
end $$;

-- Change plan. With a live Stripe subscription the server changes the price in Stripe first.
create or replace function public.mormo_change_plan(p_customer uuid, p_subscription uuid, p_plan text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare s public.mormo_subscriptions; p public.mormo_plans; v public.mormo_vehicles;
begin
  select * into s from public.mormo_subscriptions where id = p_subscription and customer_id = p_customer for update;
  if not found or s.status = 'canceled' then raise exception 'Naročnina ne obstaja.' using errcode = 'P0001'; end if;
  select * into p from public.mormo_plans where key = p_plan and active;
  if not found then raise exception 'Neznan paket.' using errcode = 'P0001'; end if;
  select * into v from public.mormo_vehicles where id = s.vehicle_id;
  update public.mormo_subscriptions
     set plan_key = p.key, visits_per_period = p.visits_per_period,
         monthly_amount_cents = p.monthly_cents
           + coalesce((public.mormo__setting('size_surcharge_cents') ->> v.size)::int, 0) * p.visits_per_period,
         updated_at = now()
   where id = s.id;
end $$;

create or replace function public.mormo_update_profile(
  p_customer uuid, p_full_name text, p_phone text, p_street text, p_city text, p_location_kind text,
  p_access_notes text, p_marketing boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_erp uuid;
begin
  if length(btrim(coalesce(p_full_name, ''))) < 2 then raise exception 'Vpiši ime in priimek.' using errcode = 'P0001'; end if;
  update public.mormo_customers set
    full_name = left(btrim(p_full_name), 120),
    phone = nullif(left(btrim(coalesce(p_phone, '')), 40), ''),
    street = nullif(left(btrim(coalesce(p_street, '')), 160), ''),
    city = nullif(left(btrim(coalesce(p_city, '')), 120), ''),
    location_kind = case when p_location_kind in ('doma', 'sluzba', 'drugje') then p_location_kind end,
    access_notes = nullif(left(btrim(coalesce(p_access_notes, '')), 500), ''),
    marketing_consent_at = case when p_marketing then coalesce(marketing_consent_at, now()) end,
    updated_at = now()
  where id = p_customer
  returning erp_customer_id into v_erp;
  if not found then raise exception 'Profil ne obstaja.' using errcode = 'P0001'; end if;
  update public.customers set name = left(btrim(p_full_name), 120), phone = nullif(left(btrim(coalesce(p_phone, '')), 40), '')
   where id = v_erp;
end $$;

create or replace function public.mormo_update_vehicle(
  p_customer uuid, p_vehicle uuid, p_nickname text, p_make text, p_model text, p_plate text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if length(btrim(coalesce(p_nickname, ''))) < 1 or length(btrim(coalesce(p_make, ''))) < 1 then
    raise exception 'Vpiši vozilo in ime zanj.' using errcode = 'P0001';
  end if;
  update public.mormo_vehicles set
    nickname = left(btrim(p_nickname), 60), make = left(btrim(p_make), 80),
    model = nullif(left(btrim(coalesce(p_model, '')), 80), ''), plate = nullif(left(btrim(coalesce(p_plate, '')), 16), '')
  where id = p_vehicle and customer_id = p_customer;
  if not found then raise exception 'Vozilo ne obstaja.' using errcode = 'P0001'; end if;
end $$;

-- GDPR: a copy of everything we hold about one customer.
create or replace function public.mormo_export_data(p_customer uuid)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'exported_at', now(),
    'profile', to_jsonb(c) - 'erp_customer_id' - 'stripe_customer_id',
    'vehicles', coalesce((select jsonb_agg(to_jsonb(v) - 'customer_id') from public.mormo_vehicles v where v.customer_id = c.id), '[]'),
    'subscriptions', coalesce((select jsonb_agg(to_jsonb(s) - 'customer_id' - 'stripe_subscription_id' - 'stripe_price_id')
                                 from public.mormo_subscriptions s where s.customer_id = c.id), '[]'),
    'bookings', coalesce((select jsonb_agg(to_jsonb(b) - 'customer_id' - 'job_id') from public.mormo_bookings b where b.customer_id = c.id), '[]'))
  from public.mormo_customers c where c.id = p_customer;
$$;

-- GDPR: erase. Future appointments are cancelled and personal details are removed from
-- the calendar and the ERP customer list. Calendar entries themselves stay (as anonymous
-- history); invoices stay with the payment provider as the law requires.
create or replace function public.mormo_delete_customer(p_customer uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_erp uuid;
begin
  select erp_customer_id into v_erp from public.mormo_customers where id = p_customer;
  if not found then return; end if;
  update public.jobs j set status = 'cancelled'
   where j.id in (select job_id from public.mormo_bookings where customer_id = p_customer)
     and j.status in ('reserved', 'confirmed') and j.starts_at > now();
  update public.jobs j set from_address = null, notes = 'Mormo.si · podatki izbrisani'
   where j.id in (select job_id from public.mormo_bookings where customer_id = p_customer);
  update public.customers set name = 'Izbrisana stranka', phone = null, email = null, notes = null
   where id = v_erp and notes = 'Mormo.si stranka'; -- only a row this portal created
  delete from public.mormo_customers where id = p_customer; -- cascades to everything of theirs
end $$;

-- Stripe webhook: mirror the subscription state.
create or replace function public.mormo_apply_subscription_state(
  p_subscription uuid, p_status text, p_stripe_subscription text, p_stripe_price text,
  p_period_start timestamptz, p_period_end timestamptz, p_cancel_at_period_end boolean)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.mormo_subscriptions set
    status = p_status,
    stripe_subscription_id = coalesce(p_stripe_subscription, stripe_subscription_id),
    stripe_price_id = coalesce(p_stripe_price, stripe_price_id),
    current_period_start = coalesce(p_period_start, current_period_start),
    current_period_end = coalesce(p_period_end, current_period_end),
    cancel_at_period_end = coalesce(p_cancel_at_period_end, cancel_at_period_end),
    updated_at = now()
  where id = p_subscription;

  if p_status = 'active' then -- paid: held appointments become confirmed
    update public.jobs j set status = 'confirmed'
     where j.status = 'reserved' and j.id in (
       select job_id from public.mormo_bookings where subscription_id = p_subscription and status = 'booked');
  elsif p_status = 'canceled' then -- appointments after the paid period are released
    update public.jobs j set status = 'cancelled'
     where j.status in ('reserved', 'confirmed') and j.starts_at > coalesce(p_period_end, now()) and j.id in (
       select job_id from public.mormo_bookings where subscription_id = p_subscription and status = 'booked');
  end if;
end $$;

-- Cron: who should get "choose your appointment for this month".
create or replace function public.mormo_due_reminders()
returns table (subscription_id uuid, customer_id uuid, vehicle_id uuid, email text, full_name text,
               nickname text, month date, remaining integer)
language sql stable security definer set search_path = public, pg_temp as $$
  with m as (select date_trunc('month', now() at time zone 'Europe/Ljubljana')::date as month),
  used as (
    select b.subscription_id as sid, count(*)::int as n
    from public.mormo_bookings b, m
    where b.status in ('booked', 'completed')
      and date_trunc('month', b.starts_at at time zone 'Europe/Ljubljana')::date = m.month
    group by b.subscription_id)
  select s.id, c.id, v.id, c.email, c.full_name, v.nickname, m.month, s.visits_per_period - coalesce(u.n, 0)
  from public.mormo_subscriptions s
  join public.mormo_customers c on c.id = s.customer_id
  join public.mormo_vehicles v on v.id = s.vehicle_id
  left join used u on u.sid = s.id, m
  where s.status = 'active' and s.visits_per_period > coalesce(u.n, 0);
$$;

-- 7. Keep bookings in step with the calendar -------------------------------------------
-- When staff move, complete or cancel a wash in the ERP, the customer sees it.
-- Any failure here is swallowed: this trigger must never stop an ERP update.
create or replace function public.mormo__sync_booking_from_job()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.type = 'pranje' and (new.status is distinct from old.status or new.starts_at is distinct from old.starts_at) then
    begin
      update public.mormo_bookings set
        starts_at = new.starts_at,
        status = case new.status when 'completed' then 'completed' when 'cancelled' then 'cancelled' else 'booked' end,
        updated_at = now()
      where job_id = new.id;
    exception when others then
      null;
    end;
  end if;
  return new;
end $$;
create trigger mormo_sync_booking after update on public.jobs
  for each row execute function public.mormo__sync_booking_from_job();

-- 8. Who may call what -----------------------------------------------------------------
-- New functions are callable by everyone by default. Take that away: server only.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.proname like 'mormo%' loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
