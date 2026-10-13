-- Largent cloud finance schema.
-- Apply to a Supabase project whose third-party JWT trust is configured for Clerk.
-- Clerk JWTs must expose "sub" as the Clerk user ID; policies use auth.jwt()->>'sub'.
create extension if not exists pgcrypto;

create or replace function public.largent_current_user_id()
returns text language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')
$$;

create table if not exists public.transactions (
  id uuid primary key,
  user_id text not null default public.largent_current_user_id(),
  type text not null check (type in ('income', 'expense')),
  amount bigint not null check (amount > 0),
  category_id text not null,
  date timestamptz not null,
  note text not null default '',
  source text not null check (source in ('manual', 'csv_import')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_owner_id_unique unique (user_id, id)
);
create index if not exists transactions_user_date_idx on public.transactions (user_id, date desc);

create table if not exists public.budgets (
  id uuid primary key,
  user_id text not null default public.largent_current_user_id(),
  category_id text not null,
  "limit" bigint not null check ("limit" > 0),
  period text not null check (period in ('weekly', 'monthly')),
  constraint budgets_owner_id_unique unique (user_id, id)
);
create index if not exists budgets_user_idx on public.budgets (user_id);

create table if not exists public.prioritized_needs (
  id uuid primary key,
  user_id text not null default public.largent_current_user_id(),
  name text not null check (length(trim(name)) between 1 and 80),
  estimated_cost bigint not null check (estimated_cost > 0),
  position integer not null default 0,
  constraint prioritized_needs_owner_id_unique unique (user_id, id)
);
create index if not exists prioritized_needs_user_position_idx on public.prioritized_needs (user_id, position);

alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.prioritized_needs enable row level security;

-- Deny anonymous access; authenticated JWT sub must match row owner for every CRUD operation.
drop policy if exists transactions_user_isolation on public.transactions;
create policy transactions_user_isolation on public.transactions
  for all to authenticated
  using (user_id = public.largent_current_user_id())
  with check (user_id = public.largent_current_user_id());

drop policy if exists budgets_user_isolation on public.budgets;
create policy budgets_user_isolation on public.budgets
  for all to authenticated
  using (user_id = public.largent_current_user_id())
  with check (user_id = public.largent_current_user_id());

drop policy if exists prioritized_needs_user_isolation on public.prioritized_needs;
create policy prioritized_needs_user_isolation on public.prioritized_needs
  for all to authenticated
  using (user_id = public.largent_current_user_id())
  with check (user_id = public.largent_current_user_id());

revoke all on public.transactions, public.budgets, public.prioritized_needs from anon;
grant select, insert, update, delete on public.transactions, public.budgets, public.prioritized_needs to authenticated;

-- Data API must not permit callers to choose an arbitrary owner ID. RLS also blocks
-- writes for which the supplied user_id does not match the JWT subject.
