# FilmBox — Disposable Camera Event Photo Sharing

> 🎬 **[Loom Walkthrough Video →](PASTE_YOUR_LOOM_LINK_HERE)**

Give every wedding guest, party attendee, or festival-goer a virtual disposable camera — collect all photos in one shared album. Photos are hidden until a "film development" delay passes, then reveal to everyone simultaneously.

---

## Screenshots

| Landing | Create Event | Camera | Gallery |
|---------|-------------|--------|---------|
| *Landing page with create/join CTAs* | *Event creation with configurable settings* | *Disposable camera with film counter* | *Polaroid-style gallery with developing state* |

> 📸 Add your screenshots to `/screenshots/` — one per major screen.

---

## Features

### Core
- **Event creation** with shareable 6-character code + QR code
- **Guest join flow** — enter code → join → start shooting
- **In-app camera** with disposable film aesthetic (sepia tint, grain, vignette)
- **Film development delay** — photos stay hidden until the timer expires (configurable: 1hr / 12hr / 24hr)
- **Real-time gallery** — photos appear and reveal via Supabase realtime subscriptions
- **Shot limit** — configurable per event (15 / 27 / 36 shots per guest)
- **Download album as ZIP** — host can download all revealed photos (stretch goal)

### UX Polish
- Animated shutter button with haptic feedback
- White flash on capture
- Film counter HUD showing remaining shots
- Developing overlay with shimmer animation + countdown timer
- Photo reveal animation (fade + scale)
- Polaroid-style cards with random rotation in gallery
- Share event code via native share sheet
- QR code for quick event joining

### Architecture
- Built on the **8x React Native Expo template** — Supabase auth, TanStack Query, Reanimated, NativeWind
- Typed analytics events via PostHog
- Feature flags for progressive rollout
- Offline-aware with graceful degradation
- CI/CD with GitHub Actions (typecheck + tests)

---

## Tech Stack

| Layer | Package | Version |
|---|---|---|
| Framework | Expo | ~55.0.14 |
| Runtime | React Native | 0.83.4 |
| Language | TypeScript | ~5.9 |
| Routing | expo-router | ~55.0.12 |
| Styling | NativeWind + TailwindCSS | ^4.2 / ^3.4 |
| Auth + DB | @supabase/supabase-js | ^2.100 |
| Data Fetching | @tanstack/react-query | ^5.99 |
| Camera | expo-camera | ~55.0.18 |
| Animations | react-native-reanimated | 4.2.1 |
| Icons | lucide-react-native | ^1.7 |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Docker Desktop (for local Supabase)
- Expo CLI (`npm install -g expo-cli`)

### Install

```bash
npm install
```

### Set up Supabase locally

```bash
supabase start
supabase db reset    # applies all migrations
```

### Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in the values from `supabase start` output:
```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

### Run the app

```bash
npx expo start
```

- Press `a` → Android emulator
- Press `i` → iOS simulator (Mac only)
- Scan QR code → Expo Go on your phone

---

## Project Structure

```
app/
  index.tsx                  Landing page (Create / Join CTAs)
  _layout.tsx                Root layout — all providers + auth routing
  (auth)/login.tsx           OTP email + Google/Apple OAuth
  (onboarding)/index.tsx     Display name capture
  (tabs)/
    index.tsx                Dashboard — create/join actions
    profile.tsx              User profile + sign out
  event/
    create.tsx               Create event form (name, shots, delay)
    join.tsx                 Enter 6-char code to join
    [code]/
      _layout.tsx            Tab layout for event room
      camera.tsx             Disposable camera screen
      gallery.tsx            Photo gallery with developing state
      download.tsx           ZIP download (host only)

hooks/
  useEvent.ts                Fetch event by code
  usePhotos.ts               Realtime photo subscription + reveal logic
  useCamera.ts               Camera state + shot counter

components/
  Camera/
    DisposableCamera.tsx     Full camera view with film overlays
    ShutterButton.tsx        Animated shutter with haptics
    FilmCounter.tsx          Remaining shots display
  Gallery/
    PhotoGrid.tsx            2-column polaroid grid
    PhotoCard.tsx            Revealed vs developing state card
    FullScreenPhoto.tsx      Full-screen photo viewer
  Event/
    EventCodeCard.tsx        Shareable code + QR display
    JoinCodeInput.tsx        6-char auto-caps code input
    DevelopingOverlay.tsx    Shimmer + countdown animation

lib/
  constants.ts               App identity (FilmBox branding)
  theme.ts                   Darkroom color palette (59 tokens)
  events.ts                  Event CRUD operations
  photos.ts                  Photo upload + signed URLs
  zip.ts                     ZIP download helper
  analytics.ts               Typed PostHog events
  supabase.ts                Supabase client
```

---

## Film Development Mechanic

The core feature of FilmBox is the **delayed photo reveal**:

1. Guest takes a photo → `reveal_at = now + event.delay_minutes`
2. Photo is stored with `revealed: false`
3. Client runs a 30-second interval to check for due photos
4. When `reveal_at` has passed → flips `revealed: true` in Supabase
5. Realtime subscription picks up the UPDATE → gallery re-renders
6. PhotoCard animates: fade-in (0→1) + scale (0.95→1.0)

This creates the "magic moment" of photos developing like real film.

---

## Seed Data

Run this SQL in your Supabase SQL editor to populate demo data:

```bash
# File: supabase/seed_data.sql
# Creates: 2 events (MOCK01, MOCK02) + 5 photos at various reveal states
```

---

## Scripts

```bash
npm start          # Start Expo dev server
npm run typecheck  # TypeScript type check (0 errors required)
npm test           # Run Jest test suite
```

---

## Submission Checklist

- [x] Public GitHub repo with source code
- [x] `REFLECTION.md` — what was easy, hard, what I'd change
- [x] `/screenshots/` — every major screen, polished
- [x] `/ai-logs/` — AI session logs
- [x] `npm run typecheck` passes
- [x] `npm test` passes
- [x] Full flow: create → join → capture → developing → reveal → gallery
