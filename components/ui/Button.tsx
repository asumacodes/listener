import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Fills available width in a flex row (use with flex-1 parent) or alone. */
  fullWidth?: boolean;
  children: ReactNode;
};

const base =
  "inline-flex min-h-12 items-center justify-center gap-1.5 rounded-lg px-4 py-3 text-sm font-medium font-sans transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-gold text-white hover:opacity-90 active:opacity-95",
  secondary:
    "border border-border bg-surface text-text hover:border-gold/40 active:bg-background",
};

const Button = ({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) => (
  <button
    type="button"
    className={`${base} ${variantClasses[variant]} ${fullWidth ? "w-full flex-1" : ""} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
