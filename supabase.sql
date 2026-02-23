create table if not exists public.leads (
  id bigint generated always as identity primary key,
  email text not null unique,
  shop_name text,
  source text not null default 'lp',
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy if not exists "Service role can manage leads"
on public.leads
as permissive
for all
to service_role
using (true)
with check (true);

create table if not exists public.members (
  id bigint generated always as identity primary key,
  email text not null unique,
  status text not null,
  stripe_customer_id text,
  stripe_subscription_id text not null,
  stripe_price_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists members_subscription_id_idx on public.members (stripe_subscription_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_members_updated_at on public.members;
create trigger trg_members_updated_at
before update on public.members
for each row
execute function public.set_updated_at();

alter table public.members enable row level security;

create policy if not exists "Service role can manage members"
on public.members
as permissive
for all
to service_role
using (true)
with check (true);
