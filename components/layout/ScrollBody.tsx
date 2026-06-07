import type { ReactNode } from "react";

const ScrollBody = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex flex-1 flex-col gap-3.5 overflow-y-auto pb-6 pt-1 ${className}`}
  >
    {children}
  </div>
);

export default ScrollBody;
