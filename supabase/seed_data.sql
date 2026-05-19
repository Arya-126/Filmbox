-- seed_data.sql
-- Run this script in your Supabase SQL Editor to seed the database with mock events and photos.

-- 1. Create a dummy user in auth.users (if not exists)
DO $$ 
DECLARE
  dummy_user_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = dummy_user_id) THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      dummy_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'host@filmbox.app',
      '$2a$10$w0...fakehash...',
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Mock Host"}',
      now(),
      now()
    );
  END IF;
END $$;

-- 2. Create 2 Events
INSERT INTO public.events (id, code, name, host_id, delay_minutes, max_shots, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'MOCK01', 'Summer BBQ 2026', '11111111-1111-1111-1111-111111111111', 60, 27, now() - interval '2 days'),
  ('33333333-3333-3333-3333-333333333333', 'MOCK02', 'Graduation Trip', '11111111-1111-1111-1111-111111111111', 120, 27, now())
ON CONFLICT DO NOTHING;

-- 3. Create Photos (some revealed, some developing)
INSERT INTO public.photos (id, event_id, taker_id, taker_name, storage_path, taken_at, reveal_at, revealed)
VALUES 
  -- Event 1: Revealed photos
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Alice', 'mock_photo_1.jpg', now() - interval '2 days', now() - interval '1 day', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Bob', 'mock_photo_2.jpg', now() - interval '2 days', now() - interval '1 day', true),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Charlie', 'mock_photo_3.jpg', now() - interval '2 days', now() - interval '1 day', true),
  
  -- Event 2: Developing photos (reveal_at in the future)
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Alice', 'mock_photo_4.jpg', now(), now() + interval '2 hours', false),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Bob', 'mock_photo_5.jpg', now(), now() + interval '2 hours', false)
ON CONFLICT DO NOTHING;
