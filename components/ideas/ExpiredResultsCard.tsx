"use client";

import { IconClock } from "@/components/icons/ListenerIcons";
import Button from "@/components/ui/Button";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";

type ExpiredResultsCardProps = {
  onRerun: () => void;
  busy?: boolean;
};

const ExpiredResultsCard = ({
  onRerun,
  busy = false,
}: ExpiredResultsCardProps) => (
  <div className={`${ui.cardFlat} px-6 py-8 text-center`}>
    <div className={`${ui.emptyMark} mx-auto mb-5`} aria-hidden>
      <IconClock size={28} />
    </div>
    <h2 className="font-serif text-xl text-text">
      {copy.ideaDetail.expiredTitle}
    </h2>
    <p className="mx-auto mt-2 max-w-[280px] text-sm leading-relaxed text-text-secondary">
      {copy.ideaDetail.expiredBody}
    </p>
    <Button fullWidth className="mt-6" onClick={onRerun} disabled={busy}>
      {copy.ideaDetail.rerunCta}
    </Button>
  </div>
);

export default ExpiredResultsCard;
