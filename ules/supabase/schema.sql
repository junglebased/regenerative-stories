-- ============================================================
-- ULES — Emek Takas Sistemi — Supabase Schema
-- ============================================================
-- Bunu Supabase Dashboard → SQL Editor'a yapıştırıp çalıştır.
-- ============================================================

-- ── Profiles (auth.users'ı genişletir) ──────────────────────
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  tier       text not null default 'Established'
               check (tier in ('Anchor', 'Established', 'Contributor')),
  created_at timestamptz default now()
);

-- ── Entries (iş kayıtları) ───────────────────────────────────
create table if not exists entries (
  id             bigserial primary key,
  name           text not null,
  contributor_id uuid not null references profiles(id),
  recipient_id   uuid not null references profiles(id),
  skill          text not null,
  rate           numeric(4,1) not null check (rate > 0),
  project        text not null,
  units          integer not null default 1 check (units > 0),
  m1             numeric(3,1) not null default 1.0 check (m1 between 1.0 and 1.5),
  m2             numeric(3,1) not null default 1.0 check (m2 between 1.0 and 1.5),
  m3             numeric(3,1) not null default 1.0 check (m3 between 1.0 and 1.5),
  evidence       text not null,
  gen            boolean not null default false,
  notes          text not null default '',
  date           date not null default current_date,
  status         text not null default 'Pending'
                   check (status in ('Pending', 'Confirmed', 'Disputed', 'Resolved')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── Row Level Security ───────────────────────────────────────
alter table profiles enable row level security;
alter table entries  enable row level security;

-- Kimlik doğrulanmış her kullanıcı tüm profilleri okuyabilir
create policy "profiles: authenticated read"
  on profiles for select
  using (auth.uid() is not null);

create policy "profiles: own insert"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles: own update"
  on profiles for update
  using (auth.uid() = id);

-- İki kişilik kapalı sistemde tüm authenticated kullanıcılar entries'e erişir
create policy "entries: authenticated all"
  on entries for all
  using (auth.uid() is not null);

-- ── Trigger: yeni kayıt → otomatik profil oluştur ───────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, tier)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'Established'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Trigger: updated_at otomatik güncelle ───────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists entries_set_updated_at on entries;
create trigger entries_set_updated_at
  before update on entries
  for each row execute procedure public.set_updated_at();

-- ── Realtime ────────────────────────────────────────────────
-- Supabase Dashboard → Database → Replication → entries tablosunu etkinleştir
-- Ya da:
alter publication supabase_realtime add table entries;

-- ============================================================
-- KURULUM NOTU:
-- 1. Bu SQL'i çalıştır
-- 2. Authentication → Email Templates → Confirm signup template'ini kontrol et
-- 3. .env dosyasını oluştur (.env.example'dan kopyala)
-- 4. npm install && npm run dev
-- ============================================================
