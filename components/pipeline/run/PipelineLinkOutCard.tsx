"use client";

import Button from "@/components/ui/Button";
import { openExternal } from "@/lib/desktop/open-external";
import { ui } from "@/lib/design/ui";
import { formatShortDate } from "@/lib/format-date";
import type { LinkOutContent } from "@/types/pipeline-ui";

type PipelineLinkOutCardProps = {
  title: string;
  link: LinkOutContent;
  elevated?: boolean;
  /** When true, render as a row in a grouped results stack (no outer card border). */
  grouped?: boolean;
  /** Run creation time — adds "· created {date}" to the subtitle. */
  createdAt?: string | null;
};

const JIRA_BLURB =
  "Yours to edit, assign, and estimate — it's a real board in your tenant.";

/** Desktop LinkOutPanes LinkBadge, kept local so the desktop tree stays untouched. */
const LinkBadge = () => (
  <span className="inline-flex shrink-0 items-center rounded-md border border-border px-1.5 py-0.5 text-[9px] font-medium tracking-[0.14em] text-muted uppercase">
    Link
  </span>
);

const StatsBlock = ({
  stats,
  blurb,
}: {
  stats: NonNullable<LinkOutContent["stats"]>;
  blurb?: string;
}) => (
  <div className="mt-4 rounded-2xl bg-canvas px-5 py-4">
    <div className="flex items-stretch">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`px-4 first:pl-0 last:pr-0 ${i > 0 ? "border-l border-border" : ""}`}
        >
          <p className={ui.figureLg}>{stat.value}</p>
          <p className="mt-1.5 text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
    {blurb ? (
      <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
        {blurb}
      </p>
    ) : null}
  </div>
);

const PageTiles = ({
  pages,
}: {
  pages: NonNullable<LinkOutContent["pages"]>;
}) => (
  <ul className="mt-4 grid grid-cols-2 gap-2.5">
    {pages.map((page, i) => {
      const inner = (
        <>
          <div className="flex items-start justify-between gap-2">
            <span className="font-serif text-[22px] leading-none text-muted/45">
              {page.index}
            </span>
            <span className="text-[10px] font-medium tracking-[0.14em] text-gold uppercase">
              {page.kind}
            </span>
          </div>
          <p className="mt-2.5 font-serif text-[17px] leading-snug text-text">
            {page.name}
          </p>
          {page.href ? (
            <p className="mt-2 text-[11px] tracking-[0.04em] text-muted">
              Open page ↗
            </p>
          ) : null}
        </>
      );
      const tile =
        "flex h-full w-full flex-col rounded-2xl border border-border bg-surface px-3.5 py-3.5 text-left";
      return (
        <li key={`${page.index}-${page.name}-${i}`}>
          {page.href ? (
            <button
              type="button"
              onClick={() => openExternal(page.href!)}
              className={`${tile} transition hover:border-gold/35 focus-visible:ring-2 focus-visible:ring-(--gold-30) focus-visible:outline-none`}
            >
              {inner}
            </button>
          ) : (
            <div className={tile}>{inner}</div>
          )}
        </li>
      );
    })}
  </ul>
);

const PipelineLinkOutCard = ({
  title,
  link,
  elevated = true,
  grouped = false,
  createdAt = null,
}: PipelineLinkOutCardProps) => {
  const created = createdAt ? formatShortDate(createdAt) : "";
  const subtitle = link.subtitle
    ? `${link.subtitle}${created ? ` · created ${created}` : ""}`
    : null;

  return (
    <div
      className={`${grouped ? ui.resultsRow : elevated ? ui.card : ui.cardFlat} px-5 pt-4 pb-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-xl text-text">{title}</h3>
        <LinkBadge />
      </div>
      {subtitle ? (
        <p className="mt-1 text-[13px] leading-snug text-muted">{subtitle}</p>
      ) : null}

      {link.stats?.length ? (
        <StatsBlock
          stats={link.stats}
          blurb={link.kind === "jira" ? JIRA_BLURB : undefined}
        />
      ) : link.pages?.length ? (
        <PageTiles pages={link.pages} />
      ) : (
        <p className="mt-2 text-sm text-text-secondary">{link.meta}</p>
      )}

      <div className="mt-4">
        {link.href ? (
          <Button
            variant="primary"
            className="min-h-11! rounded-full! px-5! text-[13px]!"
            onClick={() => openExternal(link.href!)}
          >
            {link.cta} ↗
          </Button>
        ) : (
          <span className="text-[12px] text-muted">
            {link.cta} (unavailable)
          </span>
        )}
      </div>
    </div>
  );
};

export default PipelineLinkOutCard;
