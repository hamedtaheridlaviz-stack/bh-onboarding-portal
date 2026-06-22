create extension if not exists pgcrypto;

create table if not exists onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null,
  owner_name text,
  owner_email text,
  owner_mobile text,
  property_address text,
  documents jsonb default '[]'::jsonb,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references onboarding_requests(id) on delete cascade,
  document_name text,
  file_path text,
  uploaded_at timestamptz default now()
);

alter table onboarding_requests enable row level security;
alter table uploaded_documents enable row level security;

drop policy if exists "Public create onboarding requests" on onboarding_requests;
drop policy if exists "Public read onboarding requests by id" on onboarding_requests;
drop policy if exists "Public update onboarding status" on onboarding_requests;
drop policy if exists "Public create uploaded docs" on uploaded_documents;

create policy "Public create onboarding requests" on onboarding_requests for insert to anon with check (true);
create policy "Public read onboarding requests by id" on onboarding_requests for select to anon using (true);
create policy "Public update onboarding status" on onboarding_requests for update to anon using (true) with check (true);
create policy "Public create uploaded docs" on uploaded_documents for insert to anon with check (true);

-- Storage bucket must be created manually in Supabase Storage:
-- Bucket name: onboarding-documents
-- Bucket type: private

insert into storage.buckets (id, name, public)
values ('onboarding-documents', 'onboarding-documents', false)
on conflict (id) do nothing;

drop policy if exists "Public upload onboarding files" on storage.objects;
create policy "Public upload onboarding files" on storage.objects
for insert to anon
with check (bucket_id = 'onboarding-documents');
