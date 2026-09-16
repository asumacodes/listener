-- KAN-66 Door B: in-app support ticket form.
-- Mirrors the `feedback` table's shape/access pattern (insert-only for the
-- owning user). A SELECT policy is required too: the app does
-- `.insert(...).select("id").single()`, and under Postgres RLS the
-- RETURNING clause is itself a read — with no SELECT policy it's
-- default-deny, which raises the same "violates row-level security policy"
-- error as a failed WITH CHECK. (Learned the hard way testing this against
-- dev — the INSERT-only version above passed migration cleanly but every
-- authenticated insert 403'd until this was added.)

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subject text not null,
  message text not null,
  category text not null check (category in ('bug', 'question', 'feature', 'other')),
  email text not null,
  route text,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

create policy "support_tickets_insert_own"
  on public.support_tickets
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "support_tickets_select_own"
  on public.support_tickets
  for select
  to authenticated
  using (auth.uid() = user_id);
