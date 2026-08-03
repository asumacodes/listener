"use client";

import { IconArrowRight } from "@/components/icons/ListenerIcons";
import { ui } from "@/lib/design/ui";
import type { LinkOutContent } from "@/types/pipeline-ui";

type PipelineLinkOutCardProps = {
  title: string;
  link: LinkOutContent;
  elevated?: boolean;
  /** When true, render as a row in a grouped results stack (no outer card border). */
  grouped?: boolean;
};

const isStandalonePwa = () => {
  if (typeof window === "undefined") return false;
  const displayStandalone = window.matchMedia(
    "(display-mode: standalone)"
  ).matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    );
  return displayStandalone || iosStandalone;
};

/** External links: `target=_blank` often no-ops in iOS/Android standalone PWAs. */
const openExternal = (href: string) => {
  if (isStandalonePwa()) {
    const opened = window.open(href, "_blank", "noopener,noreferrer");
    if (!opened) window.location.assign(href);
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
};

const PipelineLinkOutCard = ({
  title,
  link,
  elevated = true,
  grouped = false,
}: PipelineLinkOutCardProps) => (
  <div
    className={`${grouped ? ui.resultsRow : elevated ? ui.card : ui.cardFlat} px-5 py-4`}
  >
    <div className="flex items-start justify-between gap-3">
      <h3 className="font-serif text-lg text-text">{title}</h3>
      <span className="shrink-0 rounded-full bg-gold-10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gold-deep uppercase">
        Link
      </span>
    </div>
    <p className="mt-2 text-sm text-text-secondary">{link.meta}</p>
    {link.href ? (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold"
        onClick={(e) => {
          e.preventDefault();
          openExternal(link.href!);
        }}
      >
        {link.cta}
        <IconArrowRight size={14} className="shrink-0" />
      </a>
    ) : (
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
        {link.cta}
        <span className="text-xs">(link unavailable)</span>
      </span>
    )}
  </div>
);

export default PipelineLinkOutCard;
