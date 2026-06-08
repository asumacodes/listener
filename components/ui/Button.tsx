import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "retry" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
};

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-[22px] font-sans text-[15px] font-medium leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-30)] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] motion-reduce:active:scale-100 disabled:pointer-events-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-gold text-white hover:brightness-[1.03] disabled:border-border disabled:bg-[var(--gold-10)] disabled:text-muted disabled:opacity-100",
  secondary:
    "border-border bg-surface text-text hover:bg-black/[0.03] disabled:border-border disabled:bg-[var(--gold-10)] disabled:text-muted disabled:opacity-100",
  danger:
    "border-transparent bg-red text-white hover:brightness-[1.03] disabled:bg-[#f3dede] disabled:text-[#cc9999] disabled:opacity-100",
  retry:
    "border-[#E8545440] bg-error-surface text-red hover:brightness-[0.98] disabled:border-border disabled:bg-[var(--gold-10)] disabled:text-muted disabled:opacity-100",
  ghost:
    "border-transparent bg-transparent text-text-secondary hover:bg-black/[0.04] disabled:text-muted",
};

const Button = ({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={`${base} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
