-- Lets the admin dashboard change a lead's status.
-- The dashboard talks to Supabase with the anon key (its login is client-side), so instead of an
-- open UPDATE policy we expose a narrow function that can only change `status`, to a known value.

do $$ begin if not exists (select 1 from pg_constraint where conname = 'inquiries_status_check') then
alter table public.inquiries add constraint inquiries_status_check
  check (status in ('pending', 'contacted', 'confirmed', 'cancelled')); end if; end $$;

create or replace function public.set_inquiry_status(inquiry_id uuid, new_status text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if new_status not in ('pending', 'contacted', 'confirmed', 'cancelled') then
    raise exception 'Invalid status: %', new_status;
  end if;

  update public.inquiries set status = new_status where id = inquiry_id;
  return found;
end;
$$;

revoke all on function public.set_inquiry_status(uuid, text) from public;
grant execute on function public.set_inquiry_status(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
