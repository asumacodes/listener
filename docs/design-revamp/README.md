# Design Revamp — Build Cards Index

Locked decisions and batch order live in the intake plan. This folder holds **implementation build cards** produced per batch.

| Batch | Doc                                                                          | Status            |
| ----- | ---------------------------------------------------------------------------- | ----------------- |
| 0     | [batch-0-foundations.md](./batch-0-foundations.md)                           | Implemented       |
| 1     | [batch-1-auth-capture.md](./batch-1-auth-capture.md)                         | Ready for mockups |
| 2     | [batch-2-transcript-project-sheet.md](./batch-2-transcript-project-sheet.md) | Ready for mockups |
| 3     | [batch-3-handoff-stepper.md](./batch-3-handoff-stepper.md)                   | Ready for mockups |
| 4     | [batch-4-rehydration.md](./batch-4-rehydration.md)                           | Ready for mockups |
| 5     | [batch-5-projects-idea-detail.md](./batch-5-projects-idea-detail.md)         | Ready for mockups |
| 6     | [batch-6-search-offline.md](./batch-6-search-offline.md)                     | Ready for mockups |
| 7     | [batch-7-account-confirm-sheets.md](./batch-7-account-confirm-sheets.md)     | Ready for mockups |

## Locked decisions

- Mobile-first (~390px record tab)
- Lottie (illustrations) + GSAP (UI motion)
- Handoff replaces Submitting; Stepper is post-submit pipeline only
- IdeaDetail uses KAN-36 artifacts
- ConfirmSheets: delete project, recording, run, account
- Search → IdeaDetail directly

## Architecture

Hooks orchestrate, lib executes. `AppState` unchanged. Revamp is presentation + new routes only.
