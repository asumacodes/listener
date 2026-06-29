# Pipeline UI integration

Model 2 pipeline run surface reads **`pipelineStage`**, **`appState`**, and real `run_results` payloads to render an incremental card feed.

## Today

| Layer                              | Role                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `lib/pipeline/derive-ui-state.ts`  | Pure mapping: variant + stage → feed order, card states, title          |
| `lib/pipeline/cards.ts`            | Pipeline card order, stage map, loading-card mapping, and card metadata |
| `lib/ideas/run-results-content.ts` | Maps real `run_results` JSON into card content                          |
| `components/pipeline/run/*`        | Presentational cards and feed — no Supabase                             |
| `screens/PipelineRunScreen.tsx`    | Shell: header, scroll feed, completion/failure CTAs                     |

Card content comes from `run_results` where available. The **transcript** card uses the saved recording transcription as its stable source.

## Later

1. Add richer empty/error states for partial stage outputs.
2. Add explicit selected-run history behavior for older run snapshots.
3. Keep Jira / Confluence links tenant-aware as integration data evolves.

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
