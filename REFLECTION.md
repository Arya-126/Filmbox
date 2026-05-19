# Reflection: FilmBox — Disposable Camera Event Photo Sharing

## What was easy
- Following the structured UI patterns set by the 8x React Native template. The predefined theme tokens, typography components, and bottom-sheet modals significantly sped up the development of the frontend.
- Integrating `expo-camera`. The API is straightforward, and layering UI elements like the film counter and mock vignette over the preview was simple using standard absolute positioning.
- The Supabase schema was clean and simple — two tables (events + photos) with straightforward RLS policies. The migration-based workflow made iteration predictable.

## What was hard
- Synchronizing the "film delay" logic. Ensuring that photos correctly stay hidden until their `reveal_at` timestamp passes required careful attention to the 30-second interval check and realtime subscriptions, making sure the UI accurately reflected the state transition without requiring a manual refresh.
- Handling the typing and mock implementations of the stretch goals, specifically working around the `expo-file-system` and `expo-sharing` APIs in the context of Expo SDK 55's updated type definitions.
- Getting the "darkroom" aesthetic to feel premium without going overboard. Balancing the sepia overlays, grain textures, and vignette effects so the camera preview still looked usable required several iterations.

## What I'd change
- **Realtime scalability**: The current interval-based check in the client is sufficient for a demo, but in a true production environment, relying on clients to flip the `revealed` flag via a 30s interval can be unreliable and cause conflicts if many users are in the same event. I'd move this logic to a serverless cron job (e.g., Supabase Edge Functions with pg_cron) that flips the flag at the database level, and use realtime subscriptions strictly for pushing updates to the clients.
- **Image Processing**: I would implement actual image processing (e.g., applying LUTs or shaders via Expo Image or a dedicated library) rather than just overlaying semi-transparent UI views, to give the photos a true, baked-in analog look before they are uploaded to the bucket.
- **Guest identity**: The current flow asks for a display name via a simple modal. In production, I'd build a proper guest onboarding screen with avatar selection and persist it to a dedicated `guests` table linked to both `auth.users` and `events`, supporting multi-event guest profiles.
