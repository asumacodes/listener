# Batch 4 — Rehydration Splash + Session Restore

## Scope

**RehydrationSplash** (ill-6) when `useSessionRestore` has `restoreMode === 'pipeline'`. Minimal **AppBootstrapScreen** when `restoreMode === 'none'`.

## Surfaces

| Moment               | Component                | Trigger                                     |
| -------------------- | ------------------------ | ------------------------------------------- |
| Pipeline tab refresh | `RehydrationSplash`      | `!isAppReady && restoreMode === 'pipeline'` |
| Brief session read   | `AppBootstrapScreen`     | `!isAppReady && restoreMode === 'none'`     |
| Ready                | `StepperSurface` or idle | `isAppReady`                                |

Illustration: [`RehydrationIllustration`](../components/illustrations/pipeline/RehydrationIllustration.tsx)

Copy: Welcome back · Finding where you were · Reconnecting your session — one moment.

## Files

| Action       | Path                                                                |
| ------------ | ------------------------------------------------------------------- |
| Reskin       | `screens/AppBootstrapScreen.tsx` — minimal spinner (no ill-6)       |
| **New**      | `screens/RehydrationSplash.tsx` — `RehydrationIllustration` (ill-6) |
| Wire         | `hooks/useSessionRestore.ts` — `restoreMode: 'none' \| 'pipeline'`  |
| Wire         | `components/ListenerApp.tsx`                                        |
| Illustration | `RehydrationIllustration` SVG + CSS (not Lottie)                    |

## Copy sheet

| Key             | String                         |
| --------------- | ------------------------------ |
| splash.default  | Restoring your session…        |
| splash.pipeline | Picking up where you left off… |

## Motion

- Splash: `RehydrationIllustration` with CSS motion; static when `prefers-reduced-motion`
- Transition: crossfade to target screen when `isAppReady`

## Backend deps

- `lib/murmur/resume.ts` (exists)

## Acceptance

- [ ] Refresh during Stepper → splash → Stepper at correct stage
- [ ] Fresh load with no session → brief splash → IDLE
- [ ] Reduced motion: static poster only
