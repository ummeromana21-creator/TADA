-- Tada database setup. Paste this whole file into the Supabase SQL editor and click Run.

-- Projects: one row per scrapbook.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  idea text not null,
  country text not null,
  country_name text not null,
  currency text not null,
  region text default '',
  interview jsonb not null default '[]'::jsonb,
  facts jsonb not null default '[]'::jsonb,
  chat jsonb not null default '[]'::jsonb,
  book jsonb,
  done jsonb not null default '{}'::jsonb,
  done_at jsonb not null default '{}'::jsonb,
  work jsonb,
  images jsonb not null default '{}'::jsonb,
  redos int not null default 0,
  share_token text unique,
  share_public boolean not null default false,
  built_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_owner_idx on public.projects(owner, updated_at desc);

-- Keep updated_at fresh.
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

-- Usage counters: so one person can't run up the AI bill by accident.
create table if not exists public.usage_counts (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  kind text not null,
  count int not null default 0,
  primary key (user_id, day, kind)
);

-- Row-level security: people only ever see their own rows.
alter table public.projects enable row level security;
alter table public.usage_counts enable row level security;

drop policy if exists "own projects" on public.projects;
create policy "own projects" on public.projects
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

drop policy if exists "own usage" on public.usage_counts;
create policy "own usage" on public.usage_counts
  for select using (auth.uid() = user_id);

-- Public storage bucket for generated pictures.
insert into storage.buckets (id, name, public)
  values ('tada-images', 'tada-images', true)
  on conflict (id) do nothing;

drop policy if exists "public read tada-images" on storage.objects;
create policy "public read tada-images" on storage.objects
  for select using (bucket_id = 'tada-images');
