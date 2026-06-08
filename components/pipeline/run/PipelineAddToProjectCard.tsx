"use client";

import { IconChevron } from "@/components/icons/ListenerIcons";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";

type PipelineAddToProjectCardProps = {
  onClick: () => void;
  disabled?: boolean;
};

const FolderAddIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden
    className="text-gold"
  >
    <path
      d="M3.5 6.5A1.5 1.5 0 0 1 5 5h3.2l1.3 1.5H15a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 15 16H5a1.5 1.5 0 0 1-1.5-1.5v-8Z"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinejoin="round"
    />
    <path
      d="M10 9v4M8 11h4"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
    />
  </svg>
);

const PipelineAddToProjectCard = ({
  onClick,
  disabled = false,
}: PipelineAddToProjectCardProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`${ui.cardFlat} flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:scale-[0.995] disabled:opacity-60`}
  >
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-10">
      <FolderAddIcon />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block font-medium text-text">
        {copy.pipeline.addToProjectTitle}
      </span>
      <span className="mt-0.5 block text-sm text-text-secondary">
        {copy.pipeline.addToProjectLead}
      </span>
    </span>
    <IconChevron size={18} className="shrink-0 -rotate-90 text-muted" />
  </button>
);

export default PipelineAddToProjectCard;
