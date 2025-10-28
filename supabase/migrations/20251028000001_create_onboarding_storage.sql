-- Create storage bucket for onboarding files
insert into storage.buckets (id, name, public)
values ('onboarding-files', 'onboarding-files', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Policy: Authenticated users can upload files to onboarding-files bucket
create policy "Authenticated users can upload onboarding files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'onboarding-files');

-- Policy: Public can view files in onboarding-files bucket
create policy "Public can view onboarding files"
on storage.objects for select
to public
using (bucket_id = 'onboarding-files');

-- Policy: Authenticated users can update their files
create policy "Authenticated users can update onboarding files"
on storage.objects for update
to authenticated
using (bucket_id = 'onboarding-files');

-- Policy: Authenticated users can delete files
create policy "Authenticated users can delete onboarding files"
on storage.objects for delete
to authenticated
using (bucket_id = 'onboarding-files');

