import ShellHeaderGrid from "@/components/layout/ShellHeaderGrid";
import { IconBack, IconMore } from "@/components/icons/ListenerIcons";
import { ui } from "@/lib/design/ui";
import type { ReactNode } from "react";

type AppShellHeaderProps = {
  left?: ReactNode;
  title: ReactNode;
  dotColor?: string;
  sub?: string;
  right?: ReactNode;
};

export const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    aria-label="Go back"
    onClick={onClick}
    className="inline-flex h-11 w-11 items-center justify-center border-0 bg-transparent p-0 text-text transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-30)] focus-visible:ring-offset-2"
  >
    <IconBack size={22} />
  </button>
);

export const MoreButton = ({ onClick }: { onClick?: () => void }) => (
  <button
    type="button"
    aria-label="More options"
    onClick={onClick}
    className="inline-flex h-11 w-11 items-center justify-center border-0 bg-transparent p-0 text-text-secondary transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-30)] focus-visible:ring-offset-2 active:bg-black/[0.04]"
  >
    <IconMore size={20} />
  </button>
);

const AppShellHeader = ({
  left,
  title,
  dotColor,
  sub,
  right,
}: AppShellHeaderProps) => (
  <ShellHeaderGrid
    left={left}
    right={right}
    below={
      sub ? (
        <p className="mt-1.5 text-center text-[13px] text-muted">{sub}</p>
      ) : null
    }
    center={
      <h1
        className={`inline-flex max-w-full items-center justify-center gap-2.5 ${ui.shellPageTitle}`}
      >
        {dotColor ? (
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-black/[0.06]"
            style={{ backgroundColor: dotColor }}
            aria-hidden
          />
        ) : null}
        <span className="truncate">{title}</span>
      </h1>
    }
  />
);

export default AppShellHeader;
