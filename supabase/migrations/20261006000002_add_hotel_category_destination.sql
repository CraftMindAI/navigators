-- The hotels table pre-dated 20261006000001, so its CREATE was skipped.
-- Add the columns the admin dashboard needs that the existing table lacks.
alter table public.hotels add column if not exists category text not null default 'domestic';
alter table public.hotels add column if not exists destination_id uuid references public.destinations(id) on delete set null;

notify pgrst, 'reload schema';
