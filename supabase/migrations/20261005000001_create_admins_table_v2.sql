-- Enable pgcrypto for secure admin password hashing
create extension if not exists pgcrypto;

create table if not exists public.admins (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  password text not null, -- Stores bcrypt hash
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.admins enable row level security;

create policy "Admins table is strictly private"
  on admins for all
  using ( false );

drop function if exists public.verify_admin_login(text, text);

create or replace function public.verify_admin_login(admin_email text, admin_password text)
returns boolean
language plpgsql
security definer
as $$
declare
  is_valid boolean;
begin
  select exists (
    select 1 
    from public.admins 
    where email = admin_email 
      and password = crypt(admin_password, password) 
  ) into is_valid;
  return is_valid;
end;
$$;

insert into public.admins (email, password, full_name)
values ('admin@thenavigators.com', crypt('admin@123', gen_salt('bf')), 'Super Admin')
on conflict (email) do nothing;
