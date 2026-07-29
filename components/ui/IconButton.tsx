import { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  "aria-label": string;
  children: ReactNode;
};

const IconButton = ({
  children,
  className = "",
  ...props
}: IconButtonProps) => (
  <button
    type="button"
    className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-text transition hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-30 focus-visible:ring-offset-2 disabled:opacity-45 active:scale-[0.975] motion-reduce:active:scale-100 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default IconButton;
