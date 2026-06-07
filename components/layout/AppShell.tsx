import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  className?: string;
};

const AppShell = ({ children, className = "" }: AppShellProps) => (
  <div
    className={`flex min-h-dvh w-full flex-col px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] ${className}`}
  >
    {children}
  </div>
);

export default AppShell;
