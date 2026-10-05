create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  full_name text,
  phone text,
  avatar_url text,
  password_hash text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

create or replace function public.save_profile_password(p_user_id uuid, p_plain_password text)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set password_hash = crypt(p_plain_password, gen_salt('bf'))
  where id = p_user_id;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
