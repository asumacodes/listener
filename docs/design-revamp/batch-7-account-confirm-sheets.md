# Batch 7 — Account + ConfirmSheets

## Scope

Account/Settings reskin, four deletion ConfirmSheets.

## ConfirmSheets (locked)

| Sheet            | Trigger                  | confirmLabel   | Backend                        |
| ---------------- | ------------------------ | -------------- | ------------------------------ |
| Delete project   | edit form → delete       | Delete project | `deleteProject` (exists)       |
| Delete recording | IdeaDetail / project row | Delete idea    | **new** `deleteRecording`      |
| Delete run       | IdeaDetail run history   | Delete run     | **new** `deleteRun`            |
| Delete account   | Account settings         | Delete account | **new** account deletion route |

## Files

| Action  | Path                                                      |
| ------- | --------------------------------------------------------- |
| Reskin  | `screens/AccountScreen.tsx` — settings rows, edit profile |
| **New** | `lib/account/delete.ts` — server-side account wipe        |
| **New** | `app/api/account/delete/route.ts`                         |
| **New** | `lib/recordings/delete.ts`, `lib/runs/delete.ts`          |
| **New** | `lib/confirm-copy.ts` — titles/bodies per sheet type      |
| Wire    | `ConfirmSheet` usages across project, idea, account views |

## Copy sheet (examples from design system)

| Sheet                     | Title                | Body                                                                           |
| ------------------------- | -------------------- | ------------------------------------------------------------------------------ |
| Recording                 | Delete this idea?    | This removes the recording and its generated PRD. This can't be undone.        |
| Project (with recordings) | Delete project?      | "{name}" and its N recordings will move to Uncategorised.                      |
| Run                       | Delete this run?     | Removes generated outputs for this run. The recording stays.                   |
| Account                   | Delete your account? | Permanently removes your recordings, projects, and data. This can't be undone. |

Cancel label default: **Keep it** (all sheets).

## Backend deps

- Account delete: Supabase auth admin or user RPC + cascade storage cleanup
- RLS: user can only delete own rows
- Rate limit account delete endpoint

## Acceptance

- [ ] All four sheets use vertical danger + Keep it layout
- [ ] busy state locks dismiss
- [ ] Delete account signs out and redirects to login
- [ ] Delete recording removes storage object + DB row
