create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'Standard' check (plan in ('Standard','Pro','Elite')),
  is_admin boolean not null default false,
  is_vip boolean not null default false,
  subscription_status text,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  subscription_current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.watchlists (
  user_id uuid primary key references auth.users(id) on delete cascade,
  symbols text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_setups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_investigations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_theses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  plan text check (plan is null or plan in ('Standard','Pro','Elite')),
  percent_off integer check (percent_off is null or percent_off between 0 and 100),
  active boolean not null default true,
  max_redemptions integer,
  redemptions integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.watchlists enable row level security;
alter table public.saved_setups enable row level security;
alter table public.saved_investigations enable row level security;
alter table public.saved_theses enable row level security;
alter table public.promo_codes enable row level security;

create policy if not exists profiles_self_select on public.profiles for select using (auth.uid() = id);
create policy if not exists settings_self_all on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists watchlist_self_all on public.watchlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists setups_self_all on public.saved_setups for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists investigations_self_all on public.saved_investigations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists theses_self_all on public.saved_theses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists promo_codes_authenticated_read on public.promo_codes for select to authenticated using (active = true and (expires_at is null or expires_at > now()));
