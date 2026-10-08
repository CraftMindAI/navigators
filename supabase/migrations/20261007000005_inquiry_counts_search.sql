-- inquiry_status_counts now takes an optional search term, so the admin filter tab counts
-- match the search box (name / email / phone / package / message, case-insensitive).
drop function if exists public.inquiry_status_counts();

create or replace function public.inquiry_status_counts(search text default null)
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
  where coalesce(trim(search), '') = ''
     or name ilike '%' || trim(search) || '%'
     or email ilike '%' || trim(search) || '%'
     or phone ilike '%' || trim(search) || '%'
     or tour_title ilike '%' || trim(search) || '%'
     or message ilike '%' || trim(search) || '%'
  group by 1, 2;
$$;

revoke all on function public.inquiry_status_counts(text) from public;
grant execute on function public.inquiry_status_counts(text) to anon, authenticated;

notify pgrst, 'reload schema';
