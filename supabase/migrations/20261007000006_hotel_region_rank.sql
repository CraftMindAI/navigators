-- Sort key for hotels so paginated admin lists can order North India -> South India -> International
-- in the database (PostgREST can only order by real columns, not expressions).
alter table public.hotels add column if not exists region_rank smallint
  generated always as (case region when 'north' then 1 when 'south' then 2 else 3 end) stored;

notify pgrst, 'reload schema';
