# Mockup parity audit

Baseline: `Listener Mockups/listener-app.css`, `listener-app-screens.css`, `listener-ui.jsx`.

| Rule                       | Mockup            | App (before)     | Fix                             |
| -------------------------- | ----------------- | ---------------- | ------------------------------- |
| Primary btn radius         | 12px              | rounded-lg (8px) | Button → rounded-xl             |
| Primary btn text           | 15px #fff         | text-sm          | Button → text-[15px] text-white |
| Primary btn min-height     | 48px              | min-h-12 ✓       | —                               |
| Secondary btn hover        | rgba(0,0,0,0.03)  | #fcfcfa          | hover:bg-black/[0.03]           |
| Disabled btn               | gold-10 + muted   | opacity-45       | disabled: gold-10 pattern       |
| Input padding              | 14px, 15px        | py-3.5 text-sm   | Input → py-3.5 text-[15px]      |
| Field label                | 11px 0.18em muted | type-eyebrow ✓   | —                               |
| Text link                  | 14px gold fw500   | text-sm          | `.type-textlink` utility        |
| OAuth secondary            | surface + border  | ✓                | hover via Button secondary      |
| Footer auth link           | gold 14px         | text-sm gold     | AuthFooterLink → type-textlink  |
| Tab Projects icon          | 2×2 grid          | folder           | TabBar → IconGrid               |
| Frame width                | fluid             | 390/640 max-w    | `appShellClass` fluid shell     |
| Stepper inner card         | soft cap          | max-w-[380px]    | max-w-sm inner card             |
| Handoff gold ring          | 72px spin         | placeholder      | HandoffScreen + `.gold-ring`    |
| Confirm sheet ghost cancel | ghost block       | secondary        | ConfirmSheet ghost variant      |

| Auth hero headline | 36px serif `--text` h1 | 26px h2 below 40px gold wordmark | `AuthHeader` + `auth-hero` 36px h1 |
| Auth wordmark | 28px gold in auth-head | 40px standalone | 28px in header stack |
| OAuth redirect | 34px wordmark + muted eyebrow | uppercase eyebrow | 34px wm + normal-case muted |
| Email invite title | 26px ce-title | 22px | 26px + type-textlink actions |
| Rehydration copy | "Picking up where you left off…" | different strings | copy.rehydration updated |
| Rehydration layout | 140px art + 34px margin | card-only | art above card, mockup spacing |

**Status:** Token + composition pass complete. Build passes (`npm run build`).
