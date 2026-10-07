-- Counts of inquiries per page (leads vs "Call Me Now" call-backs) and status,
-- computed in the database for the admin dashboard's filter tabs and sidebar badges.
create or replace function public.inquiry_status_counts()
returns table (kind text, status text, total bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    case when tour_title = 'Call-back request' then 'callbacks' else 'leads' end as kind,
    coalesce(status, 'pending') as status,
    count(*) as total
  from public.inquiries
  group by 1, 2;
$$;

revoke all on function public.inquiry_status_counts() from public;
grant execute on function public.inquiry_status_counts() to anon, authenticated;

notify pgrst, 'reload schema';
