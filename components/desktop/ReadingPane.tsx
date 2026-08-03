import type { ReactNode } from "react";

type ReadingPaneProps = {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  /** prose ~660px body · wide ~940px · board cool whiteboard for brand */
  variant?: "prose" | "wide" | "board";
  /** Full-width strip under the title row (stats, notes, etc.). */
  meta?: ReactNode;
};

const variantShell: Record<NonNullable<ReadingPaneProps["variant"]>, string> = {
  prose: "bg-surface",
  wide: "bg-surface",
  board: "bg-white",
};

const variantMeasure: Record<
  NonNullable<ReadingPaneProps["variant"]>,
  string
> = {
  prose: "max-w-[820px]",
  wide: "max-w-[940px]",
  board: "max-w-[940px]",
};

/** Spacious reading surface for a selected desktop artifact. */
const ReadingPane = ({
  eyebrow,
  title,
  actions,
  children,
  variant = "prose",
  meta,
}: ReadingPaneProps) => (
  <div
    className={`flex min-h-0 flex-1 flex-col overflow-hidden ${variantShell[variant]}`}
  >
    <div className="min-h-0 flex-1 overflow-y-auto pt-11 scrollbar-hide">
      <div
        className={`mx-auto flex w-full flex-col gap-8 px-10 pb-14 ${variantMeasure[variant]}`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
                {eyebrow}
              </p>
              <h2 className="mt-2.5 font-serif text-[34px] leading-[1.1] text-text">
                {title}
              </h2>
            </div>
            {actions ? (
              <div className="flex shrink-0 items-center gap-2 pt-1.5">
                {actions}
              </div>
            ) : null}
          </div>
          {meta ? <div>{meta}</div> : null}
        </div>
        <div className="h-px bg-border" />
        <div className={variant === "prose" ? "max-w-[660px]" : undefined}>
          {children}
        </div>
      </div>
    </div>
  </div>
);

export default ReadingPane;
