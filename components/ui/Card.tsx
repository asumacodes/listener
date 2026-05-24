import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`rounded-2xl bg-card-white px-5 py-5 shadow-[0_2px_24px_rgba(26,26,26,0.06)] ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
