-- Complemento para compra de convites, upload de comprovante, cartelas de bingo,
-- código do comprador, indicação e área exclusiva do comprador.

alter table public.ticket_orders
  alter column buyer_email set not null;

alter table public.ticket_orders
  add column if not exists buyer_code text,
  add column if not exists combo_quantity integer not null default 0,
  add column if not exists referral_code text,
  add column if not exists referred_by_code text,
  add column if not exists proof_file_path text,
  add column if not exists proof_uploaded_at timestamptz,
  add column if not exists includes_bingo boolean not null default false,
  add column if not exists bingo_cards_quantity integer not null default 0,
  add column if not exists email_sent_at timestamptz,
  add column if not exists admin_copy_sent_at timestamptz,
  add column if not exists bingo_copy_sent_at timestamptz;

update public.ticket_orders
set buyer_code = 'TUCXA-2026-' || upper(substr(replace(id::text, '-', ''), 1, 10))
where buyer_code is null;

update public.ticket_orders
set referral_code = buyer_code
where referral_code is null;

alter table public.ticket_orders
  alter column buyer_code set not null;

create unique index if not exists ticket_orders_buyer_code_key
  on public.ticket_orders (buyer_code);

create index if not exists ticket_orders_referred_by_code_idx
  on public.ticket_orders (referred_by_code);

alter table public.offer_combos
  add column if not exists includes_bingo boolean not null default false,
  add column if not exists bingo_cards_quantity integer not null default 0;

create table if not exists public.bingo_referral_rewards (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  referrer_order_id uuid references public.ticket_orders(id) on delete set null,
  referred_order_id uuid references public.ticket_orders(id) on delete set null,
  referrer_code text not null,
  reward_type text not null default 'bingo_card',
  reward_quantity integer not null default 1,
  status text not null default 'pending' check (status in ('pending', 'approved', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.bingo_referral_rewards enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  8388608,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- A leitura administrativa dos comprovantes deve ser feita com SUPABASE_SERVICE_ROLE_KEY.
-- A política abaixo permite upload público pelo formulário. O nome do arquivo é gerado pelo servidor.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can upload payment proofs'
  ) then
    create policy "Public can upload payment proofs"
    on storage.objects
    for insert
    with check (bucket_id = 'payment-proofs');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ticket_orders'
      and policyname = 'Public can read ticket order by buyer code'
  ) then
    create policy "Public can read ticket order by buyer code"
    on public.ticket_orders
    for select
    using (buyer_code is not null);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'bingo_referral_rewards'
      and policyname = 'Public can create referral rewards'
  ) then
    create policy "Public can create referral rewards"
    on public.bingo_referral_rewards
    for insert
    with check (true);
  end if;
end $$;
