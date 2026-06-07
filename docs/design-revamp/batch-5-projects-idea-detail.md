# Batch 5 — Projects + IdeaDetail + Run History

## Scope

Projects tab, project detail, IdeaDetail with KAN-36 artifacts, run history per idea.

## Routes

| Route                                     | Screen                                           |
| ----------------------------------------- | ------------------------------------------------ |
| `/projects`                               | Project list                                     |
| `/projects/[id]`                          | Project detail (idea list rows)                  |
| `/ideas/[recordingId]` or `/runs/[runId]` | **IdeaDetail** (canonical — confirm with mockup) |

Search deep-link: **IdeaDetail directly** (locked decision).

## Files

| Action       | Path                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| Reskin       | `components/projects/ProjectListView.tsx`, `ProjectFormSheet.tsx`                 |
| Reskin       | `components/projects/ProjectDetailView.tsx` — list rows use `ListRowCard` pattern |
| **New**      | `app/(app)/ideas/[recordingId]/page.tsx` OR expand `/runs/[runId]`                |
| **New**      | `components/ideas/IdeaDetailView.tsx`                                             |
| **New**      | `components/ideas/RunHistoryList.tsx`                                             |
| **New**      | `lib/runs/server.ts` — fetch run_results by recording/run                         |
| **New**      | `lib/runs/client.ts` — delete run                                                 |
| Replace stub | `app/(app)/runs/[runId]/page.tsx`                                                 |
| Update       | `components/search/SearchView.tsx` — link to IdeaDetail                           |

## IdeaDetail sections (KAN-36)

- Transcript + audio playback
- PRD markdown / sections
- Brand kit
- Jira board link or embed
- Run history (status pills: ready, mapping, error)

## Copy sheet

| Key             | String                             |
| --------------- | ---------------------------------- |
| project.empty   | No recordings in this project yet. |
| idea.runHistory | Run history                        |
| idea.latestRun  | Latest run                         |
| status.ready    | Ready                              |
| status.mapping  | Mapping                            |
| status.error    | Error                              |

## Backend deps

- **Required:** `run_results` table + RLS read by user
- Server loader: `getIdeaDetail(recordingId)` batching recording, runs, results
- Delete run API for ConfirmSheet (batch 7)

## Acceptance

- [ ] Search result opens IdeaDetail
- [ ] Project detail row opens IdeaDetail
- [ ] Stepper complete → IdeaDetail
- [ ] Run history shows past pipeline runs with status badges
- [ ] Empty/error states for missing KAN-36 data graceful
