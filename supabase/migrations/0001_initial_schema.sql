create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nickname text not null,
  bird_code text not null unique,
  home_city text not null,
  home_country text not null,
  home_latitude double precision not null,
  home_longitude double precision not null,
  is_demo boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete set null,
  delivery_mode text not null check (delivery_mode in ('direct', 'random')),
  content text not null,
  origin_city text not null,
  origin_latitude double precision not null,
  origin_longitude double precision not null,
  destination_city text not null,
  destination_latitude double precision not null,
  destination_longitude double precision not null,
  pickup_at timestamptz not null,
  deliver_at timestamptz not null,
  read_at timestamptz,
  parent_letter_id uuid references public.letters(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.camera_reviews (
  webcam_id bigint primary key,
  title text not null,
  location text not null,
  label text not null,
  score integer not null,
  freshness text not null,
  decision text not null check (decision in ('保留', '备用', '拒绝')),
  note text not null,
  preview text not null,
  latitude double precision not null,
  longitude double precision not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.letters enable row level security;
alter table public.camera_reviews enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_authenticated'
  ) then
    create policy profiles_select_authenticated on public.profiles
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_insert_own'
  ) then
    create policy profiles_insert_own on public.profiles
      for insert
      to authenticated
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    create policy profiles_update_own on public.profiles
      for update
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'letters' and policyname = 'letters_select_sender_recipient'
  ) then
    create policy letters_select_sender_recipient on public.letters
      for select
      to authenticated
      using (auth.uid() = sender_id or auth.uid() = recipient_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'letters' and policyname = 'letters_insert_sender'
  ) then
    create policy letters_insert_sender on public.letters
      for insert
      to authenticated
      with check (auth.uid() = sender_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'letters' and policyname = 'letters_update_recipient_read'
  ) then
    create policy letters_update_recipient_read on public.letters
      for update
      to authenticated
      using (auth.uid() = sender_id or auth.uid() = recipient_id)
      with check (auth.uid() = sender_id or auth.uid() = recipient_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'camera_reviews' and policyname = 'camera_reviews_select_authenticated'
  ) then
    create policy camera_reviews_select_authenticated on public.camera_reviews
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'camera_reviews' and policyname = 'camera_reviews_update_admin'
  ) then
    create policy camera_reviews_update_admin on public.camera_reviews
      for update
      to authenticated
      using (
        exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
      )
      with check (
        exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
      );
  end if;
end $$;
