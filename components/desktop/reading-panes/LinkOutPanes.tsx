"use client";

import ReadingPane from "@/components/desktop/ReadingPane";
import Button from "@/components/ui/Button";
import { openExternal } from "@/lib/desktop/open-external";
import { M1_CARDS } from "@/lib/ideas/cards";
import {
  buildConfluenceSpaceUrl,
  buildJiraProjectUrl,
  buildRoadmapPageUrl,
} from "@/lib/ideas/launchpad";
import type { RunResults } from "@/types/run-results";

type LinkOutPaneProps = {
  results: RunResults | null;
  streaming?: boolean;
};

const LinkCta = ({ href, label }: { href: string | null; label: string }) =>
  href ? (
    <Button
      className="!min-h-9 !rounded-full !px-4 !text-xs"
      onClick={() => openExternal(href)}
    >
      {label} ↗
    </Button>
  ) : (
    <span className="text-[12px] text-muted">{label} (unavailable)</span>
  );

const SummaryBar = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-2xl border border-border bg-canvas px-5 py-3.5">
    {items.map((item) => (
      <span
        key={item}
        className="text-[13px] font-medium tracking-[0.04em] text-text uppercase"
      >
        {item}
      </span>
    ))}
  </div>
);

export const RoadmapLinkPane = ({
  results,
  streaming = false,
}: LinkOutPaneProps) => {
  const confluence = results?.confluence ?? null;
  const roadmapPage = confluence?.pagesCreated?.find(
    (p) => p.title && /roadmap/i.test(p.title)
  );
  const href = buildRoadmapPageUrl(
    confluence?.spaceUrl,
    confluence?.spaceKey,
    roadmapPage?.id
  );
  const pages = confluence?.pagesCreated ?? [];
  const phasePages = pages.filter((p) => p.title && !/roadmap/i.test(p.title));

  return (
    <ReadingPane
      variant="wide"
      eyebrow={`${streaming ? "Streaming · " : ""}Artifact 06 · ${M1_CARDS.roadmap.title} · Link`}
      title={M1_CARDS.roadmap.title}
      actions={<LinkCta href={href} label="View roadmap" />}
    >
      {!href && !pages.length ? (
        <p className="text-sm text-muted">
          Roadmap page is not available for this run yet.
        </p>
      ) : (
        <div className="max-w-[720px] space-y-6">
          <p className="text-[14px] text-text-secondary">
            {roadmapPage?.title
              ? `${roadmapPage.title} in your workspace`
              : "Phased delivery plan in your Confluence space"}
          </p>
          <SummaryBar
            items={[
              `${Math.max(phasePages.length, pages.length)} pages`,
              confluence?.spaceKey ? `Space ${confluence.spaceKey}` : "1 space",
            ]}
          />
          <div>
            <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
              What&apos;s in it
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(phasePages.length ? phasePages : pages).slice(0, 8).map((p) => (
                <div
                  key={p.id ?? p.title}
                  className="rounded-xl border border-border bg-surface px-4 py-3 text-[13px] text-text"
                >
                  {p.title ?? "Untitled page"}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            Open the roadmap in Confluence to edit phases and milestones — this
            pane only proves it exists.
          </p>
        </div>
      )}
    </ReadingPane>
  );
};

export const JiraLinkPane = ({
  results,
  streaming = false,
}: LinkOutPaneProps) => {
  const jira = results?.jira ?? null;
  const href = buildJiraProjectUrl(
    jira?.projectKey,
    jira?.siteUrl ?? results?.confluence?.spaceUrl
  );
  const epics = jira?.epicsCreated ?? [];
  const stories = jira?.storiesCreated ?? [];
  const storiesForEpic = (epicKey: string | undefined) =>
    stories.filter((s) => s.epic === epicKey).length;

  return (
    <ReadingPane
      variant="wide"
      eyebrow={`${streaming ? "Streaming · " : ""}Artifact 07 · ${M1_CARDS.jira.title} · Link`}
      title={M1_CARDS.jira.title}
      actions={<LinkCta href={href} label="View in Jira" />}
    >
      {!jira?.projectKey ? (
        <p className="text-sm text-muted">
          Jira project was not created for this run.
        </p>
      ) : (
        <div className="max-w-[720px] space-y-6">
          <p className="text-[14px] text-text-secondary">
            Board {jira.projectKey}
            {jira.projectName ? ` · ${jira.projectName}` : ""} in your workspace
          </p>
          <SummaryBar
            items={[`${stories.length} issues`, `${epics.length} epics`]}
          />
          <div>
            <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
              Epics created
            </p>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {epics.length ? (
                epics.map((epic, i) => (
                  <li
                    key={epic.key ?? i}
                    className="flex items-center gap-3 py-3 text-[14px]"
                  >
                    <span className="w-16 shrink-0 text-muted">
                      {epic.key ?? `${jira.projectKey}-${i + 1}`}
                    </span>
                    <span className="min-w-0 flex-1 text-text">
                      {epic.title ?? "Epic"}
                    </span>
                    <span className="shrink-0 text-[12px] text-muted">
                      {storiesForEpic(epic.key) || "—"} issues
                    </span>
                  </li>
                ))
              ) : (
                <li className="py-3 text-sm text-muted">No epics listed.</li>
              )}
            </ul>
          </div>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            Issues are ready in your tenant — open Jira to refine and assign.
          </p>
        </div>
      )}
    </ReadingPane>
  );
};

export const ConfluenceLinkPane = ({
  results,
  streaming = false,
}: LinkOutPaneProps) => {
  const confluence = results?.confluence ?? null;
  const href = buildConfluenceSpaceUrl(confluence?.spaceUrl);
  const pages = confluence?.pagesCreated ?? [];

  return (
    <ReadingPane
      variant="wide"
      eyebrow={`${streaming ? "Streaming · " : ""}Artifact 08 · ${M1_CARDS.confluence.title} · Link`}
      title={M1_CARDS.confluence.title}
      actions={<LinkCta href={href} label="View in Confluence" />}
    >
      {!confluence?.spaceUrl && !confluence?.spaceKey ? (
        <p className="text-sm text-muted">
          Confluence space was not created for this run.
        </p>
      ) : (
        <div className="max-w-[720px] space-y-6">
          <p className="text-[14px] text-text-secondary">
            Space {confluence.spaceKey ?? "—"} in your workspace
          </p>
          <SummaryBar items={[`${pages.length} pages`, "1 space"]} />
          <div>
            <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
              Pages created
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] text-text">
              {pages.length ? (
                pages.map((p) => (
                  <li key={p.id ?? p.title}>{p.title ?? "Untitled page"}</li>
                ))
              ) : (
                <li className="list-none text-muted">No pages listed.</li>
              )}
            </ul>
          </div>
          <p className="text-[13px] leading-relaxed text-text-secondary">
            Docs live in your Confluence space — open them to edit with your
            team.
          </p>
        </div>
      )}
    </ReadingPane>
  );
};
