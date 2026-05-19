-- Create the storage bucket for event photos (if not exists)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-photos',
  'event-photos',
  false,
  10485760,  -- 10 MB max
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Allow authenticated users to upload to the event-photos bucket
create policy "auth_upload_event_photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-photos');

-- Allow authenticated users to read photos from events
create policy "auth_read_event_photos"
on storage.objects for select
to authenticated
using (bucket_id = 'event-photos');
