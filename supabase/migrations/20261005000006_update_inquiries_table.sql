alter table public.inquiries 
add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.inquiries enable row level security;
create policy "Users can view their own package inquiries" on inquiries for select using (auth.uid() = user_id);
