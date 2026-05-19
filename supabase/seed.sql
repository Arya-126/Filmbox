-- Insert dummy users into auth.users (requires matching IDs if we were inserting via API, 
-- but for local dev we can just insert them into auth.users or use an existing user id).
-- Since we don't know the exact UUIDs of the auth.users locally, 
-- you'll usually want to create a user via the UI first, then insert events.
-- We'll add some dummy events and assume the host_id is null for simplicity of demo, 
-- or we can just leave it as an example.

insert into events (id, code, name, delay_minutes, max_shots) values 
('11111111-1111-1111-1111-111111111111', 'CAM24X', 'Sarah''s Birthday', 60, 27),
('22222222-2222-2222-2222-222222222222', 'W3DDIN', 'Alex & Taylor Wedding', 120, 27);

-- Mock photos
-- Reveal at time in the past (revealed)
insert into photos (event_id, taker_name, storage_path, taken_at, reveal_at, revealed) values 
('11111111-1111-1111-1111-111111111111', 'Guest1', 'mock1.jpg', now() - interval '2 hours', now() - interval '1 hour', true),
('11111111-1111-1111-1111-111111111111', 'Guest2', 'mock2.jpg', now() - interval '2 hours', now() - interval '1 hour', true);

-- Reveal at time in the future (developing)
insert into photos (event_id, taker_name, storage_path, taken_at, reveal_at, revealed) values 
('11111111-1111-1111-1111-111111111111', 'Guest3', 'mock3.jpg', now(), now() + interval '1 hour', false);
