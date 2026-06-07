# Backend integration tasks

Status as of mockup revamp pass. **Integrate** = backend exists, UI not wired. **Build** = not implemented yet.

## Ready to integrate (backend exists)

| Task                        | Backend                                                                | UI gap                                                                      | Priority |
| --------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------- |
| Delete run from history     | `DELETE /api/runs/[id]`, `lib/runs/client.deleteRun`                   | Wired in `RunHistory` + `DeleteRunSheet`                                    | Done     |
| Run status badges in search | `latestRunStatus` on recordings in search query                        | Search hit cards show static copy; wire status from `lib/search.ts` results | P2       |
| Profile read on settings    | `lib/profile/client.fetchUserProfile`, `useProfile`                    | Settings uses profile for display; **save** not implemented                 | P2       |
| Account stats               | `useAccountStats` + server rollup                                      | Already on Account screen                                                   | Done     |
| Delete recording            | `DELETE /api/recordings/[id]`, `lib/recordings/client.deleteRecording` | Wired on Idea Detail                                                        | Done     |
| Delete account              | `DELETE /api/account`, `lib/account/delete`                            | Wired on Account                                                            | Done     |
| Pipeline kickoff / retry    | `/api/murmur/run`, `/api/murmur/retry`, `useMurmurActions`             | Wired; Handoff now on Run Pipeline (not transcribe)                         | Done     |
| Transcribe + save           | `/api/transcribe`, `useRecordingActions`                               | Wired; `TRANSCRIBING` state for save path                                   | Done     |
| Project CRUD + assign       | `lib/projects`, `useProjectPicker`                                     | Wired on transcript + idea detail                                           | Done     |
| Pipeline rehydration        | `lib/murmur/rehydrate`, `usePipelineRehydration`                       | Wired on app reopen                                                         | Done     |
| Signed audio URLs           | `lib/recordings/server`                                                | Idea detail + project lists                                                 | Done     |
| Full-text search            | `lib/search.ts`                                                        | Search UI wired                                                             | Done     |

## Build required (no backend yet)

| Task                                 | Notes                                                                                                            | Ticket |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------ |
| M1 card payloads                     | Murmur Bridge must persist PRD, research, brand, board per run; cards show placeholders until payload API exists | KAN-36 |
| Settings persist                     | No `PATCH /api/profile` or notification prefs table; Settings save is placeholder                                | —      |
| Push notifications                   | Handoff UI requests permission; no web push subscription storage or sender                                       | —      |
| Edit profile (avatar, display name)  | Read-only profile from `users` table; no update route                                                            | —      |
| Integrations (Linear, Notion, Slack) | Settings section placeholder only                                                                                | —      |
| Competitor map “empty” copy          | `copy.limitation.noCompetitors` exists; needs real Murmur signal to choose empty vs populated                    | KAN-36 |
| Pipeline stage realtime              | Client polls/rehydrates; optional Supabase Realtime on `pipeline_runs` for live stepper                          | —      |
| Search “recent” persistence          | Recent queries likely in-memory; mockup expects persisted recents per user                                       | —      |

## API hardening (exists but should improve)

| Task                             | Detail                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------- | ---- |
| Zod validation on route handlers | `/api/murmur/*`, `/api/transcribe`, DELETE routes accept raw JSON without schemas |
| `deleteRun` client               | Uses `DELETE /api/runs/[id]` route                                                | Done |
| Rate limiting                    | Transcribe and murmur kickoff have no rate limits                                 |
| Structured logging               | Route handlers use minimal error responses; add structured logs for production    |

## Suggested integration order

1. Wire **DeleteRunSheet** → `deleteRun` (quick win, API ready).
2. **M1 payloads** when Bridge delivers (unblocks idea detail accordion content).
3. **Settings save** — profile update route + optional `notification_prefs` JSON column.
4. **Push notifications** — after settings prefs exist.
5. **Search recents** — localStorage first, then server persistence.
