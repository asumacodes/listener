"use client";

import ReadingPane from "@/components/desktop/ReadingPane";
import Button from "@/components/ui/Button";
import { useConfluenceRoadmap } from "@/hooks/useConfluenceRoadmap";
import { openExternal } from "@/lib/desktop/open-external";
import { formatShortDate } from "@/lib/format-date";
import { M1_CARDS } from "@/lib/ideas/cards";
import {
  buildConfluenceSpaceUrl,
  buildJiraProjectUrl,
  buildRoadmapPageUrl,
} from "@/lib/ideas/launchpad";
import type { RunResults } from "@/types/run-results";
import type { ReactNode } from "react";

type LinkOutPaneProps = {
  results: RunResults | null;
  streaming?: boolean;
  createdAt?: string | null;
};

type Stat = { value: string; label: string };

const LinkBadge = () => (
  <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[9px] font-medium tracking-[0.14em] text-muted uppercase">
    Link
  </span>
);

const LinkCta = ({ href, label }: { href: string | null; label: string }) =>
  href ? (
    <Button
      variant="primary"
      className="min-h-9! rounded-full! px-4! text-xs!"
      onClick={() => openExternal(href)}
    >
      {label} ↗
    </Button>
  ) : (
    <span className="text-[12px] text-muted">{label} (unavailable)</span>
  );

const Subtitle = ({ children }: { children: ReactNode }) => (
  <p className="text-[13px] leading-snug text-muted">{children}</p>
);

const StatsBar = ({ stats, blurb }: { stats: Stat[]; blurb: string }) => (
  <div className="flex flex-col gap-5 rounded-2xl bg-canvas px-6 py-5 sm:flex-row sm:items-center sm:gap-8 justify-between">
    <div className="flex flex-wrap items-stretch gap-0">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`px-5 first:pl-0 last:pr-0 ${
            i > 0 ? "border-l border-border" : ""
          }`}
        >
          <p className="font-serif text-[28px] leading-none text-text">
            {stat.value}
          </p>
          <p className="mt-1.5 text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
    <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-text-secondary sm:max-w-70 sm:text-right">
      {blurb}
    </p>
  </div>
);

const StatsBarSkeleton = () => (
  <div className="flex flex-col gap-5 rounded-2xl bg-canvas px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
    <div className="flex gap-8">
      <div className="space-y-2">
        <div className="h-7 w-10 animate-skeleton-shimmer rounded bg-border/40" />
        <div className="h-2.5 w-14 animate-skeleton-shimmer rounded bg-border/40" />
      </div>
      <div className="space-y-2 border-l border-border pl-5">
        <div className="h-7 w-10 animate-skeleton-shimmer rounded bg-border/40" />
        <div className="h-2.5 w-20 animate-skeleton-shimmer rounded bg-border/40" />
      </div>
    </div>
    <div className="h-10 w-full max-w-70 animate-skeleton-shimmer rounded bg-border/40" />
  </div>
);

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
    {children}
  </p>
);

const hostFromUrl = (url?: string | null): string | null => {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

const createdSuffix = (createdAt?: string | null): string => {
  if (!createdAt) return "";
  const d = formatShortDate(createdAt);
  return d ? ` · created ${d}` : "";
};

const DEGRADE_BLURB =
  "Open the roadmap in Confluence to edit phases and milestones — this pane only proves it exists.";

export const RoadmapLinkPane = ({
  results,
  streaming = false,
  createdAt = null,
}: LinkOutPaneProps) => {
  const confluence = results?.confluence ?? null;
  const roadmapPage = confluence?.pagesCreated?.find(
    (p) => p.title && /roadmap/i.test(p.title)
  );
  const pageId = roadmapPage?.id ?? null;
  const href = buildRoadmapPageUrl(
    confluence?.spaceUrl,
    confluence?.spaceKey,
    pageId
  );
  const host = hostFromUrl(confluence?.spaceUrl);
  const preview = useConfluenceRoadmap(pageId);

  const phases = preview.status === "ok" ? preview.data.phases : [];
  const milestoneCount =
    preview.status === "ok" ? preview.data.milestoneCount : 0;
  const blurb =
    preview.status === "ok"
      ? (preview.data.blurb ?? DEGRADE_BLURB)
      : DEGRADE_BLURB;

  return (
    <ReadingPane
      variant="wide"
      eyebrow={`${streaming ? "Streaming · " : ""}Artifact 06 · ${M1_CARDS.roadmap.title}`}
      badge={<LinkBadge />}
      title={M1_CARDS.roadmap.title}
      subtitle={
        <Subtitle>
          {host
            ? `Confluence page in ${host}`
            : roadmapPage?.title
              ? `${roadmapPage.title} in your workspace`
              : "Phased delivery plan in your Confluence space"}
          {createdSuffix(createdAt)}
        </Subtitle>
      }
      actions={<LinkCta href={href} label="View roadmap" />}
    >
      {!pageId && !href ? (
        <p className="text-sm text-muted">
          Roadmap page is not available for this run yet.
        </p>
      ) : (
        <div className="space-y-8">
          {preview.status === "loading" ? (
            <>
              <StatsBarSkeleton />
              <div>
                <SectionLabel>What&apos;s in it</SectionLabel>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-28 animate-skeleton-shimmer rounded-2xl border border-border bg-border/20"
                    />
                  ))}
                </div>
              </div>
            </>
          ) : phases.length ? (
            <>
              <StatsBar
                stats={[
                  { value: String(phases.length), label: "Phases" },
                  {
                    value: String(milestoneCount || "—"),
                    label: "Milestones",
                  },
                ]}
                blurb={blurb}
              />
              <div>
                <SectionLabel>What&apos;s in it</SectionLabel>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {phases.map((phase) => (
                    <div
                      key={`${phase.label}-${phase.title}`}
                      className="rounded-2xl border border-border bg-white px-4 py-4"
                    >
                      <p className="text-[10px] font-medium tracking-[0.14em] text-gold uppercase">
                        {phase.label}
                      </p>
                      <p className="mt-2 font-serif text-[18px] leading-snug text-text">
                        {phase.title}
                      </p>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-text-secondary">
                        {phase.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {preview.status === "ok" && preview.data.excerpt ? (
                <p className="text-[14px] leading-relaxed text-text-secondary">
                  {preview.data.excerpt}
                </p>
              ) : null}
              <p className="text-[13px] leading-relaxed text-text-secondary">
                {preview.status === "error"
                  ? preview.code === "atlassian_disconnected" ||
                    preview.code === "atlassian_unauthorized"
                    ? "Reconnect Atlassian in Settings to preview this roadmap here."
                    : DEGRADE_BLURB
                  : DEGRADE_BLURB}
              </p>
            </div>
          )}
        </div>
      )}
    </ReadingPane>
  );
};

export const JiraLinkPane = ({
  results,
  streaming = false,
  createdAt = null,
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
      eyebrow={`${streaming ? "Streaming · " : ""}Artifact 07 · ${M1_CARDS.jira.title}`}
      badge={<LinkBadge />}
      title={M1_CARDS.jira.title}
      subtitle={
        jira?.projectKey ? (
          <Subtitle>
            Board {jira.projectKey}
            {jira.projectName ? ` · ${jira.projectName}` : ""} in your workspace
            {createdSuffix(createdAt)}
          </Subtitle>
        ) : null
      }
      actions={<LinkCta href={href} label="View in Jira" />}
    >
      {!jira?.projectKey ? (
        <p className="text-sm text-muted">
          Jira project was not created for this run.
        </p>
      ) : (
        <div className="space-y-8">
          <StatsBar
            stats={[
              { value: String(stories.length), label: "Issues" },
              { value: String(epics.length), label: "Epics" },
            ]}
            blurb="Yours to edit, assign, and estimate — it's a real board in your tenant."
          />
          <div>
            <SectionLabel>Epics created</SectionLabel>
            <ul className="mt-3">
              {epics.length ? (
                epics.map((epic, i) => {
                  const key = epic.key ?? `${jira.projectKey}-${i + 1}`;
                  const count = storiesForEpic(epic.key);
                  return (
                    <li
                      key={key}
                      className="grid grid-cols-[minmax(5.5rem,auto)_1fr_auto] items-baseline gap-4 border-b border-border py-3.5 last:border-b-0"
                    >
                      <span className="whitespace-nowrap text-[12px] tracking-[0.02em] text-muted">
                        {key}
                      </span>
                      <span className="min-w-0 text-[15px] font-medium text-text">
                        {epic.title ?? "Epic"}
                      </span>
                      <span className="text-[12px] text-muted">
                        {count > 0 ? `${count} issues` : "—"}
                      </span>
                    </li>
                  );
                })
              ) : (
                <li className="py-3 text-sm text-muted">No epics listed.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </ReadingPane>
  );
};

export const ConfluenceLinkPane = ({
  results,
  streaming = false,
  createdAt = null,
}: LinkOutPaneProps) => {
  const confluence = results?.confluence ?? null;
  const href = buildConfluenceSpaceUrl(confluence?.spaceUrl);
  const pages = confluence?.pagesCreated ?? [];
  const spaceLabel = confluence?.spaceKey
    ? confluence.spaceKey
    : results?.brand?.brandName
      ? `'${results.brand.brandName}'`
      : null;

  return (
    <ReadingPane
      variant="wide"
      eyebrow={`${streaming ? "Streaming · " : ""}Artifact 08 · ${M1_CARDS.confluence.title}`}
      badge={<LinkBadge />}
      title={M1_CARDS.confluence.title}
      subtitle={
        spaceLabel ? (
          <Subtitle>
            Space {spaceLabel}
            {createdSuffix(createdAt)}
          </Subtitle>
        ) : null
      }
      actions={<LinkCta href={href} label="View in Confluence" />}
    >
      {!confluence?.spaceUrl && !confluence?.spaceKey ? (
        <p className="text-sm text-muted">
          Confluence space was not created for this run.
        </p>
      ) : (
        <div className="space-y-8">
          <StatsBar
            stats={[
              { value: String(pages.length), label: "Pages" },
              { value: "1", label: "Space" },
            ]}
            blurb="The PRD, brief, and roadmap live here too — one place to bring the team in."
          />
          <div>
            <SectionLabel>Pages created</SectionLabel>
            <ul className="mt-3">
              {pages.length ? (
                pages.map((p) => (
                  <li
                    key={p.id ?? p.title}
                    className="flex items-center gap-3 border-b border-border py-3.5 last:border-b-0"
                  >
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-gold"
                      aria-hidden
                    />
                    <span className="text-[15px] text-text">
                      {p.title ?? "Untitled page"}
                    </span>
                  </li>
                ))
              ) : (
                <li className="py-3 text-sm text-muted">No pages listed.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </ReadingPane>
  );
};
