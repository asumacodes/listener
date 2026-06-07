# Batch 1 — Auth + Capture + Mic Denied

## Scope

Auth (done), Home (idle), Recording, Playback, Mic denied.

## Auth (implemented)

| Surface | Component | Route / trigger |

|---------|-----------|-----------------|

| Sign In | `AuthScreen` + `AuthHeadline` mode signin | `/login` |

| Sign Up | `AuthScreen` + `AuthHeadline` mode signup | `/login?mode=signup` |

| OAuth redirect | `OAuthRedirectSurface` | `oauthRedirect` state |

| Email invite | `EmailInviteSurface` | `showCheckEmail` after signup |

**Orchestrator:** [`screens/AuthScreen.tsx`](../../screens/AuthScreen.tsx)

**Shell:** `AuthLayout`, `AuthBrand`, `AuthDivider`, `AuthFooterLink`, `AuthErrorBanner`

**Form:** `OAuthButtons`, `EmailPasswordForm`

**Copy:** `lib/design/copy.ts` → `copy.auth`

**Hooks unchanged:** `useAuthState`, `useAuthActions`, `lib/auth/client.ts`

## Capture state mapping

| Surface | `AppState` / route | Tab bar |

|---------|-------------------|---------|

| Home idle | `IDLE` | hidden |

| Recording | `RECORDING` | hidden |

| Playback | `STOPPED` | hidden |

| Mic denied | `ERROR` (NotAllowedError) | hidden |

## Files (capture — remaining)

| Action | Path |

|--------|------|

| Reskin | `screens/IdleScreen.tsx` — add `LottieIllustration id="home-idle"` |

| Reskin | `screens/RecordingScreen.tsx` — illustration + timer `font-serif text-5xl` |

| Reskin | `screens/PlaybackScreen.tsx` — `ScreenActions`, Card + AudioPlayer |

| **New** | `screens/MicDeniedScreen.tsx` OR variant prop on `ErrorScreen` |

| Wire | `components/RenderScreen.tsx` — route NotAllowedError to mic-specific UI |

| Wire | `hooks/useRecordingActions.ts` — optional: set error code for mic vs generic |

| Motion | `motion/useScreenEnter.ts` on each screen container |

## Copy sheet

| Key | String |

|-----|--------|

| idle.hint | Tap to record |

| idle.tagline | Speak · Transcribe · Build |

| auth.signIn.headline | Welcome back |

| auth.signUp.headline | Create your account |

| auth.oauth.google | Redirecting to Google… |

| auth.oauth.github | Redirecting to GitHub… |

| recording.label | Recording |

| playback.eyebrow | Review your recording |

| playback.rerecord | Re-record |

| playback.confirm | Continue |

| mic.title | Microphone access needed |

| mic.body | Listener needs your mic to capture ideas. Allow access in Settings, then try again. |

| mic.cta | Open Settings |

| mic.secondary | Back to home |

| processing.handoff | Sending your idea… |

## Motion

- Auth: `useScreenEnter` on `AuthLayout`; mode crossfade 0.2s; `AuthSpinner` on OAuth redirect

- Screen enter: 0.25s fade + 8px rise (`useScreenEnter`)

- Home idle: Lottie `home-idle` or CSS breathe on RecordButton only

- Recording: Lottie `recording-active` optional; waveform stays

## Backend deps

None — auth and capture already wired.

## No-go

- Do not change MIME negotiation or 120s cap

- Do not show tab bar during capture

## Acceptance

### Auth (done)

- [x] Sign In / Sign Up match mockups

- [x] OAuth redirect with uppercase eyebrow + gold ring spinner

- [x] Email invite card with resend + back to sign in

- [x] Global tagline: Speak · Transcribe · Build

### Capture (remaining)

- [ ] iOS Safari: record → stop → playback

- [ ] Mic deny shows dedicated screen (not generic error)

- [ ] Illustration poster visible before Lottie JSON added
