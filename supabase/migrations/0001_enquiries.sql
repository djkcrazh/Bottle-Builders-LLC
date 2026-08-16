-- Enquiries submitted from the Contact sheet (A-04).
-- Anonymous visitors may insert. Nobody may read back over the public API.

create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(trim(name)) between 1 and 120),
  email       text not null check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone       text check (char_length(phone) <= 40),
  organisation text check (char_length(organisation) <= 160),
  interest    text not null check (interest in ('collect', 'build', 'join', 'other')),
  message     text not null check (char_length(trim(message)) between 1 and 4000)
);

comment on table public.enquiries is 'Contact form submissions from bottlebuilders.com';

create index if not exists enquiries_created_at_idx
  on public.enquiries (created_at desc);

alter table public.enquiries enable row level security;

-- Write only. The anon key can add an enquiry and learn nothing else.
drop policy if exists "anon can submit an enquiry" on public.enquiries;
create policy "anon can submit an enquiry"
  on public.enquiries
  for insert
  to anon
  with check (true);

-- No select, update or delete policy exists for anon or authenticated, so the
-- table is unreadable through the API. Read it in the Supabase dashboard or
-- with the service role key from a trusted server.

revoke all on public.enquiries from anon, authenticated;
grant insert on public.enquiries to anon;
