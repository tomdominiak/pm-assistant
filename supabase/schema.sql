create extension if not exists "pgcrypto";

create type public.profile_role as enum ('PARENT', 'CHILD');
create type public.routine_status as enum ('PENDING', 'AWAITING_APPROVAL', 'COMPLETED', 'MISSED');

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  role public.profile_role not null,
  name text not null check (char_length(name) between 1 and 50),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  assigned_child_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  description text,
  icon_name text not null default 'plant',
  recurrence_rule text default 'FREQ=DAILY',
  time_of_day text,
  deadline text,
  requires_photo boolean not null default false,
  points_reward integer not null default 10 check (points_reward > 0),
  created_at timestamptz not null default now()
);

create table public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  target_date date not null,
  status public.routine_status not null default 'PENDING',
  proof_image_url text,
  completed_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (routine_id, target_date)
);

create index routine_logs_child_date_idx on public.routine_logs(child_id, target_date);
create index routines_child_idx on public.routines(assigned_child_id);

alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.routines enable row level security;
alter table public.routine_logs enable row level security;

create or replace function public.current_family_id()
returns uuid language sql stable security definer set search_path = public
as $$ select family_id from public.profiles where id = auth.uid() $$;

create policy "family members can read family" on public.families
  for select using (id = public.current_family_id());
create policy "family members can read profiles" on public.profiles
  for select using (family_id = public.current_family_id());
create policy "family members can read routines" on public.routines
  for select using (family_id = public.current_family_id());
create policy "parents can manage routines" on public.routines
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'PARENT' and p.family_id = routines.family_id))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'PARENT' and p.family_id = routines.family_id));
create policy "family members can read logs" on public.routine_logs
  for select using (exists (select 1 from public.profiles child where child.id = routine_logs.child_id and child.family_id = public.current_family_id()));
create policy "family members can update logs" on public.routine_logs
  for update using (
    child_id = auth.uid()
    or exists (
      select 1 from public.profiles parent
      join public.profiles child on child.id = routine_logs.child_id and child.family_id = parent.family_id
      where parent.id = auth.uid() and parent.role = 'PARENT'
    )
  );

insert into storage.buckets (id, name, public) values ('proof-images', 'proof-images', false)
on conflict (id) do nothing;

create policy "family proof uploads" on storage.objects for insert to authenticated
  with check (bucket_id = 'proof-images' and (storage.foldername(name))[1] = public.current_family_id()::text);
create policy "family proof reads" on storage.objects for select to authenticated
  using (bucket_id = 'proof-images' and (storage.foldername(name))[1] = public.current_family_id()::text);
