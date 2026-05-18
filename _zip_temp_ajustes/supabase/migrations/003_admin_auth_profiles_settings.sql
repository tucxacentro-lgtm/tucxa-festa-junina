-- Supabase Auth para administradores reais, com perfis e permissões por função.
-- Depois de criar o usuário em Authentication > Users, cadastre o perfil em public.admin_profiles.

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'coordenador'
    check (role in ('admin', 'coordenador', 'caixa', 'cozinha', 'entrega', 'garcom')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_profiles_role_idx on public.admin_profiles(role);
create index if not exists admin_profiles_active_idx on public.admin_profiles(active);

alter table public.admin_profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_profiles'
      and policyname = 'Admin users can read own profile'
  ) then
    create policy "Admin users can read own profile"
    on public.admin_profiles
    for select
    to authenticated
    using (id = auth.uid());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_profiles'
      and policyname = 'Admin users can update own name'
  ) then
    create policy "Admin users can update own name"
    on public.admin_profiles
    for update
    to authenticated
    using (id = auth.uid())
    with check (id = auth.uid());
  end if;
end $$;

-- Exemplo para cadastrar o primeiro administrador após criar o usuário no Supabase Auth:
-- insert into public.admin_profiles (id, full_name, role, active)
-- values ('COLE_AQUI_O_ID_DO_USUARIO_AUTH', 'Administrador Tucxa', 'admin', true)
-- on conflict (id) do update set role = excluded.role, active = excluded.active, updated_at = now();
