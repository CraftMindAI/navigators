-- Hotels are listed North India -> South India -> International, so each hotel needs a region.
alter table public.hotels add column if not exists region text not null default 'north';

do $$ begin if not exists (select 1 from pg_constraint where conname = 'hotels_region_check') then
alter table public.hotels add constraint hotels_region_check check (region in ('north', 'south', 'international')); end if; end $$;

-- Backfill existing rows: international by category, south by well-known South Indian states / cities.
update public.hotels set region = 'international' where category = 'international';
update public.hotels set region = 'south'
where category <> 'international'
  and city ~* '(tamil|chennai|madurai|coimbatore|ooty|kodaikanal|rameswaram|kanyakumari|pondicherry|puducherry|kerala|kochi|cochin|munnar|alleppey|alappuzha|thekkady|wayanad|trivandrum|thiruvananthapuram|karnataka|bangalore|bengaluru|mysore|mysuru|coorg|hampi|chikmagalur|andhra|tirupati|visakhapatnam|vizag|telangana|hyderabad|andaman|lakshadweep)';

notify pgrst, 'reload schema';
