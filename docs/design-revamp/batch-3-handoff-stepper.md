# Batch 3 — Handoff + Stepper (Model 2)

## Scope

**Handoff** replaces SubmittingScreen (placeholder slot; art later). **StepperSurface** replaces PipelineRunning/Done/Failed with pipeline SVG illustrations (ill-1 … ill-5).

## Illustrations

| Stage           | Component                    | Copy eyebrow |
| --------------- | ---------------------------- | ------------ |
| transcribing    | `TranscribingIllustration`   | Stage 1 of 5 |
| researching     | `ResearchingIllustration`    | Stage 2 of 5 |
| writing_prd     | `WritingPrdIllustration`     | Stage 3 of 5 |
| designing_brand | `DesigningBrandIllustration` | Stage 4 of 5 |
| building_board  | `BuildingBoardIllustration`  | Stage 5 of 5 |

Implemented in [`components/illustrations/pipeline/`](../components/illustrations/pipeline/) with CSS motion from Design System HTML.

## State mapping

| `AppState`         | Surface                   | Notes                                    |
| ------------------ | ------------------------- | ---------------------------------------- |
| `SUBMITTING`       | `HandoffScreen`           | Visual only; hooks still transcribe+save |
| `PIPELINE_RUNNING` | `StepperSurface` partial  | stage from `pipelineStage`               |
| `PIPELINE_DONE`    | `StepperSurface` complete | link → IdeaDetail                        |
| `PIPELINE_FAILED`  | `StepperSurface` failed   | retry handoff                            |

## Stepper stages (post-submit)

All five `PipelineStage` values including `transcribing` — aligned with Bridge events and ill-1 … ill-5.

1. transcribing — `TranscribingIllustration` (ill-1)
2. researching — `ResearchingIllustration` (ill-2)
3. writing_prd — `WritingPrdIllustration` (ill-3)
4. designing_brand — `DesigningBrandIllustration` (ill-4)
5. building_board — `BuildingBoardIllustration` (ill-5)

## Seven UI variants (Model 2)

Map from mockups when received; typical set:

1. Opening — first stage animating in
2. Partial — mid-progress, earlier stages complete
3. Complete — all stages done, CTA to IdeaDetail
4. Stage failed — `stage_failed` event
5. Handoff failed — pre-stepper (`PIPELINE_FAILED` + no run)
6. Retry offered — recoverable handoff
7. Non-retryable — `not_retryable` reason

## Files

| Action       | Path                                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **New**      | `screens/HandoffScreen.tsx`                                                                                                                                               |
| **New**      | `components/pipeline/StepperSurface.tsx`                                                                                                                                  |
| **New**      | `components/pipeline/StageList.tsx`, `StageRow.tsx`                                                                                                                       |
| **New**      | `types/stepper.ts` — variant enum derived from run + events                                                                                                               |
| **New**      | `lib/pipeline/stepper-ui.ts` — pure mapping from `DerivedPipelineUi`                                                                                                      |
| Replace      | `screens/SubmittingScreen.tsx`, `PipelineRunningScreen.tsx`, `PipelineDoneScreen.tsx`, `PipelineFailedScreen.tsx` (removed; superseded by HandoffScreen + StepperSurface) |
| Wire         | `components/RenderScreen.tsx`                                                                                                                                             |
| Hook         | `hooks/usePipelineRun.ts` — unchanged; Stepper reads state                                                                                                                |
| Illustration | `pipeline-stepper`, `handoff`                                                                                                                                             |

## Copy sheet

| Key                  | String                            |
| -------------------- | --------------------------------- |
| handoff.title        | Sending your idea…                |
| handoff.sub          | Transcribing and saving securely. |
| stepper.title        | Mapping your idea                 |
| stepper.complete     | Your idea is ready                |
| stepper.viewResults  | View results                      |
| stepper.newRecording | New recording                     |
| stepper.retry        | Try again                         |
| stepper.failed       | Something went wrong              |

Stage labels: use `stageLabel()` from `types/pipeline.ts`.

## Motion

- Handoff: placeholder slot (art deferred); no pipeline illustration
- Stepper: SVG + CSS keyframes (`illustration-motion.css`); progress track shimmer; 0.25s crossfade on stage swap
- Reduced motion: static SVG frame via `.ill-static` / `prefers-reduced-motion`

## Backend deps

- `usePipelineRun` + Realtime (exists)
- `useMurmurActions` kickoff/retry (exists)
- No new API for UI-only batch

## No-go

- Do not derive pipeline state client-only

## Acceptance

- [ ] Confirm → Handoff → Transcript (Stepper only after kickoff)
- [ ] Run pipeline → Stepper through all 5 stages including transcribing
- [ ] Tab refresh mid-run restores Stepper via `useSessionRestore`
- [ ] Failed handoff vs failed stage visually distinct
- [ ] Complete navigates to IdeaDetail/run route
