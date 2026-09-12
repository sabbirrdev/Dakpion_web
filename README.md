# DakPion (ডাকপিওন) — Frontend

A production-grade React/TypeScript frontend for DakPion, a bilingual (Bengali + English)
digital-postbox product. Built ahead of the backend, with a strict service-layer
abstraction so the mock data can be swapped for real API calls without touching any
component.

## Stack

- **Vite + React 19 + TypeScript** — strict mode, no `any`, `noUnusedLocals` enforced
- **Tailwind CSS v4** — design tokens defined once in `src/index.css` (`@theme` block)
- **react-router-dom** — routing
- **Zustand** — state management (`persist` middleware for the compose draft)
- **react-i18next** — full EN/BN internationalization
- **Framer Motion** — envelope-fold / wax-seal / page transition animations
- **Howler.js** — background/ambient audio playback
- **lucide-react** — icons

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## Architecture: how this survives the real backend arriving

Nothing in `components/` or `pages/` imports mock data directly. Everything flows
through an interface-typed service layer:

```
src/
├── types/            # Domain model — mirrors the backend schema in the spec doc
├── mock/              # Seed/fixture data (bilingual, realistic)
├── services/
│   ├── catalogService.ts   # CatalogService interface + MockCatalogService impl
│   ├── letterService.ts    # LetterService interface + MockLetterService impl
│   └── serviceUtils.ts     # shared fake-latency / localStorage helpers
├── store/             # Zustand stores (compose draft, UI/toasts)
├── i18n/              # i18next config + locales/en.json, locales/bn.json
├── hooks/             # useLocale, usePicker, useAudioPlayer
├── components/
│   ├── layout/         # Header, Footer, RootLayout
│   ├── shared/          # Button, LinkButton, Modal, ToastStack, ...
│   └── compose/         # WritingPad, ThemeSelector, AudioSelector, OtpModal, ...
└── pages/              # HomePage, ComposePage, LetterSentPage, EnvelopePage, PricingPage
```

**To connect the real backend:**

1. Write `HttpCatalogService implements CatalogService` and
   `HttpLetterService implements LetterService`, calling the endpoints from the
   spec (`GET /api/v1/themes`, `POST /api/v1/letters/compose`, OTP request/verify,
   payment webhook, etc).
2. Swap the single exported instance at the bottom of `catalogService.ts` /
   `letterService.ts`.
3. Delete `src/mock/`. Nothing else changes — every component depends on the
   `ServiceResponse<T>` contract, not on where the data comes from.

The mock `LetterService` already simulates the pieces called out in the spec so the
UI is exercised realistically:
- OTP request/verify with a Redis-style per-phone rate limit (`localStorage`-backed)
- A "Bad Words Filter Middleware" equivalent (`src/lib/badWordsFilter.ts`)
- A simulated payment gateway
- Persisted letters (`localStorage`) so `/letter/:id` and `/sent/:id` work end-to-end
  in the browser without a server

## Internationalization

- `src/i18n/locales/en.json` and `bn.json` share an identical key structure (verified
  — 129 keys, zero drift) so nothing can silently fall back to the wrong language.
- Default locale is **Bengali** (`bn`), matching the product's Bangla-first spec.
  Detected/persisted via `localStorage` (`dakpion:locale`), falls back to browser
  language.
- `useLocale()` syncs `<html lang>` and a `data-script` attribute that swaps the
  entire type system (Bengali → Tiro Bangla / Hind Siliguri, Latin → Fraunces / Inter)
  via CSS custom properties — no per-component font logic needed.
- All catalog/seed data (themes, audio tracks, delivery options, pricing, FAQ,
  testimonials) is typed as `{ en: string; bn: string }` pairs and read through the
  `usePicker()` hook, e.g. `pick(theme.name)`.
- Adding a third language later: add `locales/xx.json`, register it in
  `src/i18n/index.ts`, extend `LocaleCode` in `types/index.ts`, and extend every
  `LocalizedText`-shaped object in `mock/`.

## Design system

A "writing desk at dusk" visual identity, deliberately not the generic
cream-and-serif template: deep postal-ink navy chrome (`--color-ink`) holds
warm parchment paper surfaces (`--color-parchment`) with a wax-seal red
(`--color-seal`) as the primary action color and a muted postmark gold
(`--color-gold`) for accents. All tokens live in `src/index.css` under `@theme`.

## Known gaps intentionally left for the next milestone

- **Audio files**: `mock/audioTracks.ts` points at `/audio/*.mp3`, which don't exist
  yet in `public/audio/` — this sandbox has no network access to fetch royalty-free
  samples. Drop real files at those paths (or swap the `src` values) and playback
  works immediately; the `useAudioPlayer` hook and UI are fully wired.
- **Admin dashboard / courier booking** (Sprint 3 in the spec) is backend-facing and
  out of scope for this frontend milestone.
- Bundle is a single JS chunk (~530 kB / 168 kB gzip). Fine for this milestone;
  route-level `React.lazy()` code-splitting is a straightforward follow-up once
  page count grows.
