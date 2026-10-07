-- HOTEL ITINERARIES: day-wise plan attached to a hotel (imported from Excel in the admin dashboard)
create table if not exists public.hotel_itineraries (
  id uuid default gen_random_uuid() primary key,
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  location text,
  title text not null,
  nights integer default 1,
  description text,
  meals text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (hotel_id, day_number)
);

create index if not exists hotel_itineraries_hotel_id_idx on public.hotel_itineraries (hotel_id);

alter table public.hotel_itineraries enable row level security;

grant all on table public.hotel_itineraries to anon, authenticated, service_role;

-- Same access model as public.hotels: public read, admin dashboard (anon key) manages.
do $$ begin if not exists (select 1 from pg_policies where policyname = 'Allow public read access to hotel itineraries') then
create policy "Allow public read access to hotel itineraries" on public.hotel_itineraries for select using (true); end if; end $$;

do $$ begin if not exists (select 1 from pg_policies where policyname = 'Allow admin insert hotel itineraries') then
create policy "Allow admin insert hotel itineraries" on public.hotel_itineraries for insert with check (true); end if; end $$;

do $$ begin if not exists (select 1 from pg_policies where policyname = 'Allow admin update hotel itineraries') then
create policy "Allow admin update hotel itineraries" on public.hotel_itineraries for update using (true); end if; end $$;

do $$ begin if not exists (select 1 from pg_policies where policyname = 'Allow admin delete hotel itineraries') then
create policy "Allow admin delete hotel itineraries" on public.hotel_itineraries for delete using (true); end if; end $$;

notify pgrst, 'reload schema';
