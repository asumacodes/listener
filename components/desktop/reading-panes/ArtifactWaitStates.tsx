"use client";

import StageIllustration from "@/components/illustrations/pipeline/StageIllustration";
import ReadingPane from "@/components/desktop/ReadingPane";
import { M1_CARDS } from "@/lib/ideas/cards";
import {
  artifactIndexLabel,
  ARTIFACT_STAGE,
  blockingStage,
} from "@/lib/pipeline/artifact-stage";
import { getStepperMeta } from "@/lib/pipeline/stage-copy";
import { formatShortDate } from "@/lib/format-date";
import type { M1CardId } from "@/types/ideas";

const eyebrowFor = (cardId: M1CardId) =>
  `Artifact ${artifactIndexLabel(cardId)} · ${M1_CARDS[cardId].title}`;

const StagePill = ({
  label,
  pulsing = false,
}: {
  label: string;
  pulsing?: boolean;
}) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-gold-10 px-3 py-1">
    <span className="relative grid h-[7px] w-[7px] place-items-center">
      {pulsing ? (
        <>
          <span
            className="absolute inset-0 rounded-full bg-gold animate-record-pulse-ring motion-reduce:hidden"
            aria-hidden
          />
          <span
            className="relative h-[7px] w-[7px] rounded-full bg-gold animate-pulse"
            aria-hidden
          />
        </>
      ) : (
        <span className="h-[7px] w-[7px] rounded-full bg-gold" aria-hidden />
      )}
    </span>
    <span className="text-[10px] font-medium tracking-[0.14em] text-gold-deep uppercase">
      {label}
    </span>
  </span>
);

/**
 * STATE 2 — WRITING. This artifact's stage is running.
 */
export const ArtifactWritingPane = ({
  cardId,
  readyArtifacts,
  onSelectArtifact,
}: {
  cardId: M1CardId;
  readyArtifacts: M1CardId[];
  onSelectArtifact?: (id: M1CardId) => void;
}) => {
  const stage = ARTIFACT_STAGE[cardId] ?? null;
  const meta = getStepperMeta(stage);
  const jumpTo = readyArtifacts[readyArtifacts.length - 1] ?? null;

  return (
    <ReadingPane
      variant="wide"
      eyebrow={eyebrowFor(cardId)}
      title={M1_CARDS[cardId].title}
      actions={
        <StagePill label={`Stage ${meta.index} of ${meta.total}`} pulsing />
      }
    >
      <div className="flex flex-col items-center py-16 text-center">
        <StageIllustration stage={stage} size={240} scale="desktop" />

        <h3 className="mt-9 font-serif text-[34px] leading-[1.2] text-text">
          {meta.title}…
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          {meta.subtitle}
        </p>
        <p className="mt-5 text-xs text-muted">
          This usually takes about a minute.
        </p>
      </div>

      {readyArtifacts.length ? (
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-t border-border pt-6">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
          <p className="text-xs text-text-secondary">
            {readyArtifacts.map((id) => M1_CARDS[id].title).join(" and ")}
            {readyArtifacts.length > 1 ? " are" : " is"} ready to read now.
          </p>
          {jumpTo && onSelectArtifact ? (
            <button
              type="button"
              onClick={() => onSelectArtifact(jumpTo)}
              className="ml-auto text-xs font-medium text-gold-deep hover:text-text"
            >
              Read the {M1_CARDS[jumpTo].title} →
            </button>
          ) : null}
        </div>
      ) : null}
    </ReadingPane>
  );
};

/**
 * STATE 2 — PENDING. Earlier stage still running.
 */
export const ArtifactPendingPane = ({
  cardId,
  onSelectArtifact,
}: {
  cardId: M1CardId;
  onSelectArtifact?: (id: M1CardId) => void;
}) => {
  const stage = ARTIFACT_STAGE[cardId] ?? null;
  const meta = getStepperMeta(stage);
  const waitsOn = blockingStage(cardId);
  const waitsOnMeta = waitsOn ? getStepperMeta(waitsOn) : null;

  return (
    <ReadingPane
      variant="wide"
      eyebrow={eyebrowFor(cardId)}
      title={M1_CARDS[cardId].title}
      actions={
        <span className="rounded-full border border-dashed border-border px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-muted uppercase">
          Up next
        </span>
      }
    >
      <div className="flex flex-col items-center py-16 text-center">
        <div className="grid h-[124px] w-[124px] place-items-center rounded-2xl border border-dashed border-border opacity-60">
          <StageIllustration
            stage={stage}
            size={92}
            scale="desktop"
            animated={false}
          />
        </div>

        <h3 className="mt-8 font-serif text-[28px] leading-[1.2] text-text-secondary">
          Waiting its turn
        </h3>
        <p className="mt-2.5 max-w-[380px] text-sm leading-relaxed text-muted">
          {waitsOnMeta
            ? `${meta.title} starts once ${waitsOnMeta.title.toLowerCase()} is finished — it reads that first.`
            : `${meta.title} hasn’t started yet.`}
        </p>

        <p className="mt-7 text-[11px] tracking-[0.1em] text-muted uppercase">
          Stage {meta.index} of {meta.total}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <p className="text-xs text-muted">
          Nothing has been attempted here yet.
        </p>
        {onSelectArtifact ? (
          <button
            type="button"
            onClick={() => onSelectArtifact("transcript")}
            className="ml-auto text-xs font-medium text-gold-deep hover:text-text"
          >
            Back to the Transcript →
          </button>
        ) : null}
      </div>
    </ReadingPane>
  );
};

/**
 * STATE 3 — DONE AND GENUINELY EMPTY.
 */
export const ArtifactEmptyPane = ({
  cardId,
  finishedAt,
  onSelectArtifact,
}: {
  cardId: M1CardId;
  finishedAt?: string | null;
  onSelectArtifact?: (id: M1CardId) => void;
}) => (
  <ReadingPane
    variant="wide"
    eyebrow={eyebrowFor(cardId)}
    title={M1_CARDS[cardId].title}
    actions={
      <span className="rounded-full bg-success-surface px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] text-success-text uppercase">
        Stage complete
      </span>
    }
  >
    <div className="flex flex-col items-center py-16 text-center">
      <div className="grid h-[108px] w-[108px] place-items-center rounded-full border border-dashed border-border">
        <span className="h-9 w-9 rounded-full border border-dashed border-border" />
      </div>

      <h3 className="mt-8 max-w-[440px] font-serif text-[28px] leading-[1.25] text-text">
        {M1_CARDS[cardId].emptyCopy ??
          `Nothing came back for the ${M1_CARDS[cardId].title.toLowerCase()}.`}
      </h3>
      <p className="mt-3 max-w-[440px] text-sm leading-relaxed text-text-secondary">
        That’s a real finding, not an error — the step ran and came back thin.
      </p>

      {onSelectArtifact ? (
        <button
          type="button"
          onClick={() => onSelectArtifact("prd")}
          className="mt-7 h-9 rounded-full border border-gold/30 px-4 text-xs font-medium text-gold-deep transition hover:bg-gold-10"
        >
          Read the PRD instead
        </button>
      ) : null}
    </div>

    <div className="flex items-center gap-3 border-t border-border pt-6">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
      <p className="text-xs text-text-secondary">
        {finishedAt ? `Finished ${formatShortDate(finishedAt)} · ` : ""}
        the other artifacts are unaffected.
      </p>
    </div>
  </ReadingPane>
);
