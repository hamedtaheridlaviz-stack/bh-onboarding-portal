create extension if not exists "pgcrypto";

create table if not exists onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  submitted_at timestamptz,
  request_type text check (request_type in ('form_a','lsa')) not null,
  owner_name text not null,
  owner_email text,
  owner_mobile text,
  property_address text not null,
  requested_docs text[] not null,
  status text default 'pending'
);

create table if not exists uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  request_id uuid references onboarding_requests(id) on delete cascade,
  document_type text not null,
  file_path text not null,
  file_name text
);

-- Create a private bucket in Supabase Storage called: onboarding-documents
-- Storage > New bucket > onboarding-documents > keep Public OFF

alter table onboarding_requests enable row level security;
alter table uploaded_documents enable row level security;

-- Prototype policies: allow link creation and upload from the browser.
-- For full production, replace these with authenticated broker-only creation and signed upload URLs.
create policy "create requests" on onboarding_requests for insert with check (true);
create policy "read request by link" on onboarding_requests for select using (true);
create policy "update submitted status" on onboarding_requests for update using (true);
create policy "insert documents" on uploaded_documents for insert with check (true);
create policy "read documents" on uploaded_documents for select using (true);

-- Storage policies for private bucket uploads.
create policy "upload onboarding files" on storage.objects for insert with check (bucket_id = 'onboarding-documents');
create policy "read onboarding files" on storage.objects for select using (bucket_id = 'onboarding-documents');
