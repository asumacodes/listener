import { IconBack, IconMore } from "@/components/icons/ListenerIcons";
import IconButton from "@/components/ui/IconButton";
import type { ReactNode } from "react";

type AppShellHeaderProps = {
  left?: ReactNode;
  title: ReactNode;
  dotColor?: string;
  sub?: string;
  right?: ReactNode;
};

export const BackButton = ({ onClick }: { onClick: () => void }) => (
  <IconButton aria-label="Go back" onClick={onClick}>
    <IconBack size={22} />
  </IconButton>
);

export const MoreButton = ({ onClick }: { onClick?: () => void }) => (
  <IconButton aria-label="More options" onClick={onClick}>
    <IconMore size={20} />
  </IconButton>
);

const AppShellHeader = ({
  left,
  title,
  dotColor,
  sub,
  right,
}: AppShellHeaderProps) => (
  <header className="shrink-0 pt-[max(3rem,env(safe-area-inset-top))] pb-3">
    <div className="grid grid-cols-[44px_1fr_44px] items-center gap-1.5">
      <div className="justify-self-start">
        {left ?? <span className="block h-11 w-11" />}
      </div>
      <div className="min-w-0 text-center">
        <h1 className="inline-flex max-w-full items-center justify-center gap-2.5 font-serif text-[27px] leading-tight tracking-tight text-text">
          {dotColor ? (
            <span
              className="h-4 w-4 shrink-0 rounded-full border border-black/[0.06]"
              style={{ backgroundColor: dotColor }}
              aria-hidden
            />
          ) : null}
          <span className="truncate">{title}</span>
        </h1>
        {sub ? <p className="mt-1.5 text-[13px] text-muted">{sub}</p> : null}
      </div>
      <div className="justify-self-end">
        {right ?? <span className="block h-11 w-11" />}
      </div>
    </div>
  </header>
);

export default AppShellHeader;
