import { PIPELINE_CARD_META } from "@/lib/pipeline/mock-data";
import { pendingLabelForCard } from "@/lib/ideas/derive-m1-dashboard";
import type { PipelineCardId } from "@/types/pipeline-ui";

type M1PendingCardProps = {
  id: PipelineCardId;
};

const BrandIcon = () => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden
    className="text-muted"
  >
    <circle cx={5.5} cy={9} r={3.5} stroke="currentColor" strokeWidth={1.2} />
    <circle
      cx={12.5}
      cy={5.5}
      r={3.5}
      stroke="currentColor"
      strokeWidth={1.2}
    />
    <circle
      cx={12.5}
      cy={12.5}
      r={3.5}
      stroke="currentColor"
      strokeWidth={1.2}
    />
  </svg>
);

const BoardIcon = () => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden
    className="text-muted"
  >
    <rect
      x={2.5}
      y={3}
      width={3.5}
      height={12}
      rx={1}
      stroke="currentColor"
      strokeWidth={1.2}
    />
    <rect
      x={7.25}
      y={5}
      width={3.5}
      height={10}
      rx={1}
      stroke="currentColor"
      strokeWidth={1.2}
    />
    <rect
      x={12}
      y={7}
      width={3.5}
      height={8}
      rx={1}
      stroke="currentColor"
      strokeWidth={1.2}
    />
  </svg>
);

const PendingIcon = ({ id }: { id: PipelineCardId }) =>
  id === "brand" ? <BrandIcon /> : <BoardIcon />;

const M1PendingCard = ({ id }: M1PendingCardProps) => {
  const meta = PIPELINE_CARD_META[id];
  const label = pendingLabelForCard(id);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#E4E2DC] px-[18px] py-[15px]">
      <span className="grid h-[18px] w-[18px] shrink-0 place-items-center">
        <PendingIcon id={id} />
      </span>
      <span className="min-w-0 flex-1 font-serif text-base text-text-secondary">
        {meta.title}
      </span>
      <span className="shrink-0 text-[11px] tracking-wide text-muted uppercase">
        {label}
      </span>
    </div>
  );
};

export default M1PendingCard;
