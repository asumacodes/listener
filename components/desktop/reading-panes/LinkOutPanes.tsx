"use client";

import ReadingPane from "@/components/desktop/ReadingPane";
import Button from "@/components/ui/Button";
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

type PhaseCard = {
  label: string;
  title: string;
  body: string;
};

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

/** Group Jira stories by phase when the agent tagged them. */
const phasesFromStories = (
  stories: NonNullable<RunResults["jira"]>["storiesCreated"]
): PhaseCard[] => {
  if (!stories?.length) return [];
  const order: string[] = [];
  const counts = new Map<string, number>();
  for (const s of stories) {
    const raw = s.phase;
    const phase =
      typeof raw === "string"
        ? raw.trim()
        : typeof raw === "number"
          ? String(raw)
          : "";
    if (!phase) continue;
    if (!counts.has(phase)) {
      order.push(phase);
      counts.set(phase, 0);
    }
    counts.set(phase, (counts.get(phase) ?? 0) + 1);
  }
  return order.map((title, i) => {
    const n = counts.get(title) ?? 0;
    return {
      label: `Phase ${i + 1}`,
      title,
      body: `${n} milestone${n === 1 ? "" : "s"}`,
    };
  });
};

/** Fall back: one card per epic. */
const phasesFromEpics = (
  epics: NonNullable<RunResults["jira"]>["epicsCreated"],
  stories: NonNullable<RunResults["jira"]>["storiesCreated"]
): PhaseCard[] => {
  if (!epics?.length) return [];
  return epics.slice(0, 6).map((epic, i) => {
    const n = stories?.filter((s) => s.epic === epic.key).length ?? 0;
    return {
      label: `Phase ${i + 1}`,
      title: epic.title ?? `Epic ${i + 1}`,
      body:
        n > 0
          ? `${n} milestone${n === 1 ? "" : "s"}`
          : "Open in Confluence for detail",
    };
  });
};

export const RoadmapLinkPane = ({
  results,
  streaming = false,
  createdAt = null,
}: LinkOutPaneProps) => {
  const confluence = results?.confluence ?? null;
  const jira = results?.jira ?? null;
  const roadmapPage = confluence?.pagesCreated?.find(
    (p) => p.title && /roadmap/i.test(p.title)
  );
  const href = buildRoadmapPageUrl(
    confluence?.spaceUrl,
    confluence?.spaceKey,
    roadmapPage?.id
  );
  const host = hostFromUrl(confluence?.spaceUrl);
  const stories = jira?.storiesCreated ?? [];
  const epics = jira?.epicsCreated ?? [];
  const storyPhases = phasesFromStories(stories);
  const phases =
    storyPhases.length > 0 ? storyPhases : phasesFromEpics(epics, stories);
  const milestoneCount =
    stories.length ||
    results?.engineering?.engineeringTasks?.length ||
    phases.reduce((sum, p) => {
      const m = p.body.match(/^(\d+)/);
      return sum + (m ? Number(m[1]) : 0);
    }, 0);

  const stats: Stat[] = [
    { value: String(phases.length || "—"), label: "Phases" },
    {
      value: String(milestoneCount || "—"),
      label: "Milestones",
    },
  ];

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
      {!href && !phases.length ? (
        <p className="text-sm text-muted">
          Roadmap page is not available for this run yet.
        </p>
      ) : (
        <div className="space-y-8">
          <StatsBar
            stats={stats}
            blurb="Phased delivery plan, written as a Confluence page you can edit with your team."
          />
          {phases.length ? (
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
          ) : (
            <p className="text-[13px] leading-relaxed text-text-secondary">
              Open the roadmap in Confluence to edit phases and milestones —
              this pane only proves it exists.
            </p>
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
