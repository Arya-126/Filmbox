-- ============================================================
-- RUN THIS IN YOUR SUPABASE DASHBOARD → SQL EDITOR
-- This fixes the gallery not showing photos
-- ============================================================

-- 1. Drop the old restrictive policy that only showed revealed photos
DROP POLICY IF EXISTS "photos_read" ON photos;

-- 2. Create a new policy that lets authenticated users see ALL photos
-- (the app UI handles hiding unrevealed images with the DevelopingOverlay)
CREATE POLICY "photos_read" ON photos 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- 3. Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-photos',
  'event-photos',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies for uploads and reads
DO $$
BEGIN
  -- Allow authenticated users to upload photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'auth_upload_event_photos'
  ) THEN
    CREATE POLICY "auth_upload_event_photos"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'event-photos');
  END IF;

  -- Allow authenticated users to read photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'auth_read_event_photos'
  ) THEN
    CREATE POLICY "auth_read_event_photos"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (bucket_id = 'event-photos');
  END IF;
END $$;
