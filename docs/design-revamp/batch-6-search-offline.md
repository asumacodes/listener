# Batch 6 — Search + Offline

## Scope

Search tab reskin, offline full-screen takeover.

## Files

| Action       | Path                                                                  |
| ------------ | --------------------------------------------------------------------- |
| Reskin       | `components/search/SearchView.tsx` — Input, ListRowCard, empty states |
| Reskin       | `components/OfflineOverlay.tsx`                                       |
| Wire         | `hooks/useRecordingHistory.ts` — unchanged                            |
| Update links | Search → `/ideas/[recordingId]`                                       |

## Copy sheet

| Key                 | String                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| search.placeholder  | Search recordings…                                                                                       |
| search.recent       | Recent                                                                                                   |
| search.noMatches    | No matches                                                                                               |
| search.noRecordings | No recordings yet.                                                                                       |
| offline.title       | You're offline                                                                                           |
| offline.body        | Listener needs a connection to record, transcribe, and save. Everything resumes when you're back online. |
| offline.retry       | Try again                                                                                                |

## Motion

- Offline: fade-in full takeover (no slide)
- Search results: stagger optional (GSAP) — keep minimal on mobile

## Backend deps

- `search_recordings` RPC must exist in Supabase

## Acceptance

- [ ] Offline blocks all routes at z-60
- [ ] Search empty + no matches match tone of voice
- [ ] Deep-link goes to IdeaDetail not project hash
