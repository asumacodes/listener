# Batch 2 — Transcript + Copy + Project Sheet

## Scope

Four transcript variants, copy CTA, corrected "Add to a project" sheet (list + create-new).

## Variants

| #   | Variant                  | Trigger             | UI                                   |
| --- | ------------------------ | ------------------- | ------------------------------------ |
| 1   | Truncated inline         | word count > 42     | line-clamp + "Read full idea"        |
| 2   | Long-scroll sheet        | tap Read full       | `BottomSheet` full transcript        |
| 3   | Filed / project assigned | non-default project | hide file prompt; show status        |
| 4   | Pipeline CTA             | recording saved     | primary "Run pipeline" + footer CTAs |

## Files

| Action       | Path                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| Reskin       | `screens/TranscriptionScreen.tsx`                                         |
| **Replace**  | `components/ProjectPickerView.tsx` → sheet-based `ProjectPickerSheet.tsx` |
| Reskin       | `components/TranscriptionFooter.tsx`, `components/CopyButton.tsx`         |
| Reskin       | `components/ui/CtaBar.tsx`                                                |
| Hook         | `hooks/useProjectPicker.ts` — open sheet, list + create flow              |
| Illustration | optional `transcript-review` in card header                               |

## Copy sheet

| Key                     | String                                                       |
| ----------------------- | ------------------------------------------------------------ |
| transcript.pill         | Transcription · {language}                                   |
| transcript.readFull     | Read full idea                                               |
| transcript.sheetTitle   | Your idea                                                    |
| transcript.copy         | Copy                                                         |
| transcript.copyDone     | Copied                                                       |
| transcript.newRecording | New recording                                                |
| transcript.runPipeline  | Run pipeline                                                 |
| filePrompt.title        | File this recording?                                         |
| filePrompt.body         | It's still in Uncategorised. Pick a project, or start fresh. |
| filePrompt.skip         | Skip — keep in Uncategorised                                 |
| projectSheet.title      | Add to a project                                             |
| projectSheet.create     | New project                                                  |

## Motion

- Sheet: 280ms slide up (existing `BottomSheet`)
- Copy toast: 2s fade (optional success surface)

## Backend deps

- `lib/projects.ts` — list, create, assign (exists)
- Default project gate on new recording (keep behavior)

## No-go

- Do not remove uncategorised filing gate
- Inline chips removed only when sheet mockup approved

## Acceptance

- [ ] All 4 variants reachable in dev
- [ ] Copy button uses secondary full-width in CtaBar
- [ ] Project sheet: existing list + create-new in one surface
- [ ] Language pill uses gold/10 badge pattern
