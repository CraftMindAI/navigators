create table if not exists public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tour_id uuid references public.tours(id) on delete cascade not null,
  tour_title text not null,
  guests_count integer default 2,
  travel_date text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.cart_items enable row level security;
create policy "Users can view their own cart items." on cart_items for select using (auth.uid() = user_id);
create policy "Users can insert into their own cart." on cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update their own cart items." on cart_items for update using (auth.uid() = user_id);
create policy "Users can delete their own cart items." on cart_items for delete using (auth.uid() = user_id);
