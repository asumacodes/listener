import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

const Badge = ({ children, className = "" }: BadgeProps) => {
  return (
    <span
      className={`inline-block rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-medium tracking-wide text-gold uppercase ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
