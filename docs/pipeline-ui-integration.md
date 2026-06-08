# Pipeline UI integration

Model 2 pipeline run surface reads **`pipelineStage`** and **`appState`** from `usePipelineRun` and renders an incremental card feed. Bridge payload wiring is not implemented yet.

## Today

| Layer                             | Role                                                              |
| --------------------------------- | ----------------------------------------------------------------- |
| `lib/pipeline/derive-ui-state.ts` | Pure mapping: variant + stage → feed order, card states, title    |
| `lib/pipeline/mock-data.ts`       | Mock PIPE content; transcript overridden with real recording text |
| `components/pipeline/run/*`       | Presentational cards and feed — no Supabase                       |
| `screens/PipelineRunScreen.tsx`   | Shell: header, scroll feed, completion/failure CTAs               |

Card content comes from `getMockCardContent()` except the **transcript** card, which uses the user's transcription at runtime.

## Later

1. Add `lib/pipeline/run-payload.ts` to map Bridge / run-row JSON into the same `PipelineCardContent` union defined in `types/pipeline-ui.ts`.
2. Replace `getMockCardContent()` calls in `PipelineCardFeed` with payload getters keyed by `runId` (or inline payload on the run row).
3. Set real `href` values on Jira / Confluence link-out cards when URLs exist.

No hook changes are required for v1 UI: `usePipelineRun` already updates `pipelineStage` via Realtime; components only need richer payloads when Bridge stores them.

## Feed ordering

- **Running / failed:** dropped cards newest-first; active loading card pinned above.
- **Complete:** all cards in canonical `PIPELINE_CARD_ORDER` (transcript → … → confluence).

## Stage → cards

Post-submit stages (transcribing normalized to researching):

| Stage             | Cards populated on completion          |
| ----------------- | -------------------------------------- |
| `researching`     | Competitors                            |
| `writing_prd`     | PRD                                    |
| `designing_brand` | Brand                                  |
| `building_board`  | Engineering, Roadmap, Jira, Confluence |

Transcript is populated immediately when the pipeline starts.
