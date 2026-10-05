create table if not exists public.hotel_bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  destination text not null,
  check_in_date date,
  check_out_date date,
  guests_count integer default 2,
  rooms_count integer default 1,
  special_requests text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.hotel_bookings enable row level security;
create policy "Users can view their own hotel bookings" on hotel_bookings for select using (auth.uid() = user_id);
create policy "Anyone can insert a hotel booking" on hotel_bookings for insert with check (true);
