import { appShellHeaderClass } from "@/lib/layout/shell";
import type { ReactNode } from "react";

type ShellHeaderGridProps = {
  left?: ReactNode;
  center: ReactNode;
  right?: ReactNode;
  className?: string;
};

const slotPlaceholder = <span className="block h-11 w-11" aria-hidden />;

/** Shared 44 · 1fr · 44 top bar — safe-area padding, slot alignment. */
const ShellHeaderGrid = ({
  left,
  center,
  right,
  className = "",
}: ShellHeaderGridProps) => (
  <header className={`${appShellHeaderClass} ${className}`}>
    <div className="grid grid-cols-[44px_1fr_44px] items-center gap-1.5">
      <div className="justify-self-start">{left ?? slotPlaceholder}</div>
      <div className="min-w-0 text-center">{center}</div>
      <div className="justify-self-end">{right ?? slotPlaceholder}</div>
    </div>
  </header>
);

export default ShellHeaderGrid;
