# POV Clone — Disposable Camera Event Photo Sharing

Build a mobile app where event hosts create a room with a shareable code. Guests join and take
photos in-app. Photos are hidden until a set "film development" delay passes — then they reveal
to everyone in a shared gallery. Mimics the POV – Disposable Camera Events app (114M+ TikTok views).

---

## Template baseline

This project starts from the **8x React Native Expo template**. Everything below is already wired
and must NOT be re-implemented from scratch:

- Supabase client → `lib/supabase.ts`
- Auth (OTP email + Google/Apple OAuth) → `app/(auth)/login.tsx`
- Three-zone auth routing (public → onboarding → tabs) → `app/_layout.tsx` via `Stack.Protected`
- TanStack Query client → `lib/queryClient.ts` (30s stale, retry logic)
- Toast system → `useToast()` — `showToast('msg', 'success' | 'error' | 'info')`
- Bottom sheet modals → `AppModal` component
- Theme tokens (59 tokens, single `ACCENT` rebrand) → `lib/theme.ts`
- Typography → `<Text>` component from `components/ui/Text.tsx` (Inter, Android fix included)
- Button variants (primary / secondary / outline / ghost / destructive) → `components/ui/Button.tsx`
- NativeWind + Tailwind → already configured, use `className` props
- Analytics (typed) → `track('event_name', props)` from `lib/analytics.ts`
- Offline banner + overlay → already rendered in root layout
- PostHog feature flags → `useFeatureFlag('flag', default)`
- i18n → `lib/i18n.ts`, English locale in `locales/en.json`

**Work within these conventions. Don't reinvent them.**

---

## Branding — do this first

### `lib/constants.ts`
```ts
export const APP_NAME          = 'POV'
export const APP_TAGLINE       = 'Every guest. One album.'
export const APP_SCHEME        = 'pov'
export const APP_SUPPORT_EMAIL = 'support@pov.app'
export const APP_DOCS_URL      = 'https://pov.app/docs'
```

### `lib/theme.ts` — film/analog palette
```ts
export const ACCENT        = '#FFD200'          // Kodak yellow
export const ACCENT_DIM    = 'rgba(255,210,0,0.12)'
export const ACCENT_BORDER = 'rgba(255,210,0,0.30)'
export const ACCENT_GLOW   = 'rgba(255,210,0,0.20)'
export const ACCENT_LIGHT  = '#FFE566'
```

Mirror in `tailwind.config.js`:
```js
colors: { accent: '#FFD200' }
```

Background: deep warm black `#0F0A00`. Surface: `#1A1200`. Text: warm cream `#F5ECD7`.
This should feel like a darkroom, not a productivity app.

---

## New Supabase migration

Create `supabase/migrations/YYYYMMDDHHMMSS_pov_schema.sql`:

```sql
-- Events
create table events (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,             -- 6-char join code, uppercase
  name           text not null,
  host_id        uuid references auth.users on delete cascade,
  delay_minutes  integer not null default 60,      -- film development delay
  max_shots      integer not null default 27,      -- classic disposable limit
  created_at     timestamptz default now(),
  expires_at     timestamptz                       -- optional
);

-- Photos
create table photos (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid references events(id) on delete cascade,
  taker_id      uuid references auth.users,
  taker_name    text not null,
  storage_path  text not null,                     -- path in Supabase Storage
  taken_at      timestamptz default now(),
  reveal_at     timestamptz not null,              -- taken_at + delay_minutes
  revealed      boolean default false,
  created_at    timestamptz default now()
);

-- RLS
alter table events enable row level security;
alter table photos enable row level security;

-- Anyone can read events (to validate a join code)
create policy "events_read" on events for select using (true);
-- Only host can create events
create policy "events_insert" on events for insert with check (auth.uid() = host_id);

-- Anyone authed can read revealed photos in an event they're in
create policy "photos_read" on photos for select using (revealed = true);
-- Authenticated users can insert their own photos
create policy "photos_insert" on photos for insert with check (auth.uid() = taker_id);
-- System/host can flip revealed flag
create policy "photos_update" on photos for update using (true);

-- Realtime
alter publication supabase_realtime add table photos;
```

**Storage bucket:** create `event-photos` in Supabase dashboard. Set to private.
Access photos via signed URLs generated after `revealed = true`.

Run locally: `supabase db reset`

---

## File structure — new files to create

Only create what isn't already in the template. Follow existing conventions exactly.

```
app/
  index.tsx                  ← REPLACE: new landing (Create / Join CTAs)
  (tabs)/
    index.tsx                ← REPLACE: becomes active event home (camera or gallery)
  event/
    create.tsx               ← new: create event form
    join.tsx                 ← new: enter 6-char code
    [code]/
      _layout.tsx            ← new: shared layout for event screens
      camera.tsx             ← new: disposable camera UI
      gallery.tsx            ← new: shared photo gallery
      download.tsx           ← new: ZIP download (host only, stretch goal)

hooks/
  useEvent.ts                ← new: fetch event by code
  usePhotos.ts               ← new: realtime photo subscription
  useCamera.ts               ← new: camera state + shot counter

components/
  Camera/
    DisposableCamera.tsx     ← new: full camera view with film overlay
    ShutterButton.tsx        ← new: physical shutter button
    FilmCounter.tsx          ← new: X/27 shots remaining, dial aesthetic
  Gallery/
    PhotoGrid.tsx            ← new: grid layout
    PhotoCard.tsx            ← new: revealed vs developing state
    FullScreenPhoto.tsx      ← new: full-screen viewer
  Event/
    EventCodeCard.tsx        ← new: shareable code display for host
    JoinCodeInput.tsx        ← new: 6-char code entry with auto-caps
    DevelopingOverlay.tsx    ← new: grain animation for unrevealed photos

lib/
  events.ts                  ← new: generateCode(), createEvent(), joinEvent()
  photos.ts                  ← new: uploadPhoto(), revealDuePhotos()
  zip.ts                     ← new: ZIP download helper (stretch goal)
```

---

## Hook patterns — follow the template's TanStack Query conventions

### `hooks/useEvent.ts`
```ts
export function useEvent(code: string) {
  return useQuery({
    queryKey: ['event', code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()
      if (error) throw error
      return data
    },
    placeholderData: null,
  })
}
```

### `hooks/usePhotos.ts` — realtime subscription
```ts
export function usePhotos(eventId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['photos', eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('taken_at', { ascending: true })
      return data ?? []
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel(`photos:${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'photos',
        filter: `event_id=eq.${eventId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['photos', eventId] })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  return query
}
```

---

## Analytics events — add to `lib/analytics.ts`

Add to the `EventName` union type:
```ts
| 'event_created'
| 'event_joined'
| 'photo_taken'
| 'photo_revealed'
| 'gallery_viewed'
| 'photos_downloaded'
```

---

## Feature flags — add to PostHog / `lib/featureFlags.ts`

```
'zip_download'    // gates the download-all feature
'delay_options'   // shows custom delay picker vs fixed 1h
```

---

## UI / Design direction

**Aesthetic:** Analog darkroom. Warm, tactile, slightly lo-fi. NOT a clean SaaS product.

### Color usage
- Background: `#0F0A00` (near-black, warm undertone)
- Surface cards: `#1A1200`
- Primary text: `#F5ECD7` (warm cream)
- Accent / CTAs: `#FFD200` (Kodak yellow)
- Danger / film-red: `#E8272A`
- Developing state bg: `#2A1F00` with animated grain

### Typography
- Use `<Text>` from `components/ui/Text.tsx` for all text (Inter, Android fix)
- For display headings, add a slab serif via `@expo-google-fonts`: `Arvo`, `RobotoSlab`, or `PlayfairDisplay`
- Film counter and join codes: monospace font (`SpaceMono` or `Courier`)

### Key screen treatments

**Camera screen**
- Full bleed with dark radial gradient vignette around edges
- Grain texture overlay: semi-transparent noise pattern on top of preview
- Warm sepia tint: `rgba(139, 90, 0, 0.15)` overlay on live preview
- Film counter top-right: `● ● ● ○ ○ ○` dot-style in monospace
- Shutter: large circular button, physical press feel via `Animated.spring`
- On capture: white flash (`opacity: 1 → 0` over 300ms using Reanimated)

**Developing placeholder (`PhotoCard` unrevealed)**
- Dark sepia `#2A1F00` background
- Animated shimmer loop using `react-native-reanimated`
- Small monospace text: "developing..."
- Countdown timer: `HH:MM:SS` until reveal

**Photo reveal animation**
- Triggered when `revealed` flips `true` in realtime
- Fade in from 0 opacity + scale 0.95 → 1.0 over 600ms
- Use `useSharedValue` + `withTiming` from `react-native-reanimated`

**Gallery grid**
- 2-column grid of polaroid-style cards
- Taker name at bottom in small monospace
- Slight random rotation per card (−2° to +2°) — seed from photo ID for consistency
- Shadow: `shadowColor: '#FFD200', shadowOpacity: 0.15`

**Event code card (host)**
- Large letter-spaced monospaced 6-char code
- "Share" button using `Share.share()` from React Native core
- Subtitle showing event config: `"27 shots · 1 hour delay"`

---

## Film development delay mechanic

This is the **core feature**. Implement it carefully.

1. On photo capture → `reveal_at = new Date(Date.now() + event.delay_minutes * 60 * 1000)`
2. Store photo row: `revealed: false`, `reveal_at` set
3. In `usePhotos` → run `setInterval` every 30s to flip due photos:

```ts
const checkAndReveal = async () => {
  const now = new Date()
  const due = photos.filter(p => !p.revealed && new Date(p.reveal_at) <= now)
  if (due.length === 0) return
  await Promise.all(
    due.map(p => supabase.from('photos').update({ revealed: true }).eq('id', p.id))
  )
}
```

4. Realtime subscription picks up the `UPDATE` and triggers re-render
5. `PhotoCard` animates reveal when `revealed` transitions to `true`

---

## Shot limit (27 per guest)

- Enforce in `useCamera.ts`: count user's photos for this event before allowing capture
- Disable shutter when count reaches 27
- Show `FilmCounter` updating in real-time
- On last shot: `showToast('Film roll finished — 27/27 shots used', 'info')`

---

## Guest auth strategy

- Use the template's existing Supabase anonymous auth — no new auth screen needed
- After joining, capture display name via `AppModal` bottom sheet (one-time)
- Persist to `user_metadata.display_name` via `supabase.auth.updateUser()`
- Piggyback on the template's `user_metadata.onboarding_completed` pattern

---

## Build order

```
Phase 1 — Branding & UI shells (screenshots are judged first — nail these)
  [ ] lib/constants.ts, lib/theme.ts, tailwind.config.js — POV brand
  [ ] app/index.tsx — Create / Join landing
  [ ] event/create.tsx — name input, delay picker, generated code card
  [ ] event/join.tsx — 6-char code input UI
  [ ] event/[code]/camera.tsx — camera UI shell with mock film overlay
  [ ] event/[code]/gallery.tsx — grid with mock polaroid cards

Phase 2 — Core data logic
  [ ] supabase db reset with new migration
  [ ] lib/events.ts — generateCode(), createEvent(), joinEvent()
  [ ] hooks/useEvent.ts and hooks/usePhotos.ts
  [ ] Create flow wired end-to-end → event row in DB
  [ ] Join flow wired → validate code → route to camera

Phase 3 — Camera + upload
  [ ] expo-camera integration in DisposableCamera.tsx
  [ ] Capture → upload to Storage → insert photo row with reveal_at
  [ ] FilmCounter wired to real shot count

Phase 4 — Delay mechanic + gallery
  [ ] usePhotos realtime subscription live
  [ ] Developing placeholder with grain animation
  [ ] 30s interval to flip revealed = true
  [ ] Reveal animation (fade + scale) in PhotoCard
  [ ] Gallery grid fully wired with real data

Phase 5 — Polish & demo prep
  [ ] Grain/vignette overlays on camera
  [ ] White flash on shutter
  [ ] Polaroid rotation in gallery
  [ ] EventCodeCard with Share.share()
  [ ] ZIP download (stretch — only if time permits)
  [ ] npm run typecheck — 0 errors; npm test — all passing
  [ ] Seed script: 2 events, 10+ photos at various reveal states
  [ ] Screenshots of every screen → /screenshots/
  [ ] REFLECTION.md written
  [ ] Claude Code logs copied → /ai-logs/
```

---

## Commands

```bash
# Install
npm install

# Local Supabase (Docker Desktop must be running)
supabase start
supabase db reset

# Dev server
npx expo start

# iOS simulator (Mac only)
npx expo run:ios

# Android emulator
npx expo run:android

# Type check — run before every commit
npm run typecheck

# Tests
npm test
```

---

## Environment variables (`.env.local`)

```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx

# Leave empty — degrade gracefully:
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## Submission checklist

- [ ] Public GitHub repo with source code
- [ ] `/ai-logs/` — Claude Code `.md` session files (`cp ~/.claude/projects/<project>/*.md ./ai-logs/`)
- [ ] `/screenshots/` — every major screen, polished
- [ ] `REFLECTION.md` — what was easy, hard, what you'd change
- [ ] `README.md` — Loom walkthrough link at the top
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm test` passes
- [ ] Full flow verified: create → join → capture → developing state → reveal → gallery

---

## Scoring weights (from brief)

| Weight | Area | What to nail |
|--------|------|-------------|
| 40% | Product fidelity | Realtime sync works, delay reveal feels special, gallery is polished |
| 35% | Engineering quality | Typed hooks, template conventions followed, clean component split |
| 25% | Communication | Polished screenshots, Loom shows full e2e flow, honest reflection |

**The photo reveal is the money moment. Make it feel like film actually developing.**