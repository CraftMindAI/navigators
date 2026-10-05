create table if not exists public.flight_bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  departure_city text not null,
  arrival_city text not null,
  departure_date date not null,
  return_date date,
  passengers_count integer default 1,
  flight_class text default 'Economy',
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.flight_bookings enable row level security;
create policy "Users can view their own flight bookings" on flight_bookings for select using (auth.uid() = user_id);
create policy "Anyone can insert a flight booking" on flight_bookings for insert with check (true);
