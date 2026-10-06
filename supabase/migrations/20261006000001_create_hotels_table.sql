-- HOTELS TABLE (managed from the admin dashboard)
create table if not exists public.hotels (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  slug varchar(255) unique not null,
  city varchar(255) not null,
  address text,
  star_rating smallint not null default 3 check (star_rating between 1 and 5),
  price_per_night numeric(10,2),
  original_price numeric(10,2),
  image_url text not null,
  amenities text[] not null default '{}',
  description text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- category / destination_id are added in 20261006000002.

alter table public.hotels enable row level security;

grant all on table public.hotels to anon, authenticated, service_role;

-- Public site reads hotels; the admin dashboard (anon key) manages them,
-- matching how tours / destinations are handled.
do $$ begin if not exists (select 1 from pg_policies where policyname = 'Allow public read access to hotels') then
create policy "Allow public read access to hotels" on public.hotels for select using (true); end if; end $$;

do $$ begin if not exists (select 1 from pg_policies where policyname = 'Allow admin insert hotels') then
create policy "Allow admin insert hotels" on public.hotels for insert with check (true); end if; end $$;

do $$ begin if not exists (select 1 from pg_policies where policyname = 'Allow admin update hotels') then
create policy "Allow admin update hotels" on public.hotels for update using (true); end if; end $$;

do $$ begin if not exists (select 1 from pg_policies where policyname = 'Allow admin delete hotels') then
create policy "Allow admin delete hotels" on public.hotels for delete using (true); end if; end $$;

notify pgrst, 'reload schema';
