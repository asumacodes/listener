# PR #8 screenshots

Before/after captures for [asumacodes/listener#8](https://github.com/asumacodes/listener/pull/8)
(KAN-80 mobile Idea-view refresh + honest run states).

This is an orphan branch that holds only images. It is not meant to be merged.

- `before-*.png`: `main` @ `e131bc4`
- `after-*.png`: `feat/kan-80-mobile-consumption-refresh` @ `33713e8`

How they were made: a temporary, uncommitted fixture page at `/debug/kan-80-shots`
rendered the real `LatestRunDashboard`, `PipelineCardFeed`, `PrdPane` and
`DesktopIdeaHeader` components against hard-coded fixtures ("Neighbourhood tool
library" / Shedline) on `next dev` with no backend. Playwright + Chromium captured
the mobile shots at 375×812, DPR 2, and the desktop shots at 1280 wide, DPR 1,
after `document.fonts.ready`.

| File suffix | Scenario |
| --- | --- |
| `done` | Done run: Transcript + PRD open |
| `metrics` | Done run, real model success metrics (mobile PRD card) |
| `done-links` | Done run: PRD Download/Copy row through the Roadmap, Jira and Confluence rows |
| `queued` | Queued run, no stage yet |
| `running-prd` | Running, `writing_prd` |
| `failed-prd` | Failed at `writing_prd` |
| `empty` | Done run with empty competitors, brand and roadmap |
| `feed-queued` | `PipelineCardFeed`, running variant with no stage yet |
| `desktop-prd-metrics` | Desktop `PrdPane`, success-metrics section |
| `desktop-header-queued` | Desktop `DesktopIdeaHeader`, `fill="queued"` |
