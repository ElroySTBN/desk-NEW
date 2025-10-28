-- Create onboarding table for client onboarding process
create table if not exists public.onboarding (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'completed', 'exported')),
  
  -- Client and admin info
  client_id uuid references public.clients(id) on delete cascade,
  client_name text not null,
  created_by text not null,
  
  -- All onboarding data stored as JSONB for flexibility
  legal_info jsonb default '{}'::jsonb,
  brand_identity jsonb default '{}'::jsonb,
  target_audience jsonb default '{}'::jsonb,
  communication jsonb default '{}'::jsonb,
  history jsonb default '{}'::jsonb,
  google_business jsonb default '{}'::jsonb,
  visuals jsonb default '{}'::jsonb,
  nfc_team jsonb default '{}'::jsonb,
  follow_up jsonb default '{}'::jsonb,
  validation jsonb default '{}'::jsonb,
  
  -- Metadata
  last_saved_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  exported_at timestamp with time zone
);

-- Enable Row Level Security
alter table public.onboarding enable row level security;

-- Create policies
create policy "Enable read access for authenticated users"
  on public.onboarding for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on public.onboarding for insert
  to authenticated
  with check (true);

create policy "Enable update access for authenticated users"
  on public.onboarding for update
  to authenticated
  using (true);

create policy "Enable delete access for authenticated users"
  on public.onboarding for delete
  to authenticated
  using (true);

-- Create index for faster queries
create index onboarding_status_idx on public.onboarding(status);
create index onboarding_client_id_idx on public.onboarding(client_id);
create index onboarding_created_at_idx on public.onboarding(created_at desc);

-- Function to update updated_at timestamp
create or replace function update_onboarding_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_onboarding_timestamp
  before update on public.onboarding
  for each row
  execute function update_onboarding_updated_at();

