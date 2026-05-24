import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

const Badge = ({ children, className = "" }: BadgeProps) => {
  return (
    <span
      className={`inline-block rounded-full border border-gold-primary/30 bg-gold-primary/10 px-3 py-1 text-[11px] font-medium tracking-wide text-gold-primary uppercase ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
