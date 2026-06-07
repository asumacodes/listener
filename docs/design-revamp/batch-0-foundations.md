# Batch 0 — Foundations (implemented)

Design System v1 applied from `Listener - Design System.html`.

## Tokens

- [`app/globals.css`](../../app/globals.css) — full CSS variable set (canvas, gold opacity steps, success, scrim, shadows)
- [`lib/design/tokens.ts`](../../lib/design/tokens.ts) — typed reference for TS consumers

## Components updated

| Component                           | Changes                                                       |
| ----------------------------------- | ------------------------------------------------------------- |
| `Button`                            | `danger` variant, 0.975 press scale, fullWidth → `rounded-xl` |
| `Badge` / `StatusBadge`             | ready, draft, mapping, needs-attention, error                 |
| `Card`                              | border + `shadow-card`                                        |
| `ConfirmSheet`                      | vertical stack, danger first, cancel default "Keep it"        |
| `BottomSheet`                       | 280ms enter/exit                                              |
| `RecordButton`                      | 120×120, 3s breathe, 2s pulse ring                            |
| `Input`, `FieldLabel`, `IconButton` | new library primitives                                        |

## Illustrations

- [`components/illustrations/LottieIllustration.tsx`](../../components/illustrations/LottieIllustration.tsx)
- [`components/illustrations/registry.ts`](../../components/illustrations/registry.ts) — six slots
- [`public/illustrations/*.svg`](../../public/illustrations/) — poster placeholders until Lottie JSON ships

## Motion

- [`motion/useScreenEnter.ts`](../../motion/useScreenEnter.ts) — GSAP fade + 8px rise
- [`lib/gsap/`](../../lib/gsap/) — durations, reduced-motion helper
- Dependencies: `gsap`, `@gsap/react`, `lottie-react`

## Typography & voice

Use `.type-eyebrow`, `.type-caption`, serif scales from design system. Tone: calm, plain, human — see §06 in design HTML.

## Acceptance

- [ ] All existing screens render without token regressions
- [ ] `prefers-reduced-motion` disables breathe/pulse/fade
- [ ] ConfirmSheet matches vertical danger + Keep it layout
- [ ] Record button matches 120×120 spec
