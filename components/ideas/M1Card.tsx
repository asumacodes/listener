"use client";

import { IconChevron } from "@/components/icons/ListenerIcons";
import { M1_CARDS, type M1CardMeta } from "@/lib/ideas/cards";
import type { M1CardId, M1CardState } from "@/types/ideas";
import type { ReactNode } from "react";
import { useState } from "react";

type M1CardProps = {
  id: M1CardId;
  state: M1CardState;
  defaultOpen?: boolean;
  grouped?: boolean;
};

const CHEVRON_CLASS =
  "shrink-0 text-muted transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none motion-reduce:transform-none";

const PANEL_CLASS =
  "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none";

const M1AccordionPanel = ({
  open,
  children,
  className = "",
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`${PANEL_CLASS} ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
  >
    <div className="overflow-hidden">
      <div
        className={`px-[18px] pb-4 pt-0 text-sm leading-relaxed text-text-secondary ${className}`}
      >
        {children}
      </div>
    </div>
  </div>
);

const M1AccordionCard = ({
  card,
  open,
  onToggle,
  shellClass,
  body,
  bodyClassName = "",
}: {
  card: M1CardMeta;
  open: boolean;
  onToggle: () => void;
  shellClass: string;
  body: ReactNode;
  bodyClassName?: string;
}) => (
  <div className={`${shellClass} ${open ? "open" : ""}`}>
    <button
      type="button"
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-3 px-[18px] pt-4 pb-3 text-left"
      onClick={onToggle}
    >
      <span className="font-medium text-text">{card.title}</span>
      <IconChevron
        size={18}
        className={`${CHEVRON_CLASS} ${open ? "rotate-180" : ""}`}
      />
    </button>
    <M1AccordionPanel open={open} className={bodyClassName}>
      {body}
    </M1AccordionPanel>
  </div>
);

const groupedShell = (base: string) =>
  `${base} border-b border-border bg-transparent shadow-none last:border-b-0`;

const M1Card = ({
  id,
  state,
  defaultOpen = false,
  grouped = false,
}: M1CardProps) => {
  const card = M1_CARDS[id];
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => setOpen((v) => !v);

  if (state === "pending") {
    return (
      <div
        className={
          grouped
            ? "m1-card pending border-b border-dashed border-[#E4E2DC] px-[18px] py-[15px] last:border-b-0"
            : "m1-card pending rounded-2xl border border-dashed border-[#E4E2DC] px-[18px] py-[15px]"
        }
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-muted">{card.title}</span>
          <span className="text-[11px] tracking-wide text-muted uppercase">
            {card.stageLabel}
          </span>
        </div>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <M1AccordionCard
        card={card}
        open={open}
        onToggle={toggle}
        shellClass={
          grouped
            ? groupedShell("m1-card loading")
            : "m1-card loading rounded-2xl border border-border bg-surface"
        }
        bodyClassName="text-center"
        body={<>Building {card.title.toLowerCase()}…</>}
      />
    );
  }

  if (state === "failed") {
    return (
      <M1AccordionCard
        card={card}
        open={open}
        onToggle={toggle}
        shellClass={
          grouped
            ? "m1-card failed border-b border-[#E8545440] bg-error-surface last:border-b-0"
            : "m1-card failed rounded-2xl border border-[#E8545440] bg-error-surface"
        }
        body={<>We couldn&apos;t finish this step.</>}
      />
    );
  }

  if (state === "empty") {
    return (
      <M1AccordionCard
        card={card}
        open={open}
        onToggle={toggle}
        shellClass={
          grouped
            ? groupedShell("m1-card")
            : "m1-card rounded-2xl border border-border bg-surface"
        }
        body={card.emptyCopy ?? "Not available yet for this idea."}
      />
    );
  }

  return (
    <M1AccordionCard
      card={card}
      open={open}
      onToggle={toggle}
      shellClass={
        grouped
          ? groupedShell("m1-card")
          : "m1-card rounded-2xl border border-border bg-surface"
      }
      body={<>Content will appear here once pipeline results are saved.</>}
    />
  );
};

export default M1Card;
