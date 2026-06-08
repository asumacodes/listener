import type { ReactNode } from "react";

const ScrollBody = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto scrollbar-hide pb-6 pt-1 ${className}`}
  >
    {children}
  </div>
);

export default ScrollBody;
