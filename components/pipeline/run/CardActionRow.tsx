"use client";

import Button from "@/components/ui/Button";
import type { CardAction } from "@/hooks/useCardActions";

type CardActionRowProps = {
  actions: CardAction[];
};

/** Calm action row under an open result — desktop PaneAction at phone touch size. */
const CardActionRow = ({ actions }: CardActionRowProps) => (
  <div className="flex flex-wrap gap-2">
    {actions.map((action) => (
      <Button
        key={action.key}
        variant="outline"
        className="min-h-11! rounded-full! px-4! text-[12px]!"
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    ))}
  </div>
);

export default CardActionRow;
