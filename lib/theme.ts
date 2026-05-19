/**
 * 🎨 BRAND — central theme constants.
 *
 * Change ACCENT (and the matching tailwind.config.js color) to rebrand the
 * entire app in one edit. All components import from here instead of
 * hardcoding color strings.
 *
 * Steps to rebrand:
 *   1. Change ACCENT below to your hex color
 *   2. Change the `accent` key in tailwind.config.js to the same hex
 *   3. Optionally change BG for a different dark shade
 */

// ── Primary brand color ───────────────────────────────────────────────────────
// 🎨 Change this one value to rebrand the whole app
export const ACCENT = '#FFD200'           // Kodak yellow

// Derived from ACCENT — adjust opacity as needed
export const ACCENT_DIM = 'rgba(255,210,0,0.12)'
export const ACCENT_BORDER = 'rgba(255,210,0,0.30)'
export const ACCENT_GLOW = 'rgba(255,210,0,0.20)'
// Text color on dark background using accent tone
export const ACCENT_LIGHT = '#FFE566'

// ── Backgrounds ───────────────────────────────────────────────────────────────
export const BG = '#0F0A00'        // main app background
export const SURFACE = '#1A1200'        // cards, inputs
export const SURFACE2 = '#2A1F00'        // elevated surface (sheet panels, etc.)
export const SURFACE3 = '#3A2D00'        // even more elevated

// ── Text ──────────────────────────────────────────────────────────────────────
export const TEXT_PRIMARY = '#F5ECD7'
export const TEXT_SECONDARY = 'rgba(245,236,215,0.55)'
export const TEXT_TERTIARY = 'rgba(245,236,215,0.28)'
export const TEXT_DISABLED = 'rgba(245,236,215,0.18)'

// ── Borders ───────────────────────────────────────────────────────────────────
export const BORDER = 'rgba(255,255,255,0.09)'
export const BORDER_ACTIVE = 'rgba(255,255,255,0.18)'

// ── Semantic ──────────────────────────────────────────────────────────────────
export const ERROR = '#f87171'
export const ERROR_DIM = 'rgba(248,113,113,0.10)'
export const WARNING = '#fbbf24'
export const SUCCESS = '#4ade80'

// ── FilmBox Specific ──────────────────────────────────────────────────────────
export const FILM_RED = '#E8272A'
export const DEVELOPING_BG = '#2A1F00'
export const SEPIA_OVERLAY = 'rgba(139, 90, 0, 0.15)'

// ── Tab bar ───────────────────────────────────────────────────────────────────
export const TAB_ACTIVE = ACCENT
export const TAB_INACTIVE = 'rgba(255,255,255,0.40)'
export const TAB_HEIGHT = 68
