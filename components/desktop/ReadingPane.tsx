import type { ReactNode } from "react";

type ReadingPaneProps = {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

/** Spacious serif-section layout for a selected desktop artifact. */
const ReadingPane = ({
  eyebrow,
  title,
  actions,
  children,
}: ReadingPaneProps) => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-surface">
    <div className="min-h-0 flex-1 overflow-y-auto pt-11 scrollbar-hide">
      <div className="mx-auto flex max-w-[720px] flex-col gap-9 px-10 pb-12">
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
        <div className="h-px bg-border" />
        {children}
      </div>
    </div>
  </div>
);

export default ReadingPane;
